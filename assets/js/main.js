/* ============================================================
 * main.js · MillonW 个人主页交互与渲染
 * 零依赖 · 原生 JS · 多端适配
 * ============================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════
   * 0. 站点内容配置
   *    —— 想改文案就改这里，不需要碰 DOM 结构
   * ══════════════════════════════════════════════════ */
  var SITE = {
    name: 'MillonW',
    creed: ['科技服务于人', '人文点亮世界'],
    bilibili: 'https://space.bilibili.com/1004939949'
  };

  /* 技术栈 —— 描述与数值可按实际情况调整 */
  var STACK = [
    {
      name: 'JavaScript', years: 'MAIN',
      desc: '前端交互与动效的主力语言。负责页面架构、组件逻辑、滚动叙事与跨端适配，偏爱零依赖的原生实现——这个页面本身就是纯原生写的。',
      tags: ['ES2022', 'Canvas', 'Web Animations', '响应式'],
      bars: [['熟练度', 92], ['工程化', 85], ['动效实现', 88]]
    },
    {
      name: 'Python', years: 'DATA',
      desc: '数据抓取、处理与自动化的首选。B 站数据同步脚本、定时任务、数据清洗与 AI 能力接入，都由它串起来。',
      tags: ['Requests', 'BeautifulSoup', 'Pandas', '自动化'],
      bars: [['熟练度', 88], ['数据处理', 84], ['自动化', 90]]
    },
    {
      name: 'Node.js', years: 'SERVER',
      desc: '服务端运行时与工程化工具链。接口服务、CLI 工具、构建流程与静态站部署，打通从开发到上线的最后一公里。',
      tags: ['Express', 'CLI', '构建工具', 'REST API'],
      bars: [['熟练度', 82], ['服务端', 80], ['工程化', 78]]
    },
    {
      name: 'PHP', years: 'BACKEND',
      desc: '传统 Web 后端与内容系统的老搭档。接口开发、数据库设计与服务端业务逻辑，稳而快地支撑产品落地。',
      tags: ['Laravel', 'MySQL', 'REST API', '后端架构'],
      bars: [['熟练度', 80], ['后端开发', 82], ['数据库', 76]]
    },
    {
      name: 'ArkTS', years: 'HARMONY',
      desc: 'HarmonyOS 应用开发语言。面向鸿蒙生态的原生应用开发，探索声明式 UI 在多端场景下的表达力。',
      tags: ['HarmonyOS', '声明式 UI', '跨端'],
      bars: [['熟练度', 74], ['声明式 UI', 78], ['生态实践', 70]]
    }
  ];

  /* 工作室 */
  var STUDIOS = [
    {
      no: '01', name: '狐学科技工作室', en: 'HUXUE TECH STUDIO',
      desc: '技术创新与产品研发工作室。把想法快速落地成真正能用的产品，覆盖 Web 应用、跨端开发与自动化工具。',
      tags: ['产品研发', 'Web 应用', '自动化', '技术咨询']
    },
    {
      no: '02', name: '本析工作室', en: 'NORMDIGEST',
      desc: '内容分析工作室。以「本质分析」为方法，做科技观察、人文解读与信息提纯，输出有观点的深度内容。',
      tags: ['内容分析', '科技观察', '人文解读']
    }
  ];

  /* 创作历程 —— 关键节点均依据 B 站公开投稿数据整理，可按需修改 */
  var TIMELINE = [
    {
      year: '2023.11', title: '第一支投稿',
      desc: '《让我们去征服这世界》发布，正式开启创作之路。', tag: '起点'
    },
    {
      year: '2024.08', title: '首个爆款',
      desc: '童年怀旧系列《记忆越来越模糊，童年越来越邪乎》冲上 50 万播放，鬼畜风格成型。',
      tag: '爆发'
    },
    {
      year: '2025.01', title: '百万播放',
      desc: '《⚡特 辣 的 海 藻⚡》突破 260 万播放，创下个人最高纪录。',
      tag: '破圈'
    },
    {
      year: '2025', title: '内容版图扩张',
      desc: '自制投屏软件、8D 环绕音、影视解说同期上线——玩梗之外，开始把技术能力也做成内容。',
      tag: '拓展'
    },
    {
      year: '2026', title: '创作者 × 工程师',
      desc: '内容矩阵与工程能力双轨并行，AI Agent、鸿蒙应用等方向与工作室业务同步推进。',
      tag: '现在'
    }
  ];

  /* 联系方式 */
  var CONTACTS = [
    { label: 'BILIBILI', value: '@MillonW', href: SITE.bilibili, ico: '↗', external: true },
    { label: 'QQ', value: '3549769475', copy: '3549769475', ico: '⧉' },
    { label: 'WECHAT', value: 'wow522128', copy: 'wow522128', ico: '⧉' }
  ];

  /* 分类定义（与 refresh_data.py 中的 CATEGORY 保持一致） */
  var CATS = {
    remix: '鬼畜整活',
    story: '影视解说',
    music: '音乐实验',
    culture: '人文深度',
    tech: '科技观察'
  };
  var CAT_ORDER = ['remix', 'story', 'music', 'culture', 'tech'];

  var PER_PAGE = 12;

  /* ══════════════════════════════════════════════════
   * 1. 工具函数
   * ══════════════════════════════════════════════════ */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /** 数字格式化：2735800 → "273.6万"，27010000 → "2701万"，39075 → "3.9万" */
  function fmt(n) {
    n = Number(n) || 0;
    if (n >= 1e8) return (n / 1e8).toFixed(2) + '亿';
    if (n >= 1e7) return String(Math.round(n / 1e4)) + '万';
    if (n >= 1e4) return (n / 1e4).toFixed(1) + '万';
    return String(Math.round(n));
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  /** 把元素的文字拆成单字 <span class="ch">，供逐字动画使用 */
  function splitText(el) {
    if (!el || el.dataset.splitDone) return;
    var text = el.textContent;
    el.textContent = '';
    var frag = document.createDocumentFragment();
    var idx = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === ' ') {
        frag.appendChild(document.createTextNode('\u00A0'));
        continue;
      }
      var sp = document.createElement('span');
      sp.className = 'ch';
      sp.style.setProperty('--i', idx++);
      sp.textContent = ch;
      frag.appendChild(sp);
    }
    el.appendChild(frag);
    el.dataset.splitDone = '1';
  }

  /* ══════════════════════════════════════════════════
   * 2. 主题切换（黑白双方案 · 圆形扩散过渡）
   * ══════════════════════════════════════════════════ */
  var Theme = (function () {
    var KEY = 'millonw-theme';
    var root = document.documentElement;
    var btn = $('#themeToggle');

    function current() { return root.getAttribute('data-theme') || 'dark'; }

    function apply(theme) {
      root.setAttribute('data-theme', theme);
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
      try { localStorage.setItem(KEY, theme); } catch (e) { /* 隐私模式忽略 */ }
    }

    function init() {
      var saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) { /* noop */ }
      if (saved === 'dark' || saved === 'light') {
        apply(saved);
      } else {
        // 未选择过则跟随系统
        var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        apply(prefersLight ? 'light' : 'dark');
      }
      if (btn) btn.addEventListener('click', toggle);
    }

    function toggle(e) {
      var next = current() === 'dark' ? 'light' : 'dark';
      var wipe = $('#themeWipe');

      // 减少动效、或浏览器不支持 Web Animations → 直接切换
      if (reduced || !wipe || typeof wipe.animate !== 'function') { apply(next); return; }

      var x = e && e.clientX ? e.clientX : window.innerWidth - 60;
      var y = e && e.clientY ? e.clientY : 40;
      var r = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // 清掉上一轮残留动画，避免 fill:forwards 状态叠加
      if (wipe.getAnimations) wipe.getAnimations().forEach(function (a) { a.cancel(); });

      wipe.style.left = x + 'px';
      wipe.style.top = y + 'px';
      wipe.setAttribute('data-to', next);
      // 动画期间收起带 mix-blend-mode 的图层，降低合成开销
      document.body.classList.add('is-wiping');

      // 用 transform 缩放走合成层；原来的 clip-path 动画每帧都要重绘整页快照，
      // 再叠加页面里的 mix-blend-mode 与 backdrop-filter，必然掉帧
      var grow = wipe.animate(
        { transform: ['scale(0)', 'scale(' + (r / 60) + ')'], opacity: [1, 1] },
        { duration: 520, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' }
      );

      grow.onfinish = function () {
        // 遮罩已铺满：关掉过渡再换色，让新配色瞬间生效，
        // 这样遮罩淡出时看到的是最终色，不会残留颜色渐变
        document.body.classList.add('theme-switching');
        apply(next);
        void document.body.offsetWidth; // 强制回流，确保新色立即落地
        document.body.classList.remove('theme-switching');

        var fade = wipe.animate({ opacity: [1, 0] },
          { duration: 300, easing: 'ease-out', fill: 'forwards' });
        fade.onfinish = function () {
          if (wipe.getAnimations) wipe.getAnimations().forEach(function (a) { a.cancel(); });
          document.body.classList.remove('is-wiping');
        };
      };
    }

    return { init: init, current: current, toggle: toggle };
  })();

  /* ══════════════════════════════════════════════════
   * 3. 预加载：跟踪真实资源加载并反映到进度条
   *    —— 头像、视频元数据、B站数据；全部就绪 + 最短展示时间后才隐藏
   * ══════════════════════════════════════════════════ */
  function startHeroAnimation() {
    $$('[data-split]').forEach(function (el) { el.classList.add('is-in'); });
    $$('.creed__line[data-creed]').forEach(function (el) { el.classList.add('is-in'); });
  }

  // 资源加载进度跟踪器
  function createAssetLoader() {
    var bar = $('#preloaderBar');
    var text = $('#preloaderText');
    var pct = $('#preloaderPct');
    var value = 0;
    var label = '正在加载';
    var startTime = Date.now();
    var minTime = 700;
    var finished = false;
    var onDone = [];

    function render() {
      var v = Math.min(1, value);
      if (bar) bar.style.width = (v * 100).toFixed(0) + '%';
      if (text) text.textContent = label;
      if (pct) pct.textContent = Math.round(v * 100) + '%';
    }

    function check() {
      if (value >= 1 && !finished) {
        finished = true;
        var elapsed = Date.now() - startTime;
        var wait = Math.max(0, minTime - elapsed);
        setTimeout(function () { onDone.forEach(function (cb) { cb(); }); }, wait);
      }
    }

    return {
      set: function (v, l) {
        value = Math.max(value, v);
        if (l != null) label = l;
        render();
        check();
      },
      onDone: function (cb) {
        if (finished) cb();
        else onDone.push(cb);
      },
      forceFinish: function () {
        value = 1;
        label = '已就绪';
        render();
        check();
      }
    };
  }

  // 加载单张图片（带超时兜底，避免永远 pending）
  function loadImage(src, timeout) {
    return new Promise(function (resolve) {
      var done = false;
      function finish() { if (!done) { done = true; resolve(); } }
      var img = new Image();
      img.onload = img.onerror = finish;
      img.src = src;
      setTimeout(finish, timeout || 4500);
    });
  }

  // 视频背景控制器：自动判定是否降级为静态海报
  function initBgVideo() {
    var wrap = $('#bgVideo');
    if (!wrap) return { preload: function(){return Promise.resolve();}, play: function(){} };

    var reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var reducedData = matchMedia('(prefers-reduced-data: reduce)').matches;
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var slowNet = conn && /^(slow-2g|2g|3g)$/.test(conn.effectiveType || '');
    var saveData = conn && conn.saveData;
    var narrow = window.innerWidth < 720;
    var touchOnly = matchMedia('(hover: none) and (pointer: coarse)').matches;

    // 触摸端 / 弱网 / 减少动效 / 减少数据：降级为静态海报
    if (reducedMotion || reducedData || saveData || slowNet || narrow || touchOnly) {
      wrap.classList.add('is-static');
      return { preload: function(){return Promise.resolve();}, play: function(){} };
    }

    var video = wrap.querySelector('video');
    var loaded = false;
    var started = false;

    function markReady() {
      // 幂等：避免多个事件 / readyState 路径都走到这里时重复加 class
      if (loaded) return;
      loaded = true;
      wrap.classList.add('is-ready');
    }

    // 关键修复：CDN/浏览器命中缓存时，loadeddata/canplay 可能在
    // 我们注册监听器之前就已触发过 → 必须先看 readyState，否则永远等不到
    // HAVE_CURRENT_DATA = 2（HAVE_FUTURE_DATA=3 也可以播放，但 2 够用来"加载完成"判定）
    if (video.readyState >= 2) {
      markReady();
    } else {
      video.addEventListener('loadeddata', markReady, { once: true });
      // canplay 比 loadeddata 更稳：浏览器判断"现在可以播"时才触发
      video.addEventListener('canplay', markReady, { once: true });
      video.addEventListener('error', function () {
        wrap.classList.add('is-static');
        loaded = true;  // 让流程不卡住
      }, { once: true });
    }

    // Tab 切到后台时暂停，省 CPU / 电
    document.addEventListener('visibilitychange', function () {
      if (!loaded) return;
      if (document.hidden) video.pause();
      else if (started) video.play().catch(function(){});
    });

    return {
      preload: function () {
        return new Promise(function (resolve) {
          if (loaded) return resolve();
          var done = false;
          function finish() { if (!done) { done = true; resolve(); } }
          // 同样的 race condition 兜底：缓存命中时 loadedmetadata 已触发过
          if (video.readyState >= 1) {
            finish();
          } else {
            video.addEventListener('loadedmetadata', finish, { once: true });
            video.addEventListener('error', finish, { once: true });
          }
          setTimeout(finish, 3500);
        });
      },
      play: function () {
        if (!loaded || started) return;
        started = true;
        video.play().catch(function(){});
      }
    };
  }

  /* ══════════════════════════════════════════════════
   * 4. 导航
   * ══════════════════════════════════════════════════ */
  function initNav() {
    var nav = $('#nav');
    var burger = $('#burger');
    var drawer = $('#drawer');
    var lastY = window.scrollY;

    function onScroll() {
      var y = window.scrollY;
      if (!nav) return;
      nav.classList.toggle('is-stuck', y > 40);
      // 向下滚动且已越过首屏 → 隐藏导航；向上滚动 → 立即显示
      if (y > 300 && y > lastY && !drawer.classList.contains('is-open')) {
        nav.classList.add('is-hidden');
      } else {
        nav.classList.remove('is-hidden');
      }
      lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 抽屉
    function setDrawer(open) {
      if (!drawer || !burger) return;
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
      document.body.classList.toggle('is-locked', open);
    }
    if (burger) burger.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('is-open'));
    });

    // 平滑滚动（含导航高度补偿）
    $$('[data-scroll]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return;
        var target = $(href);
        if (!target) return;
        e.preventDefault();
        setDrawer(false);
        var navH = nav ? nav.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - navH + 1;
        window.scrollTo({
          top: Math.max(0, top),
          behavior: reduced ? 'auto' : 'smooth'
        });
      });
    });

    // 滚动高亮当前区块
    var sections = ['works', 'stack', 'studio', 'timeline', 'contact']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    var links = $$('.nav__links a');
    if ('IntersectionObserver' in window && sections.length) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { obs.observe(s); });
    }
  }

  /* ══════════════════════════════════════════════════
   * 4.5 浮动控件（切主题 / 回顶部）
   *     页面较长且导航会在下滚时隐藏，这里保证随时可用
   * ══════════════════════════════════════════════════ */
  function initFab() {
    var fab = $('#fab');
    var fTheme = $('#fabTheme');
    var fTop = $('#fabTop');
    if (!fab) return;

    function onScroll() {
      fab.classList.toggle('is-on', window.scrollY > 500);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (fTheme) {
      fTheme.addEventListener('click', function (e) { Theme.toggle(e); });
    }
    if (fTop) {
      fTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      });
    }
  }

  /* ══════════════════════════════════════════════════
   * 5. 滚动出现动画
   * ══════════════════════════════════════════════════ */
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  }
  function observe(el) {
    if (!el) return;
    if (io) io.observe(el); else el.classList.add('is-in');
  }
  function observeAll(nodes) { nodes.forEach(observe); }

  /* ══════════════════════════════════════════════════
   * 6. 数字滚动
   * ══════════════════════════════════════════════════ */
  function countUp(el, target) {
    if (!el) return;
    if (reduced) { el.textContent = fmt(target); return; }
    var dur = 1600;
    var start = performance.now();
    function frame(now) {
      var t = Math.min((now - start) / dur, 1);
      var v = target * easeOutExpo(t);
      el.textContent = fmt(v);
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = fmt(target);
    }
    requestAnimationFrame(frame);
  }

  /* ══════════════════════════════════════════════════
   * 7. 渲染：数据战绩
   * ══════════════════════════════════════════════════ */
  function renderStats(profile, source, videos) {
    videos = videos || [];
    var totalView = videos.reduce(function (s, v) { return s + (v.view || 0); }, 0);

    var values = [
      profile.follower || 0,
      profile.likeNum || 0,
      profile.archiveCount || 0,
      totalView
    ];

    var nums = $$('.stat__num');
    nums.forEach(function (el, i) {
      el.setAttribute('data-count', values[i]);
      el.textContent = '0';
      var stat = el.closest('.stat');
      if (stat) {
        observe(stat);
        // 数字在进入视口时才开始跑
        var once = function () {
          countUp(el, values[i]);
          stat.removeEventListener('transitionend', once);
        };
        if ('IntersectionObserver' in window) {
          var o = new IntersectionObserver(function (es, ob) {
            if (es[0].isIntersecting) { countUp(el, values[i]); ob.disconnect(); }
          }, { threshold: 0.4 });
          o.observe(stat);
        } else {
          countUp(el, values[i]);
        }
      } else {
        countUp(el, values[i]);
      }
    });

    // 双轨卡片上的数字
    var fEl = $('[data-stat="follower"]');
    var aEl = $('[data-stat="archiveCount"]');
    if (fEl) fEl.textContent = fmt(profile.follower || 0);
    if (aEl) aEl.textContent = fmt(profile.archiveCount || 0);

    // 实时徽章
    var badge = $('#liveBadge');
    if (badge) {
      var txt = badge.querySelector('span');
      if (source === 'live') {
        badge.setAttribute('data-state', 'live');
        if (txt) txt.textContent = '实时数据';
      } else {
        badge.setAttribute('data-state', 'cache');
        if (txt) txt.textContent = '快照数据';
      }
    }

  }

  /* ══════════════════════════════════════════════════
   * 8. 渲染：作品墙
   * ══════════════════════════════════════════════════ */
  var Works = (function () {
    var grid = $('#worksGrid');
    var filters = $('#filters');
    var moreBtn = $('#loadMore');
    var all = [];
    var active = 'all';
    var shown = 0;

    function buildFilters() {
      if (!filters) return;
      var counts = { all: all.length };
      all.forEach(function (v) { counts[v.cat] = (counts[v.cat] || 0) + 1; });

      var order = ['all'].concat(CAT_ORDER.filter(function (c) { return counts[c]; }));
      filters.innerHTML = '';
      order.forEach(function (key) {
        var b = document.createElement('button');
        b.className = 'filter' + (key === active ? ' is-on' : '');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.dataset.cat = key;
        b.innerHTML = (key === 'all' ? '全部' : CATS[key]) +
          '<b>' + counts[key] + '</b>';
        b.addEventListener('click', function () { select(key); });
        filters.appendChild(b);
      });
    }

    function cardHTML(v) {
      var href = 'https://www.bilibili.com/video/' + v.bvid;
      var cover = (v.pic || '').replace(/^http:/, 'https:');
      var dur = v.duration
        ? pad2(Math.floor(v.duration / 60)) + ':' + pad2(v.duration % 60)
        : '';
      return '' +
        '<a class="card" href="' + href + '" target="_blank" rel="noopener" ' +
        'data-cat="' + v.cat + '">' +
          '<div class="card__media">' +
            '<img class="card__img" src="' + cover + '" alt="' +
              String(v.title).replace(/"/g, '&quot;') + '" loading="lazy" decoding="async"' +
              // B 站 CDN 会校验 Referer：非 bilibili 来源一律 403。
              // 声明 no-referrer 让浏览器不带 Referer，即可正常取图。
              ' referrerpolicy="no-referrer">' +
            '<span class="card__fallback" aria-hidden="true">MILLONW</span>' +
            '<span class="card__badge">' + (CATS[v.cat] || '作品') + '</span>' +
            '<span class="card__view">' + fmt(v.view) + ' 播放</span>' +
            '<span class="card__play"><span>▶</span></span>' +
          '</div>' +
          '<div class="card__body">' +
            '<h3 class="card__title">' + escapeHTML(v.title) + '</h3>' +
            '<div class="card__meta">' +
              '<i>' + v.date + '</i>' + (dur ? '<i>·</i><i>' + dur + '</i>' : '') +
            '</div>' +
          '</div>' +
        '</a>';
    }

    function escapeHTML(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function list() {
      return active === 'all' ? all : all.filter(function (v) { return v.cat === active; });
    }

    function render(reset) {
      if (!grid) return;
      if (reset) shown = 0;
      var items = list().slice(0, shown + PER_PAGE);
      shown = items.length;

      grid.innerHTML = items.map(cardHTML).join('');

      // 图片加载完成后淡入，避免闪烁；失败则显示极简占位，不让版面塌陷
      $$('.card__img', grid).forEach(function (img) {
        var media = img.closest('.card__media');
        var ok = function () { img.classList.add('is-loaded'); };
        if (img.complete && img.naturalWidth) { ok(); }
        else {
          img.addEventListener('load', ok);
          img.addEventListener('error', function () {
            if (media) media.classList.add('is-fallback');
          });
        }
      });

      // 依次入场
      var cards = $$('.card', grid);
      cards.forEach(function (c, i) {
        c.style.transitionDelay = (reduced ? 0 : Math.min(i, 11) * 55) + 'ms';
        requestAnimationFrame(function () { c.classList.add('is-in'); });
      });

      if (moreBtn) {
        moreBtn.hidden = shown >= list().length;
      }
    }

    function select(cat) {
      if (cat === active) return;
      active = cat;
      $$('.filter', filters).forEach(function (b) {
        b.classList.toggle('is-on', b.dataset.cat === cat);
      });
      // 先淡出，再重排，视觉更顺滑
      var cards = $$('.card', grid);
      if (reduced || !cards.length) { render(true); return; }
      cards.forEach(function (c) { c.classList.add('is-hiding'); });
      setTimeout(function () { render(true); }, 260);
    }

    function init(videos) {
      all = videos || [];
      if (!grid) return;
      if (!all.length) {
        grid.innerHTML = '<p style="color:var(--fg-mute);font-size:14px">' +
          '暂无作品数据 · B站接口在静态站点下可能被拦截</p>';
        return;
      }
      buildFilters();
      render(true);
      if (moreBtn) {
        moreBtn.addEventListener('click', function () { render(false); });
      }
    }

    return { init: init };
  })();

  /* ══════════════════════════════════════════════════
   * 9. 渲染：技术栈
   * ══════════════════════════════════════════════════ */
  function renderStack() {
    var box = $('#stackList');
    if (!box) return;
    box.innerHTML = STACK.map(function (s, i) {
      var bars = s.bars.map(function (b) {
        return '<div class="stack__bar-row">' +
          '<span>' + b[0] + '</span>' +
          '<div class="stack__bar"><i style="--v:' + (b[1] / 100) + '"></i></div>' +
          '<b>' + b[1] + '</b>' +
        '</div>';
      }).join('');
      var tags = s.tags.map(function (t) {
        return '<span class="stack__tag">' + t + '</span>';
      }).join('');
      return '' +
        '<div class="stack__item">' +
          '<button class="stack__head" type="button" aria-expanded="false">' +
            '<span class="stack__no">' + pad2(i + 1) + '</span>' +
            '<span class="stack__name">' + s.name + '</span>' +
            '<span class="stack__years">' + s.years + '</span>' +
            '<span class="stack__plus"></span>' +
          '</button>' +
          '<div class="stack__panel"><div>' +
            '<div class="stack__panel-inner">' +
              '<div>' +
                '<p class="stack__desc">' + s.desc + '</p>' +
                '<div class="stack__tags">' + tags + '</div>' +
              '</div>' +
              '<div class="stack__bars">' + bars + '</div>' +
            '</div>' +
          '</div></div>' +
        '</div>';
    }).join('');

    $$('.stack__head', box).forEach(function (head) {
      head.addEventListener('click', function () {
        var item = head.closest('.stack__item');
        var open = item.classList.toggle('is-open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    // 默认展开第一项
    var first = $('.stack__item', box);
    if (first) {
      first.classList.add('is-open');
      var h = $('.stack__head', first);
      if (h) h.setAttribute('aria-expanded', 'true');
    }
    observeAll($$('.stack__item', box));
  }

  /* ══════════════════════════════════════════════════
   * 10. 渲染：工作室 / 历程 / 联系
   * ══════════════════════════════════════════════════ */
  function renderStudio() {
    var box = $('#studioGrid');
    if (!box) return;
    box.innerHTML = STUDIOS.map(function (s) {
      var tags = s.tags.map(function (t) { return '<span>' + t + '</span>'; }).join('');
      return '' +
        '<article class="studio__card">' +
          '<div class="studio__no">' + s.no + '</div>' +
          '<h3 class="studio__name">' + s.name + '</h3>' +
          '<div class="studio__en">' + s.en + '</div>' +
          '<p class="studio__desc">' + s.desc + '</p>' +
          '<div class="studio__tags">' + tags + '</div>' +
        '</article>';
    }).join('');
    observeAll($$('.studio__card', box));
  }

  function renderTimeline() {
    var box = $('#timelineList');
    if (!box) return;
    box.innerHTML = TIMELINE.map(function (t) {
      return '' +
        '<li class="tl__item">' +
          '<div class="tl__year">' + t.year + '</div>' +
          '<h3 class="tl__title">' + t.title + '</h3>' +
          '<p class="tl__desc">' + t.desc + '</p>' +
          '<span class="tl__tag">' + t.tag + '</span>' +
        '</li>';
    }).join('');
    observeAll($$('.tl__item', box));
  }

  function renderContact() {
    var box = $('#contactGrid');
    if (!box) return;
    box.innerHTML = CONTACTS.map(function (c) {
      var attrs = c.external
        ? 'href="' + c.href + '" target="_blank" rel="noopener"'
        : 'type="button" data-copy="' + c.copy + '"';
      var tag = c.external ? 'a' : 'button';
      return '' +
        '<' + tag + ' class="ct" ' + attrs + '>' +
          '<span>' +
            '<span class="ct__label">' + c.label + '</span>' +
            '<span class="ct__value">' + c.value + '</span>' +
          '</span>' +
          '<span class="ct__ico">' + c.ico + '</span>' +
        '</' + tag + '>';
    }).join('');

    $$('[data-copy]', box).forEach(function (btn) {
      btn.addEventListener('click', function () {
        copy(btn.dataset.copy);
      });
    });
    observeAll($$('.ct', box));
  }

  /* 复制 + 轻提示 */
  var toastTimer = null;
  function toast(msg) {
    var t = $('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 1900);
  }

  function copy(text) {
    var done = function () { toast('已复制：' + text); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); }
      catch (e) { toast('复制失败，请手动选择'); }
      document.body.removeChild(ta);
    }
  }

  /* ══════════════════════════════════════════════════
   * 11. 装饰动效：光标 / 聚光 / 进度条
   * ══════════════════════════════════════════════════ */
  function initCursor() {
    var cur = $('#cursor');      // 小点：零延迟，直接对齐鼠标
    var ring = $('#cursorRing'); // 大环：轻缓动，保留质感
    var spot = $('#spotlight');
    var spotIn = spot ? $('i', spot) : null;
    if (!cur && !ring && !spotIn) return;

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    var raf = null;
    var on = false;
    var EASE = 0.3;

    // 关键：所有样式写入都集中在 rAF 回调里，mousemove 只记坐标。
    // 之前在 mousemove 回调里直接写 transform，与渲染节奏不同步，
    // 鼠标微动时就会出现抽搐与停顿。
    function frame() {
      raf = null;
      var dx = mx - rx, dy = my - ry;

      // 位移很小时加大收敛系数，避免"动一下、停一下"的拖尾感
      var k = (Math.abs(dx) + Math.abs(dy)) < 6 ? 0.6 : EASE;
      rx += dx * k;
      ry += dy * k;

      var settled = Math.abs(mx - rx) < 0.2 && Math.abs(my - ry) < 0.2;
      if (settled) { rx = mx; ry = my; }

      if (cur) cur.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      if (ring) ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      if (spotIn) spotIn.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';

      // 追上后停掉 rAF，等下次移动再启动，不空转占用主线程
      if (!settled) raf = requestAnimationFrame(frame);
    }

    if (!isTouch && !reduced) {
      window.addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        if (!on) {
          on = true;
          if (cur) cur.classList.add('is-on');
          if (ring) ring.classList.add('is-on');
          if (spot) spot.classList.add('is-on');
        }
        if (!raf) raf = requestAnimationFrame(frame);
      }, { passive: true });

      // 悬停可交互元素时放大光标
      var hot = 'a, button, .card, .filter, .stack__head, .ct';
      document.addEventListener('mouseover', function (e) {
        if (e.target.closest && e.target.closest(hot)) {
          if (cur) cur.classList.add('is-hot');
          if (ring) ring.classList.add('is-hot');
        }
      });
      document.addEventListener('mouseout', function (e) {
        if (e.target.closest && e.target.closest(hot)) {
          if (cur) cur.classList.remove('is-hot');
          if (ring) ring.classList.remove('is-hot');
        }
      });
    }
  }

  function initProgress() {
    var bar = $('#scrollBar');
    if (!bar) return;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = p.toFixed(2) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* 身份轮播 */
  function initRotator() {
    var box = $('#roleRotator');
    if (!box) return;
    var items = $$('span', box);
    if (items.length < 2) return;
    var i = 0;
    setInterval(function () {
      items[i].classList.remove('is-active');
      i = (i + 1) % items.length;
      items[i].classList.add('is-active');
    }, 2600);
  }

  /* ══════════════════════════════════════════════════
   * 11b. 章节指示器：右侧圆点，指示当前章节并可跳转
   * ══════════════════════════════════════════════════ */
  function initSecDots() {
    var box = $('#secDots');
    if (!box) return;
    var secs = $$('main section[id]');
    if (!secs.length) return;

    var LABEL = {
      hero: '首页', stats: '战绩', works: '作品', stack: '技术',
      studio: '工作室', timeline: '历程', contact: '联系'
    };

    var dots = secs.map(function (sec) {
      var head = sec.querySelector('.sec-head__title');
      var text = LABEL[sec.id] || (head ? head.textContent : '') || sec.id;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sec-dot';
      b.innerHTML = '<span class="sec-dot__label"></span><span class="sec-dot__mark"></span>';
      b.firstChild.textContent = text;
      b.setAttribute('aria-label', '跳转到 ' + text);
      b.addEventListener('click', function () {
        var top = sec.getBoundingClientRect().top + window.scrollY - 68;
        window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
      });
      box.appendChild(b);
      return b;
    });

    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var idx = secs.indexOf(en.target);
        dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ══════════════════════════════════════════════════
   * 11c. 作品卡 3D 倾斜 + 光泽扫过（仅精确指针设备）
   * ══════════════════════════════════════════════════ */
  function initTilt() {
    var grid = $('#worksGrid');
    if (!grid || isTouch || reduced) return;
    var raf = null, card = null, px = 0, py = 0;

    function media(el) { return el ? el.querySelector('.card__media') : null; }
    function reset(m) {
      if (!m) return;
      m.style.removeProperty('--rx');
      m.style.removeProperty('--ry');
      m.style.removeProperty('--gx');
      m.style.removeProperty('--gy');
    }

    function apply() {
      raf = null;
      var m = media(card);
      if (!m) return;
      var r = m.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var dx = (px - r.left) / r.width - 0.5;
      var dy = (py - r.top) / r.height - 0.5;
      m.style.setProperty('--rx', (-dy * 7).toFixed(2) + 'deg');
      m.style.setProperty('--ry', (dx * 8).toFixed(2) + 'deg');
      m.style.setProperty('--gx', ((dx + 0.5) * 100).toFixed(1) + '%');
      m.style.setProperty('--gy', ((dy + 0.5) * 100).toFixed(1) + '%');
    }

    grid.addEventListener('mousemove', function (e) {
      var c = e.target.closest ? e.target.closest('.card') : null;
      if (c !== card) reset(media(card));
      card = c; px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });

    grid.addEventListener('mouseleave', function () {
      reset(media(card));
      card = null;
    });
  }

  /* ══════════════════════════════════════════════════
   * 11d. 首屏视差：头像与标题随鼠标反向轻微位移
   *      用独立的 translate 属性，不覆盖入场动画的 transform
   * ══════════════════════════════════════════════════ */
  function initHeroParallax() {
    if (isTouch || reduced) return;
    var layers = [
      [$('.hero__avatar'), 16],
      [$('.hero__title'), -9],
      [$('.creed'), -5]
    ].filter(function (l) { return l[0]; });
    if (!layers.length) return;

    var raf = null;
    var tx = 0, ty = 0;   // 目标：视口归一化坐标（-0.5 ~ 0.5）
    var cx = 0, cy = 0;   // 当前：缓动逼近目标

    function frame() {
      raf = null;
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      // 收敛到目标后精确贴合并停掉 rAF，避免空转
      var settled = Math.abs(tx - cx) < 0.002 && Math.abs(ty - cy) < 0.002;
      if (settled) { cx = tx; cy = ty; }
      layers.forEach(function (l) {
        l[0].style.translate =
          (cx * l[1]).toFixed(2) + 'px ' + (cy * l[1]).toFixed(2) + 'px';
      });
      if (!settled) raf = requestAnimationFrame(frame);
    }

    // 监听整页：鼠标在窗口任意位置滑动，首屏元素都会反向轻移
    // （不再只在首屏区域内才有反应）
    window.addEventListener('mousemove', function (e) {
      tx = (e.clientX / window.innerWidth) - 0.5;
      ty = (e.clientY / window.innerHeight) - 0.5;
      if (!raf) raf = requestAnimationFrame(frame);
    }, { passive: true });

    // 鼠标移出窗口：目标归零，由上面的缓动平滑归位，不再瞬间抽搐
    document.addEventListener('mouseleave', function () {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    });
  }

  /* ══════════════════════════════════════════════════
   * 11e. 彩蛋
   * ══════════════════════════════════════════════════ */

  /* Konami：↑↑↓↓←→←→BA */
  function initKonami() {
    var SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
               'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var pos = 0;
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = (k === SEQ[pos]) ? pos + 1 : (k === SEQ[0] ? 1 : 0);
      // 已经输入过半，判定为在输序列，拦掉方向键避免页面跟着滚
      if (pos >= 4 && (k.indexOf('Arrow') === 0 || k === 'b' || k === 'a')) {
        e.preventDefault();
      }
      if (pos === SEQ.length) { pos = 0; glitch(); }
    });
  }

  function glitch() {
    toast('隐藏开关已触发');
    if (reduced) return;
    document.body.classList.remove('is-glitch');
    void document.body.offsetWidth; // 重启动画
    document.body.classList.add('is-glitch');
    setTimeout(function () { document.body.classList.remove('is-glitch'); }, 1300);
  }

  /* 头像三连击：反色脉冲环 */
  function initAvatarEgg() {
    var avatar = $('.hero__avatar');
    if (!avatar) return;
    var hits = 0, timer = null;
    avatar.addEventListener('click', function (e) {
      var x = e.clientX || window.innerWidth / 2;
      var y = e.clientY || 200;
      hits++;
      clearTimeout(timer);
      timer = setTimeout(function () { hits = 0; }, 900);
      if (hits >= 3) { hits = 0; pulse(x, y); }
    });
  }

  function pulse(x, y) {
    toast('别戳了');
    if (reduced) return;
    for (var i = 0; i < 3; i++) {
      (function (i) {
        setTimeout(function () {
          var d = document.createElement('div');
          var size = 200 + i * 90;
          d.className = 'pulse-ring';
          d.style.width = size + 'px';
          d.style.height = size + 'px';
          d.style.left = x + 'px';
          d.style.top = y + 'px';
          document.body.appendChild(d);
          setTimeout(function () {
            if (d.parentNode) d.parentNode.removeChild(d);
          }, 900);
        }, i * 130);
      })(i);
    }
  }

  /* 快捷键：T 切换黑白主题 */
  function initHotkeys() {
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' ||
                t.isContentEditable)) return;
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        Theme.toggle({ clientX: window.innerWidth - 60, clientY: 40 });
      }
    });
  }

  /* 控制台欢迎语 */
  function consoleArt() {
    if (!window.console || !console.log) return;
    console.log('%c MILLONW ', 'background:#000;color:#fff;font-size:15px;' +
      'font-weight:bold;padding:5px 9px;letter-spacing:2px');
    console.log('%c科技服务于人 · 人文点亮世界',
      'color:#666;font-size:12px;padding:4px 0');
    console.log('%c快捷键：T 切换黑白主题', 'color:#999;font-size:11px');
    console.log('%c彩蛋：试试方向键 ↑↑↓↓←→←→BA，或连点头像三下',
      'color:#bbb;font-size:11px');
  }

  function initEggs() {
    initKonami();
    initAvatarEgg();
    initHotkeys();
    consoleArt();
  }

  /* ══════════════════════════════════════════════════
   * 12. 启动
   *    同步部分照常跑；异步加载头像 / 视频 / B站数据，按真实进度推进
   * ══════════════════════════════════════════════════ */
  function boot() {
    document.body.classList.add('is-locked');

    var loader = createAssetLoader();
    loader.set(0.06, '启动');

    // 保险：5 秒后无论如何强制解锁，避免脚本出错把用户锁死
    setTimeout(function () { loader.forceFinish(); }, 5000);

    // 同步部分
    Theme.init();
    initNav();
    initFab();
    initCursor();
    initProgress();
    initRotator();
    initSecDots();
    initTilt();
    initHeroParallax();
    initEggs();

    $$('[data-split]').forEach(splitText);
    $$('.creed__line[data-creed]').forEach(function (el) {
      var span = document.createElement('span');
      span.textContent = el.textContent;
      el.textContent = '';
      el.appendChild(span);
    });

    renderStack();
    renderStudio();
    renderTimeline();
    renderContact();
    observeAll($$('.reveal'));

    var yr = $('#year');
    if (yr) yr.textContent = new Date().getFullYear();

    loader.set(0.16, '加载资源');

    // 异步部分：进度随真实加载推进
    var bg = initBgVideo();
    var tasks = [];

    // 头像：作为首屏关键资源显式 preload
    tasks.push(loadImage('assets/img/avatar.jpg').then(function () {
      loader.set(0.5, '头像就绪');
    }));

    // 视频背景元数据（preload=metadata 只取头部几 KB）
    tasks.push(bg.preload().then(function () {
      loader.set(0.78, '视频就绪');
    }));

    // B 站数据：成功才计入进度，失败也不卡
    if (window.BiliAPI) {
      tasks.push(window.BiliAPI.getAll().then(function (res) {
        renderStats(res.profile, res.source, res.videos);
        Works.init(res.videos);
        loader.set(0.95, '数据就绪');
      }).catch(function () {
        renderStats({}, 'cache', []);
        Works.init([]);
        loader.set(0.95, '数据就绪');
      }));
    } else {
      renderStats({}, 'cache', []);
      Works.init([]);
      loader.set(0.95, '数据就绪');
    }

    // window.load：所有静态资源（字体、图片、iframe…）已就绪
    if (document.readyState !== 'complete') {
      tasks.push(new Promise(function (resolve) {
        window.addEventListener('load', resolve, { once: true });
      }));
    }

    // 全部就绪 → 进度到 100% → 触发 onDone（最短展示时间后隐藏）
    Promise.all(tasks).then(function () {
      loader.set(1, '已就绪');
    });

    loader.onDone(function () {
      var p = $('#preloader');
      if (!p || p.classList.contains('is-done')) return;
      p.classList.add('is-done');
      document.body.classList.remove('is-locked');
      startHeroAnimation();
      bg.play();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
