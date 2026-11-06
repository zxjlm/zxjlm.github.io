# Reused source and assets

- Zaxon theme: `valaxy-theme-zaxon@0.1.23`, author Harumonia, MIT. Source: <https://github.com/zxjlm/valaxy-theme-zaxon>. License copied to `vendor/ZAXON-LICENSE`.
- Theme SCSS, illustrations, sprites, and fonts are copied from that package. Font license files remain in `src/assets/fonts/`.
- `ArgusAlbumGrid.vue`, `ArgusAlbumLightbox.vue`, `FieldCompanions.vue`, `FieldFireflies.vue`, `FieldSnowlin.vue`, `FieldFeatureGuide.vue`, `travel.ts`, `travel-motion.ts`, `travel-frame-cache.ts` and `travel-tiles.ts` are retained from the theme.
- `TravelMapBackdrop.vue` and `TravelStaticBackdrop.vue` use the local appearance store. The standalone map publisher adapts the theme’s MapLibre Native renderer and manifest v2 cache.
- `src/composables/config.ts` provides only the settings and appearance state required by the retained Vue components. It has no Valaxy or Vue Router dependency.
- Inline navigation and social SVGs use Remix Icon 4.8.0 by Remix Design, Apache-2.0. License copied to `vendor/REMIX-ICON-LICENSE`.
- The Sass CSS-variable mixin and framework base styles have local replacements. `src/lib/remark-travel-stops.mjs` ports the coordinate-paragraph behavior to Astro's configured remark pipeline.
- Blog Markdown and Argus manifests are a local snapshot of the user's source repository; original content remains governed by its author's terms.

No image or map tile hosting was changed as part of this validation.
