<script lang="ts" setup>
import notebook from '../assets/field-notes/icon-notebook.png?url'
import travelerStanding from '../assets/field-notes/traveler-standing.png?url'
import travelerWriting from '../assets/field-notes/traveler-writing.png?url'
</script>

<template>
  <div class="field-companions" aria-hidden="true">
    <div class="field-companion field-companion--traveler">
      <img class="field-companion__pose field-companion__pose--standing" :src="travelerStanding" alt="" loading="lazy" decoding="async">
      <img class="field-companion__pose field-companion__pose--writing" :src="travelerWriting" alt="" loading="lazy" decoding="async">
    </div>

    <span
      class="field-companion field-companion--notebook"
      :style="{ '--companion-image': `url(${notebook})` }"
    />
  </div>
</template>
