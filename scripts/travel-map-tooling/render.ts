/* eslint-disable no-console */
import type { Map as NativeMap } from '@maplibre/maplibre-gl-native'
import type { StyleSpecification } from 'maplibre-gl'
import type { EventEmitter } from 'node:events'
import type { TravelMapConfig } from '../../src/lib/travel-maps/config.ts'
import { travelMapKey, type StaticTravelMap, type TravelPoint } from '../../src/lib/travel-maps/manifest.ts'
import { Buffer } from 'node:buffer'
import { createHash, randomUUID } from 'node:crypto'
import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { travelMotionPlan } from '../../src/composables/travel-motion.ts'
import { createMapResourceLoader } from './resources.ts'
import { mapResourceUrl, nativeCameraCenter, nativeTravelStyle, TRAVEL_MAP_SIZES } from './render-style.ts'

const require = createRequire(import.meta.url)

async function atomicWrite(path: string, bytes: Uint8Array | string) {
  const temporary = `${path}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, bytes)
    await rename(temporary, path)
  }
  finally {
    await rm(temporary, { force: true })
  }
}

export async function renderTravelMap(
  publicRoot: string,
  points: TravelPoint[],
  config: TravelMapConfig,
  label: string,
  resource = createMapResourceLoader(),
) {
  // Native libraries are optional publishing tools, loaded only for a cache miss.
  const native = require('@maplibre/maplibre-gl-native') as typeof import('@maplibre/maplibre-gl-native') & Pick<EventEmitter, 'on' | 'removeListener'>
  const { default: sharp } = await import('sharp')
  const key = travelMapKey(points, config)
  const out = join(publicRoot, 'travel-maps', key)
  await mkdir(out, { recursive: true })
  const manifest: StaticTravelMap = {
    version: 2,
    renderer: 'maplibre-native',
    key,
    points,
    attribution: config.attribution,
    scenes: { desktop: { light: [], dark: [] }, mobile: { light: [], dark: [] } },
    motion: {
      desktop: travelMotionPlan(points, TRAVEL_MAP_SIZES.desktop, config.zoom),
      mobile: travelMotionPlan(points, TRAVEL_MAP_SIZES.mobile, config.zoom),
    },
  }
  for (const mode of ['light', 'dark'] as const) {
    const configuredUrl = mode === 'dark' ? config.darkStyle : config.style
    const styleUrl = /^https?:|^file:/.test(configuredUrl)
      ? configuredUrl
      : pathToFileURL(join(publicRoot, configuredUrl.replace(/^\//, ''))).href
    const style = nativeTravelStyle(JSON.parse((await resource(styleUrl)).toString()) as StyleSpecification, styleUrl, points, mode === 'dark')
    const errors: Error[] = []
    const onMessage = (message: { severity?: string, text?: string }) => {
      if (message.severity === 'ERROR')
        errors.push(new Error(message.text || 'Native map rendering failed'))
    }
    const map: NativeMap = new native.Map({
      ratio: 1,
      request(request, callback) {
        resource(request.url).then((data) => {
          if (request.kind === 2) {
            const source = JSON.parse(data.toString())
            if (source.tiles)
              source.tiles = source.tiles.map((url: string) => mapResourceUrl(url, request.url))
            data = Buffer.from(JSON.stringify(source))
          }
          callback(undefined, { data })
        }).catch((error: Error) => {
          errors.push(error)
          callback(error)
        })
      },
    })
    native.on('message', onMessage)
    try {
      map.load(style)
      for (const size of ['desktop', 'mobile'] as const) {
        console.log(`[zaxon] Rendering ${size}/${mode} with MapLibre Native: ${label}`)
        const plan = manifest.motion[size]
        const viewport = plan.viewport
        const width = viewport.width + Math.round(viewport.width * plan.overscan) * 2
        const height = viewport.height + Math.round(viewport.height * plan.overscan) * 2
        const rendered = new Map<string, string>()
        for (const [segmentIndex, segment] of plan.segments.entries()) {
          for (const frame of segment) {
            const { camera } = frame
            const cameraKey = JSON.stringify(camera)
            let path = rendered.get(cameraKey)
            if (!path) {
              const pixels = await new Promise<Uint8Array>((resolve, reject) => {
                map.render({ width, height, zoom: camera.zoom, center: nativeCameraCenter(camera, viewport) }, (error, buffer) => error ? reject(error) : resolve(buffer))
              })
              if (errors.length)
                throw errors[0]
              const bytes = await sharp(pixels, { raw: { width, height, channels: 4 } }).webp({ quality: 70 }).toBuffer()
              const name = `${createHash('sha256').update(bytes).digest('hex').slice(0, 20)}.webp`
              // A failed write cannot truncate a previously published immutable image.
              await atomicWrite(join(out, name), bytes)
              path = `travel-maps/${key}/${name}`
              rendered.set(cameraKey, path)
            }
            frame.images[mode] = path
            if (segmentIndex === 0 && frame.t === 0)
              manifest.scenes[size][mode][0] = path
            if (segmentIndex < points.length && frame.t === 1)
              manifest.scenes[size][mode][segmentIndex + 1] = path
          }
          console.log(`[zaxon] ${size}/${mode} leg ${segmentIndex + 1}/${plan.segments.length}: ${segment.length} camera samples`)
        }
      }
    }
    finally {
      map.release()
      native.removeListener('message', onMessage)
    }
  }
  // Publish only after every scene succeeded; ordinary builds read this manifest offline.
  await atomicWrite(join(out, 'map.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}
