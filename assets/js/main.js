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

      // 支持 View Transitions 且未要求减少动效 → 从点击处圆形扩散
      if (document.startViewTransition && !reduced) {
        var x = e && e.clientX ? e.clientX : window.innerWidth - 60;
        var y = e && e.clientY ? e.clientY : 40;
        var r = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );
        var t = document.startViewTransition(function () { apply(next); });
        t.ready.then(function () {
          root.animate(
            { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)',
                         'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
            { duration: 680, easing: 'cubic-bezier(.76,0,.24,1)',
              pseudoElement: '::view-transition-new(root)' }
          );
        }).catch(function () { /* 过渡失败也无妨，主题已切换 */ });
      } else {
        apply(next);
      }
    }

    return { init: init, current: current, toggle: toggle };
  })();

  /* ══════════════════════════════════════════════════
   * 3. 预加载
   * ══════════════════════════════════════════════════ */
  function hidePreloader() {
    var p = $('#preloader');
    if (!p) return;
    var delay = reduced ? 0 : 1500;
    setTimeout(function () {
      p.classList.add('is-done');
      document.body.classList.remove('is-locked');
      startHeroAnimation();
    }, delay);
  }

  function startHeroAnimation() {
    $$('[data-split]').forEach(function (el) { el.classList.add('is-in'); });
    $$('.creed__line[data-creed]').forEach(function (el) { el.classList.add('is-in'); });
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

    var note = $('#statsNote');
    if (note) {
      if (source === 'live') {
        note.textContent = '数据由 B 站接口实时返回';
      } else {
        note.textContent = 'B 站接口在静态站点下受跨域与风控限制，当前展示 '
          + videos.length + ' 条兜底作品数据 · 配置代理后可切换为真·实时';
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
    var cur = $('#cursor');
    var spot = $('#spotlight');
    if (!cur && !spot) return;

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var cx = mx, cy = my;
    var raf = null;

    function loop() {
      // 缓动跟随，制造"丝滑延迟"的质感
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      if (cur) cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      if (spot) {
        spot.style.setProperty('--mx', mx + 'px');
        spot.style.setProperty('--my', my + 'px');
      }
      raf = requestAnimationFrame(loop);
    }

    if (!isTouch && !reduced) {
      window.addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        if (cur) cur.classList.add('is-on');
        if (spot) spot.classList.add('is-on');
        if (!raf) loop();
      }, { passive: true });

      // 悬停可交互元素时放大光标
      var hot = 'a, button, .card, .filter, .stack__head, .ct';
      document.addEventListener('mouseover', function (e) {
        if (e.target.closest && e.target.closest(hot)) cur.classList.add('is-hot');
      });
      document.addEventListener('mouseout', function (e) {
        if (e.target.closest && e.target.closest(hot)) cur.classList.remove('is-hot');
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
   * 12. 启动
   * ══════════════════════════════════════════════════ */
  function boot() {
    document.body.classList.add('is-locked');

    // 保险：无论后续脚本是否出错，5 秒后一定解除预加载层，
    // 避免用户被永久白屏/遮罩锁死在外面
    setTimeout(function () {
      var p = $('#preloader');
      if (p && !p.classList.contains('is-done')) {
        p.classList.add('is-done');
        document.body.classList.remove('is-locked');
        startHeroAnimation();
      }
    }, 5000);

    Theme.init();
    initNav();
    initFab();
    initCursor();
    initProgress();
    initRotator();

    // 首屏文字拆分，等待预加载结束后触发动画
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

    // 数据：优先实时拉 B站；失败则回落到 fallback.js 的兜底快照
    if (window.BiliAPI) {
      window.BiliAPI.getAll().then(function (res) {
        renderStats(res.profile, res.source, res.videos);
        Works.init(res.videos);
      });
    } else {
      renderStats({}, 'cache', []);
      Works.init([]);
    }

    hidePreloader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
