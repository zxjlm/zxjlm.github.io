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
      { text: '归档', link: '/archives/' },
      { text: '分类', link: '/categories/' },
      { text: '标签', link: '/tags/' },
      { text: '关于', link: '/about/' },
    ],

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
