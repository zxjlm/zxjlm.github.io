# Cloudflare Pages 回滚手册

| 项目 | 值 |
| --- | --- |
| 旧站本地重建基线 | `4bf6b5fad30e78f1530cfecd7f25b62a6ff936f5` |
| 旧站实际生产部署 ID / 独立地址 / SHA | `4ab61b7b-6dbd-4f33-ac9d-f4614bdcd5b0` / [旧生产](https://4ab61b7b.zxjlm-github-io.pages.dev/) / `4bf6b5fad30e78f1530cfecd7f25b62a6ff936f5` |
| Astro 预览部署 ID / 独立地址 / SHA | `cbbaa746-398b-45b4-af4d-77ceb04441e8` / [预览](https://cbbaa746.zxjlm-github-io.pages.dev/) / `320d576aa204cdf4fe690b471242b3833c706ddf` |
| Astro 生产部署 ID / 独立地址 / SHA | `75207c3a-9645-4df9-98ab-ac819062c913` / [生产](https://75207c3a.zxjlm-github-io.pages.dev/) / `320d576aa204cdf4fe690b471242b3833c706ddf` |
| 仓库 / 分支 / 自定义域名 | `zxjlm/zxjlm.github.io` / `source` / `blog.harumonia.moe` |
| 构建根目录、命令及产物 | `/`、`pnpm run build`、`dist` |
| Valaxy 构建运行时记录 | Node `22.16.0`、pnpm `10.17.1`，Pages API 已核实 |
| Astro 构建运行时 | Node `24.13.1`、pnpm `10.17.1` |
| 旧产物重建 | 从 Git SHA 归档安装冻结锁，再构建，细节见 [基线记录](baseline.md) |

## 恢复到 Valaxy

1. 暂停内容发布和新的生产构建，记录当前生产部署及症状。保留切换后的有效内容差量。
2. 在 Cloudflare Pages 项目打开 **Deployments → All deployments**，选取已登记的旧生产 deployment，执行 **Rollback to this deployment**。Pages 预览 deployment 没有该生产回滚操作，预览演练通过部署旧版本到独立预览分支后再部署候选来核验。
3. 核实自定义域名回到 Valaxy，检查文章、相册、两篇游记、订阅和 robots。若发生缓存不一致，先检查 Pages 独立地址，再按路径处理自定义域名缓存。
4. 如继续用 Valaxy 写作，恢复旧运行时和 Git 构建设置。通过提交回退恢复旧树，保留 Git 历史。使用冻结锁重建可恢复产物，确认发布来源一致。
5. 记录实际执行人、恢复时间、部署标识、关键路径状态和可见数据差量。 [Cloudflare Pages 回滚说明](https://developers.cloudflare.com/pages/configuration/rollbacks/)

## 回到 Astro

重新核对故障修复、内容增量、生产环境变量和缓存策略。对新的候选部署重跑预览验收，再按切换清单发布。保留旧生产部署至观察期结束。

已验证三段恢复及重发，见 [Cloudflare 线上验收](cloudflare-acceptance.md)。
