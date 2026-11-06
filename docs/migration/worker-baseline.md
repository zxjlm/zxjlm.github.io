# 阶段 1 · Valaxy 地图 Worker 对照

在 Zaxon 0.1.23 的发布源码制作 [独立补丁](valaxy-worker-preload.patch)，仅将地图 Worker URL 导入移入游记地图的挂载流程。单改 Vite 的预加载依赖过滤仍会留下问题，Valaxy SSG 会根据 SSR manifest 另行注入预加载标签。

补丁在隔离的 Valaxy 安装中验证。主题发布仓库可以运行 `git apply --check <patch>`。重建基线时，可在临时 Valaxy 副本的 `node_modules/valaxy-theme-zaxon` 中运行 `patch -p2 < /path/to/valaxy-worker-preload.patch` 后重新构建。保留补丁前后的两份 `dist`，固定提交、依赖、Node 版本及测量脚本。回到 Astro 工作目录执行。

```sh
VALAXY_DIST=/path/to/before/dist \
VALAXY_OPTIMIZED_DIST=/path/to/after/dist \
BENCHMARK_OUTPUT=docs/migration/worker-budget.json pnpm benchmark
```

| 检查 | 原产物 | 应用补丁 |
| --- | ---: | ---: |
| 包含地图 Worker modulepreload 的 HTML | 179 | 0 |
| 首页自动 JS | 369.4 KiB | 228.0 KiB |
| 普通公式文章自动 JS | 381.6 KiB | 240.2 KiB |
| 相册目录自动 JS | 370.0 KiB | 228.7 KiB |
| 相册详情自动 JS | 369.3 KiB | 228.0 KiB |
| 京都游记自动 JS | 386.3 KiB | 244.9 KiB |
| 京都游记含动态地图引擎及 Worker | 666.2 KiB | 666.3 KiB |

JS 体积为独立 gzip 压缩后按依赖求和。Chromium 本地预览验证补丁后首页、普通文章和相册均无地图 Worker 请求，京都与大阪各收到一次 Worker HTTP 200。该轮对照验证了加载边界，地图渲染和真实设备性能留给后续验收。 [完整预算](worker-budget.json)

如果只为减少普通页流量，可先在 Valaxy 发布这项优化，再实测性能。迁移继续按内容集合、静态页面和可扩展的摄影旅行发布链路评估，性能比较采用修复后的 Valaxy 基线。
