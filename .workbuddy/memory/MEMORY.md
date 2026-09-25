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
- **`git push` 走 https 是「间歇性」可用**（同一天内时通时断，被代理 502 拦是常态）。
  错误形态：`CONNECT tunnel failed, response 502` / `Empty reply from server` / SIGTERM 超时。
  应对顺序：先重试 1～2 次（常能过）→ 仍失败就走 REST API 兜底，
  **不要**因为一次失败就判定"网络不通"（两种通道互不相通，git 挂的时候 API 往往是通的）。
- **REST API 兜底推送**：`python .workbuddy/deploy_api.py <分支名>`（默认 main）
  自动算改动文件、自动取本地 commit message。删除远程分支可用
  `DELETE /repos/{repo}/git/refs/heads/<branch>`。
  注意 `gh api` 在本机会报未认证，改用 python + `gh auth token` 直接调 API 更稳
- 新建分支默认**只在本地**，必须 `git push -u origin <分支名>` 才会出现在 GitHub 上

## 项目约定

- 纯静态零构建，根目录 `.nojekyll` 必须保留
- 脚本加载顺序固定：`fallback.js → bili.js → main.js`（fallback 必须先加载）
- `assets/js/fallback.js` 是 B 站数据兜底层，**不能删**
- 文案大部分集中在 `assets/js/main.js` 顶部配置区（`SITE` / `STACK` / `STUDIOS` / `TIMELINE`），改文案不用碰 DOM
- **例外**：首屏 `I build ___` 的轮播词在 `index.html` 的 `#roleRotator` 里（不在 main.js），
  换词要改 HTML。切换间隔 2600ms 由 `initRotator()` 控制
- 技术栈 `STACK` 的序号由 `renderStack()` 的 `pad2(i + 1)` 自动生成，增删项不用管编号
- **背景是静态图片，不是视频**（2026-09-25 起）：
  图片 `assets/img/bg-poster.jpg`（27KB，原视频第一帧），容器 `.bg-still` + `.bg-still__veil`。
  `background.mp4` 和 `initBgVideo()` 整套视频逻辑已删除。换背景图直接替换这个 jpg 即可。
  .media query 约定：reduced-motion/reduced-data 下**不隐藏**背景（静态无动效）；
  forced-colors 下**隐藏**（保证高对比度可读性）
