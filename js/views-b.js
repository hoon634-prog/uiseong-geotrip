/* 의성 지오트립 — 화면 (2) 학습, 퀴즈, 패스, 답사 준비, 도우미, 설정 + 화면 전환 */
(function () {
  'use strict';
  var GEO = window.GEO, A = GEO.app, $ = A.$, $$ = A.$$, esc = A.esc, ic = A.ic, S = A.state, geo = GEO.geo, guide = GEO.guide, V = GEO.V, ui = V.ui;
  function concept(id) { return GEO.concepts.filter(function (c) { return c.id === id; })[0]; }
  function arrow() { return ic('back').replace('<svg', '<svg style="width:18px;height:18px;transform:rotate(180deg);color:var(--ink-3);flex:none"'); }
  function li(href, icon, title, sub) { return '<a href="' + href + '"><span class="ic">' + ic(icon) + '</span><span class="tx">' + title + (sub ? '<small>' + sub + '</small>' : '') + '</span>' + arrow() + '</a>'; }

  /* ---------- 학습 ---------- */
  V.views.study = function () {
    var total = GEO.quiz.length + GEO.sites.reduce(function (a, s) { return a + s.quiz.length; }, 0), ok = Object.keys(S.quiz).filter(function (k) { return S.quiz[k] === true; }).length;
    return { title: '학습', html:
      '<div class="list">' + li('#quiz', 'quiz', '퀴즈', '수능형 14문제 + 명소별 3문제 · 맞힌 문제 ' + ok + ' / ' + total) + li('#glossary', 'az', '용어 사전', GEO.glossary.length + '개 용어') + li('#timeline', 'time', '의성 지질 연대표', '선캄브리아 시대부터 국가지질공원까지') + li('#tools', 'tools', '탐구 도구', '클리노미터 · 공룡 속도 계산기 · 조사 노트') + li('#helper', 'search', '묻고 답하기', '궁금한 것을 검색해 보세요') + '</div>' +
      ui.sec('교과 개념 카드', '<p class="small muted">교과 표시는 2015 개정 과목명 기준입니다. 2022 개정 교육과정에서는 주로 「지구과학」과 「지구시스템과학」에서 다룹니다.</p><div class="stack">' + GEO.concepts.map(function (c) { return '<a class="concept-link" href="#concept-' + c.id + '"><span>' + esc(c.t) + '<small>' + esc(c.sum) + '</small></span><span class="chip">' + esc(c.cur) + '</span></a>'; }).join('') + '</div>') +
      ui.sec('지층의 순서', ui.strat()) };
  };
  V.views.concept = function (id) {
    var c = concept(id); if (!c) return V.views.study();
    return { title: '개념 카드', back: true, html:
      '<section class="sec"><span class="chip" style="align-self:flex-start">' + esc(c.cur) + '</span><h2 class="h-display" style="font-size:1.6rem">' + esc(c.t) + '</h2><p style="font-weight:600">' + esc(c.sum) + '</p></section>' +
      '<div class="card prose">' + c.body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      '<div class="banner">' + ic('bulb') + '<span><b>시험 포인트</b><br>' + esc(c.tip) + '</span></div>' +
      ui.sec('의성에서 확인하기', '<div class="stack">' + c.where.map(function (sid) { return ui.siteRow(A.site(sid)); }).join('') + '</div>') };
  };

  /* ---------- 퀴즈 ---------- */
  var QZ = { key: null, list: [], i: 0, pick: null, right: 0 };
  function quizList(key) {
    if (key === 'all') return GEO.quiz.map(function (q) { return { id: q.id, q: q }; });
    if (key === 'wrong') { var w = []; GEO.quiz.forEach(function (q) { if (S.quiz[q.id] === false) w.push({ id: q.id, q: q }); }); GEO.sites.forEach(function (s) { s.quiz.forEach(function (q, i) { if (S.quiz[s.id + '-' + i] === false) w.push({ id: s.id + '-' + i, q: q, site: s }); }); }); return w; }
    var s = A.site(key); return s ? s.quiz.map(function (q, i) { return { id: s.id + '-' + i, q: q, site: s }; }) : [];
  }
  V.views.quiz = function (key) {
    if (!key) {
      var wrong = Object.keys(S.quiz).filter(function (k) { return S.quiz[k] === false; }).length, gOk = GEO.quiz.filter(function (q) { return S.quiz[q.id] === true; }).length;
      return { title: '퀴즈', back: true, html:
        '<a class="card" href="#quiz-all" style="text-decoration:none;color:inherit"><span class="eyebrow">수능형 도전</span><h2 class="h2">의성에서 푸는 지구과학 ' + GEO.quiz.length + '문제</h2><div class="progress"><i style="width:' + (gOk / GEO.quiz.length * 100) + '%"></i></div><p class="small muted">맞힌 문제 ' + gOk + ' / ' + GEO.quiz.length + ' · 보기(ㄱ, ㄴ, ㄷ)형 포함</p></a>' +
        (wrong ? '<a class="btn hot block" href="#quiz-wrong">틀린 문제 ' + wrong + '개 다시 풀기</a>' : '') +
        ui.sec('명소별 확인 퀴즈', '<div class="list">' + GEO.sites.map(function (s) { var n = s.quiz.filter(function (q, i) { return S.quiz[s.id + '-' + i] === true; }).length; return '<a href="#quiz-' + s.id + '"><span class="ic">' + ic(n === s.quiz.length ? 'check' : 'quiz') + '</span><span class="tx">' + s.no + '. ' + esc(s.name) + '<small>맞힌 문제 ' + n + ' / ' + s.quiz.length + '</small></span>' + arrow() + '</a>'; }).join('') + '</div>') };
    }
    if (QZ.key !== key) { QZ = { key: key, list: quizList(key), i: 0, pick: null, right: 0 }; }
    var title = key === 'all' ? '수능형 도전' : key === 'wrong' ? '틀린 문제 다시 풀기' : (A.site(key) ? A.site(key).name + ' 퀴즈' : '퀴즈');
    if (!QZ.list.length) return { title: title, back: true, html: '<div class="card"><p>풀 문제가 없습니다.</p><a class="btn primary" href="#quiz">퀴즈 목록으로</a></div>' };
    if (QZ.i >= QZ.list.length) {
      var s = A.site(key), perfect = QZ.right === QZ.list.length, got = false;
      if (s && A.quizPerfect(s)) got = A.stamp(s.id, 'quiz');
      return { title: title, back: true, html: '<div class="card" style="text-align:center;align-items:center"><span class="eyebrow">결과</span><div class="h-display">' + QZ.right + ' / ' + QZ.list.length + '</div><p>' + (perfect ? '완벽해요! 현장에서 직접 확인하면 더 오래 기억에 남습니다.' : '틀린 문제의 해설을 다시 읽고 한 번 더 도전해 보세요.') + '</p>' + (got ? '<div class="banner">' + ic('check') + '<span><b>' + esc(s.name) + ' 스탬프를 받았어요!</b></span></div>' : '') + '</div><button class="btn primary block" data-act="quiz-restart">다시 풀기</button>' + (s ? '<a class="btn block" href="#site-' + s.id + '">' + esc(s.name) + '(으)로 돌아가기</a>' : '') + '<a class="btn block" href="#quiz">퀴즈 목록</a>' };
    }
    var it = QZ.list[QZ.i], q = it.q, marks = q.a.length === 2 ? ['', ''] : ['①', '②', '③', '④', '⑤'];
    return { title: title, back: true, html:
      '<div class="row"><div class="progress grow"><i style="width:' + (QZ.i / QZ.list.length * 100) + '%"></i></div><span class="mono small">' + (QZ.i + 1) + ' / ' + QZ.list.length + '</span></div>' +
      '<div class="q">' + (q.tag || it.site ? '<span class="chip" style="align-self:flex-start">' + esc(q.tag || it.site.name) + '</span>' : '') + '<p class="stem">' + esc(q.q) + '</p>' + (q.box ? '<div class="box"><b class="small">&lt;보기&gt;</b>' + q.box.map(function (b) { return '<span>' + esc(b) + '</span>'; }).join('') + '</div>' : '') +
      q.a.map(function (a, k) { var cls = QZ.pick == null ? '' : (k === q.k ? ' right' : (k === QZ.pick ? ' wrong' : '')); return '<button class="opt' + cls + '" data-act="quiz-pick" data-k="' + k + '"' + (QZ.pick != null ? ' disabled' : '') + '>' + (marks[k] ? '<span class="k">' + marks[k] + '</span>' : '') + '<span>' + esc(a) + '</span></button>'; }).join('') +
      (QZ.pick != null ? '<div class="why"><b>' + (QZ.pick === q.k ? '정답입니다.' : '아쉬워요. 정답은 ' + (marks[q.k] || '') + ' ' + esc(q.a[q.k]) + '.') + '</b><br>' + esc(q.why) + '</div><button class="btn primary block" data-act="quiz-next">' + (QZ.i + 1 < QZ.list.length ? '다음 문제' : '결과 보기') + '</button>' : '') + '</div>' };
  };
  V.acts['quiz-pick'] = function (t) { if (QZ.pick != null) return; var it = QZ.list[QZ.i]; QZ.pick = +t.dataset.k; var ok = QZ.pick === it.q.k; if (ok) QZ.right++; S.quiz[it.id] = ok; A.save(); V.render(true); };
  V.acts['quiz-next'] = function () { QZ.i++; QZ.pick = null; V.render(); };
  V.acts['quiz-restart'] = function () { var k = QZ.key; QZ = { key: null }; V.render(); };

  /* ---------- 용어 · 연대표 · 이야기 ---------- */
  V.views.glossary = function () { return { title: '용어 사전', back: true, html: '<label class="field">용어 찾기<input type="search" id="gloss-q" data-input="gloss" placeholder="예: 건열, 주향, 응회암" autocomplete="off"></label><div class="card" id="gloss-list">' + glossRows('') + '</div>' }; };
  function glossRows(q) { var list = GEO.glossary.filter(function (g) { return !q || g.w.indexOf(q) >= 0 || g.d.indexOf(q) >= 0; }).sort(function (a, b) { return a.w.localeCompare(b.w, 'ko'); }); return list.length ? list.map(function (g) { return '<div style="padding:8px 0;border-top:1px solid var(--line)"><b>' + esc(g.w) + '</b><p class="small">' + esc(g.d) + '</p></div>'; }).join('') : '<p class="muted">찾는 용어가 없어요. 다른 낱말로 검색해 보세요.</p>'; }
  V.inputs = { gloss: function (t) { $('#gloss-list').innerHTML = glossRows(t.value.trim()); }, helper: function (t) { var o = $('#helper-out'); o.innerHTML = helperOut(t.value.trim()); paint(o); } };
  V.views.timeline = function () { return { title: '의성 지질 연대표', back: true, html: '<p class="muted">아래로 내려갈수록 현재에 가까워집니다. 초록 점은 퇴적, 분홍 점은 화산 활동, 회색 점은 그 밖의 사건이에요.</p><div class="tl">' + GEO.timeline.map(function (e) { return '<div class="e ' + (e.c || '') + '"><span class="when">' + esc(e.when) + '</span><h3 class="h3">' + esc(e.t) + '</h3>' + (e.x ? '<p class="small">' + esc(e.x) + '</p>' : '') + (e.sites ? '<div class="chips" style="margin-top:6px">' + e.sites.map(function (id) { var s = A.site(id); return '<a class="chip ' + s.cat + '" href="#site-' + id + '" style="text-decoration:none">' + s.no + '. ' + esc(s.name) + '</a>'; }).join('') + '</div>' : '') + '</div>'; }).join('') + '</div>' }; };
  V.views.story = function (id) { var st = GEO.stories.filter(function (s) { return s.id === id; })[0]; if (!st) return V.views.home(); return { title: '이야기', back: true, html: '<section class="story"><span class="eyebrow">먼저 읽는 이야기</span><h2 class="h-display" style="font-size:1.5rem">' + esc(st.t) + '</h2>' + st.x.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</section>' + (id === 'west-east' ? ui.sec('지층의 순서', ui.strat()) : '<a class="btn block" href="#site-jeori">제오리 공룡발자국 보러 가기</a>') }; };

  /* ---------- 답사 패스 ---------- */
  var BADGES = [
    { t: '공룡 박사', d: '제오리 + 만천리', ic: 'foot', ok: function () { return S.stamps.jeori && S.stamps.mancheon; } },
    { t: '퇴적 탐정', d: '쌍호리 · 해망산 · 누룩바위 · 점곡', ic: 'layers', ok: function () { return S.stamps.ssangho && S.stamps.haemang && S.stamps.nuruk && S.stamps.jeomgok; } },
    { t: '화산 탐험가', d: '구산동응회암 + 금성산 + 빙계계곡', ic: 'star', ok: function () { return S.stamps.gusandong && S.stamps.geumseong && S.stamps.binggye; } },
    { t: '지형 읽는 눈', d: '안계분지 + 베틀바위', ic: 'compass', ok: function () { return S.stamps.angye && S.stamps.beteul; } },
    { t: '수능형 만점', d: '수능형 도전 14문제 모두 정답', ic: 'quiz', ok: function () { return GEO.quiz.every(function (q) { return S.quiz[q.id] === true; }); } },
    { t: '의성 완주', d: '스탬프 12개', ic: 'pass', ok: function () { return A.stampCount() >= 12; } }
  ];
  V.views.pass = function () {
    var n = A.stampCount(), p = S.profile;
    var last = Object.keys(S.stamps).map(function (k) { return S.stamps[k].t; }).sort().pop();
    return { title: '답사 패스', html:
      '<div class="pass"><div class="pass-top"><span class="eyebrow" style="color:inherit;opacity:.8">Uiseong Geopark Field Pass</span><span class="h-display">' + (p.name ? esc(p.name) : '이름을 적어 주세요') + '</span><span>' + esc(p.cls || '학년 · 반 · 번호') + '</span></div><div class="pass-cut"></div><div class="pass-body"><div class="row"><b class="grow">모은 스탬프</b><span class="mono">' + n + ' / 12</span></div><div class="progress"><i style="width:' + (n / 12 * 100) + '%"></i></div><div class="stamps">' + GEO.sites.map(function (s) { var st = S.stamps[s.id]; return '<a class="stamp' + (st ? ' on' : '') + '" href="#site-' + s.id + '">' + (st ? esc(s.name.replace(/^의성 /, '')) + '<br>' + new Date(st.t).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }) : s.no + '<br>' + esc(s.name.replace(/^의성 /, ''))) + '</a>'; }).join('') + '</div><p class="small muted">명소에 도착해 ‘도착 인증’을 누르거나, 그 명소의 퀴즈를 모두 맞히면 스탬프가 찍힙니다.</p></div></div>' +
      (n >= 12 ? '<div class="card" style="text-align:center;border:3px double var(--hot)"><span class="eyebrow">완주 인증</span><h2 class="h-display" style="font-size:1.5rem">의성 지질명소 12곳 완주</h2><p>' + esc(p.name || '탐험가') + ' 님은 의성 국가지질공원의 지질명소 12곳 답사를 모두 마쳤습니다.</p><p class="mono small muted">' + new Date(last).toLocaleDateString('ko-KR') + '</p></div>' : '') +
      ui.sec('배지', '<div class="stack">' + BADGES.map(function (b) { var ok = !!b.ok(); return '<div class="badge ' + (ok ? 'on' : 'off') + '"><span class="ic">' + ic(b.ic) + '</span><span><b>' + b.t + '</b><br><span class="small muted">' + b.d + '</span></span></div>'; }).join('') + '</div>') +
      '<details class="card"' + (p.name ? '' : ' open') + '><summary>내 정보 적기</summary><label class="field">이름<input id="pf-name" maxlength="20" autocomplete="off" value="' + esc(p.name) + '"></label><label class="field">학년 · 반 · 번호<input id="pf-cls" maxlength="30" autocomplete="off" value="' + esc(p.cls) + '" placeholder="예: 2학년 3반 12번"></label><button class="btn primary" data-act="profile-save">저장</button><p class="small muted">이름과 기록은 이 기기에만 저장되고 어디로도 전송되지 않습니다.</p></details>' +
      '<div class="list">' + li('#notes', 'note', '나의 조사 노트', S.notes.length + '개 기록') + li('#prep', 'bag', '답사 준비', '준비물 · 안전 · 약속') + '</div>' };
  };
  V.acts['profile-save'] = function () { S.profile.name = $('#pf-name').value.trim(); S.profile.cls = $('#pf-cls').value.trim(); A.save(); A.toast('저장했어요.'); V.render(true); };

  /* ---------- 답사 준비 · 코스 ---------- */
  V.views.prep = function () {
    var P = GEO.prep;
    return { title: '답사 준비', back: true, html:
      ui.sec('준비물 체크', '<div class="card">' + P.pack.map(function (x, i) { return '<label class="check"><input type="checkbox" id="pack-' + i + '" data-change="pack" data-i="' + i + '"' + (S.pack[i] ? ' checked' : '') + '><span>' + esc(x) + '</span></label>'; }).join('') + '</div>') +
      ui.sec('안전 수칙', '<div class="card"><ol style="margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:6px">' + P.safety.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></div>') +
      ui.sec('지질공원에서의 약속', '<div class="card"><ul style="margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:6px">' + P.rules.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>') +
      ui.sec('노두를 관찰하는 다섯 단계', '<div class="card">' + P.method.map(function (m, i) { return '<div class="look"><span class="n">' + (i + 1) + '</span><div><b>' + esc(m[0]) + '</b><p class="small">' + esc(m[1]) + '</p></div></div>'; }).join('') + '</div>') +
      '<div class="list">' + li('#courses', 'route', '추천 코스 보기', '반나절 코스 4개 · 하루 코스 1개') + li('#audio', 'sound', '오디오 가이드 미리 듣기', '') + '</div>' +
      '<div class="card flat"><b>문의</b><p class="small">의성 국가지질공원 담당: 의성군청 환경과 <span class="mono">054-830-6607</span><br>누리집: <span class="mono">www.usc.go.kr/geopark</span></p><p class="small muted">탐방 시설, 해설 프로그램, 단체 방문은 의성군에 미리 확인하세요.</p></div>' };
  };
  V.changes = { pack: function (t) { S.pack[t.dataset.i] = t.checked; A.save(); }, 'map-course': function (t) { V.acts['map-course'](t); }, 'pref-rate': function (t) { V.acts['pref-rate'](t); } };
  V.views.courses = function () { return { title: '추천 코스', back: true, html: '<p class="muted">이동 시간은 차량 기준 어림값입니다. 계절, 인원, 도로 사정에 따라 달라져요.</p><div class="stack">' + GEO.courses.map(function (c) { return '<a class="card" href="#course-' + c.id + '" style="text-decoration:none;color:inherit"><div class="row"><h2 class="h2 grow">' + esc(c.name) + '</h2><span class="chip">' + esc(c.time) + '</span></div><p class="small">' + esc(c.d) + '</p><div class="chips">' + c.stops.map(function (id) { var s = A.site(id); return '<span class="chip ' + s.cat + '">' + s.no + '. ' + esc(s.name.replace(/^의성 /, '')) + '</span>'; }).join('') + '</div></a>'; }).join('') + '</div>' }; };
  V.views.course = function (id) {
    var c = GEO.courses.filter(function (x) { return x.id === id; })[0]; if (!c) return V.views.courses();
    var mins = c.stops.reduce(function (a, sid) { return a + A.site(sid).minutes; }, 0);
    return { title: c.name, back: true, html: '<div class="card"><div class="row"><span class="chip">' + esc(c.time) + '</span><span class="small muted">관찰 시간 합계 약 ' + mins + '분 + 이동</span></div><p>' + esc(c.d) + '</p><p class="small muted">' + esc(c.note) + '</p></div>' +
      '<div class="acts"><button class="btn primary" data-act="course-map" data-id="' + c.id + '">' + ic('map') + '지도에서 보기</button><button class="btn" data-act="play" data-id="' + c.stops[0] + '" data-mode="' + (S.prefs.mode || 'std') + '">' + ic('sound') + '첫 명소 해설</button></div>' +
      ui.sec('들르는 순서', '<div class="stack">' + c.stops.map(function (sid) { return ui.siteRow(A.site(sid)); }).join('') + '</div>') };
  };
  V.acts['course-map'] = function (t) { V.setMapCourse(t.dataset.id); location.hash = '#map'; };

  /* ---------- 도구 목록 ---------- */
  V.views.tools = function () { return { title: '탐구 도구', back: true, html: '<div class="list">' + li('#clino', 'angle', '클리노미터', '스마트폰으로 지층의 주향과 경사 재기') + li('#speed', 'speed', '공룡 속도 계산기', '발 길이와 보폭으로 골반 높이와 속도 구하기') + li('#notes', 'note', '조사 노트', '사진 · 측정값 · 관찰 기록 ' + S.notes.length + '개') + li('#ar', 'lens', 'AR 렌즈', '노두에 설명과 과거 환경 겹쳐 보기') + '</div><div class="card flat"><b>측정은 과학의 언어</b><p class="small">“많이 기울었다”보다 “남동쪽으로 40° 기울었다”가 훨씬 많은 것을 알려 줍니다. 재고, 적고, 비교해 보세요.</p></div>' }; };

  /* ---------- 묻고 답하기 ---------- */
  function helperOut(q) {
    if (!q) return '<div class="stack">' + GEO.faq.map(function (f) { return '<details class="card"><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'; }).join('') + '</div>';
    var toks = q.split(/\s+/).filter(function (t) { return t.length >= 1; }), res = [];
    var score = function (txt) { var n = 0; toks.forEach(function (t) { if (txt.indexOf(t) >= 0) n += t.length > 1 ? 2 : 1; }); return n; };
    GEO.faq.forEach(function (f) { var sc = score(f.q + ' ' + f.k) * 2 + score(f.a); if (sc) res.push({ sc: sc + 1, h: '<details class="card" open><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>' }); });
    GEO.glossary.forEach(function (g) { var sc = score(g.w) * 3 + score(g.d); if (sc) res.push({ sc: sc, h: '<div class="card"><span class="eyebrow">용어</span><b>' + esc(g.w) + '</b><p class="small">' + esc(g.d) + '</p></div>' }); });
    GEO.concepts.forEach(function (c) { var sc = score(c.t) * 3 + score(c.sum); if (sc) res.push({ sc: sc, h: '<a class="concept-link" href="#concept-' + c.id + '"><span>' + esc(c.t) + '<small>' + esc(c.sum) + '</small></span><span class="chip">개념</span></a>' }); });
    GEO.sites.forEach(function (s) { var sc = score(s.name + ' ' + s.keywords.join(' ')) * 3 + score(s.quick + ' ' + s.tag); if (sc) res.push({ sc: sc, h: ui.siteRow(s) }); });
    res.sort(function (a, b) { return b.sc - a.sc; });
    return res.length ? '<div class="stack">' + res.slice(0, 10).map(function (r) { return r.h; }).join('') + '</div>' : '<div class="card"><p>앱에 담긴 자료에서는 찾지 못했어요. 낱말을 바꿔 보거나 선생님께 물어보세요.</p></div>';
  }
  V.views.helper = function () { return { title: '묻고 답하기', back: true, html: '<label class="field">무엇이 궁금한가요?<input type="search" id="helper-q" data-input="helper" placeholder="예: 지층이 왜 기울었나요, 건열, 스탬프" autocomplete="off"></label><p class="small muted">인터넷 검색이나 AI가 아니라, 이 앱에 담긴 해설·용어·개념에서 찾아 드립니다.</p><div id="helper-out">' + helperOut('') + '</div>', init: function (el) { paint(el); } }; };

  /* ---------- 설정 · 소개 ---------- */
  V.views.prefs = function () {
    var P = S.prefs, seg = function (k, opts) { return '<div class="seg" role="group">' + opts.map(function (o) { return '<button data-act="pref" data-k="' + k + '" data-v="' + o[0] + '" aria-pressed="' + (String(P[k]) === String(o[0])) + '">' + o[1] + '</button>'; }).join('') + '</div>'; };
    return { title: '설정', back: true, html:
      '<div class="card"><b>글자 크기</b>' + seg('font', [['m', '보통'], ['l', '크게'], ['xl', '아주 크게']]) + '<b>화면 밝기</b>' + seg('theme', [['auto', '기기 설정'], ['light', '밝게'], ['dark', '어둡게']]) + '<b>해설 읽는 속도</b>' + seg('rate', [[0.85, '천천히'], [1, '보통'], [1.2, '빠르게']]) + '</div>' +
      '<div class="card"><b>위치 사용</b>' + seg('loc', [[true, '앱을 열면 켜기'], [false, '필요할 때만']]) + '<p class="small muted">위치는 가까운 명소 안내, 도착 스탬프, 지도 표시에만 쓰이며 기기 밖으로 나가지 않습니다.</p><b>나침반 편각 보정 (진북 기준)</b>' + seg('decl', [[true, '보정함 (서편각 8°)'], [false, '보정 안 함 (자북)']]) + '</div>' +
      '<div class="list">' + li('#about', 'info', '앱 소개와 자료 출처', '') + '</div>' +
      '<div class="card"><b>기록 지우기</b><p class="small muted">스탬프, 퀴즈 결과, 조사 노트, 내 정보를 이 기기에서 모두 지웁니다.</p><button class="btn" data-act="reset">' + ic('trash') + '모두 지우기</button></div>' };
  };
  V.acts.reset = function () { A.sheet('<h2 class="h2">정말 모두 지울까요?</h2><p>스탬프 ' + A.stampCount() + '개, 조사 노트 ' + S.notes.length + '개를 포함한 모든 기록이 사라지고 되돌릴 수 없습니다.</p><button class="btn hot block" data-act="reset-yes">네, 모두 지웁니다</button><button class="btn block" data-act="close-sheet">취소</button>'); };
  V.acts['reset-yes'] = function () { try { localStorage.removeItem(A.KEY); } catch (e) { } location.hash = '#home'; location.reload(); };
  V.views.about = function () { return { title: '앱 소개', back: true, html:
    '<div class="card prose"><h2 class="h2">의성 지오트립</h2><p>고등학생이 의성 국가지질공원의 지질명소 12곳을 답사하면서 지구과학 교과 내용을 현장에서 확인하도록 돕는 학습용 앱입니다. 해설을 듣고, AR 렌즈로 노두를 비춰 보고, 주향과 경사를 재고, 퀴즈로 정리합니다.</p><p><b>이 앱은 의성군이나 의성 국가지질공원이 만든 공식 앱이 아닙니다.</b> 학교 수업을 위해 만든 비공식 학습 도구이며, 탐방 시설과 운영 정보는 바뀔 수 있으니 방문 전 의성군에 확인하세요.</p></div>' +
    ui.sec('내용의 바탕이 된 자료', '<div class="card"><ul style="margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:6px" class="small">' + GEO.sources.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><p class="small muted">해설 문장은 위 자료의 사실과 수치를 바탕으로 고등학생 눈높이에 맞게 새로 쓴 것입니다. 연구가 진행되면 해석이 달라질 수 있습니다.</p></div>') +
    ui.sec('그림과 사진', '<div class="card"><p class="small">명소 화면의 그림은 실제 사진이 아니라 특징을 강조해 그린 장면 일러스트입니다. 직접 찍은 사진을 <span class="mono">img/sites/명소ID.jpg</span> (예: <span class="mono">jeori.jpg</span>) 이름으로 넣으면 그림 대신 사진이 보입니다. 자세한 방법은 앱 폴더의 사용 설명서를 보세요.</p></div>') +
    ui.sec('기기에 저장되는 것', '<div class="card"><p class="small">이름, 스탬프, 퀴즈 결과, 조사 노트와 사진은 이 기기의 브라우저 저장소에만 보관됩니다. 서버로 보내지 않으며, 브라우저 데이터를 지우면 함께 사라집니다.</p></div>') }; };

  /* ---------- 화면 전환 ---------- */
  var root, navs = 0, TABS = [['home', 'home', '홈'], ['map', 'map', '지도'], ['ar', 'lens', 'AR'], ['study', 'book', '학습'], ['pass', 'pass', '패스']];
  var TOP = { home: 1, map: 1, ar: 1, study: 1, pass: 1 };
  var TABOF = { sites: 'home', site: 'home', audio: 'home', prep: 'home', courses: 'home', course: 'home', story: 'home', concept: 'study', quiz: 'study', glossary: 'study', timeline: 'study', tools: 'study', clino: 'study', speed: 'study', notes: 'study', helper: 'study', prefs: 'home', about: 'home' };
  function parse() { var h = (location.hash || '#home').slice(1); try { h = decodeURIComponent(h); } catch (e) { } var i = h.indexOf('-'); return i < 0 ? { name: h || 'home', arg: null } : { name: h.slice(0, i), arg: h.slice(i + 1) }; }
  function paint(el) { $$('canvas[data-scene]', el).forEach(function (c) { try { GEO.scene.paint(c, c.dataset.scene); } catch (e) { } }); }
  V.paint = paint;
  V.render = function (keep) {
    var r = parse(), y = window.scrollY, arSite = null;
    if (r.name === 'ar' && r.arg && A.site(r.arg)) { arSite = A.site(r.arg); r = { name: 'site', arg: arSite.id, viaAr: true }; }
    var fn = V.views[r.name] || V.views.home, v = fn(r.arg) || V.views.home();
    var tab = TOP[r.name] ? r.name : (r.viaAr ? 'ar' : TABOF[r.name] || 'home');
    root.innerHTML =
      '<header class="top">' + (v.back ? '<button class="icon-btn plain" data-act="back" aria-label="뒤로">' + ic('back') + '</button>' : '<svg class="brand-dot" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="var(--accent)"/><path d="M6 22l7-11 4 6 3-4 6 9z" fill="var(--accent-ink)"/><circle cx="23" cy="9" r="2.4" fill="var(--accent-ink)"/></svg>') + '<h1>' + esc(v.title) + '</h1><a class="icon-btn" href="#helper" aria-label="묻고 답하기">' + ic('search') + '</a><a class="icon-btn" href="#prefs" aria-label="설정">' + ic('gear') + '</a></header>' +
      '<main id="main">' + v.html + '</main>' +
      '<nav class="tabs" aria-label="주요 메뉴"><div class="tabs-in">' + TABS.map(function (t) { var cur = tab === t[0] ? ' aria-current="page"' : ''; return t[0] === 'ar' ? '<a class="tab tab-ar" href="#ar"' + cur + '><span class="lens">' + ic('lens') + '</span><span>AR 렌즈</span></a>' : '<a class="tab" href="#' + t[0] + '"' + cur + '>' + ic(t[1]) + '<span>' + t[2] + '</span></a>'; }).join('') + '</div></nav>';
    paint(root); if (v.init) { try { v.init($('#main')); } catch (e) { } }
    window.scrollTo(0, keep ? y : 0); V.player();
    if (arSite) GEO.ar.open(arSite); else if (GEO.ar && GEO.ar.isOpen()) GEO.ar.close(true);
  };
  V.acts.back = function () { if (navs > 0) history.back(); else location.hash = '#home'; };
  V.goBack = V.acts.back;
  V.canBack = function () { return navs > 0; };

  document.addEventListener('click', function (e) { var t = e.target.closest ? e.target.closest('[data-act]') : null; if (!t || t.disabled) return; var f = V.acts[t.dataset.act]; if (f) { if (t.tagName !== 'A') e.preventDefault(); f(t, e); } });
  document.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('g[data-act]')) { e.preventDefault(); V.acts[e.target.dataset.act](e.target, e); } if (e.key === 'Escape') { A.closeSheet(); } });
  document.addEventListener('change', function (e) { var t = e.target, k = t.dataset && t.dataset.change; if (k && V.changes[k]) V.changes[k](t); });
  document.addEventListener('input', function (e) { var t = e.target, k = t.dataset && t.dataset.input; if (k && V.inputs[k]) V.inputs[k](t); });
  window.addEventListener('hashchange', function () { navs++; A.closeSheet(); V.render(); });
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (!(GEO.ar && GEO.ar.isOpen())) paint(root); }, 250); });

  V.boot = function () {
    root = $('#app');
    if (S.prefs.loc) geo.start();
    var told = {};
    geo.subs.push(function (g) { if (!g.pos) return true; var n = g.nearest(); if (n && g.inside(n.s) && !told[n.s.id] && !S.stamps[n.s.id]) { told[n.s.id] = 1; A.toast(n.s.name + '에 도착했어요. 해설을 듣고 도착 인증을 해 보세요.', 5000); } return true; });
    V.render();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', V.boot); else setTimeout(V.boot, 0);
})();
