# Argus 相册发布与本地验收

Astro 根据 `public/albums/index.json` 与每项的 `manifest_path` 静态生成相册目录、详情和网格。Argus 的 `pages/albums/*.md` 是 Valaxy 的路由占位文件。Astro 直接从索引生成路由，只导入 Argus 已清洗的 v1 JSON。相册图片与视频继续使用导出的公开 URL。Astro 是正式发布来源。迁移基线来自 Valaxy 的已提交快照。

## 发布相册

在独立的暂存目录使用 Argus 已有的 `valaxy-zaxon` 导出插件。完整导出反映新增和删除。确认 Argus 返回成功、完整导出中只有拟公开的相册，再导入 Astro。

```sh
# 在 Argus backend 目录执行
album_stage="$(mktemp -d)"
uv run argus-photo album export all --site "$album_stage" --overwrite

# 在 Astro 项目根目录执行，沿用上面同一个 shell 中的 album_stage
node scripts/import-argus-albums.mjs "$album_stage"
pnpm build
pnpm preview
```

- 导入器以暂存索引完整替换 `public/albums/` 的生成 JSON。导入前核对暂存索引，确认保留项齐全。通过 `git diff` 核对公开清单、相册路径与更新范围。
- 已发布相册沿用原 slug。单册新增或更新时，先把当前 `public/albums/` 复制到空暂存目录的 `public/albums/`，再运行 `uv run argus-photo album export <album-id> --site "$album_stage" --slug <published-slug> --overwrite`。Argus 会根据暂存目录中的详情重新生成索引。涉及自定义 slug 的全量更新可逐册向同一个空暂存目录导出，并传入原 slug。
- 删除单册时可全量导出剩余相册，或从暂存目录删除该相册的 manifest 目录，再重新导出一个保留的相册以让 Argus 重建索引。确认最后一本也要下架时，用 `node scripts/import-argus-albums.mjs --empty` 生成空索引。
- 相册索引和详情会校验版本、身份、路径、照片数量和重复项。构建时遇到坏索引或详情会打印警告并显示不可用提示。单张照片缺图时优先尝试同一照片的另一种尺寸，其次显示占位图或错误提示。灯箱视频加载失败时显示静态照片。

首页默认从索引提供的封面和缩略图中随机抽取至多两张。无脚本时显示静态的前两张。开启 `siteConfig.albums.featured.enable` 后，优先展示 manifest 标注为 `featured` 且按 `featured_order` 排序的照片，候选数由 `limit` 控制。当前生产基线开关关闭。常驻装饰通过 `siteConfig.theme` 配置，Snowlin 和功能导览空闲时启动，萤火虫和伴随角色由静态 HTML 与 CSS 渲染。赞助界面按旧站功能对照延后。

## 验收记录

- 旧站基线保留 4 个相册、32 张照片，详情 JSON 与公开相册地址延续。
- 使用 Argus 自带的静态导出服务与内存 SQLite，在隔离站点导出含两张照片的测试册和一本空册，随后演练更新、下架和清空。每次导入后生成 Astro 静态产物，检查路由、照片顺序、地点、Live Photo 视频 URL 和空相册状态。
- Chromium 本地演练通过鼠标打开、左右键、Tab/Shift+Tab 焦点环绕、Esc 关闭、背景滚动锁定与焦点恢复。390×844 竖屏和 844×390 横屏验证按钮可用及视频失败后图片回退。移动导航的 Esc 关闭、明暗主题持久化和浅色模式功能导览也通过。
- 实况测试使用一组通过 Apple ContentIdentifier 核对的真实静态与视频配对。测试在本地用去掉元数据的 JPEG 和 H.264 MOV 衍生文件提供浏览器响应，验证播放进度增加，以及视频请求失败后静态图片加载成功。样本与衍生文件未纳入仓库或部署产物，Cloudflare 环境的实际媒体请求留待线上验收。
- `node --test scripts/album-manifests.test.mjs` 覆盖 v1 校验、非法路径与重复项、索引/详情冲突、更新和删除、重复导入、清空，以及既有相册 slug 改变时保留原快照。
