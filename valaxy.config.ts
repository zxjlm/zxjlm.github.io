import type { ThemeConfig } from 'valaxy-theme-zaxon'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  theme: 'zaxon',

  themeConfig: {
    colors: {
      primary: '#0078E7',
    },

    nav: [
      { text: '首页', link: '/' },
      { text: '生活', link: '/notes/' },
      { text: '归档', link: '/archives/' },
      { text: '分类', link: '/categories/' },
      { text: '标签', link: '/tags/' },
      { text: '关于', link: '/about/' },
    ],

    content: {
      lifeCategories: ['起居杂录', '桂苑酌记', '见闻录'],
      devCategories: ['源流清泉'],
    },

    footer: {
      since: 2018,
      icon: {
        name: 'i-ri-cloud-line',
        animated: true,
        color: '#0078E7',
      },
      beian: {
        enable: false,
      },
    },
  },
})
