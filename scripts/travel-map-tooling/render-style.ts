import type { StyleSpecification } from 'maplibre-gl'
import type { TravelCamera, TravelViewport } from '../../src/composables/travel.ts'
import type { TravelPoint } from '../../src/lib/travel-maps/manifest.ts'

export const TRAVEL_MAP_SIZES = {
  desktop: { width: 1000, height: 1100, padding: { top: 64, right: 318, bottom: 0, left: 0 } },
  mobile: { width: 640, height: 900, padding: { top: 64, right: 0, bottom: 150, left: 0 } },
}

/** Native render options have no padding, so offset the optical centre in Mercator. */
export function nativeCameraCenter(camera: TravelCamera, view: TravelViewport): [number, number] {
  const world = 512 * 2 ** camera.zoom
  const sin = Math.sin(camera.lat * Math.PI / 180)
  const { top, right, bottom, left } = view.padding
  const x = (camera.lng + 180) / 360 + (right - left) / (2 * world)
  const y = 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI) + (bottom - top) / (2 * world)
  return [x * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180 / Math.PI]
}

/** Preserve the tokens expanded by the map engine. */
export function mapResourceUrl(url: string, base: string) {
  return new URL(url, base).href.replace(/%7B/gi, '{').replace(/%7D/gi, '}')
}

export function nativeTravelStyle(input: StyleSpecification, base: string, points: TravelPoint[], dark: boolean): StyleSpecification {
  const style = structuredClone(input)
  if (style.glyphs)
    style.glyphs = mapResourceUrl(style.glyphs, base)
  if (typeof style.sprite === 'string')
    style.sprite = mapResourceUrl(style.sprite, base)
  else if (Array.isArray(style.sprite))
    style.sprite = style.sprite.map(sprite => ({ ...sprite, url: mapResourceUrl(sprite.url, base) }))
  for (const source of Object.values(style.sources)) {
    if ('url' in source && source.url)
      source.url = mapResourceUrl(source.url, base)
    if ('tiles' in source && source.tiles)
      source.tiles = source.tiles.map(url => mapResourceUrl(url, base))
  }
  for (const layer of style.layers) {
    if (layer.type === 'symbol' && layer['source-layer'] !== 'place')
      layer.layout = { ...layer.layout, visibility: 'none' }
  }
  const coordinates = points.map(point => [point.lng, point.lat])
  style.sources['zaxon-route'] = {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        ...(coordinates.length > 1 ? [{ type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates } }] : []),
        ...coordinates.map((coordinates, index) => ({ type: 'Feature' as const, properties: { index }, geometry: { type: 'Point' as const, coordinates } })),
      ],
    },
  }
  const accent = dark ? '#ffb84d' : '#d98732'
  style.layers.push(
    { id: 'route-line', type: 'line', source: 'zaxon-route', filter: ['==', ['geometry-type'], 'LineString'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': accent, 'line-width': 2.5, 'line-opacity': 0.85, 'line-dasharray': [1.6, 1.4] } },
    { id: 'route-stops', type: 'circle', source: 'zaxon-route', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-radius': 4, 'circle-color': accent, 'circle-stroke-color': dark ? '#081320' : '#f4f1e8', 'circle-stroke-width': 1.5 } },
    { id: 'route-active', type: 'circle', source: 'zaxon-route', filter: ['==', ['get', 'index'], -1], paint: { 'circle-radius': 11, 'circle-color': accent, 'circle-opacity': 0.22, 'circle-stroke-color': accent, 'circle-stroke-width': 2 } },
  )
  return style
}
