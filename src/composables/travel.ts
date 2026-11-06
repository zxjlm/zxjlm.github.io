export interface TravelCamera {
  lng: number
  lat: number
  zoom: number
}

export interface TravelStop {
  el: HTMLElement
  lng: number
  lat: number
  /** Full place line as written in the article. */
  place: string
  /** Short name for the itinerary. */
  label: string
}

export interface ReadingPosition {
  /** Index of the keyframe the reader has most recently passed. */
  segment: number
  /** Progress from `segment` to `segment + 1`, in [0, 1]. */
  progress: number
}

/** Share of the viewport height where the reader is assumed to be reading. */
export const TRAVEL_READING_LINE = 0.4

/** Curvature of the zoom-out arc; matches MapLibre's `flyTo` default. */
const RHO = 1.42
const TILE_SIZE = 512

/**
 * Place lines are written as `<area>` + ideographic space + `<spot>（<note>）`;
 * the itinerary only needs the spot.
 */
export function stopLabel(place: string) {
  const spot = place.split('\u3000').map(part => part.trim()).filter(Boolean).at(-1) || place.trim()
  return spot.replace(/\s*[（(][^（）()]*[）)]\s*$/, '') || spot
}

export function collectTravelStops(root: ParentNode): TravelStop[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-travel-stop]'))
    .map((el) => {
      const place = el.querySelector('.travel-stop__place')?.textContent?.trim() || ''
      const lat = Number(el.dataset.lat)
      const lng = Number(el.dataset.lng)
      return { el, lat, lng, place, label: stopLabel(place) || `${lat}, ${lng}` }
    })
    .filter(stop => Number.isFinite(stop.lat) && Number.isFinite(stop.lng))
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function toMercator(lng: number, lat: number): [number, number] {
  const sin = Math.sin(lat * Math.PI / 180)
  return [(lng + 180) / 360, 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)]
}

function fromMercator(x: number, y: number) {
  return {
    lng: x * 360 - 180,
    lat: Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180 / Math.PI,
  }
}

/**
 * Smooth zoom-and-pan path between two cameras (van Wijk & Nuij, "Smooth and
 * efficient zooming and panning"), so distant stops zoom out on the way and
 * nearby stops only pan.
 */
export function flyInterpolator(from: TravelCamera, to: TravelCamera, viewportSize: number) {
  const [x0, y0] = toMercator(from.lng, from.lat)
  const [x1, y1] = toMercator(to.lng, to.lat)
  const dx = x1 - x0
  const dy = y1 - y0
  const u1 = Math.hypot(dx, dy)
  const w0 = viewportSize / (TILE_SIZE * 2 ** from.zoom)
  const w1 = viewportSize / (TILE_SIZE * 2 ** to.zoom)
  const rho2 = RHO * RHO

  const cameraAt = (u: number, w: number): TravelCamera => ({
    ...fromMercator(x0 + dx * u, y0 + dy * u),
    zoom: Math.log2(viewportSize / (TILE_SIZE * w)),
  })

  let frame: (t: number) => TravelCamera
  if (u1 < 1e-12) {
    frame = t => cameraAt(0, w0 * (w1 / w0) ** t)
  }
  else {
    const b = (w: number, sign: number) => (w1 * w1 - w0 * w0 + sign * rho2 * rho2 * u1 * u1) / (2 * w * rho2 * u1)
    const r = (value: number) => Math.log(Math.sqrt(value * value + 1) - value)
    const r0 = r(b(w0, 1))
    const length = (r(b(w1, -1)) - r0) / RHO

    frame = (t) => {
      const s = r0 + RHO * length * t
      const w = w0 * Math.cosh(r0) / Math.cosh(s)
      const u = w0 * (Math.cosh(r0) * Math.tanh(s) - Math.sinh(r0)) / rho2 / u1
      return cameraAt(u, w)
    }
  }

  return (t: number): TravelCamera => {
    if (t <= 0)
      return { ...from }
    if (t >= 1)
      return { ...to }
    return frame(t)
  }
}

/**
 * Camera that fits every point inside a `width` × `height` pixel box.
 */
export function overviewCamera(points: Array<{ lng: number, lat: number }>, width: number, height: number, maxZoom: number): TravelCamera {
  const projected = points.map(point => toMercator(point.lng, point.lat))
  const xs = projected.map(([x]) => x)
  const ys = projected.map(([, y]) => y)
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const fit = Math.min(width / ((maxX - minX) * TILE_SIZE), height / ((maxY - minY) * TILE_SIZE))

  return {
    ...fromMercator((minX + maxX) / 2, (minY + maxY) / 2),
    zoom: Number.isFinite(fit) ? Math.min(Math.log2(fit), maxZoom) : maxZoom,
  }
}

export interface TravelViewport {
  width: number
  height: number
  padding: { top: number, right: number, bottom: number, left: number }
}

/**
 * Vector tiles (512px) a map of `viewport` needs to draw `camera`; the camera
 * centre sits in the middle of the padded area, as in MapLibre.
 */
export function cameraTiles(camera: TravelCamera, viewport: TravelViewport, minZoom: number, maxZoom: number) {
  const z = Math.min(Math.max(Math.floor(camera.zoom), minZoom), maxZoom)
  const worldSize = TILE_SIZE * 2 ** camera.zoom
  const [mx, my] = toMercator(camera.lng, camera.lat)
  const { width, height, padding } = viewport
  const focusX = padding.left + (width - padding.left - padding.right) / 2
  const focusY = padding.top + (height - padding.top - padding.bottom) / 2
  const scale = 2 ** z / worldSize
  const count = 2 ** z

  const left = Math.floor((mx * worldSize - focusX) * scale)
  const right = Math.floor((mx * worldSize + width - focusX) * scale)
  const top = Math.max(0, Math.floor((my * worldSize - focusY) * scale))
  const bottom = Math.min(count - 1, Math.floor((my * worldSize + height - focusY) * scale))

  const tiles: Array<{ z: number, x: number, y: number }> = []
  for (let x = left; x <= right; x += 1) {
    for (let y = top; y <= bottom; y += 1)
      tiles.push({ z, x: ((x % count) + count) % count, y })
  }
  return tiles
}

/**
 * Locates the reading anchor between ascending keyframe offsets.
 */
export function readingPosition(keyframes: number[], anchor: number): ReadingPosition {
  if (keyframes.length < 2)
    return { segment: 0, progress: 0 }

  let segment = 0
  while (segment < keyframes.length - 2 && keyframes[segment + 1] <= anchor)
    segment += 1

  const span = keyframes[segment + 1] - keyframes[segment]
  const progress = span > 0 ? clamp01((anchor - keyframes[segment]) / span) : 1
  return { segment, progress }
}

/**
 * Maps `progress` onto a smoothstep that only moves inside `[start, end]`,
 * leaving the camera at rest for the rest of the segment.
 */
export function easeWithin(progress: number, start: number, end: number) {
  const t = clamp01((progress - start) / (end - start))
  return t * t * (3 - 2 * t)
}
