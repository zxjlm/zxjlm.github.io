const heroOrigin = 'https://pic.harumonia.moe';
const heroImage = (variant: string) => ({
  preview: `${heroOrigin}/illustration/hero-field-${variant}-low.webp`,
  full: `${heroOrigin}/illustration/hero-field-${variant}.png`,
});

export const siteConfig = {
  url: 'https://blog.harumonia.moe',
  lang: 'zh-CN',
  title: 'Zaxon',
  subtitle: 'Find the key of soul',
  author: 'harumonia',
  timeZone: 'Asia/Shanghai',
  since: 2018,
  nav: [
    { label: '首页', href: '/' },
    { label: '技术', href: '/tech/' },
    { label: '生活', href: '/notes/' },
    { label: '相册', href: '/albums/' },
    { label: '关于', href: '/about/' },
  ],
  sections: {
    tech: { title: '技术', kind: 'dev', href: '/tech/' },
    notes: { title: '生活记录', kind: 'life', href: '/notes/' },
    archives: { title: '归档', kind: 'all', href: '/archives/' },
  },
  content: {
    lifeCategories: ['起居杂录', '桂苑酌记', '见闻录'],
    devCategories: ['源流清泉'],
  },
  hero: {
    origin: heroOrigin,
    desktop: { light: heroImage('desktop-light'), dark: heroImage('desktop-dark') },
    mobile: { light: heroImage('mobile-light'), dark: heroImage('mobile-dark') },
  },
  albums: {
    indexPath: '/albums/index.json',
    title: '相册',
    description: '从 Argus 发布的照片记录。',
    featured: { enable: false, limit: 6 },
  },
  social: [
    { label: 'RSS', href: '/atom.xml', icon: 'rss' },
    { label: 'GitHub', href: 'https://github.com/zxjlm', icon: 'github' },
    { label: '哔哩哔哩', href: 'https://space.bilibili.com/1801214', icon: 'bilibili' },
    { label: '电子邮件', href: 'mailto:zxjlm233@gmail.com', icon: 'mail' },
  ] as const,
  theme: {
    fireflies: true,
    companions: true,
    featureGuide: true,
    snowlin: { enable: true, frequency: 'normal' },
    travel: {
      mode: 'dynamic' as 'dynamic' | 'static',
      style: 'https://tiles.openfreemap.org/styles/positron',
      darkStyle: 'https://tiles.openfreemap.org/styles/fiord',
      attribution: 'OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors',
      zoom: 14,
      opacity: 0.42,
    },
  },
};
