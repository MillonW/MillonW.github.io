# 项目长期记忆 · millonw-homepage

## 部署信息

| 项目 | 值 |
|---|---|
| 仓库 | `MillonW/MillonW.github.io`（public） |
| 线上地址 | https://millonw.github.io/ |
| 分支 / 目录 | `main` / `/` |
| 平台 | GitHub Pages（自动构建） |

## 日常更新流程

改完文件后：

```bash
cd C:/Users/admin/Desktop/millonw-homepage
git add -A
git commit -m "描述"
git push
```

推送后约 30～60 秒自动上线。

> 约定：改完先本地验证，**推送前须经用户确认**，不要自动 push。
> 另：大改前先备份源文件到桌面带时间戳的目录。

## 协作偏好

- 步骤 / 流程说明一律用**文字或表格**，不要画流程图（用户明确要求，已同步到全局记忆）

## 工具与命令备忘

- GitHub CLI：`C:\Users\admin\.workbuddy\binaries\gh\bin\gh.exe`（未加入 PATH，需用全路径调用）
- 查构建状态：`gh api repos/MillonW/MillonW.github.io/pages`
- 本机 curl 访问 HTTPS 必须加 `--ssl-no-revoke`（Windows schannel 吊销检查误报）
- 本机 SSH 22 端口不通，443 端口可用
- **`git push` 走 https 已恢复可用（2026-09-25 验证）**。之前长期被代理 502 拦截。
  若再次遇到 push 超时/失败，改用 `.workbuddy/deploy_api.py` 走 Git Data REST API 兜底。
  注意：main 的 push 偶发首次超时（SIGTERM），后台重试一次即成功，不必急着换方案。
- 新建分支默认**只在本地**，必须 `git push -u origin <分支名>` 才会出现在 GitHub 上

## 项目约定

- 纯静态零构建，根目录 `.nojekyll` 必须保留
- 脚本加载顺序固定：`fallback.js → bili.js → main.js`（fallback 必须先加载）
- `assets/js/fallback.js` 是 B 站数据兜底层，**不能删**
- 文案大部分集中在 `assets/js/main.js` 顶部配置区（`SITE` / `STACK` / `STUDIOS` / `TIMELINE`），改文案不用碰 DOM
- **例外**：首屏 `I build ___` 的轮播词在 `index.html` 的 `#roleRotator` 里（不在 main.js），
  换词要改 HTML。切换间隔 2600ms 由 `initRotator()` 控制
- 技术栈 `STACK` 的序号由 `renderStack()` 的 `pad2(i + 1)` 自动生成，增删项不用管编号
