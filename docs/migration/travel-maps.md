# 游记地图

京都 45 处、大阪 43 处坐标沿用游记 Markdown 的坐标段落写法。构建生成正文坐标和行程链接，行程无需 JavaScript 即可跳转。动态地图失败时仍可用行程阅读正文。

## 选择模式

`src/site.config.ts` 中的 `theme.travel.mode` 默认为 `dynamic`，沿用 OpenFreeMap 在线底图。游记加载 MapLibre、对应 CSS 和 Worker。普通文章、首页和相册的加载链不含地图脚本。样式服务的可选 `circle-11` 图标缺失时，MapLibre 使用透明占位，保留地名标签。减少动画模式下相机在地点间直接切换，行程跳转关闭平滑滚动。

设为 `static` 或在部署环境统一配置 `TRAVEL_MAP_MODE=static`，即可选择离线预生成底图。读者使用同源 WebP 帧和 Canvas，无需访问地图服务或加载 MapLibre Worker。静态资源损坏或未发布时，构建会列出受影响的游记并失败。静态阅读时如个别帧加载失败，画布保留最近的可用帧。

## 生成和部署静态地图

常规构建只需站点依赖。编辑者生成缓存时另外安装锁定的渲染工具，首次下载 Native 二进制和底图资源需要网络。

```sh
pnpm --dir scripts/travel-map-tooling install --frozen-lockfile
pnpm travel:maps
TRAVEL_MAP_MODE=static pnpm travel:maps:check
TRAVEL_MAP_MODE=static pnpm build
```

Linux 无显示环境可在安装 Xvfb 和 Mesa 后，以 `xvfb-run -a pnpm travel:maps` 启动渲染。Cloudflare Pages 读取随候选提交一起发布的 `public/travel-maps/`，验证缓存时无需安装发布工具或请求底图服务。当前选定动态模式，Valaxy 基线和 Astro 候选目录均无真实游记的静态缓存。

- `--file src/content/posts/2024-06-kyoto.md` 仅生成一篇。草稿无需生成缓存。
- `--cache-dir <目录>` 可指定公有目录外的独立缓存，默认 `.cache/zaxon/`。发布目录缺少资源时，命令先尝试恢复已验证的缓存。
- 资源路径基于有序坐标、样式 URL、缩放、署名及渲染版本。Manifest v2 记录每个视口与主题的路径，WebP 文件名校验内容哈希。渲染先原子写图片，完成后再写 manifest。
- 上游样式内容可能在 URL 不变时更新。确认要采用新底图时，使用 `pnpm travel:maps --force` 重新生成并发布资源。生成工具保留旧资源以免正在阅读的页面丢失帧。

## 本地回归

`node scripts/verify-travel-maps.mjs` 用本地最小样式实际渲染 Native 地图，覆盖明暗主题、桌面和手机、WebP 输出、草稿跳过、缓存恢复、坐标变化及损坏文件。macOS 使用锁文件全新安装独立工具后已通过验证，Metal 需要系统着色器服务。隔离的 Astro 工程验证了缺失缓存时构建失败，以及完整缓存时桌面与 390px 手机可读同源 WebP 和 Canvas、切换明暗主题且未请求动态地图资源。

启动动态构建的本地预览后，运行 `node scripts/verify-travel-browser.mjs`，需要时可通过 `BASE_URL` 指定预览地址。该脚本以本地矢量瓦片替代底图服务，验证京都桌面和大阪 390px 手机的坐标、行程、署名、主题切换、图标兼容和 Worker 加载边界。Cloudflare 预览阶段可设置 `REAL_EXTERNAL=1`，用相同的检查验证实际底图和外部资源。
