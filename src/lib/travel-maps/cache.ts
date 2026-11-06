import type { TravelMapConfig } from './config.ts'
import type { StaticTravelMap, TravelPoint } from './manifest.ts'
import { createHash, randomUUID } from 'node:crypto'
import { copyFile, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { readTravelMap } from './manifest.ts'

export function travelMapImages(map: StaticTravelMap) {
  return [...new Set([
    ...Object.values(map.scenes).flatMap(modes => Object.values(modes).flat()),
    ...Object.values(map.motion).flatMap(plan => plan.segments.flatMap(segment => segment.flatMap(frame => Object.values(frame.images)))),
  ])]
}

/** Check every referenced image against its immutable content-addressed name. */
export async function verifiedTravelMap(publicRoot: string, points: TravelPoint[], config: TravelMapConfig): Promise<StaticTravelMap | undefined> {
  const map = readTravelMap(publicRoot, points, config)
  if (!map)
    return
  try {
    for (const path of travelMapImages(map)) {
      const bytes = await readFile(join(publicRoot, path))
      const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 20)
      if (!bytes.length || !path.endsWith(`/${digest}.webp`))
        return
    }
    return map
  }
  catch {
    return undefined
  }
}

async function atomicCopy(source: string, destination: string) {
  const temporary = `${destination}.${randomUUID()}.tmp`
  try {
    await copyFile(source, temporary)
    await rename(temporary, destination)
  }
  finally {
    await rm(temporary, { force: true })
  }
}

/** Publish only referenced files, with the manifest last. Never prune old assets. */
export async function copyTravelMap(map: StaticTravelMap, sourceRoot: string, destinationRoot: string) {
  if (resolve(sourceRoot) === resolve(destinationRoot))
    return
  const manifestPath = join(destinationRoot, 'travel-maps', map.key, 'map.json')
  await mkdir(dirname(manifestPath), { recursive: true })
  for (const path of travelMapImages(map))
    await atomicCopy(join(sourceRoot, path), join(destinationRoot, path))
  const temporary = `${manifestPath}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, `${JSON.stringify(map, null, 2)}\n`)
    await rename(temporary, manifestPath)
  }
  finally {
    await rm(temporary, { force: true })
  }
}

export async function prepareCachedTravelMap(publicRoot: string, cacheRoot: string, points: TravelPoint[], config: TravelMapConfig): Promise<'local' | 'restored' | undefined> {
  const local = await verifiedTravelMap(publicRoot, points, config)
  if (local) {
    const cached = await verifiedTravelMap(cacheRoot, points, config)
    if (JSON.stringify(cached) !== JSON.stringify(local))
      await copyTravelMap(local, publicRoot, cacheRoot)
    return 'local'
  }
  const cached = await verifiedTravelMap(cacheRoot, points, config)
  if (cached) {
    await copyTravelMap(cached, cacheRoot, publicRoot)
    if (!await verifiedTravelMap(publicRoot, points, config))
      throw new Error(`Restored map failed verification: ${cached.key}`)
    return 'restored'
  }
}
