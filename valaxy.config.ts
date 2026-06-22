import type { UserThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

const safelist = [
  'i-ri-home-4-line',
  'i-ri-archive-line',
  'i-ri-folder-2-line',
  'i-ri-price-tag-3-line',
  'i-ri-genderless-line',
  'i-ri-calendar-check-line',
  'i-ri-rss-line',
  'i-ri-qq-line',
  'i-ri-github-line',
  'i-ri-bilibili-line',
  'i-ri-twitter-x-fill',
  'i-ri-mail-line',
  'i-ri-alipay-line',
  'i-ri-wechat-pay-line',
]

export default defineValaxyConfig<UserThemeConfig>({
  theme: 'yun',

  themeConfig: {
    colors: {
      primary: '#0078E7',
    },

    banner: {
      enable: true,
      title: '迷雾中的藏宝地',
    },

    bg_image: {
      enable: true,
      url: 'https://cdn.jsdelivr.net/gh/YunYouJun/cdn/img/bg/stars-timing-0-blur-30px.jpg',
      dark: 'https://cdn.jsdelivr.net/gh/zxjlm/my-static-files@master/img/bg_tree_gl.webp',
      opacity: 0.7,
    },

    avatar: {
      enable: true,
      url: 'https://harumona-blog.oss-cn-beijing.aliyuncs.com/blog/Ocabe.webp',
      rounded: true,
      opacity: 1,
    },

    pages: [
      {
        name: '我的小伙伴们',
        url: '/links/',
        icon: 'i-ri-genderless-line',
        color: 'dodgerblue',
      },
      {
        name: 'Schedule',
        url: '/schedule/',
        icon: 'i-ri-calendar-check-line',
        color: '#0078E7',
      },
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

    notice: {
      enable: true,
      content: 'Thanks for watching my blog.',
    },

    say: {
      enable: true,
      api: 'https://cdn.jsdelivr.net/gh/ElpsyCN/say@gh-pages/sentences.json',
      hitokoto: {
        enable: true,
        api: 'https://v1.hitokoto.cn',
      },
    },

    fireworks: {
      enable: true,
      colors: [
        '102, 167, 221',
        '62, 131, 225',
        '33, 78, 194',
      ],
    },

    creative_commons: {
      license: 'by-nc-sa',
      language: 'deed.zh',
      post: true,
      clipboard: false,
    },

    google_analytics: {
      enable: true,
      id: 'G-EBNGE3F0F6',
    },
  },

  unocss: { safelist },
})
