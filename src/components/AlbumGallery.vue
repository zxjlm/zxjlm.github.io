<script setup lang="ts">
import { ref } from 'vue';
import type { ArgusAlbumPhoto } from '../types/albums';
import ArgusAlbumGrid from './ArgusAlbumGrid.vue';
import ArgusAlbumLightbox from './ArgusAlbumLightbox.vue';
defineProps<{ photos: ArgusAlbumPhoto[] }>();
const activeIndex = ref(-1);
</script>
<template>
  <ArgusAlbumGrid :photos="photos" @select="activeIndex = $event" />
  <ArgusAlbumLightbox :photos="photos" :active-index="activeIndex" @update="activeIndex = $event" @close="activeIndex = -1" />
</template>
