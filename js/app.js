/* ==========================================================================
   Renderer. It reads js/config.js and builds the page.
   You normally do NOT need to edit this file.
   ========================================================================== */
(() => {
  'use strict';

  const C = window.SITE_CONFIG;
  const app = document.getElementById('app');

  if (!C) {
    app.innerHTML = '<p style="padding:2rem;font:16px system-ui">Could not find <b>js/config.js</b>. Keep it next to app.js in the js folder.</p>';
    return;
  }

  /* ------------------------------------------------------------------ *
   *  Tiny helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  const HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
  const heartSvg = cls => `<svg class="heart ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${HEART_PATH}"/></svg>`;
  const PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';

  const TILTS = [-3.2, 2.1, -1.5, 3, -2.4, 1.3, -2.8, 2.6];
  const tiltFor = i => TILTS[((i % TILTS.length) + TILTS.length) % TILTS.length];
  const RATIOS = ['3/4', '1/1', '4/5', '4/3', '3/4', '5/4'];

  /* body scroll locks (opening screen, lightbox) */
  const locks = new Set();
  const lock = (key, on) => {
    on ? locks.add(key) : locks.delete(key);
    document.body.classList.toggle('locked', locks.size > 0);
  };

  const observeOnce = (node, cb, opts) => {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); cb(); }
    }, opts);
    io.observe(node);
  };

  /* ------------------------------------------------------------------ *
   *  Dates and the {magic words}
   * ------------------------------------------------------------------ */
  const parseDate = s => {
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(String(s || '').trim());
    return m ? new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)) : null;
  };

  // ?date=2026-11-14 pretends today is that day (keeps the real time of day)
  const dateOffset = (() => {
    const p = parseDate(new URLSearchParams(location.search).get('date'));
    if (!p) return 0;
    const real = new Date();
    p.setHours(real.getHours(), real.getMinutes(), real.getSeconds());
    return p - real;
  })();
  const now = () => new Date(Date.now() + dateOffset);

  const addMonths = (d, n) => {
    const r = new Date(d.getFullYear(), d.getMonth() + n, 1, d.getHours(), d.getMinutes());
    const last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(d.getDate(), last));
    return r;
  };
  const wholeMonths = (from, to) => {
    let m = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (addMonths(from, m) > to) m--;
    return Math.max(0, m);
  };
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const ordinal = n => {
    const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const start = parseDate(C.startDate);
  const birth = parseDate(C.birthday);
  const isMonthsaryDay = t => {
    if (!start) return false;
    const m = wholeMonths(start, t);
    return m > 0 && sameDay(addMonths(start, m), t);
  };
  const isBirthdayToday = t => !!birth && t.getMonth() === birth.getMonth() && t.getDate() === birth.getDate();

  const VARS = (() => {
    const t = now();
    const v = { name: C.herName || '', me: C.yourName || '', year: String(t.getFullYear()) };
    if (start) {
      const m = wholeMonths(start, t);
      v.months = m;
      v.ordinalMonths = ordinal(m);
      v.days = Math.max(0, Math.floor((t - start) / 864e5));
      v.startDate = start.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    if (birth) {
      let age = t.getFullYear() - birth.getFullYear();
      if (t < new Date(t.getFullYear(), birth.getMonth(), birth.getDate())) age--;
      v.age = age;
      v.ordinalAge = ordinal(age);
    }
    return v;
  })();

  const fill = s => String(s == null ? '' : s).replace(/\{(\w+)\}/g, (m, k) => (k in VARS ? VARS[k] : m));
  const tpl = s => esc(fill(s));

  /* ------------------------------------------------------------------ *
   *  Themes
   * ------------------------------------------------------------------ */
  const NOTES = { 'note-1': '#FFD3DC', 'note-2': '#FFE9A8', 'note-3': '#CDEBDD', 'note-4': '#D9D2F5' };
  const THEMES = {
    strawberry: { bg: '#FDE3E8', bg2: '#F9CEDA', ink: '#45122B', muted: '#8A5068', accent: '#D6336C', accent2: '#FF8FAB', paper: '#FFFDFB', 'paper-ink': '#3B2330', tape: 'rgba(255,226,140,.72)', shadow: 'rgba(86,22,52,.30)' },
    midnight:   { bg: '#1B1030', bg2: '#2A1A47', ink: '#F7E9F1', muted: '#BBA3BD', accent: '#FF7AA2', accent2: '#FFB3C8', paper: '#FFF8F2', 'paper-ink': '#3B2330', tape: 'rgba(150,226,214,.62)', shadow: 'rgba(0,0,0,.55)' },
    lavender:   { bg: '#EFE9FF', bg2: '#DFD3FF', ink: '#2A1F52', muted: '#6B5E96', accent: '#7A47E8', accent2: '#B79CFF', paper: '#FFFDFE', 'paper-ink': '#2E2550', tape: 'rgba(255,205,222,.78)', shadow: 'rgba(42,31,82,.30)' },
    ocean:      { bg: '#DFF3F6', bg2: '#C5E7EE', ink: '#0E3040', muted: '#3F6C7D', accent: '#0E7C9B', accent2: '#79CFE0', paper: '#FFFEFC', 'paper-ink': '#14323F', tape: 'rgba(255,226,140,.72)', shadow: 'rgba(14,48,64,.30)' }
  };
  const applyTheme = () => {
    const theme = Object.assign({}, NOTES, THEMES[C.theme] || THEMES.strawberry, C.colors || {});
    const root = document.documentElement.style;
    Object.keys(theme).forEach(k => root.setProperty('--' + k, theme[k]));
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.bg);
  };

  /* ------------------------------------------------------------------ *
   *  Media: image, video, or YouTube, detected from the file name
   * ------------------------------------------------------------------ */
  const VIDEO_RE = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;
  const YT_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;
  const kind = src => (YT_RE.test(src || '') ? 'youtube' : VIDEO_RE.test(src || '') ? 'video' : 'image');
  const norm = raw => (typeof raw === 'string' ? { src: raw } : raw || {});

  const placeholder = (src, k) => {
    const d = el('div', 'ph');
    const what = k === 'video' ? 'video' : 'photo';
    d.innerHTML = `${heartSvg()}<small>Your ${what} goes here${src ? `<code>${esc(src)}</code>` : ''}</small>`;
    return d;
  };

  function createMedia(raw, o = {}) {
    const item = norm(raw);
    const src = item.src || '';
    const k = kind(src);

    if (!src) return placeholder('', k);

    if (k === 'youtube') {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${YT_RE.exec(src)[1]}?rel=0&playsinline=1`;
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.loading = 'lazy';
      f.title = item.caption || 'Video';
      return f;
    }

    if (k === 'video') {
      const v = document.createElement('video');
      v.src = (o.thumb && !o.autoplay && !src.includes('#')) ? src + '#t=0.1' : src;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = o.autoplay ? 'auto' : 'metadata';
      if (item.poster) v.poster = item.poster;
      if (o.autoplay) {
        v.defaultMuted = true; v.muted = true; v.loop = true; v.autoplay = true;
      } else if (o.controls !== false) {
        v.controls = true;
      }
      if (o.muted) { v.defaultMuted = true; v.muted = true; }
      v.addEventListener('loadedmetadata', () => o.onMeta && o.onMeta(v.videoWidth, v.videoHeight));
      v.addEventListener('error', () => v.replaceWith(placeholder(src, 'video')));
      return v;
    }

    const img = new Image();
    img.alt = item.alt || item.caption || '';
    img.decoding = 'async';
    img.loading = o.eager ? 'eager' : 'lazy';
    img.addEventListener('error', () => img.replaceWith(placeholder(src, 'image')));
    img.src = src;
    return img;
  }

  /* Photos "settle" into place as they scroll into view */
  const settleIO = ('IntersectionObserver' in window)
    ? new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); settleIO.unobserve(e.target); }
      }), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' })
    : null;

  function polaroid(raw, o = {}) {
    const item = norm(raw);
    const fig = el('figure', 'polaroid' + (o.slim ? ' slim' : ''));
    fig.style.setProperty('--tilt', (o.tilt || 0) + 'deg');
    fig.style.setProperty('--tape-tilt', (-(o.tilt || 0) * 1.3 - 2) + 'deg');

    const pic = el('div', 'pic');
    if (o.ar) pic.style.setProperty('--ar', o.ar);
    const media = createMedia(item, Object.assign({}, o, {
      onMeta: (w, h) => {
        if (o.autoRatio && w && h) {
          pic.style.setProperty('--ar', `${w} / ${h}`);
          fig.classList.toggle('portrait', h > w);
        }
      }
    }));
    pic.appendChild(media);
    if (o.badge && media.tagName === 'VIDEO') pic.appendChild(el('span', 'badge', PLAY_SVG));
    fig.appendChild(pic);

    if (item.caption || !o.slim) fig.appendChild(el('figcaption', '', tpl(item.caption || '')));

    if (!o.hero && settleIO && !reduceMotion) {
      fig.setAttribute('data-settle', '');
      settleIO.observe(fig);
    }
    return fig;
  }

  function makeZoomable(node, open) {
    node.classList.add('zoomable');
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', 'Open full size');
    node.addEventListener('click', open);
    node.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  }

  /* ------------------------------------------------------------------ *
   *  Lightbox
   * ------------------------------------------------------------------ */
  const LB = (() => {
    const box = $('#lightbox');
    const stage = $('.lb-stage', box);
    const cap = $('.lb-cap', box);
    const count = $('.lb-count', box);
    let list = [], idx = 0, opener = null;

    const stopMedia = () => {
      stage.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });
      stage.replaceChildren();
    };
    const show = () => {
      stopMedia();
      const item = norm(list[idx]);
      const m = createMedia(item, { controls: true, eager: true });
      stage.appendChild(m);
      if (m.tagName === 'VIDEO') { const p = m.play(); if (p && p.catch) p.catch(() => {}); }
      cap.textContent = fill(item.caption || '');
      count.textContent = list.length > 1 ? `${idx + 1} / ${list.length}` : '';
      box.classList.toggle('single', list.length < 2);
    };
    const step = d => { if (list.length > 1) { idx = (idx + d + list.length) % list.length; show(); } };
    const close = () => {
      stopMedia();
      box.hidden = true;
      lock('lightbox', false);
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    };
    const open = (items, i) => {
      list = items; idx = i || 0;
      opener = document.activeElement;
      box.hidden = false;
      lock('lightbox', true);
      show();
      $('.lb-close', box).focus({ preventScroll: true });
    };

    $('.lb-close', box).addEventListener('click', close);
    $('.lb-prev', box).addEventListener('click', () => step(-1));
    $('.lb-next', box).addEventListener('click', () => step(1));
    box.addEventListener('click', e => { if (e.target === box || e.target === stage) close(); });
    document.addEventListener('keydown', e => {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
    let x0 = null;
    stage.addEventListener('touchstart', e => { x0 = e.changedTouches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    }, { passive: true });

    return { open };
  })();

  /* ------------------------------------------------------------------ *
   *  Music (pauses itself while a video with sound is playing)
   * ------------------------------------------------------------------ */
  function setupMusic() {
    const btn = $('#music');
    const cfg = C.music || {};
    const none = { play() {}, duck() {} };
    if (!cfg.src) return none;

    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = Math.min(1, Math.max(0, cfg.volume == null ? 0.6 : cfg.volume));
    const label = cfg.title ? ` (${cfg.title})` : '';
    let resumeAfter = false;

    const setState = on => {
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', (on ? 'Pause music' : 'Play music') + label);
      btn.title = (on ? 'Pause music' : 'Play music') + label;
    };
    audio.addEventListener('play', () => setState(true));
    audio.addEventListener('pause', () => setState(false));
    audio.addEventListener('error', () => { btn.hidden = true; });
    audio.src = cfg.src;
    setState(false);
    btn.hidden = false;
    btn.addEventListener('click', () => {
      resumeAfter = false;
      if (audio.paused) { const p = audio.play(); if (p && p.catch) p.catch(() => {}); } else audio.pause();
    });

    const duck = on => {
      if (on && !audio.paused) { resumeAfter = true; audio.pause(); }
      else if (!on && resumeAfter) { resumeAfter = false; const p = audio.play(); if (p && p.catch) p.catch(() => {}); }
    };
    const isLoudVideo = e => e.target && e.target.tagName === 'VIDEO' && !e.target.muted;
    document.addEventListener('play', e => { if (isLoudVideo(e)) duck(true); }, true);
    document.addEventListener('pause', e => { if (isLoudVideo(e)) duck(false); }, true);
    document.addEventListener('ended', e => { if (isLoudVideo(e)) duck(false); }, true);

    return { play() { const p = audio.play(); if (p && p.catch) p.catch(() => {}); }, duck };
  }

  /* ------------------------------------------------------------------ *
   *  Effects: floating hearts + confetti
   * ------------------------------------------------------------------ */
  const FX = (() => {
    const cBg = $('#fx-bg'), cTop = $('#fx-top');
    const gBg = cBg.getContext && cBg.getContext('2d');
    const gTop = cTop.getContext && cTop.getContext('2d');
    let W = 0, H = 0, colors = ['#ff6f91'], ambient = [], bits = [], raf = 0, ready = false;

    const heart = (g, x, y, s, rot, color, alpha) => {
      const k = s / 2;
      g.save();
      g.translate(x, y);
      g.rotate(rot);
      g.globalAlpha = alpha;
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(0, k * 0.9);
      g.bezierCurveTo(-k * 1.6, -k * 0.1, -k * 0.7, -k * 1.3, 0, -k * 0.4);
      g.bezierCurveTo(k * 0.7, -k * 1.3, k * 1.6, -k * 0.1, 0, k * 0.9);
      g.fill();
      g.restore();
    };
    const pick = () => colors[(Math.random() * colors.length) | 0];
    const spawn = initial => ({
      x: Math.random() * W, y: initial ? Math.random() * H : H + 30,
      s: 10 + Math.random() * 16, v: 0.25 + Math.random() * 0.45,
      ph: Math.random() * 6.28, sw: 8 + Math.random() * 18,
      rot: (Math.random() - 0.5) * 0.6, c: pick(), a: 0.12 + Math.random() * 0.16
    });

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      [[cBg, gBg], [cTop, gTop]].forEach(([c, g]) => {
        c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
      });
    };

    const frame = t => {
      raf = 0;
      gBg.clearRect(0, 0, W, H);
      ambient.forEach(p => {
        p.y -= p.v;
        heart(gBg, p.x + Math.sin(t / 1400 + p.ph) * p.sw, p.y, p.s, p.rot + Math.sin(t / 1800 + p.ph) * 0.15, p.c, p.a);
        if (p.y < -40) Object.assign(p, spawn(false));
      });

      gTop.clearRect(0, 0, W, H);
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i];
        b.vy += 0.13; b.vx *= 0.992; b.x += b.vx; b.y += b.vy; b.rot += b.vr; b.life -= b.decay;
        if (b.life <= 0 || b.y > H + 40) { bits.splice(i, 1); continue; }
        const a = Math.min(1, b.life * 1.6);
        if (b.shape === 'heart') heart(gTop, b.x, b.y, b.s, b.rot, b.c, a);
        else {
          gTop.save(); gTop.translate(b.x, b.y); gTop.rotate(b.rot);
          gTop.globalAlpha = a; gTop.fillStyle = b.c; gTop.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
          gTop.restore();
        }
      }
      if (ambient.length || bits.length) raf = requestAnimationFrame(frame);
    };
    const run = () => { if (!raf) raf = requestAnimationFrame(frame); };

    return {
      init() {
        if (!gBg || !gTop) return;
        ready = true;
        const cs = getComputedStyle(document.documentElement);
        const read = k => cs.getPropertyValue(k).trim();
        colors = ['--accent', '--accent2', '--note-1', '--note-2', '--note-3'].map(read).filter(Boolean);
        if (!colors.length) colors = ['#ff6f91'];
        size();
        window.addEventListener('resize', size);
        if (C.floatingHearts !== false && !reduceMotion) {
          const n = Math.max(6, Math.min(16, Math.round(W / 85)));
          ambient = Array.from({ length: n }, () => spawn(true));
          run();
        }
      },
      burst(x, y, n = 90) {
        if (!ready || reduceMotion) return;
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 7;
          bits.push({
            x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4,
            s: 8 + Math.random() * 14, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
            c: pick(), life: 1, decay: 0.006 + Math.random() * 0.008,
            shape: Math.random() < 0.65 ? 'heart' : 'rect'
          });
        }
        run();
      },
      celebrate() {
        [[0.5, 0.5, 0], [0.25, 0.4, 220], [0.75, 0.4, 440], [0.5, 0.3, 700]].forEach(([fx, fy, delay]) =>
          setTimeout(() => this.burst(W * fx, H * fy, 80), delay));
      }
    };
  })();

  /* ------------------------------------------------------------------ *
   *  Sections
   * ------------------------------------------------------------------ */
  const shell = (id, cfg, cls = '') => {
    const s = el('section', ('sec ' + cls).trim());
    s.id = id;
    if (cfg.title || cfg.subtitle) {
      const h = el('header', 'sec-head');
      if (cfg.title) h.appendChild(el('h2', '', tpl(cfg.title)));
      if (cfg.subtitle) h.appendChild(el('p', 'hand', tpl(cfg.subtitle)));
      s.appendChild(h);
    }
    return s;
  };

  const R = {};

  /* ---- hero ---- */
  R.hero = cfg => {
    const s = el('header', 'hero');
    s.id = 'top';
    const inner = el('div', 'hero-inner');
    const txt = el('div', 'hero-text');

    const t = now();
    let title = cfg.title;
    if (cfg.titleOnBirthday && isBirthdayToday(t)) title = cfg.titleOnBirthday;
    else if (cfg.titleOnMonthsary && isMonthsaryDay(t)) title = cfg.titleOnMonthsary;

    if (cfg.eyebrow) txt.appendChild(el('p', 'hand', tpl(cfg.eyebrow)));
    txt.appendChild(el('h1', '', tpl(title || '')));
    if (cfg.subtitle) txt.appendChild(el('p', 'lede', tpl(cfg.subtitle)));
    inner.appendChild(txt);

    if (cfg.photo) {
      const wrap = el('div', 'hero-photo');
      wrap.appendChild(polaroid({ src: cfg.photo, caption: cfg.photoCaption, poster: cfg.photoPoster },
        { tilt: -3.5, ar: '4/5', autoplay: true, eager: true, hero: true }));
      inner.appendChild(wrap);
    } else {
      s.classList.add('no-photo');
    }
    s.appendChild(inner);

    const cue = el('button', 'cue',
      `<span>${tpl(cfg.cue || 'scroll')}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
    cue.type = 'button';
    cue.addEventListener('click', () => {
      const next = s.nextElementSibling;
      if (next) next.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    s.appendChild(cue);
    return s;
  };

  /* ---- live counter ---- */
  R.counter = cfg => {
    if (!start) return null;
    const s = shell('together', cfg);
    const wrap = el('div', 'stub-wrap');
    const stub = el('div', 'stub');
    wrap.appendChild(stub);

    const WORDS = { months: ['month', 'months'], days: ['day', 'days'], hours: ['hour', 'hours'], minutes: ['minute', 'minutes'], seconds: ['second', 'seconds'] };
    const nums = {}, labels = {};
    Object.keys(WORDS).forEach(u => {
      const cell = el('div', 'cell');
      nums[u] = el('span', 'num', '0');
      labels[u] = el('span', 'unit hand', WORDS[u][1]);
      cell.append(nums[u], labels[u]);
      stub.appendChild(cell);
    });
    s.appendChild(wrap);
    s.appendChild(el('p', 'hand since', tpl(cfg.since || 'Since {startDate}')));
    const next = el('p', 'hand next');
    s.appendChild(next);

    const tick = () => {
      const t = now();
      let parts = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
      if (t >= start) {
        const m = wholeMonths(start, t);
        let ms = t - addMonths(start, m);
        const d = Math.floor(ms / 864e5); ms -= d * 864e5;
        const h = Math.floor(ms / 36e5); ms -= h * 36e5;
        const mi = Math.floor(ms / 6e4); ms -= mi * 6e4;
        parts = { months: m, days: d, hours: h, minutes: mi, seconds: Math.floor(ms / 1e3) };

        if (isMonthsaryDay(t)) {
          next.textContent = fill(cfg.today || 'Today is our monthsary!');
        } else {
          const n = Math.max(1, Math.ceil((addMonths(start, m + 1) - t) / 864e5));
          next.textContent = fill(cfg.next || '{n} {unit} until our next monthsary')
            .replace('{n}', n).replace('{unit}', n === 1 ? 'day' : 'days');
        }
      }
      Object.keys(parts).forEach(u => {
        nums[u].textContent = parts[u];
        labels[u].textContent = WORDS[u][parts[u] === 1 ? 0 : 1];
      });
    };
    tick();
    setInterval(tick, 1000);
    return s;
  };

  /* ---- story ---- */
  R.story = cfg => {
    const s = shell('story', cfg);
    (cfg.items || []).forEach((raw, i) => {
      const it = norm(raw);
      const media = it.media || it.src;
      const row = el('article', 'memory' + (i % 2 ? ' flip' : '') + (media ? '' : ' memory-text-only'));

      if (media) {
        const p = polaroid({ src: media, caption: it.caption, poster: it.poster }, { tilt: tiltFor(i), ar: '4/5' });
        if (kind(media) === 'image') makeZoomable(p, () => LB.open([{ src: media, caption: it.caption }], 0));
        row.appendChild(p);
      }
      const txt = el('div', 'memory-text');
      if (it.date) txt.appendChild(el('p', 'hand date', tpl(it.date)));
      if (it.title) txt.appendChild(el('h3', '', tpl(it.title)));
      if (it.text) txt.appendChild(el('p', '', tpl(it.text)));
      row.appendChild(txt);
      s.appendChild(row);
    });
    return s;
  };

  /* ---- photo wall ---- */
  R.gallery = cfg => {
    const s = shell('gallery', cfg);
    const items = (cfg.items || []).map(norm);
    const wall = el('div', 'wall');
    items.forEach((it, i) => {
      const f = polaroid(it, {
        slim: true, tilt: tiltFor(i + 3) * 0.55, ar: RATIOS[i % RATIOS.length],
        thumb: true, controls: false, muted: true, badge: true
      });
      makeZoomable(f, () => LB.open(items, i));
      wall.appendChild(f);
    });
    s.appendChild(wall);
    return s;
  };

  /* ---- videos ---- */
  R.video = cfg => {
    const s = shell('film', cfg);
    const items = cfg.items || (cfg.src ? [cfg] : []);
    const films = el('div', 'films');
    items.forEach((raw, i) => {
      films.appendChild(polaroid(raw, { tilt: i % 2 ? 1.1 : -1.1, ar: '16/9', autoRatio: true, controls: true, thumb: true }));
    });
    s.appendChild(films);
    return s;
  };

  /* ---- reasons ---- */
  R.reasons = cfg => {
    const s = shell('reasons', cfg);
    const grid = el('div', 'notes');
    (cfg.items || []).forEach((raw, i) => {
      const text = typeof raw === 'string' ? raw : (raw && raw.text) || '';
      const b = el('button', 'note');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.style.setProperty('--tilt', tiltFor(i + 1) + 'deg');
      b.style.setProperty('--c', `var(--note-${(i % 4) + 1})`);
      b.innerHTML =
        `<span class="note-inner">` +
          `<span class="face front">${heartSvg()}<span class="hand">${tpl(cfg.noteLabel || 'reason no.')} ${i + 1}</span><span class="hand tap">${tpl(cfg.tapLabel || 'tap to read')}</span></span>` +
          `<span class="face back"><span class="hand">${tpl(text)}</span></span>` +
        `</span>`;
      b.addEventListener('click', () => {
        const on = b.classList.toggle('flipped');
        b.setAttribute('aria-pressed', String(on));
      });
      grid.appendChild(b);
    });
    s.appendChild(grid);
    return s;
  };

  /* ---- letter (typewriter) ---- */
  R.letter = cfg => {
    const s = shell('letter', cfg);
    const paper = el('article', 'letter');
    if (cfg.greeting) paper.appendChild(el('p', 'hand greet', tpl(cfg.greeting)));

    const typed = cfg.typewriter !== false && !reduceMotion;
    const body = el('div', 'letter-body');
    const paras = (cfg.body || []).map(t => {
      const text = fill(t);
      const p = el('p');
      const a = el('span', 't');
      const b = el('span', 'r');
      if (typed) { b.textContent = text; p.append(a, b); } else { a.textContent = text; p.append(a); }
      body.appendChild(p);
      return { p, a, b, text };
    });
    paper.appendChild(body);

    const sig = el('p', 'sig' + (typed ? '' : ' in'));
    sig.innerHTML = `${cfg.signoff ? tpl(cfg.signoff) : ''}<b>${cfg.signature ? tpl(cfg.signature) : ''}</b>`;
    paper.appendChild(sig);
    s.appendChild(paper);

    if (typed) {
      const caret = el('span', 'caret');
      caret.setAttribute('aria-hidden', 'true');
      const total = paras.reduce((n, p) => n + p.text.length, 0);
      const speed = cfg.typingSpeed || 24;
      let skip = false, started = false;

      const render = n => {
        let left = n, active = null;
        paras.forEach(p => {
          const k = Math.max(0, Math.min(p.text.length, left));
          p.a.textContent = p.text.slice(0, k);
          p.b.textContent = p.text.slice(k);
          if (k > 0) active = p;
          left -= p.text.length;
        });
        if (active) active.p.insertBefore(caret, active.b); else caret.remove();
      };
      const begin = () => {
        if (started) return;
        started = true;
        const t0 = performance.now();
        const step = t => {
          const n = skip ? total : Math.min(total, Math.floor((t - t0) / speed));
          render(n);
          if (n < total) requestAnimationFrame(step);
          else { caret.remove(); sig.classList.add('in'); }
        };
        requestAnimationFrame(step);
      };
      paper.addEventListener('click', () => { skip = true; });
      observeOnce(paper, begin, { threshold: 0.4 });
    }
    return s;
  };

  /* ---- finale ---- */
  R.finale = cfg => {
    const s = el('section', 'sec finale');
    s.id = 'finale';
    const inner = el('div', 'finale-inner');
    s.appendChild(inner);

    if (cfg.title) inner.appendChild(el('h2', '', tpl(cfg.title)));
    if (cfg.message) inner.appendChild(el('p', 'hand msg', tpl(cfg.message)));

    const q = cfg.question || {};
    const asking = q.enabled !== false && !!q.text;
    const ask = el('div', 'ask');
    const btns = el('div', 'btns');
    if (asking) ask.appendChild(el('p', 'q', tpl(q.text)));

    const yes = el('button', 'btn yes');
    yes.type = 'button';
    yes.textContent = fill(asking ? (q.yes || 'Yes') : (cfg.button || 'Tap for a surprise'));
    btns.appendChild(yes);

    let no = null;
    if (asking) {
      no = el('button', 'btn ghost no');
      no.type = 'button';
      no.textContent = fill(q.no || 'No');
      btns.appendChild(no);
    }
    ask.appendChild(btns);
    inner.appendChild(ask);

    const rv = cfg.reveal || {};
    const reveal = el('div', 'reveal');
    reveal.hidden = true;
    if (rv.media) reveal.appendChild(polaroid({ src: rv.media, caption: rv.caption, poster: rv.poster }, { tilt: -2, ar: '4/5', autoplay: true }));
    if (rv.message) reveal.appendChild(el('p', 'reveal-msg', tpl(rv.message)));
    inner.appendChild(reveal);

    yes.addEventListener('click', () => {
      ask.hidden = true;
      reveal.hidden = false;
      FX.celebrate();
      reveal.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });

    if (no) {
      let dodges = 0, tx = 0, ty = 0, relented = false;
      const move = () => {
        const r = no.getBoundingClientRect();
        for (let i = 0; i < 10; i++) {
          const nx = tx + (Math.random() * 2 - 1) * 150;
          const ny = ty + (Math.random() * 2 - 1) * 80;
          const L = r.left + (nx - tx), T = r.top + (ny - ty);
          if (L > 10 && L + r.width < window.innerWidth - 10 && T > 10 && T + r.height < window.innerHeight - 10) {
            tx = nx; ty = ny; break;
          }
        }
        no.style.transform = `translate(${tx}px, ${ty}px)`;
      };
      const dodge = () => {
        if (relented) return;
        dodges++;
        if (dodges >= 5) {
          relented = true;
          no.textContent = fill(q.noRelents || 'Okay, yes');
          no.classList.remove('ghost');
          no.style.transform = '';
          return;
        }
        move();
      };
      no.addEventListener('pointerenter', dodge);
      no.addEventListener('click', () => { if (relented) yes.click(); else dodge(); });
    }
    return s;
  };

  /* ------------------------------------------------------------------ *
   *  Opening screen, progress bar, boot
   * ------------------------------------------------------------------ */
  function setupGate(music) {
    const g = $('#gate');
    const cfg = C.gate || {};
    const open = () => requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('opened')));

    if (cfg.enabled === false) { open(); return; }

    g.hidden = false;
    lock('gate', true);
    g.innerHTML =
      `<div class="gate-card">${heartSvg('beat')}` +
      `<p class="gate-text">${tpl(cfg.text || 'I made something for you, {name}.')}</p>` +
      `<button class="btn" type="button">${tpl(cfg.button || 'Open it')}</button>` +
      (cfg.hint ? `<p class="hand gate-hint">${tpl(cfg.hint)}</p>` : '') +
      `</div>`;

    const btn = $('.btn', g);
    btn.focus({ preventScroll: true });
    btn.addEventListener('click', () => {
      const r = btn.getBoundingClientRect();
      g.classList.add('gone');
      lock('gate', false);
      window.scrollTo(0, 0);
      open();
      music.play();
      FX.burst(r.left + r.width / 2, r.top + r.height / 2, 45);
      setTimeout(() => { g.hidden = true; }, 900);
    }, { once: true });
  }

  function setupProgress() {
    const bar = $('#progress');
    let queued = false;
    const update = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  const DEFAULT_ORDER = ['hero', 'counter', 'story', 'gallery', 'video', 'reasons', 'letter', 'finale'];

  function boot() {
    applyTheme();
    document.title = C.pageTitle || document.title;
    FX.init();
    const music = setupMusic();

    (C.sections || DEFAULT_ORDER).forEach(name => {
      const build = R[name], cfg = C[name];
      if (!build || !cfg) return;
      const node = build(cfg);
      if (node) app.appendChild(node);
    });
    if (C.footer) app.appendChild(el('footer', 'foot hand', tpl(C.footer)));

    setupProgress();
    setupGate(music);
  }

  boot();
})();
