<script lang="ts" setup>
const fireflies = [
  { top: '12%', left: '9%', blinkDelay: '0s', blinkDuration: '3.4s', wanderDelay: '0s', wanderDuration: '20s' },
  { top: '28%', left: '63%', blinkDelay: '-1.4s', blinkDuration: '2.8s', wanderDelay: '-7s', wanderDuration: '17s' },
  { top: '44%', left: '22%', blinkDelay: '-2.7s', blinkDuration: '4.2s', wanderDelay: '-14s', wanderDuration: '25s' },
  { top: '58%', left: '78%', blinkDelay: '-0.9s', blinkDuration: '3.0s', wanderDelay: '-4s', wanderDuration: '19s' },
  { top: '74%', left: '44%', blinkDelay: '-3.6s', blinkDuration: '4.8s', wanderDelay: '-17s', wanderDuration: '28s' },
  { top: '19%', left: '87%', blinkDelay: '-2.1s', blinkDuration: '3.7s', wanderDelay: '-10s', wanderDuration: '22s' },
  { top: '63%', left: '13%', blinkDelay: '-4.4s', blinkDuration: '2.6s', wanderDelay: '-3s', wanderDuration: '16s' },
  { top: '37%', left: '51%', blinkDelay: '-5.2s', blinkDuration: '3.9s', wanderDelay: '-20s', wanderDuration: '27s' },
]
</script>

<template>
  <div class="field-fireflies" aria-hidden="true">
    <span
      v-for="fly in fireflies"
      :key="`fly-${fly.top}-${fly.left}`"
      class="field-fireflies__firefly"
      :style="{
        '--fly-top': fly.top,
        '--fly-left': fly.left,
        '--fly-blink-delay': fly.blinkDelay,
        '--fly-blink-duration': fly.blinkDuration,
        '--fly-wander-delay': fly.wanderDelay,
        '--fly-wander-duration': fly.wanderDuration,
      }"
    />
  </div>
</template>
