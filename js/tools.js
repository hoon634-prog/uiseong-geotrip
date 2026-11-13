/* 의성 지오트립 — 탐구 도구: 클리노미터(주향·경사), 공룡 속도 계산기, 조사 노트 */
(function () {
  'use strict';
  var GEO = window.GEO, A = GEO.app, $ = A.$, $$ = A.$$, esc = A.esc, ic = A.ic, S = A.state, geo = GEO.geo, V = GEO.V, ui = V.ui;
  var T = GEO.tools = {}, RAD = Math.PI / 180, DECL = -8;

  /* ---------- 방위 표기 ---------- */
  T.norm = function (a) { return ((a % 360) + 360) % 360; };
  T.notation = function (dipDir, dip) {
    var d = Math.round(T.norm(dipDir)) % 360, s = (d + 270) % 180, dipR = Math.round(dip);
    var strike = s === 0 ? 'NS' : s === 90 ? 'EW' : (s < 90 ? 'N' + s + '°E' : 'N' + (180 - s) + '°W');
    var quad = d % 90 === 0 ? ['N', 'E', 'S', 'W'][d / 90] : ['NE', 'SE', 'SW', 'NW'][Math.floor(d / 90)];
    if (dipR < 1) return { strike: '—', dip: '수평', full: '평평한 지층 (기울기 0°)', s: s, d: d };
    return { strike: strike, dip: dipR + '°' + quad, full: strike + ', ' + dipR + '°' + quad, s: s, d: d };
  };
  T.compassName = function (az) { return ['북', '북동', '동', '남동', '남', '남서', '서', '북서'][Math.round(T.norm(az) / 45) % 8]; };

  /* ---------- 클리노미터 ---------- */
  var C = { mode: 'sensor', on: false, hold: false, dip: null, dir: null, head: false, got: false, abs: false, man: { dip: 40, dir: 155 }, n: null, hs: 0, hc: 1, last: 0 };
  function clinoSvg() {
    var o = '<svg viewBox="-110 -110 220 220" id="clino-svg" role="img" aria-label="주향과 경사 기호"><circle r="100" fill="var(--card)" stroke="var(--line)" stroke-width="2"/>';
    for (var a = 0; a < 360; a += 15) { var r1 = a % 90 === 0 ? 84 : 92; o += '<line x1="' + (Math.sin(a * RAD) * r1) + '" y1="' + (-Math.cos(a * RAD) * r1) + '" x2="' + (Math.sin(a * RAD) * 99) + '" y2="' + (-Math.cos(a * RAD) * 99) + '" stroke="var(--ink-3)" stroke-width="' + (a % 90 === 0 ? 2 : 1) + '"/>'; }
    [['N', 0, -70], ['E', 72, 4], ['S', 0, 78], ['W', -72, 4]].forEach(function (t) { o += '<text x="' + t[1] + '" y="' + t[2] + '" text-anchor="middle" font-family="var(--f-mono)" font-size="14" font-weight="600" fill="' + (t[0] === 'N' ? 'var(--hot)' : 'var(--ink-2)') + '">' + t[0] + '</text>'; });
    o += '<g id="clino-sym"><line x1="0" y1="-58" x2="0" y2="58" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/><line x1="0" y1="0" x2="30" y2="0" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/></g><text id="clino-num" x="0" y="0" text-anchor="middle" dominant-baseline="central" font-family="var(--f-mono)" font-size="20" font-weight="600" fill="var(--ink)"></text></svg>';
    return o;
  }
  function clinoShow() {
    var svg = $('#clino-svg'); if (!svg) { clinoStop(); return; }
    var dip = C.mode === 'manual' ? C.man.dip : C.dip, dir = C.mode === 'manual' ? C.man.dir : C.dir, has = C.mode === 'manual' ? true : C.head;
    var set = function (id, v) { var e = $('#' + id); if (e) e.textContent = v; };
    if (dip == null) { set('cl-dip', '—'); set('cl-dir', '—'); set('cl-str', '—'); set('cl-full', '측정 전'); return; }
    var sym = $('#clino-sym'), num = $('#clino-num');
    if (has && dir != null) { var n = T.notation(dir, dip); sym.setAttribute('transform', 'rotate(' + (n.d - 90) + ')'); sym.style.opacity = 1; var rr = 52; num.setAttribute('x', Math.sin(n.d * RAD) * rr); num.setAttribute('y', -Math.cos(n.d * RAD) * rr); num.textContent = Math.round(dip);
      set('cl-dip', Math.round(dip) + '°'); set('cl-dir', n.d + '° (' + T.compassName(n.d) + ')'); set('cl-str', n.strike); set('cl-full', n.full); }
    else { sym.style.opacity = 0.25; num.setAttribute('x', 0); num.setAttribute('y', 0); num.textContent = Math.round(dip) + '°'; set('cl-dip', Math.round(dip) + '°'); set('cl-dir', '방향 센서 없음'); set('cl-str', '—'); set('cl-full', '기울기 ' + Math.round(dip) + '° (방향 미확인)'); }
  }
  function onOri(e) {
    if (C.mode !== 'sensor' || !C.on) return; if (e.beta == null || e.gamma == null) return;
    if (e.type === 'deviceorientationabsolute') C.abs = true; else if (C.abs && typeof e.webkitCompassHeading !== 'number') return;
    C.got = true; if (C.hold) return;
    var b = e.beta * RAD, g = e.gamma * RAD, nx = Math.sin(g), ny = -Math.sin(b) * Math.cos(g), nz = Math.cos(b) * Math.cos(g);
    if (!C.n) C.n = [nx, ny, nz]; else { C.n[0] += (nx - C.n[0]) * 0.2; C.n[1] += (ny - C.n[1]) * 0.2; C.n[2] += (nz - C.n[2]) * 0.2; }
    var len = Math.sqrt(C.n[0] * C.n[0] + C.n[1] * C.n[1] + C.n[2] * C.n[2]) || 1, dip = Math.acos(Math.max(-1, Math.min(1, C.n[2] / len))) / RAD; if (dip > 90) dip = 180 - dip;
    var phi = Math.atan2(C.n[0], C.n[1]) / RAD, head = null;
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) head = e.webkitCompassHeading; else if ((e.absolute === true || e.type === 'deviceorientationabsolute') && e.alpha != null) head = 360 - e.alpha;
    C.dip = dip;
    if (head != null) { C.hs += (Math.sin(head * RAD) - C.hs) * 0.2; C.hc += (Math.cos(head * RAD) - C.hc) * 0.2; var h = Math.atan2(C.hs, C.hc) / RAD; C.head = true; C.dir = T.norm(h + phi + (S.prefs.decl ? DECL : 0)); } else { C.head = false; C.dir = null; }
    var now = Date.now(); if (now - C.last > 120) { C.last = now; clinoShow(); }
  }
  function clinoStart() {
    var go = function () { C.on = true; C.got = false; C.n = null; window.addEventListener('deviceorientationabsolute', onOri, true); window.addEventListener('deviceorientation', onOri, true); setTimeout(function () { if (C.on && !C.got && $('#clino-svg')) { A.toast('기울기 센서를 찾을 수 없어요. ‘직접 입력’으로 연습해 보세요.', 4000); C.mode = 'manual'; clinoStop(); V.render(true); } }, 1800); V.render(true); };
    try { if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') { DeviceOrientationEvent.requestPermission().then(function (r) { if (r === 'granted') go(); else A.toast('동작 및 방향 권한이 필요합니다.'); }).catch(function () { A.toast('센서 권한을 받을 수 없어요.'); }); } else if (window.DeviceOrientationEvent) go(); else { A.toast('이 기기에는 기울기 센서가 없어요.'); C.mode = 'manual'; V.render(true); } } catch (e) { C.mode = 'manual'; V.render(true); }
  }
  function clinoStop() { C.on = false; window.removeEventListener('deviceorientationabsolute', onOri, true); window.removeEventListener('deviceorientation', onOri, true); }
  V.views.clino = function () {
    var seg = '<div class="seg" role="group"><button data-act="clino-mode" data-m="sensor" aria-pressed="' + (C.mode === 'sensor') + '">센서로 재기</button><button data-act="clino-mode" data-m="manual" aria-pressed="' + (C.mode === 'manual') + '">직접 입력(연습)</button></div>';
    return { title: '클리노미터', back: true, html:
      '<div class="card"><b>재는 방법</b><ol class="small" style="margin:0;padding-left:1.2em"><li>스마트폰 <b>뒷면</b>을 지층면에 평평하게 댑니다(화면이 하늘 쪽). 지층을 만질 수 없으면 나란하게 들어 맞춥니다.</li><li>숫자가 안정되면 ‘고정’을 누르고 값을 읽습니다.</li><li>자석이 든 케이스·철제 구조물 근처에서는 방향이 틀릴 수 있어요.</li></ol></div>' + seg +
      (C.mode === 'sensor' && !C.on ? '<button class="btn primary block" data-act="clino-start">' + ic('compass') + '센서 켜기</button>' : '') +
      '<div class="gauge">' + clinoSvg() + '</div>' +
      '<div class="read"><div><span>기운 각도</span><b id="cl-dip">—</b></div><div><span>기울어 내려가는 방향 (' + (S.prefs.decl ? '진짜 북쪽' : '나침반 북쪽') + ' 기준)</span><b id="cl-dir" style="font-size:1rem">—</b></div><div><span>지층이 뻗은 방향 (주향)</span><b id="cl-str">—</b></div><div><span>지질학자의 표기 (심화)</span><b id="cl-full" style="font-size:1rem">—</b></div></div>' +
      '<p class="small muted">먼저 ‘어느 쪽으로 몇 도 기울었나’만 읽으면 충분합니다. 아래 두 칸은 지질 조사에서 쓰는 표기예요.</p>' +
      (C.mode === 'manual' ? '<div class="card"><label class="field">기운 각도 <span class="mono" id="mv-dip">' + C.man.dip + '°</span><input type="range" min="0" max="90" value="' + C.man.dip + '" id="man-dip" data-input="clino-man"></label><label class="field">기울어 내려가는 방향 (북쪽 0°, 동쪽 90°, 남쪽 180°, 서쪽 270°) <span class="mono" id="mv-dir">' + C.man.dir + '°</span><input type="range" min="0" max="359" value="' + C.man.dir + '" id="man-dir" data-input="clino-man"></label><p class="small muted">제오리 화석지의 지층은 남동쪽(약 155°)으로 40° 기울어 있습니다. 슬라이더로 같은 값을 만들어 보세요. 지질학자의 표기로는 N65°E, 40°SE입니다.</p></div>' : '<div class="acts"><button class="btn" data-act="clino-hold"' + (C.on ? '' : ' disabled') + '>' + (C.hold ? '고정 풀기' : '고정') + '</button><button class="btn primary" data-act="clino-save">' + ic('note') + '노트에 저장</button></div>') +
      (C.mode === 'manual' ? '<button class="btn primary block" data-act="clino-save">' + ic('note') + '노트에 저장</button>' : '') +
      '<details class="card"><summary>한 걸음 더: 주향과 경사</summary><p class="small muted">2022 개정 교육과정에는 나오지 않는 심화 내용입니다. 지질 조사가 궁금한 사람만 읽어 보세요.</p><p class="small"><b>주향</b>은 지층면이 수평면과 만나는 선의 방향이고, <b>경사</b>는 지층면이 수평면에서 기운 각도와 방향입니다. 기울어 내려가는 방향은 언제나 주향과 직각이에요. 위 그림의 긴 선이 주향, 짧은 선이 기울어 내려가는 방향이며, 지질도에서도 같은 기호(⊥)를 씁니다. ‘N65°E, 40°SE’는 주향이 북에서 동으로 65° 방향이고, 남동쪽으로 40° 기울었다는 뜻이에요.</p><p class="small">나침반이 가리키는 북쪽은 진짜 북쪽보다 서쪽으로 약 8° 치우쳐 있습니다. 설정에서 보정을 켜면 진짜 북쪽 기준 값으로 바꿔 보여 줍니다.</p></details>',
      init: function () { clinoShow(); } };
  };
  V.acts['clino-mode'] = function (t) { C.mode = t.dataset.m; if (C.mode === 'manual') clinoStop(); V.render(true); };
  V.acts['clino-start'] = clinoStart;
  V.acts['clino-hold'] = function () { C.hold = !C.hold; V.render(true); };
  V.acts['clino-save'] = function () { var dip = C.mode === 'manual' ? C.man.dip : C.dip, dir = C.mode === 'manual' ? C.man.dir : C.dir; if (dip == null) { A.toast('먼저 측정해 주세요.'); return; } var txt = dir != null ? '지층의 기울기: ' + T.compassName(dir) + '쪽(' + Math.round(T.norm(dir)) + '°)으로 ' + Math.round(dip) + '° 기울어짐 · 지질학자의 표기 ' + T.notation(dir, dip).full + ' (' + (S.prefs.decl ? '진짜 북쪽' : '나침반 북쪽') + ' 기준)' : '지층의 기울기: ' + Math.round(dip) + '° (방향 미확인)'; T.editNote({ text: txt + (C.mode === 'manual' ? ' — 직접 입력값' : '') + '\n어디를 쟀나요? ' }); };
  V.inputs['clino-man'] = function () { C.man.dip = +$('#man-dip').value; C.man.dir = +$('#man-dir').value; $('#mv-dip').textContent = C.man.dip + '°'; $('#mv-dir').textContent = C.man.dir + '°'; clinoShow(); };

  /* ---------- 공룡 속도 계산기 ---------- */
  var SP = { fl: 26.04, sl: 100.61, k: 4 };
  var PRE = [['제오리 육식 공룡 (Ttw1)', 26.04, 100.61, 4], ['만천리 아기 공룡 ① (2008년 측정)', 9.86, 52.75, 4], ['만천리 아기 공룡 ② (2008년 측정)', 9.1, 58.6, 4]];
  T.speed = function (flCm, slCm, k) { var h = flCm * k / 100, sl = slCm / 100; if (!(h > 0) || !(sl > 0)) return null; var v = 0.25 * Math.sqrt(9.8) * Math.pow(sl, 1.67) * Math.pow(h, -1.17), rel = sl / h; return { h: h, body: flCm * 10 / 100, v: v, kmh: v * 3.6, rel: rel, gait: rel < 2 ? '걷기' : rel <= 2.9 ? '빠른 걸음(속보)' : '달리기' }; };
  function speedOut() {
    var r = T.speed(SP.fl, SP.sl, SP.k); if (!r) return '<p class="muted">발 길이와 보폭을 입력하세요.</p>';
    var bar = function (label, kmh, col) { return '<div class="row small"><span style="width:7.5em">' + label + '</span><div class="progress grow"><i style="width:' + Math.min(100, kmh / 40 * 100) + '%;background:' + col + '"></i></div><span class="mono" style="width:5.2em;text-align:right">' + kmh.toFixed(1) + ' km/h</span></div>'; };
    return '<div class="read"><div><span>골반 높이</span><b>' + r.h.toFixed(2) + ' m</b></div><div><span>몸길이(어림)</span><b>' + r.body.toFixed(1) + ' m</b></div><div><span>속도</span><b>' + r.kmh.toFixed(1) + ' km/h</b></div><div><span>걸음걸이</span><b style="font-size:1rem">' + r.gait + '</b></div></div>' +
      '<p class="small muted">상대 보폭(보폭 ÷ 골반 높이) = ' + r.rel.toFixed(2) + ' → 2.0 미만은 걷기, 2.0~2.9는 속보, 2.9 초과는 달리기로 봅니다.</p>' +
      bar('이 공룡', r.kmh, 'var(--hot)') + bar('사람 걷기', 4.5, 'var(--accent)') + bar('사람 100m 달리기', 37, 'var(--ink-3)');
  }
  V.views.speed = function () { return { title: '공룡 속도 계산기', back: true, html:
    '<div class="card"><p class="small">발자국의 <b>발 길이</b>와 <b>보폭</b>(같은 발이 다시 찍힐 때까지의 거리)만 알면 공룡의 크기와 걷는 속도를 어림할 수 있어요.</p><div class="chips">' + PRE.map(function (p, i) { return '<button class="chip" data-act="speed-pre" data-i="' + i + '" style="cursor:pointer">' + p[0] + '</button>'; }).join('') + '</div>' +
    '<div class="grid2"><label class="field">발 길이 (cm)<input type="number" inputmode="decimal" id="sp-fl" min="1" step="0.1" value="' + SP.fl + '" data-input="speed"></label><label class="field">보폭 (cm)<input type="number" inputmode="decimal" id="sp-sl" min="1" step="0.1" value="' + SP.sl + '" data-input="speed"></label></div>' +
    '<label class="field">골반 높이 어림식<select id="sp-k" data-change="speed"><option value="4"' + (SP.k == 4 ? ' selected' : '') + '>발 길이 × 4 (답사 책자의 어림식)</option><option value="4.6"' + (SP.k == 4.6 ? ' selected' : '') + '>발 길이 × 4.6 (일반식)</option><option value="5.9"' + (SP.k == 5.9 ? ' selected' : '') + '>발 길이 × 5.9 (작은 조각류)</option></select></label></div>' +
    '<div class="card" id="sp-out">' + speedOut() + '</div><button class="btn primary block" data-act="speed-save">' + ic('note') + '계산 결과를 노트에 저장</button>' +
    '<details class="card"><summary>어떻게 계산하나요?</summary><p class="small">동물학자 알렉산더(1976)는 여러 동물의 걸음을 조사해 보폭과 다리 길이로 속도를 구하는 식을 만들었습니다.</p><p class="mono small">v = 0.25 × g<sup>0.5</sup> × (보폭)<sup>1.67</sup> × (골반 높이)<sup>−1.17</sup></p><p class="small">g는 중력 가속도(9.8 m/s²), 길이의 단위는 m입니다. 골반 높이는 발 길이에서 어림하는데, 연구자와 공룡 종류에 따라 4~5.9배까지 다른 값을 써요. 그래서 같은 발자국도 식에 따라 속도가 달라집니다. 실제로 만천리의 아기 공룡은 2008년 측정값으로는 시속 2~5km, 2021년 정밀 조사에서는 시속 2.8km와 1.8km로 계산되었어요. 어느 값이 더 알맞을지 따져 보는 것도 탐구입니다.</p></details>' }; };
  function speedRead() { SP.fl = parseFloat($('#sp-fl').value); SP.sl = parseFloat($('#sp-sl').value); SP.k = parseFloat($('#sp-k').value); $('#sp-out').innerHTML = speedOut(); }
  V.inputs.speed = speedRead; V.changes.speed = speedRead;
  V.acts['speed-pre'] = function (t) { var p = PRE[+t.dataset.i]; SP.fl = p[1]; SP.sl = p[2]; SP.k = p[3]; V.render(true); };
  V.acts['speed-save'] = function () { var r = T.speed(SP.fl, SP.sl, SP.k); if (!r) { A.toast('값을 먼저 입력하세요.'); return; } T.editNote({ text: '공룡 속도 계산: 발 길이 ' + SP.fl + 'cm, 보폭 ' + SP.sl + 'cm → 골반 높이 ' + r.h.toFixed(2) + 'm, 속도 ' + r.kmh.toFixed(1) + 'km/h (' + r.gait + ', 골반 높이 = 발 길이 × ' + SP.k + ')\n어느 보행렬인가요? ' }); };

  /* ---------- 조사 노트 ---------- */
  T.shrink = function (file, cb) { var fr = new FileReader(); fr.onload = function () { var im = new Image(); im.onload = function () { var m = 1000, sc = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', 0.72)); }; im.onerror = function () { cb(null); }; im.src = fr.result; }; fr.onerror = function () { cb(null); }; fr.readAsDataURL(file); };
  T.addNote = function (n) { n.id = 'n' + Date.now(); n.t = Date.now(); if (geo.pos) { n.lat = +geo.pos.lat.toFixed(5); n.lon = +geo.pos.lon.toFixed(5); } S.notes.unshift(n); if (!A.save()) { var had = n.photo; n.photo = null; if (!A.save()) { S.notes.shift(); A.toast('저장 공간이 부족해요. 오래된 노트를 내보낸 뒤 지워 주세요.', 4500); return false; } if (had) A.toast('저장 공간이 부족해 사진 없이 글만 저장했어요.', 4500); } return true; };
  var draft = null;
  T.editNote = function (preset) {
    preset = preset || {}; var near = geo.nearest(), guess = preset.site || (near && geo.inside(near.s) ? near.s.id : (location.hash.match(/^#(?:site|ar|quiz)-([a-z]+)/) || [])[1] || '');
    draft = { site: guess, text: preset.text || '', photo: preset.photo || null };
    A.sheet('<h2 class="h2">조사 노트 쓰기</h2><label class="field">어느 명소인가요?<select id="nt-site"><option value="">선택 안 함</option>' + GEO.sites.map(function (s) { return '<option value="' + s.id + '"' + (s.id === guess ? ' selected' : '') + '>' + s.no + '. ' + esc(s.name) + '</option>'; }).join('') + '</select></label><label class="field">관찰한 것과 내 생각<textarea id="nt-text" rows="6" placeholder="관찰한 사실: …&#10;내 해석: …">' + esc(draft.text) + '</textarea></label><div id="nt-ph">' + (draft.photo ? '<img src="' + draft.photo + '" alt="첨부 사진" style="border-radius:12px;max-height:220px">' : '') + '</div><label class="btn" style="cursor:pointer">' + ic('cam') + '사진 넣기<input type="file" accept="image/*" capture="environment" id="nt-file" data-change="note-photo" hidden></label><p class="small muted">사진에는 자나 동전을 함께 넣어 크기를 알 수 있게 하세요.' + (geo.pos ? ' 현재 위치 좌표가 함께 기록됩니다.' : '') + '</p><button class="btn primary block" data-act="note-save">저장</button><button class="btn block" data-act="close-sheet">취소</button>');
  };
  V.changes['note-photo'] = function (t) { var f = t.files && t.files[0]; if (!f) return; T.shrink(f, function (url) { if (!url) { A.toast('사진을 읽지 못했어요.'); return; } if (draft) draft.photo = url; var b = $('#nt-ph'); if (b) b.innerHTML = '<img src="' + url + '" alt="첨부 사진" style="border-radius:12px;max-height:220px">'; }); };
  V.acts['note-new'] = function (t) { var s = t && t.dataset.id ? A.site(t.dataset.id) : null; T.editNote(s ? { site: s.id, text: s.inquiry.map(function (q, i) { return '[탐구 ' + (i + 1) + '] ' + q + '\n→ '; }).join('\n\n') } : {}); };
  V.acts['note-save'] = function () { if (!draft) return; var text = $('#nt-text').value.trim(), site = $('#nt-site').value; if (!text && !draft.photo) { A.toast('글이나 사진을 넣어 주세요.'); return; } if (T.addNote({ site: site, text: text, photo: draft.photo })) { A.closeSheet(); A.toast('조사 노트에 저장했어요.'); if (/^#notes/.test(location.hash) || /^#pass/.test(location.hash)) V.render(true); } draft = null; };
  V.acts['note-del'] = function (t) { var id = t.dataset.id; A.sheet('<h2 class="h2">이 노트를 지울까요?</h2><p>지우면 되돌릴 수 없습니다.</p><button class="btn hot block" data-act="note-del-yes" data-id="' + id + '">지우기</button><button class="btn block" data-act="close-sheet">취소</button>'); };
  V.acts['note-del-yes'] = function (t) { S.notes = A.state.notes = S.notes.filter(function (n) { return n.id !== t.dataset.id; }); A.save(); A.closeSheet(); V.render(true); };
  function when(t) { var d = new Date(t); return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) + ' ' + d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }); }
  T.exportText = function () { var p = S.profile, out = '의성 지질답사 조사 노트\n' + (p.name ? p.name + ' (' + p.cls + ')\n' : '') + '기록 ' + S.notes.length + '개 · 스탬프 ' + A.stampCount() + '/12\n'; S.notes.slice().reverse().forEach(function (n, i) { var s = n.site ? A.site(n.site) : null; out += '\n[' + (i + 1) + '] ' + when(n.t) + (s ? ' · ' + s.name : '') + (n.lat ? ' · ' + n.lat + ', ' + n.lon : '') + '\n' + (n.text || '(사진만 있음)') + (n.photo ? '\n(사진 첨부)' : '') + '\n'; }); return out; };
  V.acts['note-copy'] = function () { var txt = T.exportText(); var fb = function () { A.sheet('<h2 class="h2">아래 글을 길게 눌러 복사하세요</h2><textarea rows="12" style="width:100%" readonly>' + esc(txt) + '</textarea><button class="btn block" data-act="close-sheet">닫기</button>'); }; try { navigator.clipboard.writeText(txt).then(function () { A.toast('조사 노트 글을 복사했어요. 과제 문서에 붙여 넣으세요.'); }, fb); } catch (e) { fb(); } };
  V.acts['note-file'] = function () {
    var p = S.profile, html = '<!doctype html><html lang="ko"><meta charset="utf-8"><title>의성 지질답사 조사 노트</title><style>body{font:16px/1.7 sans-serif;max-width:720px;margin:24px auto;padding:0 16px}img{max-width:100%;border-radius:8px}article{border-top:1px solid #ccc;padding:16px 0}small{color:#666}pre{white-space:pre-wrap;font:inherit}</style><h1>의성 지질답사 조사 노트</h1><p>' + esc(p.name) + ' ' + esc(p.cls) + ' · 스탬프 ' + A.stampCount() + '/12</p>' + S.notes.slice().reverse().map(function (n, i) { var s = n.site ? A.site(n.site) : null; return '<article><small>' + (i + 1) + '. ' + when(n.t) + (s ? ' · ' + esc(s.name) : '') + (n.lat ? ' · ' + n.lat + ', ' + n.lon : '') + '</small><pre>' + esc(n.text) + '</pre>' + (n.photo ? '<img src="' + n.photo + '" alt="">' : '') + '</article>'; }).join('') + '</html>';
    try { var url = URL.createObjectURL(new Blob([html], { type: 'text/html' })), a = document.createElement('a'); a.href = url; a.download = '의성답사노트.html'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000); A.toast('사진이 포함된 파일로 저장했어요.'); } catch (e) { A.toast('이 환경에서는 파일 저장이 막혀 있어요. ‘글 복사’를 써 주세요.'); }
  };
  V.views.notes = function () {
    return { title: '조사 노트', back: true, html:
      '<div class="acts"><button class="btn primary" data-act="note-new">' + ic('plus') + '새 노트</button><button class="btn" data-act="note-copy"' + (S.notes.length ? '' : ' disabled') + '>' + ic('copy') + '글 복사</button></div>' + (S.notes.length && !GEO.env.artifact ? '<button class="btn block" data-act="note-file">' + ic('note') + '사진 포함 파일로 저장 (.html)</button>' : '') +
      (S.notes.length ? '<div class="stack">' + S.notes.map(function (n) { var s = n.site ? A.site(n.site) : null; return '<article class="note">' + (n.photo ? '<img src="' + n.photo + '" alt="노트 사진">' : '<div class="ph">' + ic('note') + '</div>') + '<div style="min-width:0"><div class="row"><span class="small muted grow">' + when(n.t) + (s ? ' · ' + esc(s.name) : '') + '</span><button class="icon-btn plain" data-act="note-del" data-id="' + n.id + '" aria-label="노트 지우기" style="width:34px;height:34px">' + ic('trash') + '</button></div><p class="small" style="white-space:pre-wrap">' + esc(n.text || '(사진만 있음)') + '</p>' + (n.lat ? '<span class="mono small muted">' + n.lat + ', ' + n.lon + '</span>' : '') + '</div></article>'; }).join('') + '</div>'
        : '<div class="card flat"><b>아직 기록이 없어요</b><p class="small">현장에서 본 것, 잰 것, 떠오른 생각을 적어 두세요. AR 렌즈로 찍은 사진과 클리노미터·속도 계산 결과도 이곳에 모입니다. 답사가 끝나면 ‘글 복사’로 보고서에 옮길 수 있어요.</p></div>') +
      '<p class="small muted">노트와 사진은 이 기기에만 저장됩니다. 사진이 많아지면 저장 공간이 찰 수 있으니 답사 후 파일로 내보내 두세요.</p>' };
  };
})();
