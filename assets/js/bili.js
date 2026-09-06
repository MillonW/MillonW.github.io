/* ============================================================
 * bili.js · B 站数据接入层
 * ------------------------------------------------------------
 * 设计目标：页面加载时优先尝试从 B站实时拉取数据；
 *           因跨域/风控拿不到时，使用 fallback.js 的兜底快照，
 *           保证页面始终可浏览。
 *
 * 为什么必须有兜底：
 *   1. api.bilibili.com 不返回 CORS 头，浏览器 fetch 直接跨域拦截；
 *   2. JSONP 绕跨域时，响应 Content-Type 为 application/json，
 *      会被 Chrome 的 ORB（Opaque Response Blocking）阻止；
 *   3. 新版风控 -352 要求 Referer 来自 space.bilibili.com，
 *      而 GitHub Pages/静态站点无法伪造 Referer。
 * 因此浏览器端无法稳定直连。若要真·实时，需自建代理（见 CONFIG.proxy）。
 * ============================================================ */

(function (global) {
  'use strict';

  var CONFIG = {
    mid: 1004939949,
    // 填入你自己的跨域代理（如 Cloudflare Worker）即可切换到真·实时
    proxy: '',
    timeout: 6000
  };

  /* ---------- 兜底数据（B站实时失败时使用） ---------- */
  var FALLBACK = global.__BILI_FALLBACK__ || { profile: {}, videos: [] };

  function classify(title) {
    var t = title.replace(/\s+/g, '');
    if (/Agent|agent|AI|人工智能|大模型|编程|代码|部署|开源|技术|PC|桌面|创造公开赛|自研|IDE/.test(t)) return 'tech';
    if (/8D|杜比|环绕|全景声|音乐|翻唱|remix|REMiX/.test(title)) return 'music';
    if (/熊出没|安史之乱|历史|解说|番外|篇|四季|剧情/.test(title)) return 'story';
    if (/文化祛魅|舆论|深扒|赛博|人生|人文|社会|祛魅/.test(title)) return 'culture';
    return 'remix';
  }

  /* ---------- JSONP ---------- */
  function jsonp(url, timeout) {
    return new Promise(function (resolve, reject) {
      var cbName = '__mwcb_' + Date.now() + '_' + Math.floor(Math.random() * 1e4);
      var script = document.createElement('script');
      var timer;

      function cleanup() {
        clearTimeout(timer);
        try { delete global[cbName]; } catch (e) { global[cbName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      timer = setTimeout(function () { cleanup(); reject(new Error('timeout')); }, timeout);

      global[cbName] = function (data) { cleanup(); resolve(data); };
      script.onerror = function () { cleanup(); reject(new Error('network')); };
      script.src = url + (url.indexOf('?') > -1 ? '&' : '?') + 'jsonp=jsonp&callback=' + cbName;
      document.head.appendChild(script);
    });
  }

  /* ---------- 归一化 ---------- */
  function normalizeProfile(raw) {
    if (!raw || raw.code !== 0 || !raw.data) return null;
    var d = raw.data;
    var card = d.card || {};
    return {
      name: card.name || '',
      sign: card.sign || '',
      face: (card.face || '').replace(/^http:/, 'https:'),
      follower: typeof d.follower === 'number' ? d.follower : (card.fans || 0),
      likeNum: typeof d.like_num === 'number' ? d.like_num : 0,
      archiveCount: typeof d.archive_count === 'number' ? d.archive_count : 0
    };
  }

  function normalizeVideo(v) {
    var stat = v.stat || {};
    return {
      bvid: v.bvid,
      title: v.title,
      pic: (v.pic || '').replace(/^http:/, 'https:') + '@480w_300h_1c.webp',
      view: stat.view || 0,
      duration: v.duration || 0,
      date: v.pubdate ? new Date(v.pubdate * 1000).toISOString().slice(0, 10) : '',
      cat: classify(v.title)
    };
  }

  /* ---------- 代理 ---------- */
  function viaProxy(type) {
    if (!CONFIG.proxy) return Promise.reject(new Error('no-proxy'));
    var url = CONFIG.proxy + (type === 'profile' ? '?type=profile&mid=' : '?type=videos&mid=') + CONFIG.mid;
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, CONFIG.timeout) : null;
    return fetch(url, { signal: ctrl ? ctrl.signal : undefined, cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('http-' + r.status); return r.json(); })
      .finally(function () { if (timer) clearTimeout(timer); });
  }

  /* ---------- 实时：账号数据 ---------- */
  function fetchLiveProfile() {
    return viaProxy('profile')
      .then(function (j) {
        var p = normalizeProfile(j);
        if (!p) throw new Error('bad-payload');
        return p;
      })
      .catch(function () {
        var url = 'https://api.bilibili.com/x/web-interface/card?mid=' + CONFIG.mid + '&photo=false';
        return jsonp(url, CONFIG.timeout).then(function (raw) {
          var p = normalizeProfile(raw);
          if (!p) throw new Error('code-' + (raw && raw.code));
          return p;
        });
      });
  }

  /* ---------- 实时：投稿列表 ---------- */
  function fetchLiveVideos() {
    return viaProxy('videos')
      .then(function (j) {
        if (!j || j.code !== 0 || !j.data || !j.data.archives) throw new Error('bad-payload');
        return j.data.archives.map(normalizeVideo).sort(function (a, b) { return b.view - a.view; });
      })
      .catch(function () {
        var all = [];
        function page(pn) {
          var url = 'https://api.bilibili.com/x/series/recArchivesByKeywords?mid=' + CONFIG.mid +
            '&keywords=&orderby=pubdate&pn=' + pn + '&ps=20';
          return jsonp(url, CONFIG.timeout).then(function (raw) {
            if (!raw || raw.code !== 0 || !raw.data || !raw.data.archives) throw new Error('code-' + (raw && raw.code));
            raw.data.archives.forEach(function (v) { all.push(normalizeVideo(v)); });
            if (raw.data.archives.length === 20) return page(pn + 1);
            return all.sort(function (a, b) { return b.view - a.view; });
          });
        }
        return page(1);
      });
  }

  /* ---------- 兜底 ---------- */
  function fallbackProfile() { return Object.assign({}, FALLBACK.profile); }
  function fallbackVideos() { return FALLBACK.videos.slice(); }

  /* ---------- 对外 API ---------- */
  function getAll() {
    var profile = null, videos = null, live = false;
    return Promise.all([
      fetchLiveProfile().then(function (p) { profile = p; live = true; }).catch(function () { profile = fallbackProfile(); }),
      fetchLiveVideos().then(function (v) { videos = v; }).catch(function () { videos = fallbackVideos(); })
    ]).then(function () {
      return { profile: profile, videos: videos, source: live ? 'live' : 'cache' };
    });
  }

  global.BiliAPI = {
    CONFIG: CONFIG,
    getAll: getAll,
    getProfile: fetchLiveProfile,
    getVideos: fetchLiveVideos,
    fallback: FALLBACK
  };
})(window);
