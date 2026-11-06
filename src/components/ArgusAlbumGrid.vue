<script setup lang="ts">
import fallbackImage from '../assets/field-notes/thumb-camera.png?url'
import type { ArgusAlbumPhoto } from '../types/albums'

defineProps<{ photos: ArgusAlbumPhoto[] }>()
const emit = defineEmits<{ select: [index: number] }>()

function photoLabel(photo: ArgusAlbumPhoto, index: number) {
  return [photo.originalFilename || `照片 ${index + 1}`, photo.livePhoto ? 'Live Photo' : '', photo.city, photo.capturedAt.slice(0, 10)]
    .filter(Boolean)
    .join(' · ')
}

function select(event: MouseEvent, index: number) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus({ preventScroll: true })
  emit('select', index)
}

function fallBack(event: Event, photo: ArgusAlbumPhoto) {
  if (!(event.currentTarget instanceof HTMLImageElement)) return
  const image = event.currentTarget
  if (image.getAttribute('src') !== photo.previewPath && !image.classList.contains('argus-image--fallback')) {
    image.src = photo.previewPath
  } else if (!image.classList.contains('argus-image--fallback')) {
    image.classList.add('argus-image--fallback')
    image.src = fallbackImage
  }
}
</script>

<template>
  <div class="argus-album-grid">
    <a
      v-for="(photo, index) in photos"
      :key="photo.id"
      class="argus-album-grid__item"
      :href="photo.previewPath"
      :style="{ aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : '4 / 3' }"
      :aria-label="`打开${photoLabel(photo, index)}`"
      @click="select($event, index)"
    >
      <img
        :src="photo.thumbnailPath"
        :alt="photo.originalFilename || `照片 ${index + 1}`"
        loading="lazy"
        decoding="async"
        @error="fallBack($event, photo)"
      >
      <span v-if="photo.livePhoto" class="argus-album-grid__live" aria-hidden="true">Live</span>
    </a>
  </div>
</template>
