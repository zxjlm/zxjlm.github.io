import type { TravelCamera, TravelViewport } from './travel.ts'
import { flyInterpolator, overviewCamera } from './travel.ts'

export interface TravelMotionFrame {
  t: number
  camera: TravelCamera
  images: Record<'light' | 'dark', string>
}

export interface TravelMotionPlan {
  viewport: TravelViewport
  overscan: number
  segments: TravelMotionFrame[][]
}

export const TRAVEL_OVERSCAN = 0.24
const MAX_ZOOM_STEP = 0.6
const MAX_PAN_STEP = 0.12

export function travelMercator(camera: Pick<TravelCamera, 'lng' | 'lat'>): [number, number] {
  const sin = Math.sin(camera.lat * Math.PI / 180)
  return [(camera.lng + 180) / 360, 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)]
}

/** Sample the actual fly path, including its zoom-out arc, rather than a straight line. */
export function travelMotionPlan(points: Array<{ lng: number, lat: number }>, viewport: TravelViewport, zoom: number): TravelMotionPlan {
  const { width, height, padding } = viewport
  const focusWidth = width - padding.left - padding.right
  const focusHeight = height - padding.top - padding.bottom
  const overview = overviewCamera(points, focusWidth - 112, focusHeight - 112, zoom - 1)
  overview.zoom = Math.max(0, overview.zoom)
  const cameras = [overview, ...points.map(point => ({ ...point, zoom })), overview]
  const frame = (t: number, camera: TravelCamera): TravelMotionFrame => ({ t, camera, images: { light: '', dark: '' } })
  const segments = cameras.slice(1).map((to, index) => {
    const fly = flyInterpolator(cameras[index], to, Math.max(focusWidth, focusHeight))
    const frames = [frame(0, fly(0))]
    const split = (start: number, end: number, depth: number) => {
      const a = fly(start)
      const b = fly(end)
      const mid = (start + end) / 2
      const c = fly(mid)
      const world = 512 * 2 ** Math.max(a.zoom, b.zoom, c.zoom)
      const [ax, ay] = travelMercator(a)
      const [bx, by] = travelMercator(b)
      const [cx, cy] = travelMercator(c)
      const zoomRange = Math.max(a.zoom, b.zoom, c.zoom) - Math.min(a.zoom, b.zoom, c.zoom)
      const pan = Math.max(
        (Math.max(ax, bx, cx) - Math.min(ax, bx, cx)) * world / width,
        (Math.max(ay, by, cy) - Math.min(ay, by, cy)) * world / height,
      )
      if (depth < 12 && (zoomRange > MAX_ZOOM_STEP || pan > MAX_PAN_STEP)) {
        split(start, mid, depth + 1)
        split(mid, end, depth + 1)
      }
      else {
        frames.push(frame(end, b))
      }
    }
    split(0, 1, 0)
    return frames
  })
  return { viewport, overscan: TRAVEL_OVERSCAN, segments }
}

export function motionFrameIndex(frames: TravelMotionFrame[], t: number) {
  let index = 0
  while (index < frames.length - 1 && frames[index + 1].t <= t)
    index += 1
  if (index < frames.length - 1 && t - frames[index].t > frames[index + 1].t - t)
    index += 1
  return index
}

/** Affine Mercator projection of a rendered map onto the current scroll camera. */
export function travelRasterTransform(reference: TravelCamera, camera: TravelCamera, plan: TravelMotionPlan, width: number, height: number) {
  const view = plan.viewport
  const cover = Math.max(width / view.width, height / view.height)
  const focusX = view.padding.left + (view.width - view.padding.left - view.padding.right) / 2
  const focusY = view.padding.top + (view.height - view.padding.top - view.padding.bottom) / 2
  const cropX = (view.width * cover - width) / 2
  const cropY = (view.height * cover - height) / 2
  const marginX = Math.round(view.width * plan.overscan)
  const marginY = Math.round(view.height * plan.overscan)
  const scale = 2 ** (camera.zoom - reference.zoom) * cover
  const [rx, ry] = travelMercator(reference)
  const [cx, cy] = travelMercator(camera)
  const world = 512 * 2 ** camera.zoom
  const x = focusX * cover - cropX + (rx - cx) * world * cover - (focusX + marginX) * scale
  const y = focusY * cover - cropY + (ry - cy) * world * cover - (focusY + marginY) * scale
  const renderedWidth = (view.width + marginX * 2) * scale
  const renderedHeight = (view.height + marginY * 2) * scale
  return {
    x,
    y,
    width: renderedWidth,
    height: renderedHeight,
    covers: x <= 0.5 && y <= 0.5 && x + renderedWidth >= width - 0.5 && y + renderedHeight >= height - 0.5,
  }
}
