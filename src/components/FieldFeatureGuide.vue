<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import cropManifest from '../assets/field-notes/fly/crop-manifest.json'
import teleportIn2 from '../assets/field-notes/fly/teleport-in-2.png?url'
import wavePaperPlane from '../assets/field-notes/fly/wave-paper-plane.png?url'

interface GuideTarget {
  element: HTMLElement
  feature: string
}

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

const teleportIn2Sprite = sprite(teleportIn2, 'teleport-in-2')
const wavePaperPlaneSprite = sprite(wavePaperPlane, 'wave-paper-plane')

const guide = ref<GuideTarget>()
const guidePosition = ref<Record<string, string>>()
const guideSprite = ref<Sprite>(teleportIn2Sprite)
const guideSpriteStyle = computed(() => ({
  left: `${guideSprite.value.crop.x / 256 * 100}%`,
  top: `${guideSprite.value.crop.y / 256 * 100}%`,
  width: `${guideSprite.value.crop.width / 256 * 100}%`,
  height: `${guideSprite.value.crop.height / 256 * 100}%`,
}))
let guideTimer: ReturnType<typeof globalThis.setTimeout> | undefined
let startTimer: ReturnType<typeof globalThis.setTimeout> | undefined
let spriteTimer: ReturnType<typeof globalThis.setTimeout> | undefined
let controller: AbortController
let observer: MutationObserver
let motion: MediaQueryList

function clearGuide() {
  if (guideTimer)
    globalThis.clearTimeout(guideTimer)
  if (startTimer)
    globalThis.clearTimeout(startTimer)
  if (spriteTimer)
    globalThis.clearTimeout(spriteTimer)
  guide.value?.element.removeAttribute('data-field-guide-active')
  guide.value = undefined
}

function isGuideTarget(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const style = globalThis.getComputedStyle(element)
  return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
}

function chooseTarget(): GuideTarget | undefined {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('[data-field-guide]'))
    .filter(isGuideTarget)
    .map(element => ({ element, feature: element.dataset.fieldGuide || 'feature' }))

  if (!candidates.length)
    return undefined

  let unseen = candidates
  try {
    unseen = candidates.filter(candidate => !sessionStorage.getItem(`field-guide-seen:${candidate.feature}`))
  }
  catch {
    // The guide remains available when session storage is restricted.
  }
  const pool = unseen.length ? unseen : candidates
  return pool[Math.floor(Math.random() * pool.length)]
}

function beginGuide() {
  if (motion.matches || document.documentElement.classList.contains('dark'))
    return

  const target = chooseTarget()
  if (!target)
    return

  const rect = target.element.getBoundingClientRect()
  const targetX = rect.left + rect.width / 2 - 44
  const targetY = rect.top + rect.height / 2 - 44
  const startX = targetX < window.innerWidth / 2 ? -92 : window.innerWidth + 8
  const startY = Math.min(Math.max(targetY - 52, 84), window.innerHeight - 132)

  guide.value = target
  guideSprite.value = teleportIn2Sprite
  guidePosition.value = {
    '--guide-start-x': `${startX}px`,
    '--guide-start-y': `${startY}px`,
    '--guide-end-x': `${targetX}px`,
    '--guide-end-y': `${targetY}px`,
  }
  target.element.dataset.fieldGuideActive = 'true'
  try {
    sessionStorage.setItem(`field-guide-seen:${target.feature}`, 'true')
  }
  catch {
    // Remembering prior hints is optional.
  }

  spriteTimer = globalThis.setTimeout(() => {
    guideSprite.value = wavePaperPlaneSprite
  }, 180)

  guideTimer = globalThis.setTimeout(() => clearGuide(), 2300)
}

onMounted(() => {
  motion = matchMedia('(prefers-reduced-motion: reduce)')
  controller = new AbortController()
  const { signal } = controller
  startTimer = globalThis.setTimeout(beginGuide, 5200)
  motion.addEventListener('change', clearGuide, { signal })
  window.addEventListener('scroll', clearGuide, { passive: true, signal })
  window.addEventListener('pointerdown', clearGuide, { passive: true, signal })
  window.addEventListener('keydown', clearGuide, { signal })
  observer = new MutationObserver(clearGuide)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  clearGuide()
  controller?.abort()
  observer?.disconnect()
})
</script>

<template>
  <div
    v-if="guide && guidePosition"
    class="field-feature-guide"
    aria-hidden="true"
    :style="guidePosition"
  >
    <img :src="guideSprite.src" :style="guideSpriteStyle" alt="" decoding="async">
  </div>
</template>
