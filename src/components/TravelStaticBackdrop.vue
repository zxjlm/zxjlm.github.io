<script setup lang="ts">
import type { TravelCamera, TravelMotionFrame, TravelMotionPlan, TravelStop } from '../composables'
import type { StaticTravelMap } from '../lib/travel-maps/manifest'
import { useAppStore } from '../composables/config'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createTravelFrameCache, easeWithin, flyInterpolator, motionFrameIndex, readingPosition, TRAVEL_READING_LINE, travelMercator, travelRasterTransform, useThemeConfig } from '../composables'

const props = defineProps<{ stops: TravelStop[], map: StaticTravelMap }>()
const active = defineModel<number>('active', { default: -1 })
const config = useThemeConfig()
const app = useAppStore()
const mounted = ref(false)
const mobile = ref(false)
const ready = ref(false)
const displayed = ref('')
const canvas = ref<HTMLCanvasElement>()
const travel = computed(() => config.value.travel || {})
const plan = computed(() => props.map.motion[mobile.value ? 'mobile' : 'desktop'])
const orderedFrames = computed(() => plan.value.segments.flat())
const mode = computed(() => app.isDark ? 'dark' : 'light')
const url = (path: string) => `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}${path}`
const loadingImages = new Set<HTMLImageElement>()
let offsets: number[] = []
let frame = 0
let disposed = false
let observer: ResizeObserver | undefined
let media: MediaQueryList | undefined
let reducedMotion: MediaQueryList | undefined
let context: CanvasRenderingContext2D | null = null
let measuredPlan: TravelMotionPlan | undefined
let flights: Array<(t: number) => TravelCamera> = []
let timeline = 0
let direction = 1

interface Raster {
  image: HTMLImageElement
  reference: TravelMotionFrame
  camera: TravelCamera
  plan: TravelMotionPlan
  mode: 'light' | 'dark'
  path: string
  active: number
}
let last: Raster | undefined
let previous: (Raster & { since: number }) | undefined

const cache = createTravelFrameCache({
  async load(src, priority) {
    const image = new Image()
    image.decoding = 'async'
    image.fetchPriority = priority
    loadingImages.add(image)
    image.src = src
    try {
      await image.decode()
      return image
    }
    finally {
      loadingImages.delete(image)
    }
  },
  ready: schedule,
  error: src => console.warn(`[zaxon] Static travel frame unavailable: ${src}`),
})

function paint(raster: Raster, camera: TravelCamera, alpha = 1) {
  if (!canvas.value || !context)
    return
  const transform = travelRasterTransform(raster.reference.camera, camera, raster.plan, canvas.value.clientWidth, canvas.value.clientHeight)
  context.globalAlpha = alpha
  context.drawImage(raster.image, transform.x, transform.y, transform.width, transform.height)
}

function highlight(raster: Raster, camera: TravelCamera) {
  if (!canvas.value || !context)
    return
  const point = props.stops[raster.active]
  if (!point)
    return
  const view = raster.plan.viewport
  const width = canvas.value.clientWidth
  const height = canvas.value.clientHeight
  const cover = Math.max(width / view.width, height / view.height)
  const focusX = view.padding.left + (view.width - view.padding.left - view.padding.right) / 2
  const focusY = view.padding.top + (view.height - view.padding.top - view.padding.bottom) / 2
  const [px, py] = travelMercator(point)
  const [cx, cy] = travelMercator(camera)
  const world = 512 * 2 ** camera.zoom
  const x = focusX * cover - (view.width * cover - width) / 2 + (px - cx) * world * cover
  const y = focusY * cover - (view.height * cover - height) / 2 + (py - cy) * world * cover
  context.beginPath()
  context.arc(x, y, 11 * cover, 0, Math.PI * 2)
  context.fillStyle = raster.mode === 'dark' ? '#ffb84d' : '#d98732'
  context.globalAlpha = 0.22
  context.fill()
  context.globalAlpha = 1
  context.strokeStyle = context.fillStyle
  context.lineWidth = 2 * cover
  context.stroke()
}

function update() {
  frame = 0
  if (disposed || !canvas.value || !context || offsets.length < 2)
    return
  const currentPlan = plan.value
  if (measuredPlan !== currentPlan) {
    measuredPlan = currentPlan
    const view = currentPlan.viewport
    const size = Math.max(view.width - view.padding.left - view.padding.right, view.height - view.padding.top - view.padding.bottom)
    flights = currentPlan.segments.map(frames => flyInterpolator(frames[0].camera, frames.at(-1)!.camera, size))
  }
  const { segment, progress } = readingPosition(offsets, window.scrollY + window.innerHeight * TRAVEL_READING_LINE)
  const closing = segment === currentPlan.segments.length - 1
  let t = closing ? easeWithin(progress, 0.35, 1) : easeWithin(progress, 0, 0.55)
  if (reducedMotion?.matches)
    t = Math.round(t)
  const position = segment + t
  if (Math.abs(position - timeline) > 0.0001)
    direction = position >= timeline ? 1 : -1
  timeline = position
  active.value = Math.min(Math.max(t >= 0.5 ? segment : segment - 1, 0), props.stops.length - 1)
  const camera = flights[segment](t)
  const frames = currentPlan.segments[segment]
  const index = motionFrameIndex(frames, t)
  const wanted = url(frames[index].images[mode.value])
  cache.request(wanted)

  // While the nearest sample loads, another decoded sample may still cover the camera.
  const candidates = [...frames].sort((a, b) => Math.abs(a.t - t) - Math.abs(b.t - t))
  let raster: Raster | undefined
  for (const reference of candidates) {
    const path = url(reference.images[mode.value])
    const image = cache.get(path)
    if (image && travelRasterTransform(reference.camera, camera, currentPlan, canvas.value.clientWidth, canvas.value.clientHeight).covers) {
      raster = { image, reference, camera, plan: currentPlan, mode: mode.value, path, active: active.value }
      break
    }
  }
  const ratio = Math.min(window.devicePixelRatio || 1, 1.25)
  const width = Math.round(canvas.value.clientWidth * ratio)
  const height = Math.round(canvas.value.clientHeight * ratio)
  if (canvas.value.width !== width || canvas.value.height !== height) {
    canvas.value.width = width
    canvas.value.height = height
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.globalAlpha = 1
  if (raster) {
    if (last && last.path !== raster.path && last.plan === currentPlan && last.mode === mode.value)
      previous = { ...last, since: performance.now() }
    context.clearRect(0, 0, canvas.value.clientWidth, canvas.value.clientHeight)
    const blend = previous && !reducedMotion?.matches ? Math.min(1, (performance.now() - previous.since) / 100) : 1
    if (previous && blend < 1 && previous.plan === currentPlan && previous.mode === mode.value && travelRasterTransform(previous.reference.camera, camera, currentPlan, canvas.value.clientWidth, canvas.value.clientHeight).covers) {
      paint(previous, camera)
      paint(raster, camera, blend)
      schedule()
    }
    else {
      previous = undefined
      paint(raster, camera)
    }
    highlight(raster, camera)
    last = raster
    displayed.value = raster.path
    ready.value = true
  }
  else if (last) {
    // Large jumps or a failed image keep the last complete view, rather than exposing raster edges.
    paint(last, last.camera)
    highlight(last, last.camera)
  }

  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (ready.value && !connection?.saveData) {
    const ordered = orderedFrames.value
    const at = ordered.indexOf(frames[index])
    const ahead: string[] = []
    const add = (sample: TravelMotionFrame | undefined) => {
      if (sample) {
        const path = url(sample.images[mode.value])
        if (path !== wanted && !ahead.includes(path))
          ahead.push(path)
      }
    }
    if (reducedMotion?.matches) {
      add(direction > 0 ? currentPlan.segments[segment + 1]?.at(-1) : currentPlan.segments[segment - 1]?.[0])
    }
    else {
      for (let step = 1; step <= 10 && ahead.length < 4; step += 1)
        add(ordered[at + step * direction])
      add(ordered[at - direction])
    }
    cache.prefetch(ahead)
  }
  else {
    cache.prefetch([])
  }
}

function schedule() {
  if (!disposed && !frame)
    frame = requestAnimationFrame(update)
}

function measure() {
  if (!props.stops.length)
    return
  const top = (el: Element) => el.getBoundingClientRect().top + window.scrollY
  const stops = props.stops.map(stop => top(stop.el))
  const content = props.stops[0].el.closest('.field-post__content')
  const start = Math.min(content ? top(content) : 0, stops[0])
  const end = document.documentElement.scrollHeight - window.innerHeight * (1 - TRAVEL_READING_LINE)
  offsets = [start, ...stops, Math.max(end, stops.at(-1)! + 1)]
  schedule()
}

function resize() {
  mobile.value = media?.matches ?? false
  measure()
}

onMounted(async () => {
  mounted.value = true
  media = window.matchMedia('(max-width: 859px)')
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  mobile.value = media.matches
  await nextTick()
  if (disposed) return
  context = canvas.value?.getContext('2d') ?? null
  observer = new ResizeObserver(measure)
  const content = props.stops[0]?.el.closest('.field-post__content')
  if (content)
    observer.observe(content)
  if (canvas.value?.parentElement)
    observer.observe(canvas.value.parentElement)
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', resize)
  reducedMotion.addEventListener('change', schedule)
  measure()
})

watch([plan, mode], schedule)
watch(() => props.stops, measure)

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(frame)
  cache.dispose()
  for (const image of loadingImages)
    image.removeAttribute('src')
  loadingImages.clear()
  observer?.disconnect()
  reducedMotion?.removeEventListener('change', schedule)
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', resize)
  last = undefined
  previous = undefined
})
</script>

<template>
  <Teleport v-if="mounted" to=".field-shell">
    <div class="travel-map" :class="{ 'travel-map--ready': ready }" :style="{ '--travel-map-opacity': travel.opacity ?? 0.42 }" aria-hidden="true">
      <canvas ref="canvas" class="travel-map__raster" :data-travel-frame="displayed" />
    </div>
  </Teleport>
  <p v-if="ready && map.attribution" class="travel-map__attribution">
    {{ map.attribution }}
  </p>
</template>
