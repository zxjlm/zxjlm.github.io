<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { collectTravelStops, TRAVEL_READING_LINE, type TravelStop } from '../composables/travel';
import type { StaticTravelMap } from '../lib/travel-maps/manifest';

const props = defineProps<{ manifestUrl?: string }>();
const TravelMapBackdrop = defineAsyncComponent(() => import('./TravelMapBackdrop.vue'));
const TravelStaticBackdrop = defineAsyncComponent(() => import('./TravelStaticBackdrop.vue'));

const stops = shallowRef<TravelStop[]>([]);
const manifest = shallowRef<StaticTravelMap>();
const active = ref(-1);
const marker = ref<HTMLElement>();
const controller = new AbortController();
let itinerary: HTMLElement | null | undefined;
let links: NodeListOf<HTMLAnchorElement> | undefined;

function visit(event: MouseEvent) {
  const link = (event.target as Element).closest<HTMLAnchorElement>('.travel-itinerary__stop');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
    return;
  const stop = document.getElementById(link.hash.slice(1));
  if (!stop) return;

  event.preventDefault();
  history.replaceState(history.state, '', link.hash);
  const top = stop.getBoundingClientRect().top + window.scrollY - window.innerHeight * TRAVEL_READING_LINE + 2;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, behavior: reducedMotion ? 'instant' : 'smooth' });
}

onMounted(async () => {
  const content = document.getElementById('article-content');
  if (!content) return;
  stops.value = collectTravelStops(content);
  itinerary = marker.value?.closest('[data-travel-experience]')?.querySelector('.travel-itinerary');
  links = itinerary?.querySelectorAll('.travel-itinerary__stop');
  itinerary?.addEventListener('click', visit);

  if (!props.manifestUrl) return;
  try {
    const response = await fetch(props.manifestUrl, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const map: StaticTravelMap = await response.json();
    if (map.points.length !== stops.value.length || map.points.some(({ lat, lng }, index) => lat !== stops.value[index].lat || lng !== stops.value[index].lng))
      throw new Error('route coordinates differ from article');
    if (!controller.signal.aborted) manifest.value = map;
  }
  catch (error) {
    if (!controller.signal.aborted)
      console.warn('[zaxon] static travel map unavailable', error);
  }
});

watch(active, (index, previous) => {
  stops.value[previous]?.el.classList.remove('travel-stop--active');
  stops.value[index]?.el.classList.add('travel-stop--active');
  links?.[previous]?.classList.remove('travel-itinerary__stop--active');
  links?.[previous]?.removeAttribute('aria-current');
  links?.[index]?.classList.add('travel-itinerary__stop--active');
  links?.[index]?.setAttribute('aria-current', 'location');
});

onBeforeUnmount(() => {
  controller.abort();
  itinerary?.removeEventListener('click', visit);
  stops.value[active.value]?.el.classList.remove('travel-stop--active');
  links?.[active.value]?.classList.remove('travel-itinerary__stop--active');
  links?.[active.value]?.removeAttribute('aria-current');
});
</script>

<template>
  <span ref="marker" hidden />
  <TravelStaticBackdrop v-if="manifest && stops.length" :stops="stops" :map="manifest" v-model:active="active" />
  <TravelMapBackdrop v-else-if="!manifestUrl && stops.length" :stops="stops" v-model:active="active" />
</template>
