/* 의성 지오트립 — AR 렌즈
   · 카메라(현장) / 연습 장면(교실) / 사진 불러오기 세 가지 바탕 위에
   · 관찰 포인트 설명, 발자국 틀, 경사 가이드, 방향 라벨, ‘시간 여행’ 애니메이션을 겹쳐 보여 주고
   · 겹친 화면을 그대로 찍어 조사 노트에 저장합니다. */
(function () {
  'use strict';
  var GEO = window.GEO, A = GEO.app, $ = A.$, $$ = A.$$, esc = A.esc, ic = A.ic, S = A.state, geo = GEO.geo, V = GEO.V, RAD = Math.PI / 180, DECL = -8;
  var AR = GEO.ar = {}, st = null;
  var TPL = [null, 'sauro', 'ornitho', 'thero'], TPLNAME = { sauro: '용각류 틀', ornitho: '조각류 틀', thero: '수각류 틀' }, TPLTIP = { sauro: '둥글고 큰 뒷발 + 작은 앞발. 목 긴 초식 공룡', ornitho: '뭉툭한 세 발가락. 두 발(때로 네 발) 초식 공룡', thero: '가늘고 뾰족한 세 발가락. 육식 공룡' };
  function wrap(a) { a = ((a + 180) % 360 + 360) % 360 - 180; return a; }

  AR.isOpen = function () { return !!st; };
  AR.open = function (site, mode) {
    if (st && st.site === site) return; if (st) AR.close(true);
    try { GEO.guide.stop(); } catch (e) { }
    var el = document.createElement('div'); el.className = 'ar'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', site.name + ' AR 렌즈');
    el.innerHTML = '<div class="stage"><video playsinline muted autoplay hidden></video><canvas class="bg" data-k="scene" hidden></canvas><img class="bg" data-k="photo" alt="" hidden><canvas class="fx"></canvas><div class="layer" style="position:absolute;inset:0;z-index:2"></div></div>' +
      '<div class="ar-top"><button class="ar-btn" data-ar="close" aria-label="AR 렌즈 닫기">' + ic('x') + '</button><div class="ttl"><b>' + esc(site.name) + '</b><small id="ar-sub"></small></div></div>' +
      '<div class="ar-modes"><button class="ar-chip" data-ar="mode" data-m="live">카메라</button><button class="ar-chip" data-ar="mode" data-m="practice">연습 장면</button><label class="ar-chip" style="cursor:pointer;display:inline-flex;align-items:center">사진<input type="file" accept="image/*" id="ar-file" hidden></label></div>' +
      '<div class="ar-tools">' + tool('time', 'time', '시간 여행') + (site.cat === 'fossil' || true ? tool('tpl', 'foot', '발자국 틀') : '') + tool('dip', 'angle', '경사 가이드') + (site.dirs && site.dirs.length ? tool('geo', 'compass', '방향 라벨') : '') + '</div>' +
      '<div class="ar-bottom"><div id="ar-extra"></div><div class="ar-card" id="ar-card"></div><div class="ar-chips" id="ar-chips"></div><div class="row" style="justify-content:space-between"><button class="ar-btn" data-ar="speak" aria-label="설명 읽어 주기">' + ic('sound') + '</button><button class="ar-shutter" data-ar="shot" aria-label="겹친 화면 찍어 조사 노트에 저장"></button><button class="ar-btn" data-ar="clear" aria-label="표시 지우기">' + ic('trash') + '</button></div></div>';
    document.body.appendChild(el); document.body.style.overflow = 'hidden';
    st = { site: site, el: el, stage: $('.stage', el), mode: null, video: $('video', el), scene: $('canvas.bg', el), photo: $('img.bg', el), fx: $('canvas.fx', el), layer: $('.layer', el), sel: -1, pins: [], tool: { time: false, tpl: null, dip: false, geo: false }, t: 1, raf: 0, t0: performance.now(), roll: 0, hasRoll: false, heading: null, pitch: 0, sim: 150, tp: { x: 0, y: 0, s: 1, r: 0 }, dipA: 25, stream: null, msg: '' };
    st.found = S.looks[site.id] = S.looks[site.id] || {};
    el.addEventListener('click', onClick); st.layer.addEventListener('pointerup', onTap);
    $('#ar-file', el).addEventListener('change', onFile);
    window.addEventListener('resize', onResize);
    setMode(mode || (canCam() ? 'live' : 'practice'));
  };
  function tool(k, icon, label) { return '<div><button class="ar-btn" data-ar="tool" data-k="' + k + '" aria-pressed="false" aria-label="' + label + '">' + ic(icon) + '</button><div class="lb">' + label + '</div></div>'; }
  function canCam() { return !GEO.env.artifact && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.isSecureContext !== false); }

  AR.close = function (silent) {
    if (!st) return; var id = st.site.id; stopCam(); cancelAnimationFrame(st.raf);
    window.removeEventListener('resize', onResize); window.removeEventListener('devicemotion', onMotion, true); window.removeEventListener('deviceorientation', onOri, true); window.removeEventListener('deviceorientationabsolute', onOri, true);
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { }
    if (st.photoUrl) URL.revokeObjectURL(st.photoUrl);
    st.el.remove(); st = null; document.body.style.overflow = '';
    if (!silent) { if (V.canBack && V.canBack()) history.back(); else location.hash = '#site-' + id; }
  };

  /* ---------- 바탕(카메라·연습·사진) ---------- */
  function stopCam() { if (st && st.stream) { st.stream.getTracks().forEach(function (t) { t.stop(); }); st.stream = null; } }
  function setMode(m) {
    stopCam(); st.mode = m; st.el.classList.toggle('practice', m === 'practice'); st.video.hidden = m !== 'live'; st.scene.hidden = m !== 'practice'; st.photo.hidden = m !== 'photo'; st.pins = []; st.msg = '';
    $$('[data-ar="mode"]', st.el).forEach(function (b) { b.classList.toggle('on', b.dataset.m === m); });
    if (m === 'live') {
      st.msg = '카메라를 켜는 중…';
      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }).then(function (s) {
        if (!st || st.mode !== 'live') { s.getTracks().forEach(function (t) { t.stop(); }); return; }
        st.stream = s; st.video.srcObject = s; st.video.play().catch(function () { }); st.msg = ''; draw();
      }).catch(function (e) { if (!st) return; var why = e && e.name === 'NotAllowedError' ? '카메라 권한이 꺼져 있어요.' : '이 기기에서 카메라를 쓸 수 없어요.'; setMode('practice'); st.msg = why + ' 연습 장면으로 보여 드립니다.'; draw(); setTimeout(function () { if (st) { st.msg = ''; draw(); } }, 3500); });
    }
    if (m === 'practice') paintScene();
    sizeFx(); draw();
  }
  function paintScene() { GEO.scene.paint(st.scene, st.site.scene, { w: st.stage.clientWidth, h: st.stage.clientHeight }); }
  function sizeFx() { var dpr = Math.min(window.devicePixelRatio || 1, 2), w = st.stage.clientWidth, h = st.stage.clientHeight; st.fx.width = w * dpr; st.fx.height = h * dpr; st.fxc = st.fx.getContext('2d'); st.fxc.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function onResize() { if (!st) return; if (st.mode === 'practice') paintScene(); sizeFx(); draw(); }
  function onFile(e) { var f = e.target.files && e.target.files[0]; if (!f || !st) return; if (st.photoUrl) URL.revokeObjectURL(st.photoUrl); st.photoUrl = URL.createObjectURL(f); st.photo.src = st.photoUrl; setMode('photo'); e.target.value = ''; }

  /* ---------- 화면 그리기 ---------- */
  function draw() {
    if (!st) return; var s = st.site, L = st.layer, h = '';
    $('#ar-sub', st.el).textContent = { live: '카메라 · 노두를 비추고 아래 관찰 포인트를 눌러 보세요', practice: '연습 장면 · 노란 점을 눌러 보세요', photo: '불러온 사진 · 관찰 포인트를 골라 사진 위를 눌러 표시' }[st.mode] || '';
    if (st.mode === 'practice') s.look.forEach(function (l, i) { h += '<button class="ar-hot' + (st.sel === i ? ' on' : '') + (st.found[i] ? ' found' : '') + '" style="left:' + l.p[0] * 100 + '%;top:' + l.p[1] * 100 + '%" data-ar="hot" data-i="' + i + '" aria-label="' + esc(l.k) + '"></button>' + (st.found[i] || st.sel === i ? '<span class="ar-pin" style="left:' + l.p[0] * 100 + '%;top:calc(' + l.p[1] * 100 + '% - 16px)">' + esc(l.k) + '</span>' : ''); });
    st.pins.forEach(function (p) { h += '<span class="ar-pin" style="left:' + p.x * 100 + '%;top:' + p.y * 100 + '%">' + esc(p.k) + '</span>'; });
    if (st.msg) h += '<div class="ar-msg">' + esc(st.msg) + '</div>';
    if (st.tool.dip) h += '<div class="ar-dip"><div class="hz" style="transform:rotate(' + (-st.roll) + 'deg)"></div><div class="ln" style="transform:rotate(' + st.dipA + 'deg)"></div><div class="val">' + dipVal() + '°</div></div>';
    if (st.tool.geo) h += geoLabels();
    L.innerHTML = h;
    if (st.tool.tpl) mountTpl();
    $$('[data-ar="tool"]', st.el).forEach(function (b) { var k = b.dataset.k; b.setAttribute('aria-pressed', k === 'tpl' ? !!st.tool.tpl : !!st.tool[k]); });
    // 아래쪽 도구별 조절기
    var ex = '', fo = st.focus;
    if (fo && !(fo === 'tpl' ? st.tool.tpl : st.tool[fo])) fo = st.focus = null;
    if (fo === 'time') { var stage = s.fx === 'air' ? Math.min(3, Math.floor(st.t * 4)) : (st.t > 0.72 ? 3 : st.t > 0.45 ? 2 : st.t > 0.18 ? 1 : 0); ex += '<div class="ar-slider"><span>' + (s.fx === 'air' ? '여름' : '현재') + '</span><input type="range" min="0" max="100" value="' + Math.round(st.t * 100) + '" id="ar-t" aria-label="시간 여행"><span>' + (s.fx === 'air' ? '가을' : '과거') + '</span></div><div class="small" style="text-align:center;color:#ffd36b;font-weight:600">' + esc(s.fxCap[stage]) + '</div>'; }
    if (fo === 'dip') ex += '<div class="ar-slider"><span>선 돌리기</span><input type="range" min="-89" max="89" value="' + st.dipA + '" id="ar-dip" aria-label="경사 가이드 선 돌리기"></div><div class="small" style="text-align:center">노란 선을 지층 줄무늬에 맞추세요. ' + (st.hasRoll ? '흰 점선이 수평입니다.' : '휴대폰은 반듯하게!') + ' 지층이 뻗은 방향으로 서서 봐야 실제 기울기와 같아요.</div>';
    if (fo === 'tpl') ex += '<div class="small" style="text-align:center;font-weight:600">' + TPLNAME[st.tool.tpl] + ' · ' + TPLTIP[st.tool.tpl] + '</div><div class="row" style="justify-content:center;flex-wrap:nowrap"><button class="ar-chip" data-ar="tpl-s" data-d="-1">작게</button><button class="ar-chip" data-ar="tpl-s" data-d="1">크게</button><button class="ar-chip" data-ar="tpl-r">돌리기</button><button class="ar-chip" data-ar="tpl-next">다른 틀</button></div><div class="small" style="text-align:center">손가락으로 끌어 발자국 위에 겹쳐 보세요.</div>';
    if (fo === 'geo') ex += (st.heading == null ? '<div class="ar-slider"><span>방향 돌리기</span><input type="range" min="0" max="359" value="' + st.sim + '" id="ar-sim" aria-label="바라보는 방향"><span class="mono">' + st.sim + '°</span></div><div class="small" style="text-align:center">나침반 센서가 없어 손으로 돌려 보는 연습 모드입니다.</div>' : '<div class="small" style="text-align:center">휴대폰을 세워 들고 천천히 돌려 보세요. 이름표가 실제 방향에 나타납니다.</div>');
    var exEl = $('#ar-extra', st.el); exEl.innerHTML = ex;
    ['ar-t', 'ar-dip', 'ar-sim'].forEach(function (id) { var e = $('#' + id, exEl); if (e) e.addEventListener('input', onSlide); });
    // 관찰 포인트 칩과 설명 카드
    $('#ar-chips', st.el).innerHTML = s.look.map(function (l, i) { return '<button class="ar-chip' + (st.sel === i ? ' on' : '') + (st.found[i] ? ' found' : '') + '" data-ar="hot" data-i="' + i + '">' + esc(l.k) + '</button>'; }).join('');
    var card = $('#ar-card', st.el);
    if (st.sel >= 0) { var l = s.look[st.sel]; card.hidden = false; card.innerHTML = '<h3>' + esc(l.k) + '</h3><p>' + esc(l.d) + '</p><p class="tip">미션: ' + esc(l.m) + '</p>' + (st.mode !== 'practice' && !st.found[st.sel] ? '<p class="small" style="color:#ffd36b">화면에서 이 부분을 찾아 눌러 표시하세요.</p>' : '') + '<div class="row"><button class="ar-chip' + (st.found[st.sel] ? ' on' : '') + '" data-ar="found">' + (st.found[st.sel] ? '찾았어요 ✓' : '찾았어요') + '</button><button class="ar-chip" data-ar="concept" data-c="' + l.c + '">쉬운 설명 보기</button></div>'; }
    else if (fo) { card.hidden = true; }
    else { var n = s.look.filter(function (l, i) { return st.found[i]; }).length; card.hidden = false; card.innerHTML = '<p class="small">' + esc(s.tag) + ' · 관찰 포인트 ' + n + ' / ' + s.look.length + '개 찾음</p>'; }
    loop();
  }
  function onSlide(e) { var id = e.target.id, v = +e.target.value; if (id === 'ar-t') { st.t = v / 100; var cap = e.target.parentNode.nextElementSibling, s = st.site, stage = s.fx === 'air' ? Math.min(3, Math.floor(st.t * 4)) : (st.t > 0.72 ? 3 : st.t > 0.45 ? 2 : st.t > 0.18 ? 1 : 0); if (cap) cap.textContent = s.fxCap[stage]; } else if (id === 'ar-dip') { st.dipA = v; updDip(); } else if (id === 'ar-sim') { st.sim = v; e.target.nextElementSibling.textContent = v + '°'; updGeo(); } }
  function loop() { if (!st) return; cancelAnimationFrame(st.raf); var w = st.stage.clientWidth, h = st.stage.clientHeight; if (!st.tool.time) { st.fxc.clearRect(0, 0, w, h); return; } var step = function (now) { if (!st || !st.tool.time) return; GEO.scene.fx(st.fxc, w, h, st.site.fx, st.t, (now - st.t0) / 1000); st.raf = requestAnimationFrame(step); }; st.raf = requestAnimationFrame(step); }

  /* ---------- 누르기 ---------- */
  function onClick(e) {
    var t = e.target.closest('[data-ar]'); if (!t || !st) return; var k = t.dataset.ar;
    if (k === 'close') AR.close();
    else if (k === 'mode') { if (t.dataset.m === 'live' && !canCam()) { st.msg = '카메라는 https 주소에 올린 앱을 휴대폰으로 열었을 때 쓸 수 있어요. 지금은 연습 장면이나 사진으로 해 보세요.'; draw(); setTimeout(function () { if (st) { st.msg = ''; draw(); } }, 3500); return; } setMode(t.dataset.m); }
    else if (k === 'tpl-next') { st.tool.tpl = TPL[TPL.indexOf(st.tool.tpl) % 3 + 1]; draw(); }
    else if (k === 'hot') { var i = +t.dataset.i; st.sel = st.sel === i ? -1 : i; if (st.sel >= 0) st.focus = null; if (st.mode === 'practice' && st.sel === i && t.classList.contains('ar-hot')) { st.found[i] = true; A.save(); } draw(); }
    else if (k === 'found') { st.found[st.sel] = !st.found[st.sel]; A.save(); draw(); }
    else if (k === 'concept') { var c = t.dataset.c; AR.close(true); location.hash = '#concept-' + c; }
    else if (k === 'tool') toggleTool(t.dataset.k);
    else if (k === 'tpl-s') { st.tp.s = Math.max(0.3, Math.min(4, st.tp.s * (t.dataset.d > 0 ? 1.15 : 0.87))); applyTpl(); }
    else if (k === 'tpl-r') { st.tp.r += 15 * RAD; applyTpl(); }
    else if (k === 'speak') speak();
    else if (k === 'clear') { st.pins = []; st.sel = -1; draw(); }
    else if (k === 'shot') shot();
  }
  function onTap(e) { if (!st || st.mode === 'practice' || st.sel < 0) return; if (e.target !== st.layer) return; var r = st.layer.getBoundingClientRect(); st.pins = st.pins.filter(function (p) { return p.i !== st.sel; }); st.pins.push({ i: st.sel, k: st.site.look[st.sel].k, x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }); st.found[st.sel] = true; A.save(); draw(); }
  function toggleTool(k) {
    var on;
    if (k === 'tpl') { st.tool.tpl = st.tool.tpl ? null : (st.lastTpl || 'sauro'); on = !!st.tool.tpl; if (on && !st.tp.x) { st.tp = { x: st.stage.clientWidth / 2 - 100, y: st.stage.clientHeight * 0.36 - 130, s: 1, r: 0 }; } }
    else { on = st.tool[k] = !st.tool[k]; if (on && (k === 'dip' || k === 'geo')) sensors(k); if (k === 'geo' && on && !geo.pos && geo.ok && S.prefs.loc) geo.start(); }
    if (on) { st.focus = k; st.sel = -1; } else if (st.focus === k) st.focus = ['time', 'tpl', 'dip', 'geo'].filter(function (x) { return x === 'tpl' ? st.tool.tpl : st.tool[x]; })[0] || null;
    draw();
  }
  function speak() { var s = st.site, txt = st.sel >= 0 ? s.look[st.sel].k + '. ' + s.look[st.sel].d + ' 미션. ' + s.look[st.sel].m : s.quick; try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(txt); u.lang = 'ko-KR'; if (GEO.guide.voice) u.voice = GEO.guide.voice; u.rate = S.prefs.rate || 1; speechSynthesis.speak(u); } catch (e) { A.toast('이 기기는 음성 읽기를 지원하지 않아요.'); } }

  /* ---------- 센서: 기울기(경사 가이드)와 방향(방향 라벨) ---------- */
  function sensors(k) {
    var go = function () { if (!st) return; window.addEventListener('devicemotion', onMotion, true); window.addEventListener('deviceorientation', onOri, true); window.addEventListener('deviceorientationabsolute', onOri, true); };
    try { var ps = []; if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') ps.push(DeviceMotionEvent.requestPermission()); if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') ps.push(DeviceOrientationEvent.requestPermission()); if (ps.length) Promise.all(ps).then(go, go); else go(); } catch (e) { go(); }
  }
  function onMotion(e) { if (!st) return; var a = e.accelerationIncludingGravity; if (!a || a.x == null || a.y == null) return; var sgn = GEO.env.ios ? -1 : 1, phi = Math.atan2(-a.x * sgn, a.y * sgn) / RAD, ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0, r1 = wrap(phi + ang), r2 = wrap(phi - ang), r = Math.abs(r1) < Math.abs(r2) ? r1 : r2; if (Math.abs(a.z || 0) > 9) return; st.roll += wrap(r - st.roll) * 0.2; st.hasRoll = true; if (st.tool.dip) updDip(); }
  var absSeen = false, lastGeo = 0;
  function onOri(e) {
    if (!st || e.beta == null) return; var head = null, pitch = 0;
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) { head = e.webkitCompassHeading; pitch = e.beta - 90; }
    else { if (e.type === 'deviceorientationabsolute') absSeen = true; else if (absSeen || e.absolute !== true) return; if (e.alpha == null) return;
      var al = e.alpha * RAD, be = e.beta * RAD, ga = e.gamma * RAD, cA = Math.cos(al), sA = Math.sin(al), sB = Math.sin(be), cG = Math.cos(ga), sG = Math.sin(ga);
      var rA = -cA * sG - sA * sB * cG, rB = -sA * sG + cA * sB * cG; head = (Math.atan2(rA, rB) / RAD + 360) % 360; pitch = Math.asin(Math.max(-1, Math.min(1, -Math.cos(be) * cG))) / RAD; }
    head = (head + DECL + 360) % 360; st.heading = st.heading == null ? head : (st.heading + wrap(head - st.heading) * 0.25 + 360) % 360; st.pitch += (pitch - st.pitch) * 0.25;
    var now = Date.now(); if (st.tool.geo && now - lastGeo > 70) { lastGeo = now; updGeo(); }
  }
  function dipVal() { var x = Math.abs(st.dipA + st.roll) % 180; if (x > 90) x = 180 - x; return Math.round(x); }
  function updDip() { var d = $('.ar-dip', st.layer); if (!d) return; $('.hz', d).style.transform = 'rotate(' + (-st.roll) + 'deg)'; $('.ln', d).style.transform = 'rotate(' + st.dipA + 'deg)'; $('.val', d).textContent = dipVal() + '°'; }
  function geoLabels() {
    var w = st.stage.clientWidth, h = st.stage.clientHeight, me = geo.pos || st.site, head = st.heading != null ? st.heading : st.sim, hf = w > h ? 68 : 50, vf = w > h ? 42 : 66, out = '';
    st.site.dirs.forEach(function (d) { var br = A.bearing(me.lat, me.lon, d.lat, d.lon), di = A.dist(me.lat, me.lon, d.lat, d.lon), dx = wrap(br - head);
      if (Math.abs(dx) <= hf / 2) { var x = w / 2 + dx / (hf / 2) * (w / 2), y = Math.max(120, Math.min(h * 0.55, h * 0.4 + st.pitch / (vf / 2) * (h / 2))); out += '<div class="ar-geo" style="left:' + x + 'px;top:' + y + 'px">' + esc(d.name) + '<small>' + Math.round(br) + '° · ' + A.fmtDist(di) + '</small><i></i></div>'; }
      else out += '<div class="ar-geo" style="' + (dx < 0 ? 'left:64px' : 'left:' + (w - 64) + 'px') + ';top:' + (150 + st.site.dirs.indexOf(d) * 40) + 'px;font-size:.72rem">' + (dx < 0 ? '◀ ' : '') + esc(d.name) + (dx > 0 ? ' ▶' : '') + '</div>'; });
    out += '<div class="ar-geo" style="left:50%;top:104px"><small>' + T8(head) + ' ' + Math.round(head) + '°' + (geo.pos ? '' : ' · 명소 위치 기준') + '</small></div>';
    return '<div id="ar-geo">' + out + '</div>';
  }
  function T8(az) { return ['북', '북동', '동', '남동', '남', '남서', '서', '북서'][Math.round(az / 45) % 8]; }
  function updGeo() { var g = $('#ar-geo', st.layer); if (g) g.outerHTML = geoLabels(); }

  /* ---------- 발자국 틀 ---------- */
  function mountTpl() {
    var c = document.createElement('canvas'); c.className = 'ar-tpl'; c.width = 400; c.height = 520; c.style.width = '200px'; c.style.height = '260px'; c.style.left = '0'; c.style.top = '0';
    var x = c.getContext('2d'); x.scale(2, 2); x.shadowColor = 'rgba(0,0,0,.9)'; x.shadowBlur = 5;
    var k = st.tool.tpl; st.lastTpl = k; GEO.foot(x, k, 100, k === 'sauro' ? 165 : 140, k === 'sauro' ? 62 : k === 'ornitho' ? 78 : 92, 0, 'rgba(255,211,107,.55)');
    x.shadowBlur = 0; x.setLineDash([6, 5]); x.strokeStyle = '#ffd36b'; x.lineWidth = 2; x.strokeRect(6, 6, 188, 248);
    st.layer.appendChild(c); st.tplEl = c; applyTpl();
    var P = {}, base = null, snap = function () { var ids = Object.keys(P); base = { tp: { x: st.tp.x, y: st.tp.y, s: st.tp.s, r: st.tp.r }, p: JSON.parse(JSON.stringify(P)) }; if (ids.length >= 2) { var a = P[ids[0]], b = P[ids[1]]; base.d = Math.hypot(b.x - a.x, b.y - a.y); base.a = Math.atan2(b.y - a.y, b.x - a.x); } };
    c.addEventListener('pointerdown', function (e) { e.stopPropagation(); try { c.setPointerCapture(e.pointerId); } catch (er) { } P[e.pointerId] = { x: e.clientX, y: e.clientY }; snap(); });
    c.addEventListener('pointermove', function (e) { if (!P[e.pointerId] || !base) return; P[e.pointerId] = { x: e.clientX, y: e.clientY }; var ids = Object.keys(P);
      if (ids.length === 1 && base.p[ids[0]]) { st.tp.x = base.tp.x + P[ids[0]].x - base.p[ids[0]].x; st.tp.y = base.tp.y + P[ids[0]].y - base.p[ids[0]].y; }
      else if (ids.length >= 2 && base.d) { var a = P[ids[0]], b = P[ids[1]]; st.tp.s = Math.max(0.3, Math.min(4, base.tp.s * Math.hypot(b.x - a.x, b.y - a.y) / base.d)); st.tp.r = base.tp.r + Math.atan2(b.y - a.y, b.x - a.x) - base.a; }
      applyTpl(); });
    var up = function (e) { delete P[e.pointerId]; snap(); e.stopPropagation(); }; c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    c.addEventListener('wheel', function (e) { e.preventDefault(); st.tp.s = Math.max(0.3, Math.min(4, st.tp.s * (e.deltaY < 0 ? 1.08 : 0.93))); applyTpl(); }, { passive: false });
  }
  function applyTpl() { if (st && st.tplEl) st.tplEl.style.transform = 'translate(' + st.tp.x + 'px,' + st.tp.y + 'px) rotate(' + st.tp.r + 'rad) scale(' + st.tp.s + ')'; }

  /* ---------- 촬영: 겹친 화면을 한 장으로 ---------- */
  function cover(x, src, sw, sh, W, H) { if (!sw || !sh) return; var sc = Math.max(W / sw, H / sh), dw = sw * sc, dh = sh * sc; x.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh); }
  function shot() {
    var W = st.stage.clientWidth, H = st.stage.clientHeight, sc = Math.min(2, 1280 / Math.max(W, H)), c = document.createElement('canvas'); c.width = Math.round(W * sc); c.height = Math.round(H * sc); var x = c.getContext('2d'); x.scale(sc, sc); x.fillStyle = '#0b100e'; x.fillRect(0, 0, W, H);
    try { if (st.mode === 'live') cover(x, st.video, st.video.videoWidth, st.video.videoHeight, W, H); else if (st.mode === 'photo') cover(x, st.photo, st.photo.naturalWidth, st.photo.naturalHeight, W, H); else x.drawImage(st.scene, 0, 0, W, H); } catch (e) { }
    if (st.tool.time) x.drawImage(st.fx, 0, 0, W, H);
    var labels = [], tag = function (txt, px, py) { x.font = '700 13px sans-serif'; var tw = x.measureText(txt).width + 16; x.fillStyle = '#ffd36b'; x.beginPath(); if (x.roundRect) x.roundRect(px - tw / 2, py - 30, tw, 24, 7); else x.rect(px - tw / 2, py - 30, tw, 24); x.fill(); x.beginPath(); x.moveTo(px - 6, py - 7); x.lineTo(px, py); x.lineTo(px + 6, py - 7); x.fill(); x.fillStyle = '#201400'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, px, py - 18); labels.push(txt); };
    if (st.mode === 'practice') st.site.look.forEach(function (l, i) { if (st.found[i]) tag(l.k, l.p[0] * W, l.p[1] * H - 6); });
    st.pins.forEach(function (p) { tag(p.k, p.x * W, p.y * H); });
    if (st.tool.tpl && st.tplEl) { x.save(); x.translate(st.tp.x + 100, st.tp.y + 130); x.rotate(st.tp.r); x.scale(st.tp.s, st.tp.s); x.drawImage(st.tplEl, -100, -130, 200, 260); x.restore(); labels.push(TPLNAME[st.tool.tpl]); }
    if (st.tool.dip) { x.save(); x.translate(W / 2, H / 2); x.strokeStyle = '#fff'; x.setLineDash([6, 5]); x.lineWidth = 1.5; x.save(); x.rotate(-st.roll * RAD); x.beginPath(); x.moveTo(-W * 0.42, 0); x.lineTo(W * 0.42, 0); x.stroke(); x.restore(); x.setLineDash([]); x.strokeStyle = '#ffd36b'; x.lineWidth = 3; x.rotate(st.dipA * RAD); x.beginPath(); x.moveTo(-W * 0.42, 0); x.lineTo(W * 0.42, 0); x.stroke(); x.restore(); x.fillStyle = '#fff'; x.font = '700 20px monospace'; x.textAlign = 'center'; x.fillText('겉보기 경사 ' + dipVal() + '°', W / 2, H / 2 + 34); labels.push('겉보기 경사 ' + dipVal() + '°'); }
    x.fillStyle = 'rgba(8,14,12,.78)'; x.fillRect(0, H - 34, W, 34); x.fillStyle = '#e9f0ea'; x.font = '600 13px sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(st.site.name + ' · ' + new Date().toLocaleDateString('ko-KR') + (st.mode === 'practice' ? ' · 연습 장면' : ''), 12, H - 17); x.textAlign = 'right'; x.fillText('의성 지오트립', W - 12, H - 17);
    var url; try { url = c.toDataURL('image/jpeg', 0.8); } catch (e) { A.toast('이 화면은 저장할 수 없어요.'); return; }
    var ok = GEO.tools.addNote({ site: st.site.id, photo: url, text: 'AR 렌즈 기록' + (labels.length ? ': ' + labels.join(', ') : '') + (st.tool.time ? ' · 시간 여행(' + st.site.fxCap[st.t > 0.72 ? 3 : st.t > 0.45 ? 2 : st.t > 0.18 ? 1 : 0] + ')' : '') });
    if (ok) { st.el.animate ? st.el.animate([{ filter: 'brightness(2.2)' }, { filter: 'none' }], { duration: 260 }) : 0; A.toast('찍었어요! 조사 노트에 저장했습니다.'); }
  }
})();
