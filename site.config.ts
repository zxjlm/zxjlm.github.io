import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://blog.harumonia.moe',
  lang: 'zh-CN',
  title: 'Zaxon',
  subtitle: 'Find the key of soul',
  author: {
    name: 'harumonia',
    avatar: 'https://harumona-blog.oss-cn-beijing.aliyuncs.com/blog/Ocabe.webp',
    status: {
      emoji: '😊',
      message: '永远相信美好的事情即将发生',
    },
  },
  description: 'lazy',
  favicon: '/yun.svg',
  social: [
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
    {
      name: 'GitHub',
      link: 'https://github.com/zxjlm',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: '哔哩哔哩',
      link: 'https://space.bilibili.com/1801214',
      icon: 'i-ri-bilibili-line',
      color: '#FF8EB3',
    },
    {
      name: 'E-Mail',
      link: 'mailto:zxjlm233@gmail.com',
      icon: 'i-ri-mail-line',
      color: '#8E71C1',
    },
  ],
  search: {
    enable: true,
  },
  sponsor: {
    enable: true,
    title: "I'm so cute. Please give me money.",
    methods: [
      {
        name: '支付宝',
        url: 'https://harumona-blog.oss-cn-beijing.aliyuncs.com/blog/IMG_3741.JPG',
        color: '#00A3EE',
        icon: 'i-ri-alipay-line',
      },
      {
        name: '微信支付',
        url: 'https://harumona-blog.oss-cn-beijing.aliyuncs.com/blog/IMG_3742.JPG',
        color: '#2DC100',
        icon: 'i-ri-wechat-pay-line',
      },
    ],
  },
})
