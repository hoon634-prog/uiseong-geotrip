/* 의성 지오트립 — 공통 기능: 저장, 아이콘, 알림, 위치(GPS), 오디오 가이드(TTS), 스탬프 */
(function () {
  'use strict';
  var GEO = window.GEO = window.GEO || {};
  GEO.env = { artifact: !!window.GEOTRIP_ARTIFACT, ios: /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }

  /* ---------- 아이콘 ---------- */
  var IC = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>', map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    lens: '<circle cx="12" cy="12" r="3.2"/><path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2"/>',
    book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z"/><path d="M19 19v2H6"/>', pass: '<path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4V8z"/><path d="M14 6v12" stroke-dasharray="2 3"/>',
    play: '<path d="M7 4l13 8-13 8V4z" fill="currentColor"/>', pause: '<path d="M7 4h3v16H7zM14 4h3v16h-3z" fill="currentColor"/>', next: '<path d="M5 4l10 8-10 8V4z" fill="currentColor"/><path d="M19 5v14"/>', prev: '<path d="M19 4L9 12l10 8V4z" fill="currentColor"/><path d="M5 5v14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', back: '<path d="M15 5l-7 7 7 7"/>', pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    nav: '<path d="M3 11l18-8-8 18-2-8-8-2z"/>', check: '<path d="M5 12l5 5 9-10"/>', bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z"/>',
    tools: '<path d="M14.5 6.5a4 4 0 005 5L10 21a2.1 2.1 0 01-3-3l9.5-9.5"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>', angle: '<path d="M4 20h16M4 20L18 6"/><path d="M11 20a7 7 0 00-2.1-5"/>',
    speed: '<path d="M5 18a8 8 0 1114 0"/><path d="M12 14l4-5"/>', note: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>', cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>', sound: '<path d="M4 10v4h4l5 4V6l-5 4H4z"/><path d="M17 9a4 4 0 010 6M19.5 6.5a8 8 0 010 11"/>', time: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    route: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18c9 0 1-12 8-12"/>', quiz: '<circle cx="12" cy="12" r="9.5"/><path d="M9.5 9.5a2.6 2.6 0 114.3 2c-.9.8-1.8 1.3-1.8 2.7M12 17.3v.2"/>',
    az: '<path d="M3 18l4-12 4 12M4.5 14h5M14 8h6l-6 10h6"/>', shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>', layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5"/>',
    foot: '<path d="M12 9c3 0 5 2.5 5 6s-2 6-5 6-5-2.5-5-6 2-6 5-6z"/><ellipse cx="9.3" cy="5.5" rx="1.5" ry="2"/><ellipse cx="14.7" cy="5.5" rx="1.5" ry="2"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/>', list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>', photo: '<path d="M4 5h16v14H4z"/><path d="M4 16l5-5 4 4 3-3 4 4"/><circle cx="9" cy="9" r="1.5"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', copy: '<path d="M9 9h10v11H9z"/><path d="M5 15V4h10"/>', plus: '<path d="M12 5v14M5 12h14"/>', star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z"/>',
    story: '<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4z"/><path d="M9 8h6M9 12h6"/>', bag: '<path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/>'
  };
  function ic(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[n] || '') + '</svg>'; }

  /* ---------- 저장 ---------- */
  var KEY = 'geotrip.v1';
  var def = { profile: { name: '', cls: '' }, stamps: {}, quiz: {}, looks: {}, pack: {}, read: {}, notes: [], prefs: { font: 'm', theme: 'auto', rate: 1, loc: false, decl: true, mode: 'std', words: true } };
  var state = def;
  try { var raw = JSON.parse(localStorage.getItem(KEY) || '{}'); state = Object.assign({}, def, raw); state.prefs = Object.assign({}, def.prefs, raw.prefs || {}); state.profile = Object.assign({}, def.profile, raw.profile || {}); if (!state.read || typeof state.read !== 'object') state.read = {}; } catch (e) { state = def; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; } }
  var themed = false;
  function applyPrefs() { var r = document.documentElement; if (state.prefs.theme !== 'auto') { r.setAttribute('data-theme', state.prefs.theme); themed = true; } else if (themed || !GEO.env.artifact) { r.removeAttribute('data-theme'); themed = false; } if (state.prefs.font === 'm') r.removeAttribute('data-font'); else r.setAttribute('data-font', state.prefs.font); }

  /* ---------- 알림 ---------- */
  var toastT;
  function toast(msg, ms) { var t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, ms || 2600); }
  function sheet(html) { closeSheet(); var bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.innerHTML = '<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + html + '</div>'; bg.addEventListener('click', function (e) { if (e.target === bg) closeSheet(); }); document.body.appendChild(bg); return bg.firstChild; }
  function closeSheet() { var s = $('.sheet-bg'); if (s) s.remove(); }

  /* ---------- 위치 ---------- */
  function dist(aLat, aLon, bLat, bLon) { var R = 6371000, r = Math.PI / 180, dLat = (bLat - aLat) * r, dLon = (bLon - aLon) * r; var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLon / 2) * Math.sin(dLon / 2); return 2 * R * Math.asin(Math.sqrt(x)); }
  function bearing(aLat, aLon, bLat, bLon) { var r = Math.PI / 180, y = Math.sin((bLon - aLon) * r) * Math.cos(bLat * r), x = Math.cos(aLat * r) * Math.sin(bLat * r) - Math.sin(aLat * r) * Math.cos(bLat * r) * Math.cos((bLon - aLon) * r); return (Math.atan2(y, x) / r + 360) % 360; }
  function fmtDist(m) { return m < 1000 ? Math.round(m / 10) * 10 + 'm' : (m / 1000).toFixed(m < 10000 ? 1 : 0) + 'km'; }
  var geo = {
    pos: null, err: null, id: null, subs: [],
    ok: 'geolocation' in navigator,
    start: function (cb) {
      if (cb) geo.subs.push(cb);
      if (!geo.ok) { geo.err = 'unsupported'; geo.emit(); return; }
      if (geo.id != null) { if (geo.pos && cb) cb(geo); return; }
      geo.id = navigator.geolocation.watchPosition(function (p) { geo.pos = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy, alt: p.coords.altitude, t: Date.now() }; geo.err = null; geo.emit(); },
        function (e) { geo.err = e.code === 1 ? 'denied' : 'unavailable'; geo.emit(); if (e.code === 1) geo.stop(); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    },
    stop: function () { if (geo.id != null) { navigator.geolocation.clearWatch(geo.id); geo.id = null; } },
    emit: function () { geo.subs = geo.subs.filter(function (f) { try { return f(geo) !== false; } catch (e) { return false; } }); },
    toSite: function (s) { if (!geo.pos) return null; var d = dist(geo.pos.lat, geo.pos.lon, s.lat, s.lon); if (s.alt) d = Math.min(d, dist(geo.pos.lat, geo.pos.lon, s.alt.lat, s.alt.lon)); return d; },
    nearest: function () { if (!geo.pos) return null; var best = null; GEO.sites.forEach(function (s) { var d = geo.toSite(s); if (!best || d < best.d) best = { s: s, d: d }; }); return best; },
    inside: function (s) { var d = geo.toSite(s); return d != null && d <= s.radius + Math.min(geo.pos.acc || 0, 150); }
  };
  function site(id) { return GEO.sites.filter(function (s) { return s.id === id; })[0]; }

  /* ---------- 스탬프 ---------- */
  function stamp(id, how) { if (state.stamps[id]) return false; state.stamps[id] = { t: Date.now(), how: how }; save(); return true; }
  function stampCount() { return Object.keys(state.stamps).length; }
  function quizPerfect(s) { return s.quiz.every(function (q, i) { return state.quiz[s.id + '-' + i] === true; }); }

  /* ---------- 오디오 가이드(음성 합성) ---------- */
  var synth = window.speechSynthesis;
  var guide = {
    ok: !!(synth && window.SpeechSynthesisUtterance), q: [], i: -1, site: null, mode: 'std', playing: false, paused: false, onchange: null, voice: null,
    pickVoice: function () { try { var vs = synth.getVoices().filter(function (v) { return /^ko/i.test(v.lang); }); guide.voice = vs.filter(function (v) { return /Google|Yuna|Sora|Heami|SunHi|InJoon/i.test(v.name); })[0] || vs[0] || null; } catch (e) { guide.voice = null; } },
    /* 문장 단위로 나눈다. 4.25미터처럼 숫자 사이의 점에서는 끊지 않는다 */
    split: function (txt) { return txt.match(/(?:[^.!?]|\.(?=\d))+[.!?]+[”’"')\]]*\s*/g) || [txt]; },
    build: function (s, mode) { var q = [], split = guide.split;
      if (mode === 'exp') split(s.quick).forEach(function (x) { q.push({ seg: -1, t: '30초 요약', x: x.trim() }); });
      else {
        q.push({ seg: -1, t: s.name, x: s.name + '. ' + s.tag + '.' });
        /* 처음 듣는 사람을 위해, 해설에 나오는 낱말의 뜻을 먼저 읽어 준다(설정에서 끌 수 있음) */
        if (state.prefs.words !== false && s.words && s.words.length) { q.push({ seg: -1, t: '먼저 알아두기', x: '먼저 알아 둘 낱말입니다.' }); s.words.forEach(function (w) { q.push({ seg: -1, t: '먼저 알아두기', x: w[0] + '. ' + w[1] + '.' }); }); }
        s.narr.forEach(function (n, k) { q.push({ seg: k, t: n.t, x: n.t + '.' }); split(n.x).forEach(function (x) { q.push({ seg: k, t: n.t, x: x.trim() }); }); });
      }
      return q; },
    /* 명소가 아닌 것(개념 카드 등)을 읽어 줄 때: meta = { id, name, href }, q = [{ seg, t, x }] */
    playList: function (meta, q) {
      if (!guide.ok) { toast('이 기기(브라우저)는 음성 읽기를 지원하지 않아요. 글로 읽어 주세요.'); return; }
      guide.stop(true); guide.site = meta; guide.mode = 'list'; guide.q = q; guide.i = 0; guide.playing = true; guide.paused = false; guide.speak();
    },
    play: function (s, mode, fromSeg) {
      if (!guide.ok) { toast('이 기기(브라우저)는 음성 읽기를 지원하지 않아요. 글로 읽어 주세요.'); return; }
      guide.stop(true); guide.site = s; guide.mode = mode || state.prefs.mode || 'std'; guide.q = guide.build(s, guide.mode); guide.i = 0;
      if (fromSeg != null) { for (var k = 0; k < guide.q.length; k++) if (guide.q[k].seg === fromSeg) { guide.i = k; break; } }
      guide.playing = true; guide.paused = false; guide.speak();
    },
    speak: function () {
      if (guide.i < 0 || guide.i >= guide.q.length) { guide.finish(); return; }
      if (!guide.voice) guide.pickVoice();
      var u = new SpeechSynthesisUtterance(guide.q[guide.i].x); u.lang = 'ko-KR'; if (guide.voice) u.voice = guide.voice; u.rate = state.prefs.rate || 1;
      var my = guide.token = Math.random();
      u.onend = function () { if (guide.token !== my || !guide.playing || guide.paused) return; guide.i++; guide.speak(); };
      u.onerror = function (e) { if (guide.token !== my) return; if (e.error === 'interrupted' || e.error === 'canceled') return; guide.i++; if (guide.playing) guide.speak(); };
      guide.u = u; try { synth.cancel(); synth.speak(u); } catch (e) { guide.finish(); }
      guide.emit();
    },
    pause: function () { guide.paused = true; guide.token = null; try { synth.cancel(); } catch (e) { } guide.emit(); },
    resume: function () { if (!guide.site) return; guide.paused = false; guide.playing = true; guide.speak(); },
    toggle: function () { if (!guide.playing) return; if (guide.paused) guide.resume(); else guide.pause(); },
    jump: function (d) { if (!guide.playing) return; var cur = guide.q[guide.i] ? guide.q[guide.i].seg : -1, k = guide.i;
      if (d > 0) { while (k < guide.q.length && guide.q[k].seg === cur) k++; } else { while (k > 0 && guide.q[k].seg === cur) k--; var c2 = guide.q[k].seg; while (k > 0 && guide.q[k - 1].seg === c2) k--; }
      guide.i = k; guide.paused = false; guide.speak(); },
    finish: function () { guide.playing = false; guide.paused = false; guide.i = -1; guide.token = null; guide.emit(); },
    stop: function (quiet) { guide.token = null; try { if (synth) synth.cancel(); } catch (e) { } guide.playing = false; guide.paused = false; guide.i = -1; if (!quiet) { guide.site = null; guide.emit(); } },
    emit: function () { if (guide.onchange) guide.onchange(guide); }
  };
  if (guide.ok) { try { guide.pickVoice(); synth.onvoiceschanged = guide.pickVoice; } catch (e) { } }
  window.addEventListener('pagehide', function () { try { if (synth) synth.cancel(); } catch (e) { } });

  var CAT = { fossil: '화석', sed: '퇴적', volcano: '화산', land: '지형' };
  var CATCOL = { fossil: '#c2570c', sed: '#8a6a12', volcano: '#b02a63', land: '#136f84' };

  GEO.app = { $: $, $$: $$, esc: esc, ic: ic, state: state, save: save, applyPrefs: applyPrefs, toast: toast, sheet: sheet, closeSheet: closeSheet, dist: dist, bearing: bearing, fmtDist: fmtDist, site: site, stamp: stamp, stampCount: stampCount, quizPerfect: quizPerfect, CAT: CAT, CATCOL: CATCOL, KEY: KEY };
  GEO.geo = geo; GEO.guide = guide;
  applyPrefs();
})();
