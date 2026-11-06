import type { ThemeConfig } from 'valaxy-theme-zaxon'
import { defineValaxyConfig } from 'valaxy'

// `hero` is consumed by local haru-theme; not yet in published 0.1.14 types.
type BlogThemeConfig = ThemeConfig & {
  hero: {
    desktopLight: string
    desktopDark: string
    mobileLight: string
    mobileDark: string
    desktopLightPreview?: string
    desktopDarkPreview?: string
    mobileLightPreview?: string
    mobileDarkPreview?: string
  }
}

export default defineValaxyConfig<BlogThemeConfig>({
  theme: 'zaxon',

  themeConfig: {
    colors: {
      primary: '#0078E7',
    },

    content: {
      lifeCategories: ['起居杂录', '桂苑酌记', '见闻录'],
      devCategories: ['源流清泉'],
    },

    hero: {
      desktopLight: 'https://pic.harumonia.moe/illustration/hero-field-desktop-light.png',
      desktopDark: 'https://pic.harumonia.moe/illustration/hero-field-desktop-dark.png',
      mobileLight: 'https://pic.harumonia.moe/illustration/hero-field-mobile-light.png',
      mobileDark: 'https://pic.harumonia.moe/illustration/hero-field-mobile-dark.png',
      desktopLightPreview: 'https://pic.harumonia.moe/illustration/hero-field-desktop-light-low.webp',
      desktopDarkPreview: 'https://pic.harumonia.moe/illustration/hero-field-desktop-dark-low.webp',
      mobileLightPreview: 'https://pic.harumonia.moe/illustration/hero-field-mobile-light-low.webp',
      mobileDarkPreview: 'https://pic.harumonia.moe/illustration/hero-field-mobile-dark-low.webp',
    },

    nav: [
      { text: '首页', link: '/' },
      { text: '技术', link: '/tech/' },
      { text: '生活', link: '/notes/' },
      { text: '相册', link: '/albums/' },
      { text: '关于', link: '/about/' },
    ],

    albums: {
      enable: true,
      indexPath: '/albums/index.json',
      title: '相册',
      description: '从 Argus 发布的照片记录。',
      featured: {
        enable: false,
        limit: 6,
      },
    },

    footer: {
      since: 2018,
      icon: {
        name: 'i-ri-cloud-line',
        animated: true,
        color: '#0078E7',
        url: '/',
        title: 'Zaxon',
      },
      beian: {
        enable: false,
        icp: '',
      },
    },
  },
})
