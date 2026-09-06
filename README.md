# MillonW · 个人主页

极简黑白静态主页，双轨呈现「内容创作者 × 全栈工程师」。零依赖、零构建。

线上：<https://millonw.github.io/>

---

## 本地预览

```bash
python -m http.server 8000
# http://localhost:8000
```

双击 `index.html` 也能看，但图片懒加载与复制功能在 `file://` 下受限。

## 部署

```bash
git add -A
git commit -m "说明"
git push
```

推完约 30～60 秒自动上线。仓库 `MillonW/MillonW.github.io`，Pages 走 `main` + `/`。

## 改内容

文案全在 `assets/js/main.js` 顶部「站点内容配置」区，改完刷新即可，不用碰 DOM：

| 变量 | 作用 |
|---|---|
| `SITE` | 名字、名言、B 站主页地址 |
| `STACK` | 技术栈（名称 / 描述 / 标签 / 能力条数值） |
| `STUDIOS` | 工作室介绍 |
| `TIMELINE` | 创作历程时间线 |
| `CONTACTS` | 联系方式（B 站 / QQ / 微信） |
| `CATS`、`CAT_ORDER` | 作品分类名与顺序 |
| `PER_PAGE` | 作品墙每页数量，默认 12 |

## 目录

```
index.html              页面结构
.nojekyll               禁用 Jekyll
assets/css/style.css    样式（设计令牌 / 组件 / 动效 / 响应式）
assets/js/fallback.js   B 站数据兜底快照
assets/js/bili.js       数据接入层（实时优先 → 回落兜底）
assets/js/main.js       内容配置 + 渲染 + 交互
assets/img/avatar.jpg   头像
```

## 约定与坑

- 脚本加载顺序固定 `fallback.js → bili.js → main.js`，**不能调换**
- `fallback.js` 是兜底层，**不能删**；删了且实时拉取失败会开天窗
- 想要真·实时数据需自建代理，填 `assets/js/bili.js` 顶部的 `CONFIG.proxy`
- 封面图必须带 `referrerpolicy="no-referrer"`，否则 B 站 CDN 校验 Referer 返回 403

## 本机环境备忘

- GitHub CLI 在 `C:\Users\admin\.workbuddy\binaries\gh\bin\gh.exe`，**未加入 PATH**
- 本机 curl 访问 HTTPS 必须加 `--ssl-no-revoke`（Windows schannel 吊销检查误报）
- 本机 SSH 22 端口不通，443 端口可用
- 查部署状态：`gh api repos/MillonW/MillonW.github.io/pages`
