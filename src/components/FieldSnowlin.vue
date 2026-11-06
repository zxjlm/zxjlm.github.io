<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import cropManifest from '../assets/field-notes/fly/crop-manifest.json'
import flyRight1 from '../assets/field-notes/fly/fly-right-1.png?url'
import flyRight2 from '../assets/field-notes/fly/fly-right-2.png?url'
import flyRight3 from '../assets/field-notes/fly/fly-right-3.png?url'
import idleHover from '../assets/field-notes/fly/idle-hover.png?url'
import peekBottom from '../assets/field-notes/fly/peek-bottom.png?url'
import peekLeft1 from '../assets/field-notes/fly/peek-left-1.png?url'
import peekLeft2 from '../assets/field-notes/fly/peek-left-2.png?url'
import peekLeft3 from '../assets/field-notes/fly/peek-left-3.png?url'
import peekRight from '../assets/field-notes/fly/peek-right.png?url'
import sleepOnPaperPlane from '../assets/field-notes/fly/sleep-on-paper-plane.png?url'
import teleportIn1 from '../assets/field-notes/fly/teleport-in-1.png?url'
import teleportIn2 from '../assets/field-notes/fly/teleport-in-2.png?url'
import teleportIn3 from '../assets/field-notes/fly/teleport-in-3.png?url'
import teleportOut1 from '../assets/field-notes/fly/teleport-out-1.png?url'
import teleportOut2 from '../assets/field-notes/fly/teleport-out-2.png?url'
import teleportOut3 from '../assets/field-notes/fly/teleport-out-3.png?url'
import { useThemeConfig } from '../composables'

type Scene = 'peek-left' | 'peek-right' | 'peek-bottom' | 'fly-by' | 'teleport' | 'rest'
interface Crop {
  x: number
  y: number
  width: number
  height: number
}

interface Sprite {
  src: string
  crop: Crop
}

function sprite(src: string, name: keyof typeof cropManifest): Sprite {
  return { src, crop: cropManifest[name] }
}

const flyRight1Sprite = sprite(flyRight1, 'fly-right-1')
const flyRight2Sprite = sprite(flyRight2, 'fly-right-2')
const flyRight3Sprite = sprite(flyRight3, 'fly-right-3')
const idleHoverSprite = sprite(idleHover, 'idle-hover')
const peekBottomSprite = sprite(peekBottom, 'peek-bottom')
const peekLeft1Sprite = sprite(peekLeft1, 'peek-left-1')
const peekLeft2Sprite = sprite(peekLeft2, 'peek-left-2')
const peekLeft3Sprite = sprite(peekLeft3, 'peek-left-3')
const peekRightSprite = sprite(peekRight, 'peek-right')
const sleepOnPaperPlaneSprite = sprite(sleepOnPaperPlane, 'sleep-on-paper-plane')
const teleportIn1Sprite = sprite(teleportIn1, 'teleport-in-1')
const teleportIn2Sprite = sprite(teleportIn2, 'teleport-in-2')
const teleportIn3Sprite = sprite(teleportIn3, 'teleport-in-3')
const teleportOut1Sprite = sprite(teleportOut1, 'teleport-out-1')
const teleportOut2Sprite = sprite(teleportOut2, 'teleport-out-2')
const teleportOut3Sprite = sprite(teleportOut3, 'teleport-out-3')

const isLight = ref(true)
const isVisible = ref(false)
const scene = ref<Scene>('peek-left')
const frame = ref<Sprite>(idleHoverSprite)
const themeConfig = useThemeConfig()
let sceneTimer: ReturnType<typeof globalThis.setTimeout> | undefined
let nextSceneTimer: ReturnType<typeof globalThis.setTimeout> | undefined
let themeObserver: MutationObserver | undefined
let motion: MediaQueryList | undefined
const frameTimers = new Set<ReturnType<typeof globalThis.setTimeout>>()

const sceneClass = computed(() => `field-snowlin--${scene.value}`)
const isEnabled = computed(() => themeConfig.value.snowlin?.enable !== false)
const frequency = computed(() => themeConfig.value.snowlin?.frequency || 'normal')
const frequencyTiming = computed(() => {
  if (frequency.value === 'debug')
    return { initial: 3000, delay: 3000 }
  if (frequency.value === 'low')
    return { initial: 60000, delay: 60000 }
  if (frequency.value === 'high')
    return { initial: 10000, delay: 10000 }
  return { initial: 30000, delay: 30000 }
})
const frameStyle = computed(() => ({
  left: `${frame.value.crop.x / 256 * 100}%`,
  top: `${frame.value.crop.y / 256 * 100}%`,
  width: `${frame.value.crop.width / 256 * 100}%`,
  height: `${frame.value.crop.height / 256 * 100}%`,
}))

function clearTimers() {
  if (sceneTimer)
    globalThis.clearTimeout(sceneTimer)
  if (nextSceneTimer)
    globalThis.clearTimeout(nextSceneTimer)
  for (const timer of frameTimers)
    globalThis.clearTimeout(timer)
  frameTimers.clear()
}

function setFrameAfter(delay: number, nextFrame: Sprite) {
  const timer = globalThis.setTimeout(() => {
    frameTimers.delete(timer)
    if (isVisible.value)
      frame.value = nextFrame
  }, delay)
  frameTimers.add(timer)
}

function finishAfter(delay: number) {
  sceneTimer = globalThis.setTimeout(() => {
    isVisible.value = false
    scheduleNextScene()
  }, delay)
}

function playScene() {
  if (!isLight.value || !isEnabled.value)
    return

  const scenes: Scene[] = ['peek-left', 'peek-right', 'peek-bottom', 'fly-by', 'teleport', 'rest']
  scene.value = scenes[Math.floor(Math.random() * scenes.length)]
  isVisible.value = true

  if (scene.value === 'peek-left') {
    frame.value = peekLeft1Sprite
    setFrameAfter(440, peekLeft2Sprite)
    setFrameAfter(920, peekLeft3Sprite)
    setFrameAfter(2300, peekLeft2Sprite)
    finishAfter(2860)
    return
  }

  if (scene.value === 'peek-right') {
    frame.value = peekRightSprite
    finishAfter(2600)
    return
  }

  if (scene.value === 'peek-bottom') {
    frame.value = peekBottomSprite
    finishAfter(3000)
    return
  }

  if (scene.value === 'fly-by') {
    frame.value = flyRight1Sprite
    setFrameAfter(360, flyRight2Sprite)
    setFrameAfter(720, flyRight3Sprite)
    setFrameAfter(1080, flyRight1Sprite)
    setFrameAfter(1440, flyRight2Sprite)
    setFrameAfter(1800, flyRight3Sprite)
    setFrameAfter(2160, flyRight1Sprite)
    setFrameAfter(2520, flyRight2Sprite)
    setFrameAfter(2880, flyRight3Sprite)
    finishAfter(3600)
    return
  }

  if (scene.value === 'teleport') {
    frame.value = teleportIn1Sprite
    setFrameAfter(150, teleportIn2Sprite)
    setFrameAfter(310, teleportIn3Sprite)
    setFrameAfter(820, idleHoverSprite)
    setFrameAfter(2320, teleportOut1Sprite)
    setFrameAfter(2480, teleportOut2Sprite)
    setFrameAfter(2640, teleportOut3Sprite)
    finishAfter(2920)
    return
  }

  frame.value = sleepOnPaperPlaneSprite
  finishAfter(5200)
}

function scheduleNextScene(initial = false) {
  if (!isLight.value || !isEnabled.value)
    return

  const timing = frequencyTiming.value
  const delay = initial ? timing.initial : timing.delay
  nextSceneTimer = globalThis.setTimeout(playScene, delay)
}

function syncTheme() {
  isLight.value = !document.documentElement.classList.contains('dark')
  clearTimers()
  isVisible.value = false
  if (isLight.value && isEnabled.value && !motion?.matches) {
    scheduleNextScene(true)
  }
}

onMounted(() => {
  motion = matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', syncTheme)
  syncTheme()
  themeObserver = new MutationObserver(syncTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

watch([isEnabled, frequency], syncTheme)

onBeforeUnmount(() => {
  clearTimers()
  themeObserver?.disconnect()
  motion?.removeEventListener('change', syncTheme)
})
</script>

<template>
  <div
    v-if="isVisible"
    class="field-snowlin"
    :class="sceneClass"
    aria-hidden="true"
  >
    <img :src="frame.src" :style="frameStyle" alt="" decoding="async">
  </div>
</template>
