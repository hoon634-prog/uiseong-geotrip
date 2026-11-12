/* 의성 지오트립 — 화면 (1) 홈, 명소, 지도, AR 고르기, 오디오 가이드 */
(function () {
  'use strict';
  var GEO = window.GEO, A = GEO.app, $ = A.$, $$ = A.$$, esc = A.esc, ic = A.ic, S = A.state, geo = GEO.geo, guide = GEO.guide;
  var V = GEO.V = { views: {}, acts: {}, ui: {} };
  var ui = V.ui;

  ui.chip = function (cat) { return '<span class="chip ' + cat + '">' + A.CAT[cat] + '</span>'; };
  ui.dot = function (s) { return '<span class="stamp-dot' + (S.stamps[s.id] ? ' on' : '') + '" title="' + (S.stamps[s.id] ? '스탬프 완료' : '스탬프 없음') + '">' + (S.stamps[s.id] ? '✓' : '') + '</span>'; };
  ui.distTxt = function (s) { var d = geo.toSite(s); return d == null ? '' : '<span class="mono small muted">' + A.fmtDist(d) + '</span>'; };
  ui.siteCard = function (s) { return '<a class="site-card" href="#site-' + s.id + '"><canvas data-scene="' + s.scene + '" aria-hidden="true"></canvas><div class="b"><span class="no">' + ('0' + s.no).slice(-2) + ' · ' + esc(s.fm) + '</span><span class="nm">' + esc(s.name) + '</span><span class="tg">' + esc(s.tag) + '</span><span class="row" style="margin-top:4px">' + ui.chip(s.cat) + ui.dot(s) + '</span></div></a>'; };
  ui.siteRow = function (s) { return '<a class="site-row" href="#site-' + s.id + '"><canvas data-scene="' + s.scene + '" aria-hidden="true"></canvas><div class="b"><span class="row" style="gap:6px"><span class="mono small muted">' + ('0' + s.no).slice(-2) + '</span>' + ui.chip(s.cat) + '<span class="grow"></span>' + ui.distTxt(s) + ui.dot(s) + '</span><b>' + esc(s.name) + '</b><span class="small muted">' + esc(s.tag) + '</span></div></a>'; };
  ui.sec = function (title, body, link) { return '<section class="sec"><div class="sec-head"><h2 class="h2">' + title + '</h2>' + (link || '') + '</div>' + body + '</section>'; };
  ui.strat = function () {
    var U = [['g0', '기반암', '변성암', []], ['g1', '낙동층', '역암·사암', ['angye']], ['g1', '하산동층', '사암·자색 이암', ['ssangho', 'haemang']], ['g1', '진주층', '사암·검은 셰일', ['nuruk']], ['g2', '일직층', '사암·셰일', []], ['g2', '후평동층', '사암·역암', []], ['g2', '점곡층', '검은 셰일', ['beteul', 'jeomgok']], ['g2', '사곡층', '붉은 사암·이암', ['jeori', 'mancheon']], ['g3', '구산동응회암', '건층', ['gusandong']], ['g2', '춘산층', '셰일·실트암', []], ['g2', '신양동층', '검은 셰일', ['stromat']], ['g3', '유천층군', '화산암', ['geumseong', 'binggye']]];
    return '<div class="strat" role="list" aria-label="서쪽에서 동쪽으로, 오래된 지층에서 젊은 지층 순서">' + U.map(function (u) { return '<div class="u ' + u[0] + '" role="listitem"><span>' + u[1] + '<small>' + u[2] + '</small></span><span class="dots">' + u[3].map(function (id) { var s = A.site(id); return '<a href="#site-' + id + '" aria-label="' + esc(s.name) + '">' + s.no + '</a>'; }).join('') + '</span></div>'; }).join('') + '</div><p class="small muted">← 서쪽·오래됨 &nbsp;&nbsp; 동쪽·젊음 → &nbsp; 숫자를 누르면 그 지층의 명소로 이동합니다. (안계분지는 낙동층~하산동층 위의 지형)</p>';
  };

  var TIPS = ['사진을 찍을 때는 자나 동전을 옆에 두세요. 크기를 알 수 있어야 과학 자료가 됩니다.', '노두에서는 “멀리서 한 번, 가까이서 한 번”. 전체 모양을 먼저 보고 세부를 보세요.', '붉은 지층은 공기 중에 드러났던 땅, 검은 지층은 물속. 색만 봐도 환경이 보입니다.', '관찰한 사실과 내 해석을 구분해서 적는 것이 탐구 보고서의 기본입니다.', '암석과 화석은 눈으로만! 가져가도 되는 것은 사진과 기록뿐입니다.'];

  /* ---------- 홈 ---------- */
  V.views.home = function () {
    var n = A.stampCount(), near = geo.nearest();
    var nearHtml = near && near.d < 8000 ? '<a class="banner" href="#site-' + near.s.id + '">' + ic('pin') + '<span><b>가까운 명소: ' + esc(near.s.name) + '</b> · ' + A.fmtDist(near.d) + (geo.inside(near.s) ? '<br>도착했어요! 해설을 듣고 스탬프를 받아 보세요.' : '') + '</span></a>'
      : GEO.env.artifact ? '<div class="banner">' + ic('info') + '<span><b>미리보기 화면입니다</b><br>여기서는 카메라와 GPS를 쓸 수 없어요. AR은 ‘연습 장면’과 ‘사진’으로, 스탬프는 퀴즈로 체험해 보세요. 현장용은 앱 폴더를 https 주소에 올려 사용합니다.</span></div>'
      : (geo.pos ? '' : '<button class="banner" data-act="loc-on" style="border:0;text-align:left;width:100%">' + ic('nav') + '<span><b>내 위치 켜기</b><br>가까운 명소 안내와 도착 스탬프에 쓰입니다. 위치는 이 기기 안에서만 사용해요.</span></button>');
    return { title: '의성 지오트립', html:
      '<section class="hero"><canvas data-scene="slab" aria-hidden="true"></canvas><div class="hero-txt"><span class="eyebrow">Uiseong Geopark · Field Trip</span><h2 class="h-display">1억 년 전 호숫가로<br>떠나는 지질 답사</h2><p>공룡 발자국, 꺼져 내린 화산, 한여름의 얼음골. 의성 국가지질공원의 지질명소 12곳을 걷고, 비춰 보고, 재고, 풀어 보세요.</p><a class="btn primary" href="#sites">' + ic('pin') + '답사 시작하기</a></div></section>' +
      nearHtml +
      '<div class="quick"><a href="#prep">' + ic('bag') + '답사 준비</a><a href="#audio">' + ic('sound') + '오디오 가이드</a><a href="#courses">' + ic('route') + '추천 코스</a><a href="#tools">' + ic('tools') + '탐구 도구</a></div>' +
      '<a class="card" href="#pass" style="text-decoration:none;color:inherit"><div class="row"><b class="grow">나의 답사 스탬프</b><span class="mono">' + n + ' / 12</span></div><div class="progress"><i style="width:' + (n / 12 * 100) + '%"></i></div></a>' +
      ui.sec('지질명소 12', '<div class="hscroll">' + GEO.sites.map(ui.siteCard).join('') + '</div>', '<a href="#sites">전체 보기</a>') +
      ui.sec('서쪽에서 동쪽으로, 지층의 순서', ui.strat()) +
      ui.sec('먼저 읽는 이야기', '<div class="list">' + GEO.stories.map(function (s) { return '<a href="#story-' + s.id + '"><span class="ic">' + ic('story') + '</span><span class="tx">' + esc(s.t) + '</span>' + ic('back').replace('<svg', '<svg style="width:18px;height:18px;transform:rotate(180deg);color:var(--ink-3)"') + '</a>'; }).join('') + '</div>') +
      '<div class="card flat"><span class="eyebrow">답사 한마디</span><p>' + TIPS[new Date().getDate() % TIPS.length] + '</p></div>' +
      '<p class="small muted">이 앱은 학교 수업을 위한 비공식 학습 도구이며, 의성군·의성 국가지질공원의 공식 앱이 아닙니다. <a href="#about">자료 출처와 안내</a></p>' };
  };

  /* ---------- 명소 목록 ---------- */
  var filter = 'all';
  V.views.sites = function () {
    var list = GEO.sites.filter(function (s) { return filter === 'all' || s.cat === filter; });
    if (geo.pos) list = list.slice().sort(function (a, b) { return geo.toSite(a) - geo.toSite(b); });
    var seg = [['all', '전체'], ['fossil', '화석'], ['sed', '퇴적'], ['volcano', '화산'], ['land', '지형']].map(function (f) { return '<button data-act="filter" data-cat="' + f[0] + '" aria-pressed="' + (filter === f[0]) + '">' + f[1] + '</button>'; }).join('');
    return { title: '지질명소', back: true, html: '<div class="seg" role="group" aria-label="분류">' + seg + '</div>' + (geo.pos ? '<p class="small muted">내 위치에서 가까운 순서입니다.</p>' : '') + '<div class="stack">' + list.map(ui.siteRow).join('') + '</div>' + ui.sec('함께 들르는 곳', '<div class="list">' + GEO.pois.map(function (p) { return '<a href="https://map.kakao.com/link/map/' + encodeURIComponent(p.name) + ',' + p.lat + ',' + p.lon + '" target="_blank" rel="noopener"><span class="ic">' + ic('pin') + '</span><span class="tx">' + esc(p.name) + '<small>' + esc(p.d) + '</small></span></a>'; }).join('') + '</div>') };
  };
  V.acts.filter = function (t) { filter = t.dataset.cat; V.render(true); };

  /* ---------- 명소 상세 ---------- */
  V.views.site = function (id) {
    var s = A.site(id); if (!s) return V.views.sites();
    var looks = S.looks[id] || {}, done = S.stamps[id];
    var qd = s.quiz.filter(function (q, i) { return S.quiz[id + '-' + i] === true; }).length;
    var d = geo.toSite(s);
    var kakao = 'https://map.kakao.com/link/to/' + encodeURIComponent(s.alt ? s.alt.name : s.name) + ',' + (s.alt ? s.alt.lat : s.lat) + ',' + (s.alt ? s.alt.lon : s.lon);
    var html =
      '<div class="site-hero"><canvas data-scene="' + s.scene + '" data-photo="' + s.id + '" aria-hidden="true"></canvas><span class="cap">장면 그림 (실제 모습과 다를 수 있음)</span></div>' +
      '<section class="sec"><span class="eyebrow">' + ('0' + s.no).slice(-2) + ' / 12 · ' + esc(s.en) + '</span><h2 class="h-display" style="font-size:1.7rem">' + esc(s.name) + '</h2><p class="muted">' + esc(s.tag) + '</p><div class="chips">' + ui.chip(s.cat) + s.keywords.map(function (k) { return '<span class="chip">' + esc(k) + '</span>'; }).join('') + '</div></section>' +
      '<div class="acts"><button class="btn primary" data-act="play" data-id="' + id + '" data-mode="std">' + ic('sound') + '해설 듣기</button><a class="btn hot" href="#ar-' + id + '">' + ic('lens') + 'AR 렌즈</a><a class="btn" href="' + kakao + '" target="_blank" rel="noopener">' + ic('nav') + '길찾기</a><button class="btn" data-act="checkin" data-id="' + id + '">' + ic(done ? 'check' : 'pin') + (done ? '스탬프 완료' : '도착 인증') + '</button></div>' +
      '<div class="card"><div class="row"><b class="grow">30초 요약</b><button class="btn sm" data-act="play" data-id="' + id + '" data-mode="exp">' + ic('play') + '듣기</button></div><p>' + esc(s.quick) + '</p></div>' +
      '<dl class="kv"><div><dt>지층</dt><dd>' + esc(s.fm) + '<br><span class="small muted">' + esc(s.group) + '</span></dd></div><div><dt>시대</dt><dd>' + esc(s.age) + '</dd></div><div><dt>암석</dt><dd>' + esc(s.rock) + '</dd></div><div><dt>관찰 시간</dt><dd>약 ' + s.minutes + '분' + (d != null ? '<br><span class="small muted">여기서 ' + A.fmtDist(d) + '</span>' : '') + '</dd></div><div><dt>위치</dt><dd>' + esc(s.addr) + '</dd></div><div><dt>접근</dt><dd>' + esc(s.access) + '</dd></div></dl>' +
      '<div class="banner warn">' + ic('shield') + '<span>' + esc(s.caution) + '</span></div>' +
      ui.sec('해설', '<div class="stack" id="narr">' + s.narr.map(function (n, i) { return '<article class="narr-seg" data-seg="' + i + '"><div class="row"><h3 class="grow">' + esc(n.t) + '</h3><button class="icon-btn plain" data-act="play" data-id="' + id + '" data-mode="std" data-seg="' + i + '" aria-label="이 부분부터 듣기">' + ic('play') + '</button></div><p>' + esc(n.x) + '</p></article>'; }).join('') + '</div>') +
      ui.sec('현장에서 찾아볼 것', '<div class="card">' + s.look.map(function (l, i) { return '<div class="look"><button class="n' + (looks[i] ? ' done' : '') + '" data-act="look" data-id="' + id + '" data-i="' + i + '" aria-pressed="' + !!looks[i] + '" aria-label="' + esc(l.k) + ' 찾음 표시" style="border:0">' + (looks[i] ? '✓' : i + 1) + '</button><div><b>' + esc(l.k) + '</b><p class="small">' + esc(l.d) + '</p><p class="small" style="color:var(--hot)">미션: ' + esc(l.m) + '</p></div></div>'; }).join('') + '</div><a class="btn hot block" href="#ar-' + id + '">' + ic('lens') + 'AR 렌즈로 비춰 보기</a>') +
      '<section class="story"><span class="eyebrow">이야기</span><h2 class="h2">' + esc(s.story.t) + '</h2><p>' + esc(s.story.x) + '</p></section>' +
      ui.sec('교과서와 연결하기', '<div class="stack">' + s.links.map(function (cid) { var c = GEO.concepts.filter(function (x) { return x.id === cid; })[0]; return c ? '<a class="concept-link" href="#concept-' + c.id + '"><span>' + esc(c.t) + '<small>' + esc(c.sum) + '</small></span><span class="chip">' + esc(c.cur) + '</span></a>' : ''; }).join('') + '</div>') +
      ui.sec('탐구 활동', '<div class="card"><ol style="margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:8px">' + s.inquiry.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol><button class="btn" data-act="note-new" data-id="' + id + '">' + ic('note') + '조사 노트에 기록하기</button></div>') +
      ui.sec('확인 퀴즈', '<a class="card" href="#quiz-' + id + '" style="text-decoration:none;color:inherit"><div class="row"><span class="grow"><b>' + s.quiz.length + '문제</b> · 맞힌 문제 ' + qd + '개</span><span class="btn sm primary">풀기</span></div><p class="small muted">모두 맞히면 위치 확인 없이도 스탬프를 받을 수 있어요.</p></a>') +
      ui.sec('가까이에', '<div class="card">' + s.near.map(function (n) { return '<div class="row"><b class="grow">' + esc(n.name) + '</b><span class="small muted">' + esc(n.d) + '</span></div>'; }).join('') + '</div>');
    return { title: s.name, back: true, html: html, init: function (el) {
      if (!GEO.env.artifact) { var cv = $('canvas[data-photo]', el); var im = new Image(); im.onload = function () { if (!cv.isConnected) return; im.alt = s.name + ' 사진'; cv.replaceWith(im); var cap = $('.site-hero .cap', el); if (cap) cap.remove(); }; im.src = 'img/sites/' + s.id + '.jpg'; }
      V.markNarr();
    } };
  };
  V.markNarr = function () { var box = $('#narr'); if (!box) return; var cur = guide.playing && guide.site && location.hash === '#site-' + guide.site.id && guide.q[guide.i] ? guide.q[guide.i].seg : -2; $$('.narr-seg', box).forEach(function (a) { a.classList.toggle('on', +a.dataset.seg === cur); }); };
  V.acts.look = function (t) { var id = t.dataset.id, i = t.dataset.i; S.looks[id] = S.looks[id] || {}; S.looks[id][i] = !S.looks[id][i]; A.save(); t.classList.toggle('done', S.looks[id][i]); t.textContent = S.looks[id][i] ? '✓' : (+i + 1); t.setAttribute('aria-pressed', S.looks[id][i]); };
  V.acts.play = function (t) { var s = A.site(t.dataset.id); guide.play(s, t.dataset.mode, t.dataset.seg != null ? +t.dataset.seg : null); };
  V.acts.checkin = function (t) {
    var s = A.site(t.dataset.id); if (S.stamps[s.id]) { location.hash = '#pass'; return; }
    var tryNow = function () { if (geo.inside(s)) { A.stamp(s.id, 'gps'); A.toast('도착 인증 완료! ' + s.name + ' 스탬프를 받았어요.'); V.render(true); return true; } return false; };
    if (geo.pos && tryNow()) return;
    var fail = function (msg) { A.sheet('<h2 class="h2">아직 인증할 수 없어요</h2><p>' + msg + '</p><p class="muted small">위치를 확인하기 어려우면 이 명소의 퀴즈 ' + s.quiz.length + '문제를 모두 맞혀도 스탬프를 받을 수 있습니다.</p><a class="btn primary block" href="#quiz-' + s.id + '" data-act="close-sheet">퀴즈로 인증하기</a><button class="btn block" data-act="close-sheet">닫기</button>'); };
    if (geo.pos) { fail(esc(s.name) + '까지 약 ' + A.fmtDist(geo.toSite(s)) + ' 남았습니다. 명소에 도착한 뒤 다시 눌러 주세요.'); return; }
    if (GEO.env.artifact) { fail('이 미리보기 화면에서는 위치를 확인할 수 없습니다.'); return; }
    A.toast('위치를 확인하는 중…'); var done = false;
    geo.start(function (g) { if (done) return false; if (g.pos) { done = true; if (!tryNow()) fail(esc(s.name) + '까지 약 ' + A.fmtDist(geo.toSite(s)) + ' 남았습니다.'); return false; } if (g.err) { done = true; fail(g.err === 'denied' ? '위치 권한이 꺼져 있습니다. 브라우저 설정에서 이 사이트의 위치 권한을 허용해 주세요.' : '이 기기에서 위치를 확인할 수 없습니다.'); return false; } return true; });
  };
  V.acts['close-sheet'] = function () { A.closeSheet(); };
  V.acts['loc-on'] = function () { A.toast('위치를 확인하는 중…'); S.prefs.loc = true; A.save(); geo.start(function (g) { if (g.pos) { V.render(true); return false; } if (g.err) { A.toast(g.err === 'denied' ? '위치 권한이 거부되었어요. 브라우저 설정에서 허용할 수 있습니다.' : '위치를 확인할 수 없어요.'); return false; } return true; }); };

  /* ---------- 지도 ---------- */
  var mapMode = 'geo', mapCourse = '', leaf = null;
  var MB = { w: 400, minLon: 128.262, maxLon: 128.916, minLat: 36.175, maxLat: 36.545 };
  MB.h = Math.round(MB.w * (MB.maxLat - MB.minLat) / ((MB.maxLon - MB.minLon) * Math.cos(36.36 * Math.PI / 180)));
  function px(lon, lat) { return [((lon - MB.minLon) / (MB.maxLon - MB.minLon) * MB.w), ((MB.maxLat - lat) / (MB.maxLat - MB.minLat) * MB.h)]; }
  function mapSvg() {
    var o = '<svg viewBox="0 0 ' + MB.w + ' ' + MB.h + '" role="img" aria-label="의성군 지질명소 개요도">';
    for (var lon = 128.3; lon < 128.92; lon += 0.1) { var a = px(lon, 0)[0]; o += '<line class="map-grid" x1="' + a + '" y1="0" x2="' + a + '" y2="' + MB.h + '"/><text class="map-sub" x="' + (a + 3) + '" y="' + (MB.h - 5) + '">' + lon.toFixed(1) + '°E</text>'; }
    for (var lat = 36.2; lat < 36.55; lat += 0.1) { var b = px(0, lat)[1]; o += '<line class="map-grid" x1="0" y1="' + b + '" x2="' + MB.w + '" y2="' + b + '"/><text class="map-sub" x="4" y="' + (b - 3) + '">' + lat.toFixed(1) + '°N</text>'; }
    o += '<polygon class="map-county" points="' + GEO.outline.map(function (p) { return px(p[0], p[1]).map(function (v) { return v.toFixed(1); }).join(','); }).join(' ') + '"/>';
    [['안계면', 128.462, 36.412], ['의성읍', 128.7, 36.352], ['금성면', 128.672, 36.243], ['점곡면', 128.79, 36.405], ['춘산면', 128.83, 36.245], ['안평면', 128.585, 36.356], ['다인면', 128.37, 36.455], ['사곡면', 128.79, 36.31], ['봉양면', 128.62, 36.305]].forEach(function (t) { var p = px(t[1], t[2]); o += '<text class="map-sub" x="' + p[0] + '" y="' + p[1] + '" text-anchor="middle" style="font-size:9px;fill:var(--ink-2)">' + t[0] + '</text>'; });
    if (mapCourse) { var c = GEO.courses.filter(function (x) { return x.id === mapCourse; })[0]; if (c) o += '<polyline class="map-route" points="' + c.stops.map(function (id) { var s = A.site(id); return px(s.lon, s.lat).join(','); }).join(' ') + '"/>'; }
    GEO.pois.slice(0, 5).forEach(function (p) { var q = px(p.lon, p.lat); o += '<rect x="' + (q[0] - 3.5) + '" y="' + (q[1] - 3.5) + '" width="7" height="7" fill="var(--ink-3)" stroke="var(--card)" stroke-width="1.5"><title>' + esc(p.name) + '</title></rect>'; });
    var off = { jeori: [-17, 7], mancheon: [-15, -13], geumseong: [-2, 16], stromat: [10, -12], binggye: [8, 12] };
    GEO.sites.forEach(function (s) { var p = px(s.lon, s.lat), d = off[s.id] || [0, 0]; if (d[0] || d[1]) o += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + (p[0] + d[0]) + '" y2="' + (p[1] + d[1]) + '" stroke="' + A.CATCOL[s.cat] + '" stroke-width="1.5"/>'; o += '<g class="map-pin" data-act="map-pin" data-id="' + s.id + '" tabindex="0" role="button" aria-label="' + esc(s.name) + '"><circle class="o" cx="' + (p[0] + d[0]) + '" cy="' + (p[1] + d[1]) + '" r="10.5" fill="' + A.CATCOL[s.cat] + '"' + (S.stamps[s.id] ? ' stroke-dasharray="0"' : '') + '/><text x="' + (p[0] + d[0]) + '" y="' + (p[1] + d[1] + 0.5) + '">' + s.no + '</text></g>'; });
    if (geo.pos) { var m = px(geo.pos.lon, geo.pos.lat); if (m[0] > -20 && m[0] < MB.w + 20 && m[1] > -20 && m[1] < MB.h + 20) o += '<circle cx="' + m[0] + '" cy="' + m[1] + '" r="13" fill="#2563eb" opacity=".2"/><circle class="map-me" cx="' + m[0] + '" cy="' + m[1] + '" r="6"/>'; }
    var kmPx = MB.w / ((MB.maxLon - MB.minLon) * 111.32 * Math.cos(36.36 * Math.PI / 180));
    o += '<g transform="translate(' + (MB.w - 20 - kmPx * 10) + ',' + 18 + ')"><rect width="' + (kmPx * 10) + '" height="4" fill="var(--ink)"/><rect width="' + (kmPx * 5) + '" height="4" fill="var(--card)" stroke="var(--ink)" stroke-width="1"/><text class="map-sub" x="0" y="15">0</text><text class="map-sub" x="' + (kmPx * 10) + '" y="15" text-anchor="end">10km</text></g>';
    o += '<g transform="translate(22,26)"><path d="M0 -14L5 6L0 2L-5 6Z" fill="var(--ink)"/><text class="map-sub" x="0" y="17" text-anchor="middle">N</text></g></svg>';
    return o;
  }
  V.views.map = function () {
    var courseSel = '<label class="field">코스 따라가기<select id="map-course" data-change="map-course"><option value="">표시 안 함</option>' + GEO.courses.map(function (c) { return '<option value="' + c.id + '"' + (mapCourse === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select></label>';
    var seg = GEO.env.artifact ? '' : '<div class="seg" role="group" aria-label="지도 종류"><button data-act="map-mode" data-mode="geo" aria-pressed="' + (mapMode === 'geo') + '">개요도 (오프라인)</button><button data-act="map-mode" data-mode="real" aria-pressed="' + (mapMode === 'real') + '">실제 지도</button></div>';
    var legend = '<div class="legend">' + Object.keys(A.CAT).map(function (k) { return '<span><i style="background:' + A.CATCOL[k] + '"></i>' + A.CAT[k] + '</span>'; }).join('') + '<span><i style="background:var(--ink-3);border-radius:0"></i>함께 들르는 곳</span>' + (geo.pos ? '<span><i style="background:#2563eb"></i>내 위치</span>' : '') + '</div>';
    return { title: '지도', html: seg + '<div class="mapbox">' + (mapMode === 'real' ? '<div id="leaf"></div>' : mapSvg() + legend) + '</div>' +
      (geo.pos || GEO.env.artifact ? '' : '<button class="btn block" data-act="loc-on">' + ic('nav') + '내 위치 표시하기</button>') + courseSel +
      ui.sec('명소 번호', '<div class="stack">' + GEO.sites.map(ui.siteRow).join('') + '</div>') +
      '<p class="small muted">개요도의 위치는 카카오맵에 등록된 지질명소 좌표이며, 군 경계는 © OpenStreetMap contributors 자료를 단순화했습니다.</p>',
      init: function () { leaf = null; if (mapMode === 'real') startLeaf(); } };
  };
  V.setMapCourse = function (id) { mapCourse = id; };
  V.acts['map-mode'] = function (t) { mapMode = t.dataset.mode; V.render(true); };
  V.acts['map-course'] = function (t) { mapCourse = t.value; V.render(true); };
  V.acts['map-pin'] = function (t) { var s = A.site(t.dataset.id), d = geo.toSite(s); A.sheet('<span class="eyebrow">' + ('0' + s.no).slice(-2) + ' · ' + esc(s.fm) + '</span><h2 class="h2">' + esc(s.name) + '</h2><p>' + esc(s.quick) + '</p>' + (d != null ? '<p class="mono small muted">여기서 ' + A.fmtDist(d) + '</p>' : '') + '<a class="btn primary block" href="#site-' + s.id + '" data-act="close-sheet">자세히 보기</a><a class="btn block" target="_blank" rel="noopener" href="https://map.kakao.com/link/to/' + encodeURIComponent(s.name) + ',' + s.lat + ',' + s.lon + '">' + ic('nav') + '카카오맵 길찾기</a>'); };
  function startLeaf() {
    var boot = function () { var el = $('#leaf'); if (!el || !window.L) return; var L = window.L; leaf = L.map(el, { attributionControl: true }).setView([36.33, 128.63], 10);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap contributors' }).on('tileerror', function () { if (!startLeaf.warned) { startLeaf.warned = true; A.toast('지도 타일을 불러오지 못했어요. 인터넷 연결을 확인하세요.'); } }).addTo(leaf);
      L.polygon(GEO.outline.map(function (p) { return [p[1], p[0]]; }), { color: '#1f6b45', weight: 2, fill: false }).addTo(leaf);
      GEO.sites.forEach(function (s) { L.circleMarker([s.lat, s.lon], { radius: 9, color: '#fff', weight: 2, fillColor: A.CATCOL[s.cat], fillOpacity: 1 }).addTo(leaf).bindTooltip(s.no + '. ' + s.name).on('click', function () { V.acts['map-pin']({ dataset: { id: s.id } }); }); });
      if (mapCourse) { var c = GEO.courses.filter(function (x) { return x.id === mapCourse; })[0]; if (c) L.polyline(c.stops.map(function (id) { var s = A.site(id); return [s.lat, s.lon]; }), { color: '#c2410c', dashArray: '6 6' }).addTo(leaf); }
      if (geo.pos) L.circleMarker([geo.pos.lat, geo.pos.lon], { radius: 7, color: '#fff', weight: 2, fillColor: '#2563eb', fillOpacity: 1 }).addTo(leaf); };
    if (window.L) return boot();
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css);
    var js = document.createElement('script'); js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'; js.onload = boot; js.onerror = function () { A.toast('실제 지도는 인터넷 연결이 필요해요. 개요도로 돌아갑니다.'); mapMode = 'geo'; V.render(true); }; document.head.appendChild(js);
  }

  /* ---------- AR 고르기 ---------- */
  V.views.ar = function () {
    var near = geo.nearest(), here = near && geo.inside(near.s) ? near.s : null;
    return { title: 'AR 렌즈', html:
      '<div class="card"><span class="eyebrow">Geo Lens</span><h2 class="h2">노두를 비추면 설명이 겹쳐 보여요</h2><p>카메라로 지층을 비추고 관찰 포인트를 눌러 보세요. 발자국 틀로 공룡 종류를 가리고, 경사 가이드로 지층의 기울기를 재고, ‘시간 여행’으로 1억 년 전 풍경을 겹쳐 볼 수 있습니다.</p><p class="small muted">교실에서는 카메라 대신 ‘연습 장면’으로 미리 해 볼 수 있어요.</p></div>' +
      (here ? '<a class="btn hot block" href="#ar-' + here.id + '">' + ic('lens') + '지금 여기: ' + esc(here.name) + ' 비추기</a>' : '') +
      ui.sec('어느 노두 앞에 있나요?', '<div class="stack">' + (geo.pos ? GEO.sites.slice().sort(function (a, b) { return geo.toSite(a) - geo.toSite(b); }) : GEO.sites).map(function (s) { return '<a class="site-row" href="#ar-' + s.id + '"><canvas data-scene="' + s.scene + '" aria-hidden="true"></canvas><div class="b"><span class="row" style="gap:6px">' + ui.chip(s.cat) + '<span class="grow"></span>' + ui.distTxt(s) + '</span><b>' + esc(s.name) + '</b><span class="small muted">관찰 포인트 ' + s.look.length + '개 · ' + esc(s.fxCap[3]) + '</span></div></a>'; }).join('') + '</div>') };
  };

  /* ---------- 오디오 가이드 ---------- */
  V.views.audio = function () {
    var m = S.prefs.mode || 'std';
    return { title: '오디오 가이드', back: true, html:
      (guide.ok ? '' : '<div class="banner warn">' + ic('info') + '<span>이 브라우저는 음성 읽기를 지원하지 않습니다. 각 명소의 해설을 글로 읽어 주세요.</span></div>') +
      '<div class="card"><h2 class="h2">해설 길이 고르기</h2><div class="seg" role="group"><button data-act="pref" data-k="mode" data-v="std" aria-pressed="' + (m === 'std') + '">표준 해설 (명소당 2~3분)</button><button data-act="pref" data-k="mode" data-v="exp" aria-pressed="' + (m === 'exp') + '">핵심만 (약 30초)</button></div><label class="field">읽는 속도<select data-change="pref-rate"><option value="0.85"' + (S.prefs.rate == 0.85 ? ' selected' : '') + '>천천히</option><option value="1"' + (S.prefs.rate == 1 ? ' selected' : '') + '>보통</option><option value="1.2"' + (S.prefs.rate == 1.2 ? ' selected' : '') + '>빠르게</option></select></label><p class="small muted">기기에 설치된 한국어 음성으로 읽어 줍니다. 이어폰을 준비하면 현장에서 듣기 좋아요. 한 번 열어 둔 뒤에는 인터넷 없이도 작동합니다.</p></div>' +
      ui.sec('명소별 해설', '<div class="list">' + GEO.sites.map(function (s) { return '<button class="li" data-act="play" data-id="' + s.id + '" data-mode="' + m + '"><span class="ic">' + ic('play') + '</span><span class="tx">' + s.no + '. ' + esc(s.name) + '<small>' + esc(s.tag) + '</small></span><span class="mono small muted">' + (m === 'std' ? '약 ' + Math.max(2, Math.round(s.narr.reduce(function (a, n) { return a + n.x.length; }, 0) / 330)) + '분' : '30초') + '</span></button>'; }).join('') + '</div>') };
  };
  V.acts.pref = function (t) { var k = t.dataset.k, v = t.dataset.v; S.prefs[k] = v === 'true' ? true : v === 'false' ? false : (isNaN(+v) || v === '' ? v : (k === 'rate' ? +v : v)); A.save(); A.applyPrefs(); if (k === 'loc' && S.prefs.loc) geo.start(); V.render(true); };
  V.acts['pref-rate'] = function (t) { S.prefs.rate = +t.value; A.save(); };

  /* ---------- 재생 막대 ---------- */
  var bar;
  V.player = function () {
    if (!bar) { bar = document.createElement('div'); bar.className = 'player'; bar.hidden = true; document.body.appendChild(bar); }
    if (!guide.playing || !guide.site) { bar.hidden = true; document.body.style.setProperty('--player', '0px'); V.markNarr(); return; }
    var q = guide.q[guide.i] || { t: '' }, pct = guide.q.length ? (guide.i + 1) / guide.q.length * 100 : 0;
    bar.hidden = false;
    bar.innerHTML = '<div class="player-in"><button data-act="player-toggle" aria-label="' + (guide.paused ? '이어 듣기' : '잠시 멈춤') + '">' + ic(guide.paused ? 'play' : 'pause') + '</button><a href="#site-' + guide.site.id + '" style="color:inherit;text-decoration:none;min-width:0"><div class="t">' + esc(guide.site.name) + '</div><div class="s">' + esc(q.t) + (guide.mode === 'exp' ? '' : ' · 표준 해설') + '</div></a><button data-act="player-next" aria-label="다음 부분">' + ic('next') + '</button><button data-act="player-close" aria-label="해설 끄기">' + ic('x') + '</button><div class="bar"><i style="width:' + pct + '%"></i></div></div>';
    V.markNarr();
  };
  guide.onchange = function () { V.player(); };
  V.acts['player-toggle'] = function () { guide.toggle(); };
  V.acts['player-next'] = function () { guide.jump(1); };
  V.acts['player-close'] = function () { guide.stop(); };
})();
