/* 의성 지오트립 — 개념 카드 그림
   처음 배우는 사람을 위한 단순한 도해입니다. 직접 그린 SVG이며 색은 앱의 테마 변수를 따릅니다.
   GEO.fig('rock3') 처럼 부르면 <figure> HTML 문자열을 돌려줍니다. */
(function () {
  'use strict';
  var GEO = window.GEO = window.GEO || {};
  var INK = 'var(--ink)', INK2 = 'var(--ink-2)', INK3 = 'var(--ink-3)', C2 = 'var(--card-2)';
  var SED = 'var(--c-sed)', SEDS = 'var(--c-sed-soft)', VOL = 'var(--c-volcano)', VOLS = 'var(--c-volcano-soft)', LAND = 'var(--c-land)', LANDS = 'var(--c-land-soft)', FOS = 'var(--c-fossil)', FOSS = 'var(--c-fossil-soft)', HOT = 'var(--hot)', HOTS = 'var(--hot-soft)', ACC = 'var(--accent)', ACCS = 'var(--accent-soft)';

  function n(v) { return Math.round(v * 10) / 10; }
  function T(x, y, s, o) { o = o || {}; return '<text x="' + n(x) + '" y="' + n(y) + '" text-anchor="' + (o.a || 'middle') + '" font-size="' + (o.z || 11) + '"' + (o.b ? ' font-weight="700"' : '') + ' fill="' + (o.f || INK) + '">' + s + '</text>'; }
  function R(x, y, w, h, f, s, rx) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" rx="' + (rx == null ? 4 : rx) + '" fill="' + f + '"' + (s ? ' stroke="' + s + '"' : '') + '/>'; }
  function L(x1, y1, x2, y2, c, w, d) { return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '" stroke="' + (c || INK3) + '" stroke-width="' + (w || 1.5) + '"' + (d ? ' stroke-dasharray="' + d + '"' : '') + ' stroke-linecap="round"/>'; }
  function AR(x1, y1, x2, y2, c, w) { c = c || INK2; var a = Math.atan2(y2 - y1, x2 - x1), s = 7, bx = x2 - Math.cos(a) * s, by = y2 - Math.sin(a) * s, px = Math.sin(a) * s * 0.55, py = -Math.cos(a) * s * 0.55; return L(x1, y1, bx, by, c, w || 2) + '<polygon points="' + n(x2) + ',' + n(y2) + ' ' + n(bx + px) + ',' + n(by + py) + ' ' + n(bx - px) + ',' + n(by - py) + '" fill="' + c + '"/>'; }
  function P(d, f, s, w) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (s ? ' stroke="' + s + '" stroke-width="' + (w || 1.5) + '" stroke-linejoin="round" stroke-linecap="round"' : '') + '/>'; }
  function PG(pts, f, s, o) { return '<polygon points="' + pts + '" fill="' + f + '"' + (s ? ' stroke="' + s + '"' : '') + (o ? ' opacity="' + o + '"' : '') + '/>'; }
  function C(x, y, r, f, o, s) { return '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(r) + '" fill="' + f + '"' + (o ? ' opacity="' + o + '"' : '') + (s ? ' stroke="' + s + '"' : '') + '/>'; }
  /* 작은 칸: 안쪽 그림은 칸 밖으로 넘치지 않는다 */
  function sub(x, y, w, h, body) { return '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="none" stroke="var(--line)"/>'; }
  function rnd(seed) { var s = seed; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function wrap(h, body, cap) { return '<figure class="card fig"><svg viewBox="0 0 320 ' + h + '" role="img" aria-label="' + cap + '">' + body + '</svg><figcaption>' + cap + '</figcaption></figure>'; }
  function two(x, y, name, note) { return T(x, y, name, { b: 1 }) + T(x, y + 13, note, { z: 9.5, f: INK2 }); }

  var F = {};

  /* 암석의 순환 */
  F.rock3 = function () {
    var box = function (x, y, label, f, s) { return R(x, y, 100, 34, f, s, 8) + T(x + 50, y + 22, label, { b: 1, f: s }); };
    var b = box(110, 8, '화성암', VOLS, VOL) + box(208, 142, '퇴적암', SEDS, SED) + box(12, 142, '변성암', LANDS, LAND) +
      '<ellipse cx="160" cy="104" rx="44" ry="18" fill="' + HOTS + '" stroke="' + HOT + '"/>' + T(160, 108, '마그마', { b: 1, f: HOT }) +
      AR(207, 44, 250, 138) + T(270, 88, '부서지고', { z: 10.5, f: INK2 }) + T(270, 101, '쌓여서', { z: 10.5, f: INK2 }) +
      AR(204, 159, 117, 159) + T(160, 152, '열과 압력', { z: 10.5, f: INK2 }) +
      AR(80, 139, 124, 116) + T(66, 122, '녹아서', { z: 10.5, f: INK2 }) +
      AR(160, 84, 160, 46) + T(186, 68, '식어서', { z: 10.5, f: INK2 });
    return wrap(184, b, '암석은 한 가족에 머물지 않고 돌고 돕니다. 이것을 암석의 순환이라고 해요.');
  };

  /* 알갱이 크기와 퇴적암 */
  F.grain = function () {
    var rr = rnd(11), b = '', cols = [[14, '자갈 → 역암', 3, 3, 10.5], [116, '모래 → 사암', 8, 7, 3.6], [218, '진흙 → 이암', 20, 17, 1.2]];
    cols.forEach(function (c) {
      b += R(c[0], 8, 88, 78, SEDS, SED);
      var cw = 88 / c[2], ch = 78 / c[3], jx = Math.max(0, cw / 2 - c[4] - 1), jy = Math.max(0, ch / 2 - c[4] - 1);
      for (var i = 0; i < c[2]; i++) for (var j = 0; j < c[3]; j++) b += C(c[0] + cw * (i + 0.5) + (rr() * 2 - 1) * jx, 8 + ch * (j + 0.5) + (rr() * 2 - 1) * jy, c[4] * (0.8 + rr() * 0.3), SED, 0.8);
      b += T(c[0] + 44, 102, c[1], { b: 1 });
    });
    b += AR(24, 122, 296, 122, INK3) + T(24, 138, '물살이 세다 · 산기슭', { a: 'start', z: 10.5, f: INK2 }) + T(296, 138, '물이 잔잔하다 · 호수', { a: 'end', z: 10.5, f: INK2 });
    return wrap(146, b, '알갱이가 클수록 센 물살이 필요합니다. 그래서 알갱이의 크기는 물의 힘을 알려 줘요.');
  };

  /* 지층의 순서 */
  F.laws = function () {
    var ys = [14, 42, 70, 98], cols = [C2, SEDS, C2, SEDS], lab = ['④ 가장 나중', '③', '②', '① 가장 먼저'], b = '';
    ys.forEach(function (y, i) { b += R(20, y, 190, 28, cols[i], SED, 0) + T(222, y + 18, lab[i], { a: 'start', b: i === 0 || i === 3 }); });
    b += PG('96,126 116,126 150,42 130,42', VOL, null, 0.9) + T(66, 88, '암맥', { b: 1, f: VOL }) + AR(82, 84, 110, 84, VOL, 1.5) +
      T(115, 143, '암맥은 ①②③보다 나중, ④보다 먼저', { z: 10.5, f: INK2 });
    return wrap(150, b, '아래층이 먼저 쌓였고, 지층을 자르고 들어온 암맥은 잘린 지층보다 나중에 생겼습니다.');
  };

  /* 퇴적 구조 네 가지 */
  F.structures = function () {
    var rr = rnd(5), b = '', s, i;
    s = R(0, 0, 140, 56, SEDS, null, 0) + L(0, 14, 140, 14, SED, 1.5) + L(0, 50, 140, 50, SED, 1.5);
    for (i = -1; i < 8; i++) s += L(4 + i * 19, 14, 30 + i * 19, 50, SED, 1.2);
    s += AR(44, 7, 98, 7, INK2, 1.5);
    b += sub(14, 8, 140, 56, s) + two(84, 78, '사층리', '비스듬한 줄 → 물이 흘러간 쪽');
    s = R(0, 0, 140, 56, SEDS, null, 0);
    [[47, 5, 12], [36, 3.6, 16], [27.5, 2.5, 22], [20, 1.7, 30], [14, 1.1, 40], [8.5, 0.8, 50]].forEach(function (r) { for (var k = 0; k < r[2]; k++) s += C(140 / r[2] * (k + 0.5) + (rr() - 0.5) * 1.5, r[0] + (rr() - 0.5) * 1.5, r[1], SED, 0.85); });
    b += sub(166, 8, 140, 56, s) + two(236, 78, '점이층리', '위로 갈수록 작은 알갱이');
    s = R(0, 0, 140, 56, C2, null, 0) + P('M18 12 q6 -4 12 0 t12 0 t12 0', null, LAND, 1.2) + P('M78 16 q6 -4 12 0 t12 0 t12 0', null, LAND, 1.2) +
      P('M0 56 L0 32 q8.75 -11 17.5 0 t17.5 0 t17.5 0 t17.5 0 t17.5 0 t17.5 0 t17.5 0 t17.5 0 L140 56 Z', SEDS, SED, 1.5);
    b += sub(14, 102, 140, 56, s) + two(84, 172, '연흔(물결자국)', '얕은 물의 물결이 남긴 주름');
    s = R(0, 0, 140, 56, HOTS, null, 0) + R(0, 0, 140, 12, SEDS, null, 0);
    [[22, 30], [54, 22], [88, 34], [118, 26]].forEach(function (w) { s += PG((w[0] - 7) + ',12 ' + (w[0] + 7) + ',12 ' + w[0] + ',' + (12 + w[1]), SEDS) + L(w[0] - 7, 12, w[0], 12 + w[1], SED, 1) + L(w[0] + 7, 12, w[0], 12 + w[1], SED, 1); });
    b += sub(166, 102, 140, 56, s) + two(236, 172, '건열', '말라서 갈라진 틈 (위가 넓다)');
    return wrap(192, b, '지층에 남은 네 가지 무늬. 쌓일 때의 물과 날씨를 알려 줍니다.');
  };

  /* 지질 시대 */
  F.time = function () {
    var b = T(20, 13, '지구의 역사 46억 년', { a: 'start', z: 10.5, f: INK2 }) + R(20, 19, 247, 16, C2, INK3, 0) + R(267, 19, 33, 16, ACCS, ACC, 0) + T(143, 31, '선캄브리아 시대', { z: 10 }) +
      T(300, 49, '마지막 5억 4천만 년을 늘여 보면 ↓', { a: 'end', z: 10, f: INK2 }) +
      T(20, 65, '5억 4천만 년 전', { a: 'start', z: 9, f: INK2 }) + T(170, 65, '2억 5천만', { z: 9, f: INK2 }) + T(262, 65, '6,600만', { a: 'end', z: 9, f: INK2 }) + T(300, 65, '지금', { a: 'end', z: 9, f: INK2 }) +
      R(20, 70, 149.6, 24, LANDS, LAND, 0) + R(169.6, 70, 96.3, 24, FOSS, FOS, 0) + R(265.9, 70, 34.1, 24, SEDS, SED, 0) +
      T(95, 86, '고생대', { b: 1, f: LAND }) + T(218, 86, '중생대', { b: 1, f: FOS }) + T(283, 85.5, '신생대', { z: 9, b: 1, f: SED }) +
      L(248.2, 94, 248.2, 106, FOS, 1.5) + C(248.2, 94, 2.5, FOS) + T(252, 117, '의성의 공룡 발자국 · 약 1억 년 전', { a: 'end', z: 10 }) +
      L(263.8, 94, 263.8, 124, VOL, 1.5) + C(263.8, 94, 2.5, VOL) + T(300, 135, '금성산 화산 · 약 7천만 년 전', { a: 'end', z: 10 });
    return wrap(142, b, '공룡은 중생대에 살았습니다. 의성의 지층은 대부분 중생대의 마지막 시기인 백악기에 쌓였어요.');
  };

  /* 묽은 마그마와 끈적한 마그마 */
  F.magma = function () {
    var rr = rnd(3), b = L(8, 110, 312, 110, INK3, 1.5) +
      P('M14 110 Q82 62 150 110 Z', C2, INK3) + P('M82 86 Q104 91 134 108', null, HOT, 5) + P('M82 86 Q62 91 36 107', null, HOT, 3.5) + C(82, 86, 4, HOT) +
      P('M178 110 L234 46 L254 46 L310 110 Z', C2, INK3);
    for (var i = 0; i < 18; i++) b += C(190 + rr() * 110, 40 + rr() * 56, 1.3, VOL, 0.7);
    [[244, 30, 13], [230, 24, 10], [258, 22, 11], [244, 13, 10], [226, 38, 7], [262, 37, 7]].forEach(function (c) { b += C(c[0], c[1], c[2], VOLS, null, VOL); });
    b += T(82, 127, '묽은 마그마', { b: 1 }) + T(82, 141, '조용히 흐른다 → 현무암', { z: 10, f: INK2 }) + T(244, 127, '끈적한 마그마', { b: 1 }) + T(244, 141, '폭발한다 → 화산재, 응회암', { z: 10, f: INK2 });
    return wrap(148, b, '마그마가 묽으면 흘러나오고, 끈적하면 가스가 갇혔다가 폭발합니다.');
  };

  /* 절리·단층·습곡·경동 */
  F.deform = function () {
    var b = '', s, k;
    s = R(0, 0, 140, 56, SEDS, null, 0) + R(0, 19, 140, 19, C2, null, 0) + L(0, 19, 140, 19, SED, 1.2) + L(0, 38, 140, 38, SED, 1.2) + L(38, 0, 36, 56, INK, 1.6) + L(74, 0, 76, 56, INK, 1.6) + L(108, 0, 106, 56, INK, 1.6);
    b += sub(14, 8, 140, 56, s) + two(84, 78, '절리', '틈만 있고 어긋나지 않았다');
    /* 오른쪽(단층면 위쪽) 덩어리가 아래로 내려간 정단층 */
    s = R(0, 0, 140, 56, SEDS, null, 0) + PG('0,19 65.5,19 75,38 0,38', C2) + PG('70,28 140,28 140,47 79.5,47', C2) + L(0, 19, 65.5, 19, SED, 1.2) + L(0, 38, 75, 38, SED, 1.2) + L(70, 28, 140, 28, SED, 1.2) + L(79.5, 47, 140, 47, SED, 1.2) + L(56, 0, 84, 56, INK, 1.8) + AR(72, 4, 79, 18, INK2, 1.5);
    b += sub(166, 8, 140, 56, s) + two(236, 78, '단층', '틈을 따라 양쪽이 어긋났다');
    s = R(0, 0, 140, 56, SEDS, null, 0);
    [12, 26, 40].forEach(function (y) { s += P('M-17.5 ' + (y + 4) + ' q17.5 -16 35 0 t35 0 t35 0 t35 0 t35 0', null, SED, 1.5); });
    b += sub(14, 102, 140, 56, s) + two(84, 172, '습곡', '지층이 물결처럼 휘었다');
    s = R(0, 0, 140, 56, SEDS, null, 0);
    for (k = -3; k < 5; k++) s += L(0, k * 14 + 2, 140, k * 14 + 42, SED, 1.5);
    b += sub(166, 102, 140, 56, s) + two(236, 172, '경동', '지층이 한쪽으로 기울었다');
    return wrap(192, b, '암석이 큰 힘을 받으면 틈이 생기고, 어긋나고, 휘고, 기울어집니다.');
  };

  /* 반감기 */
  F.half = function () {
    var b = '', xs = [34, 108, 182, 256], fr = ['1', '1/2', '1/4', '1/8'], lb = ['처음', '반감기 1번', '2번', '3번'];
    xs.forEach(function (x, k) { var h = 80 / Math.pow(2, k); b += R(x, 26, 36, 80, C2, INK3, 0) + R(x, 106 - h, 36, h, ACC, null, 0) + T(x + 18, 20, fr[k], { b: 1 }) + T(x + 18, 121, lb[k], { z: 10.5 }); if (k < 3) b += AR(x + 42, 66, x + 68, 66, INK3, 1.5); });
    b += R(52, 132, 10, 10, ACC, null, 2) + T(67, 141, '처음 원소(남은 양)', { a: 'start', z: 10, f: INK2 }) + R(190, 132, 10, 10, C2, INK3, 2) + T(205, 141, '바뀐 원소', { a: 'start', z: 10, f: INK2 });
    return wrap(148, b, '반감기가 한 번 지날 때마다 처음 원소는 절반씩 줄어듭니다.');
  };

  /* 열쇠층으로 지층 맞춰 보기 */
  F.correl = function () {
    var col = function (x, y, hs, cs) { var s = '', yy = y; hs.forEach(function (h, i) { s += R(x, yy, 80, h, cs[i], cs[i] === VOL ? VOL : SED, 0); yy += h; }); return s; };
    var b = T(80, 13, 'A 지역', { b: 1 }) + T(240, 13, 'B 지역', { b: 1 }) +
      col(40, 20, [24, 12, 32, 30], [SEDS, VOL, C2, SEDS]) + col(200, 20, [40, 12, 20, 26], [C2, VOL, SEDS, C2]) +
      L(120, 44, 200, 60, VOL, 1.2, '4 3') + L(120, 56, 200, 72, VOL, 1.2, '4 3') + T(160, 43, '같은 때', { z: 10, b: 1, f: VOL }) +
      T(160, 138, '색이 진한 화산재층이 같으면 같은 때에 쌓인 층', { z: 10.5, f: INK2 });
    return wrap(146, b, '모습이 다른 두 곳의 지층도 같은 화산재층을 찾으면 시간을 맞출 수 있습니다.');
  };

  /* 칼데라가 생기는 과정 */
  F.caldera = function () {
    var b = '', s, flat = [50, 60, 70].map(function (y) { return L(0, y, 96, y, SED, 1); }).join(''), cone = P('M22 40 L44 16 L52 16 L74 40 Z', C2, INK3);
    s = R(0, 40, 96, 44, SEDS, null, 0) + flat + cone + R(45, 16, 6, 46, HOT, null, 0) + '<ellipse cx="48" cy="68" rx="26" ry="10" fill="' + HOT + '"/>';
    b += sub(8, 8, 96, 84, s) + T(56, 106, '① 마그마가 차오른다', { z: 9.5 });
    s = R(0, 40, 96, 44, SEDS, null, 0) + flat + cone + '<ellipse cx="48" cy="68" rx="26" ry="10" fill="' + HOTS + '" stroke="' + HOT + '" stroke-dasharray="3 3"/>' + C(48, 9, 9, VOLS, null, VOL) + C(36, 13, 6, VOLS, null, VOL) + C(60, 13, 6, VOLS, null, VOL);
    b += sub(112, 8, 96, 84, s) + T(160, 106, '② 대폭발로 속이 빈다', { z: 9.5 });
    s = P('M0 40 L24 40 L38 53 L58 53 L72 40 L96 40 L96 84 L0 84 Z', SEDS) + PG('24,40 38,53 58,53 72,40', VOLS, VOL);
    [56, 65, 74].forEach(function (y) { s += P('M0 ' + y + ' L20 ' + y + ' L40 ' + (y + 9) + ' L56 ' + (y + 9) + ' L76 ' + y + ' L96 ' + y, null, SED, 1); });
    s += AR(48, 22, 48, 38, INK2, 1.5);
    b += sub(216, 8, 96, 84, s) + T(264, 106, '③ 가운데가 꺼진다', { z: 9.5 });
    return wrap(114, b, '큰 폭발로 땅속이 비면 화산의 가운데가 내려앉고, 주변 지층은 가운데 쪽으로 기울어집니다.');
  };

  /* 얼음골의 공기 흐름 */
  F.air = function () {
    var b = '', panel = function (x, summer) {
      var rr = rnd(9), s = PG('0,84 0,6 24,6 26,30 122,80 150,80 150,84', C2, INK3), t, px, py;
      for (var i = 0; i < 16; i++) { t = i / 15; px = 36 + t * 96; py = 30 + t * 46; s += C(px + (rr() - 0.5) * 4, py - 2 + (rr() - 0.5) * 3, 4 + rr() * 2.5, INK3, 0.55) + C(px + 6 + (rr() - 0.5) * 4, py - 9 + (rr() - 0.5) * 3, 3 + rr() * 2, INK3, 0.4); }
      if (summer) s += AR(112, 66, 146, 72, LAND, 2.5) + T(146, 46, '찬 바람', { a: 'end', z: 9.5, b: 1, f: LAND }) + AR(74, 8, 50, 24, HOT, 2) + T(80, 12, '더운 공기', { a: 'start', z: 9.5, b: 1, f: HOT });
      else s += AR(146, 72, 114, 66, LAND, 2.5) + T(146, 46, '찬 공기', { a: 'end', z: 9.5, b: 1, f: LAND }) + AR(50, 24, 74, 8, HOT, 2) + T(80, 12, '따뜻한 공기', { a: 'start', z: 9.5, b: 1, f: HOT });
      return sub(x, 8, 150, 84, s);
    };
    b += panel(6, true) + two(81, 106, '여름', '냉기가 아래 구멍으로 흘러나온다') + panel(164, false) + two(239, 106, '겨울', '찬 공기가 아래에서 빨려 든다');
    return wrap(126, b, '찬 공기는 무거워 아래로, 더운 공기는 가벼워 위로. 돌무더기가 계절마다 숨을 쉽니다.');
  };

  GEO.fig = function (id) { try { return F[id] ? F[id]() : ''; } catch (e) { return ''; } };
  GEO.figIds = Object.keys(F);
})();
