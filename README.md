# MillonW · 个人主页

> 科技服务于人，人文点亮世界

ins 极简黑白风格的静态个人主页，**双轨**呈现「内容创作者 × 全栈工程师」两个身份。
零依赖、零构建，纯 HTML + CSS + 原生 JS，可直接部署到 GitHub Pages。

- 黑白两套配色，一键切换（圆形扩散过渡）
- 首屏逐字入场、滚动叙事、数字滚动、卡片 FLIP 重排等动效
- 移动端 / 平板 / 桌面三档适配，触摸设备自动降级
- 尊重 `prefers-reduced-motion` 与 `prefers-color-scheme`

---

## 一、本地预览

```bash
cd millonw-homepage
python3 -m http.server 8000
# 打开 http://localhost:8000
```

直接双击 `index.html` 也能看，但建议用本地服务器（图片懒加载与复制功能在 `file://` 下受限）。

---

## 二、部署到 GitHub Pages

### 1. 创建仓库

仓库名**必须**叫 `MillonW.github.io`（用户名 + `.github.io`），这样访问地址就是
`https://millonw.github.io`，不带子路径。

### 2. 推送代码

```bash
cd millonw-homepage
git init
git add .
git commit -m "feat: 个人主页上线"

git remote add origin git@github.com:MillonW/MillonW.github.io.git
git branch -M main
git push -u origin main
```

### 3. 开启 Pages

仓库 → **Settings** → **Pages** → Source 选 **Deploy from a branch** → 分支 `main`、目录 `/ (root)` → Save。

等 1～2 分钟，访问 <https://millonw.github.io> 即可。

### 4. 自定义域名（可选）

在仓库根目录放一个 `CNAME` 文件，内容只写域名：

```
millonw.com
```

再到域名服务商添加解析：

| 类型 | 主机名 | 值 |
|---|---|---|
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `CNAME` | `www` | `MillonW.github.io` |

---

## 三、B 站数据是怎么更新的

### 先说结论：纯静态页面上做不到「真·实时」

B 站接口在浏览器端有两个硬限制：

1. `api.bilibili.com` **不返回 CORS 头**，浏览器 `fetch` 会被跨域拦截；
2. 用 JSONP 绕跨域时，响应 `Content-Type` 是 `application/json`，会被 Chrome 的 **ORB** 阻止；
   同时 B 站新版风控 `-352` 要求 `Referer` 来自 `space.bilibili.com`，
   而 GitHub Pages / 静态站无法伪造 Referer。

所以浏览器直连 B 站基本会被拦截。当前策略是：

- 页面**每次加载都会尝试**拉取 B 站实时数据；
- 拉取失败时使用 `assets/js/fallback.js` 里的兜底快照，保证页面永远有内容可展示；
- 数据徽章会如实显示「实时数据」或「快照数据」。

### 兜底数据在哪儿、怎么更新

`assets/js/fallback.js` 顶部就是 `window.__BILI_FALLBACK__`，里面是可读的 JSON：

```js
window.__BILI_FALLBACK__ = {
  "profile": { "name": "MillonW", "follower": 39075, "likeNum": 2735801, "archiveCount": 83, ... },
  "videos": [ { "bvid": "...", "title": "...", "view": 4065618, "cat": "remix" }, ... ]
};
```

想更新数据时，让维护者重新抓取 B 站（或用代理拿到的实时数据）覆盖这个对象即可。
**这个文件是兜底层，不要删除**——删了且实时拉取又失败，页面会开天窗。

### 想要真·实时？

自建一个转发服务（比如 Cloudflare Worker：服务端带 Referer 请求 B 站 + 返回 CORS 头），
然后把 `assets/js/bili.js` 顶部的 `CONFIG.proxy` 指向它：

```js
proxy: 'https://your-worker.example.com/bili?mid='
```

页面会自动走代理拿实时数据，失败时仍然回落到 `fallback.js` 兜底。

---

## 四、改内容

所有文案集中在 `assets/js/main.js` 顶部的 **站点内容配置** 区，改完刷新即可，不用碰 DOM：

| 变量 | 作用 |
|---|---|
| `SITE` | 名字、名言、B 站主页地址 |
| `STACK` | 技术栈条目（名称 / 描述 / 标签 / 能力条数值） |
| `STUDIOS` | 工作室介绍 |
| `TIMELINE` | 创作历程时间线 |
| `CONTACTS` | 联系方式（B 站 / QQ / 微信） |
| `CATS` | 作品分类名 |
| `PER_PAGE` | 作品墙每页显示数量，默认 12 |

作品墙数据优先从 B 站接口实时拉取，失败时使用 `assets/js/fallback.js` 兜底。

---

## 五、目录结构

```
millonw-homepage/
├── index.html                   页面结构（入口，GitHub Pages 根目录直接识别）
├── .nojekyll                   禁用 Jekyll，纯静态零处理
├── README.md                   本文件：部署 / 数据 / 维护说明
└── assets/
    ├── css/
    │   └── style.css            样式（设计令牌、组件、动效、响应式）
    ├── img/
    │   └── avatar.jpg           头像
    └── js/
        ├── fallback.js          B站数据兜底快照（可读 JSON，勿删）
        ├── bili.js              数据接入层（优先实时拉取 → 回落 fallback）
        └── main.js              内容配置 + 渲染 + 交互
```

> 约定：脚本加载顺序为 `fallback.js → bili.js → main.js`。
> `fallback.js` 必须先于 `bili.js` 加载，因为 `bili.js` 运行时才去读 `window.__BILI_FALLBACK__`。

---

## 六、常见问题

**Q：封面图裂了 / 全是占位？**
B 站 CDN 会校验 Referer，非 `bilibili.com` 来源一律 403。
代码里已给 `<img>` 加上 `referrerpolicy="no-referrer"` 解决。
如果哪天又挂了，卡片会显示极简占位块，版面不会塌。

**Q：数据徽章显示「快照」？**
说明运行时没拿到实时数据，正在展示 `fallback.js` 兜底——这是预期行为，不是报错。
想要实时请看上面「想要真·实时」一节，配置一个代理即可。

**Q：手机上动画卡顿？**
触摸设备会自动关闭自定义光标与视差；系统开启「减少动效」时所有动画自动降级为瞬时切换。

---

## 七、技术说明

- 无框架、无构建、无第三方库
- 图片懒加载 + B 站 CDN 自动压缩（`@480w_300h_1c.webp`，单张约 12 KB）
- 主题切换使用 View Transitions API（不支持时降级为普通过渡）
- 全站语义化标签，支持键盘导航与 `focus-visible`
