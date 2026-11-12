/* 의성 지오트립 — 장면 그리기(노두 일러스트)와 ‘시간 여행’ 애니메이션
   사진 대신 쓰는 그림입니다. img/sites/<id>.jpg 파일을 넣으면 명소 화면에서는 사진이 대신 보입니다. */
(function () {
  'use strict';
  var GEO = window.GEO = window.GEO || {};
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var TAU = Math.PI * 2;

  /* ---------- 공통 붓 ---------- */
  function sky(c, w, h, a, b, to) { var g = c.createLinearGradient(0, 0, 0, h * (to || 0.6)); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  function ridge(c, w, y, amp, col, R, base) { c.fillStyle = col; c.beginPath(); c.moveTo(0, base); var x = 0, p = R() * 9; c.lineTo(0, y); for (x = 0; x <= w; x += w / 40) { c.lineTo(x, y - amp * (0.5 + 0.5 * Math.sin(x / w * 5 + p)) - amp * 0.35 * Math.sin(x / w * 13 + p * 2)); } c.lineTo(w, base); c.closePath(); c.fill(); }
  function blobTrees(c, x0, x1, y, s, n, R, cols) { for (var i = 0; i < n; i++) { var x = x0 + (x1 - x0) * R(), r = s * (0.6 + R() * 0.8); c.fillStyle = cols[Math.floor(R() * cols.length)]; c.beginPath(); c.arc(x, y - r * 0.6 + (R() - 0.5) * s, r, 0, TAU); c.fill(); } }
  function speck(c, x, y, w, h, n, R, cols, s) { for (var i = 0; i < n; i++) { c.fillStyle = cols[Math.floor(R() * cols.length)]; var r = s * (0.5 + R()); c.fillRect(x + R() * w, y + R() * h, r, r); } }
  function bands(c, x, y, w, h, n, R, cols, wob) { var t = y; for (var i = 0; i < n; i++) { var bh = h / n * (0.6 + R() * 0.8); c.fillStyle = cols[Math.floor(R() * cols.length)]; c.beginPath(); c.moveTo(x, t); for (var k = 0; k <= 10; k++) c.lineTo(x + w * k / 10, t + Math.sin(k * 1.3 + i) * (wob || 0)); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); c.fill(); t += bh; if (t > y + h) break; } }
  function ell(c, x, y, rx, ry, rot, fill, stroke) { c.beginPath(); c.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), rot || 0, 0, TAU); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.stroke(); } }
  function poly(c, pts, fill, stroke, lw) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); } }

  /* 발자국: kind = sauro | ornitho | thero */
  function foot(c, kind, x, y, s, rot, fill) {
    c.save(); c.translate(x, y); c.rotate(rot || 0); c.fillStyle = fill || 'rgba(60,40,30,.55)';
    if (kind === 'sauro') { ell(c, 0, 0, s * 0.8, s, 0, c.fillStyle); ell(c, s * 0.15, -s * 1.45, s * 0.5, s * 0.3, 0.2, c.fillStyle); }
    else if (kind === 'ornitho') { ell(c, 0, s * 0.35, s * 0.5, s * 0.5, 0, c.fillStyle); [-0.6, 0, 0.6].forEach(function (a) { c.save(); c.rotate(a); ell(c, 0, -s * 0.45, s * 0.3, s * 0.62, 0, c.fillStyle); c.restore(); }); }
    else { [-0.5, 0, 0.5].forEach(function (a, i) { c.save(); c.rotate(a); c.beginPath(); c.moveTo(-s * 0.17, s * 0.5); c.lineTo(0, -s * (i === 1 ? 1.25 : 0.95)); c.lineTo(s * 0.17, s * 0.5); c.closePath(); c.fill(); c.restore(); }); }
    c.restore();
  }
  function trackway(c, kind, x0, y0, x1, y1, n, s, off, fill) { var ang = Math.atan2(y1 - y0, x1 - x0); for (var i = 0; i < n; i++) { var t = i / (n - 1 || 1), side = i % 2 ? 1 : -1; var x = x0 + (x1 - x0) * t - Math.sin(ang) * off * side, y = y0 + (y1 - y0) * t + Math.cos(ang) * off * side; foot(c, kind, x, y, s, ang + Math.PI / 2, fill); } }
  GEO.foot = foot;

  /* ---------- 12개 장면 ---------- */
  var P = {};
  P.basin = function (c, w, h, R) {
    sky(c, w, h, '#bfe0ef', '#eef6e2', 0.5);
    ridge(c, w, h * 0.3, h * 0.07, '#8fb0a8', R, h); ridge(c, w, h * 0.36, h * 0.06, '#6f9a86', R, h);
    c.fillStyle = '#b9d47a'; c.fillRect(0, h * 0.36, w, h);
    for (var r = 0; r < 9; r++) { var y0 = h * (0.38 + 0.62 * Math.pow(r / 9, 1.5)), y1 = h * (0.38 + 0.62 * Math.pow((r + 1) / 9, 1.5)); var n = 4 + r; for (var k = 0; k < n; k++) { c.fillStyle = ['#c7dc7f', '#a9cc6b', '#d8e08a', '#9cc267', '#e3d98a'][Math.floor(R() * 5)]; var xa = w * k / n, xb = w * (k + 1) / n; poly(c, [[xa + (xa - w / 2) * 0.0, y0], [xb, y0], [xb + (xb - w / 2) * 0.08, y1], [xa + (xa - w / 2) * 0.08, y1]], c.fillStyle, 'rgba(255,255,255,.35)', 1); } }
    for (var i = 0; i < 5; i++) { ell(c, w * (0.52 + i * 0.09), h * (0.5 - i * 0.025), w * 0.06, h * 0.022, -0.25, '#4f7f5a'); }
    c.strokeStyle = '#8cc6e6'; c.lineWidth = Math.max(3, h * 0.022); c.lineCap = 'round'; c.beginPath(); c.moveTo(-10, h * 0.62); c.bezierCurveTo(w * 0.18, h * 0.5, w * 0.2, h * 0.62, w * 0.34, h * 0.52); c.bezierCurveTo(w * 0.44, h * 0.45, w * 0.36, h * 0.41, w * 0.5, h * 0.39); c.stroke();
    poly(c, [[w * 0.8, h * 0.1], [w * 0.83, h * 0.14], [w * 0.8, h * 0.19], [w * 0.77, h * 0.14]], '#e4572e'); c.strokeStyle = '#7a5b46'; c.lineWidth = 1; c.beginPath(); c.moveTo(w * 0.8, h * 0.19); c.quadraticCurveTo(w * 0.76, h * 0.3, w * 0.7, h * 0.4); c.stroke();
  };
  P.conglo = function (c, w, h, R) {
    sky(c, w, h, '#cfe6f2', '#e9f2df', 0.3); ridge(c, w, h * 0.2, h * 0.06, '#6f9a6a', R, h); blobTrees(c, 0, w, h * 0.22, h * 0.05, 26, R, ['#4d7c4f', '#5f8f58', '#3f6c47']);
    var y = h * 0.24, beds = [['g', 0.16], ['m', 0.05], ['g', 0.2], ['m', 0.07], ['g', 0.18], ['m', 0.05], ['g', 0.2]];
    beds.forEach(function (b, bi) { var bh = h * b[1]; c.fillStyle = b[0] === 'g' ? '#c9b48c' : '#8c5a78'; c.fillRect(0, y, w, bh + 1);
      if (b[0] === 'g') { var n = Math.round(w * bh / 260); for (var i = 0; i < n; i++) { var s = Math.pow(R(), 2.2) * bh * 0.22 + bh * 0.03; var imb = bi === 2 ? -0.45 : (R() - 0.5) * 1.6; ell(c, R() * w, y + s + R() * (bh - 2 * s), s * 1.5, s, imb, ['#9c9a94', '#e8e3d8', '#b7a59a', '#d9c7b8', '#857f7a', '#f1ece2'][Math.floor(R() * 6)], 'rgba(60,45,30,.25)'); } }
      else { c.strokeStyle = 'rgba(255,255,255,.14)'; for (var k = 1; k < 4; k++) { c.beginPath(); c.moveTo(0, y + bh * k / 4); c.lineTo(w, y + bh * k / 4); c.stroke(); } }
      y += bh; });
    ell(c, w * 0.7, h * 0.55, h * 0.085, h * 0.06, -0.2, '#b9b4ac', 'rgba(50,40,30,.4)');
    for (var f = 0; f < 7; f++) { var fx = w * (0.1 + R() * 0.2), fy = h * (0.25 + R() * 0.08); c.fillStyle = '#5d8f4e'; c.fillRect(fx, fy, 2, h * 0.03); ell(c, fx + 1, fy, h * 0.012, h * 0.012, 0, '#f2cf3a'); }
    c.fillStyle = '#7b8a5a'; c.fillRect(0, h * 0.93, w, h * 0.07);
  };
  P.cracks = function (c, w, h, R) {
    sky(c, w, h, '#d4e9f3', '#eef4e6', 0.2); blobTrees(c, 0, w, h * 0.12, h * 0.05, 30, R, ['#517d4b', '#6a9358', '#44703f']);
    c.fillStyle = '#d9c9a5'; c.fillRect(0, h * 0.13, w, h * 0.15); speck(c, 0, h * 0.13, w, h * 0.15, w / 3, R, ['#bfae88', '#efe4c6', '#a8946f'], 2);
    for (var q = 0; q < 6; q++) ell(c, w * (0.55 + R() * 0.25), h * (0.2 + R() * 0.06), h * 0.02, h * 0.008, R(), '#8b4f63');
    c.fillStyle = '#7f4a67'; c.fillRect(0, h * 0.28, w, h * 0.46); c.strokeStyle = 'rgba(255,255,255,.08)'; for (var k = 0; k < 12; k++) { c.beginPath(); c.moveTo(0, h * (0.3 + k * 0.037)); c.lineTo(w, h * (0.3 + k * 0.037)); c.stroke(); }
    var xs = [0.08, 0.2, 0.31, 0.42, 0.53, 0.66, 0.8, 0.92], ds = [0.2, 0.3, 0.16, 0.36, 0.24, 0.43, 0.32, 0.18];
    xs.forEach(function (x, i) { var tw = w * (0.012 + R() * 0.012), d = h * ds[i]; c.fillStyle = '#d9c9a5'; c.beginPath(); c.moveTo(w * x - tw, h * 0.28); c.lineTo(w * x + tw, h * 0.28); c.quadraticCurveTo(w * x + tw * 0.4 + (R() - 0.5) * 8, h * 0.28 + d * 0.6, w * x + (R() - 0.5) * 10, h * 0.28 + d); c.quadraticCurveTo(w * x - tw * 0.4, h * 0.28 + d * 0.6, w * x - tw, h * 0.28); c.fill();
      if (i === 6) { c.beginPath(); c.moveTo(w * x - 2, h * 0.28 + d * 0.5); c.lineTo(w * x + w * 0.03, h * 0.28 + d * 0.9); c.lineTo(w * x + 3, h * 0.28 + d * 0.55); c.fill(); } });
    c.fillStyle = '#cdbb95'; c.fillRect(0, h * 0.74, w, h * 0.12); speck(c, 0, h * 0.74, w, h * 0.12, w / 4, R, ['#b6a37c', '#e6dabb'], 2);
    c.fillStyle = '#9a927f'; c.fillRect(0, h * 0.86, w, h * 0.14); c.fillStyle = '#b7af9c'; c.fillRect(0, h * 0.86, w, h * 0.012);
  };
  P.nuruk = function (c, w, h, R) {
    sky(c, w, h, '#c6e2f1', '#eef5e4', 0.35); ridge(c, w, h * 0.24, h * 0.08, '#6c9a63', R, h); blobTrees(c, 0, w, h * 0.27, h * 0.05, 24, R, ['#4f7f4c', '#638f56']);
    var y = h * 0.28, rows = 7, rh = h * 0.075;
    for (var r = 0; r < rows; r++) { var x = -R() * w * 0.08; while (x < w) { var bw = w * (0.1 + R() * 0.13), rad = rh * (x > w * 0.6 ? 0.42 : 0.16); c.fillStyle = ['#d8b45e', '#cfa650', '#e0c173', '#c99d47'][Math.floor(R() * 4)]; c.beginPath(); if (c.roundRect) c.roundRect(x + 2, y + 2, bw - 4, rh - 4, rad); else c.rect(x + 2, y + 2, bw - 4, rh - 4); c.fill();
        if (r % 2 === 0) { c.save(); c.beginPath(); c.rect(x + 3, y + 3, bw - 6, rh - 6); c.clip(); c.strokeStyle = 'rgba(110,75,20,.45)'; c.lineWidth = 1; for (var k = -2; k < 9; k++) { c.beginPath(); c.moveTo(x + k * bw / 6, y + 2); c.quadraticCurveTo(x + k * bw / 6 + bw * 0.16, y + rh * 0.5, x + k * bw / 6 + bw * 0.34, y + rh - 2); c.stroke(); } c.restore(); }
        x += bw; } y += rh; }
    c.fillStyle = '#3c4048'; c.fillRect(0, y, w, h * 0.06); c.strokeStyle = 'rgba(255,255,255,.12)'; for (var s = 1; s < 4; s++) { c.beginPath(); c.moveTo(0, y + s * h * 0.015); c.lineTo(w, y + s * h * 0.015); c.stroke(); }
    c.fillStyle = '#97a37a'; c.fillRect(0, y + h * 0.06, w, h); ell(c, w * 0.3, h * 0.89, w * 0.1, h * 0.022, 0, '#7fbfe0', 'rgba(255,255,255,.6)');
    c.fillStyle = '#5a4634'; c.fillRect(w * 0.84, h * 0.72, w * 0.01, h * 0.12); c.fillRect(w * 0.93, h * 0.72, w * 0.01, h * 0.12); poly(c, [[w * 0.8, h * 0.73], [w * 0.89, h * 0.66], [w * 0.98, h * 0.73]], '#3b4a57');
  };
  P.pillars = function (c, w, h, R) {
    sky(c, w, h, '#c9e4f3', '#e6f1dc', 0.4); ridge(c, w, h * 0.3, h * 0.12, '#5f8f5c', R, h);
    blobTrees(c, 0, w, h * 0.5, h * 0.09, 60, R, ['#3f6f45', '#4f8050', '#35603d', '#5d8d58']);
    var ps = [[0.34, 0.2, 0.1, 0.5, 0.02], [0.47, 0.24, 0.07, 0.46, -0.03], [0.6, 0.18, 0.09, 0.5, 0.2], [0.26, 0.4, 0.06, 0.3, 0]];
    ps.forEach(function (p) { c.save(); c.translate(w * (p[0] + p[2] / 2), h * (p[1] + p[3])); c.rotate(p[4]); var pw = w * p[2], ph = h * p[3]; var g = c.createLinearGradient(-pw / 2, 0, pw / 2, 0); g.addColorStop(0, '#3a3f45'); g.addColorStop(0.6, '#555b62'); g.addColorStop(1, '#2e3238'); c.fillStyle = g; c.fillRect(-pw / 2, -ph, pw, ph); c.strokeStyle = 'rgba(255,255,255,.16)'; c.lineWidth = 1; for (var k = 1; k < 16; k++) { c.beginPath(); c.moveTo(-pw / 2, -ph * k / 16); c.lineTo(pw / 2, -ph * k / 16 - pw * 0.12); c.stroke(); } c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(pw * (R() * 0.3 - 0.1), -ph); c.lineTo(pw * (R() * 0.3 - 0.15), 0); c.stroke(); c.restore(); });
    blobTrees(c, 0, w, h * 0.78, h * 0.08, 40, R, ['#3b6a41', '#4b7b4c', '#2f5a39']);
    for (var i = 0; i < 9; i++) { var bx = w * (0.42 + R() * 0.28), by = h * (0.76 + R() * 0.1), bs = h * (0.02 + R() * 0.03); c.save(); c.translate(bx, by); c.rotate(R() * 2); c.fillStyle = '#4b5057'; c.fillRect(-bs, -bs * 0.6, bs * 2, bs * 1.2); c.restore(); }
    c.fillStyle = '#86a068'; c.fillRect(0, h * 0.9, w, h * 0.1);
  };
  P.cliff = function (c, w, h, R) {
    sky(c, w, h, '#c4e1f2', '#eaf3e2', 0.25); blobTrees(c, 0, w, h * 0.17, h * 0.07, 40, R, ['#4c7c4a', '#5e8f57', '#3e6c42']);
    bands(c, 0, h * 0.18, w, h * 0.56, 44, R, ['#3b4047', '#4a4f57', '#2f343a', '#565c63', '#44494f', '#8d8674'], 0.8);
    c.strokeStyle = '#b9ad8c'; c.lineWidth = Math.max(2, h * 0.012); c.beginPath(); c.moveTo(w * 0.46, h * 0.47); c.quadraticCurveTo(w * 0.55, h * 0.44, w * 0.6, h * 0.49); c.stroke(); c.beginPath(); c.moveTo(w * 0.64, h * 0.47); c.quadraticCurveTo(w * 0.7, h * 0.52, w * 0.79, h * 0.48); c.stroke();
    ell(c, w * 0.3, h * 0.73, w * 0.06, h * 0.05, 0, '#15181b');
    var g = c.createLinearGradient(0, h * 0.74, 0, h); g.addColorStop(0, '#5c8fa6'); g.addColorStop(1, '#3f7088'); c.fillStyle = g; c.fillRect(0, h * 0.74, w, h * 0.26);
    c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 1; for (var i = 0; i < 14; i++) { var y = h * (0.77 + R() * 0.2), x = R() * w; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * 0.06, y); c.stroke(); }
    c.fillStyle = '#fff'; ell(c, w * 0.8, h * 0.105, h * 0.022, h * 0.012, -0.3, '#fff'); c.fillRect(w * 0.8 + h * 0.012, h * 0.085, h * 0.006, h * 0.022); c.strokeStyle = '#d7b34a'; c.beginPath(); c.moveTo(w * 0.8 + h * 0.018, h * 0.086); c.lineTo(w * 0.8 + h * 0.04, h * 0.09); c.stroke();
  };
  P.slab = function (c, w, h, R) {
    sky(c, w, h, '#c9e3f2', '#e9f2e3', 0.3); blobTrees(c, w * 0.55, w, h * 0.16, h * 0.07, 14, R, ['#4f7f4c', '#3f6f45']);
    var A = [0, h * 0.34], B = [w, h * 0.16], C = [w, h * 0.86], D = [0, h * 0.86];
    var g = c.createLinearGradient(0, h * 0.2, 0, h * 0.86); g.addColorStop(0, '#c9a27c'); g.addColorStop(1, '#b98e6c'); poly(c, [A, B, C, D], g);
    c.save(); c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.lineTo(C[0], C[1]); c.lineTo(D[0], D[1]); c.closePath(); c.clip();
    c.strokeStyle = 'rgba(90,55,35,.22)'; c.lineWidth = 1; for (var k = 0; k < 9; k++) { c.beginPath(); c.moveTo(0, h * (0.4 + k * 0.06)); c.lineTo(w, h * (0.22 + k * 0.075)); c.stroke(); }
    speck(c, 0, h * 0.2, w, h * 0.66, w / 2, R, ['rgba(255,240,220,.25)', 'rgba(80,50,30,.18)'], 2);
    poly(c, [[w * 0.76, h * 0.86], [w * 0.8, h * 0.86], [w * 0.9, h * 0.16], [w * 0.86, h * 0.16]], '#e7ddd0', 'rgba(120,100,90,.5)');
    c.strokeStyle = 'rgba(60,40,30,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(w * 0.6, h * 0.24); c.lineTo(w * 0.72, h * 0.44); c.stroke(); c.beginPath(); c.moveTo(w * 0.63, h * 0.26); c.lineTo(w * 0.7, h * 0.38); c.stroke();
    c.strokeStyle = 'rgba(95,60,40,.5)'; c.lineWidth = 1.5; for (var r = 0; r < 7; r++) { c.beginPath(); for (var x = 0; x <= 12; x++) { var px = w * (0.12 + x * 0.02), py = h * (0.7 + r * 0.018) + Math.sin(x * 1.6) * h * 0.006 - x * h * 0.002; if (x) c.lineTo(px, py); else c.moveTo(px, py); } c.stroke(); }
    var fc = 'rgba(70,42,28,.5)'; trackway(c, 'sauro', w * 0.14, h * 0.62, w * 0.5, h * 0.44, 7, h * 0.03, h * 0.035, fc); trackway(c, 'sauro', w * 0.2, h * 0.52, w * 0.46, h * 0.36, 6, h * 0.026, h * 0.03, fc);
    trackway(c, 'ornitho', w * 0.5, h * 0.56, w * 0.7, h * 0.38, 7, h * 0.02, h * 0.016, fc); trackway(c, 'thero', w * 0.38, h * 0.78, w * 0.64, h * 0.6, 8, h * 0.018, h * 0.012, fc);
    c.restore();
    c.strokeStyle = '#8b97a3'; c.lineWidth = Math.max(2, Math.min(w, h) * 0.008); c.beginPath(); c.moveTo(0, h * 0.3); c.lineTo(w, h * 0.1); c.stroke(); c.globalAlpha = 0.5; c.lineWidth = Math.max(1.5, Math.min(w, h) * 0.005); for (var t = 0; t < 5; t++) { var tx = w * (0.08 + t * 0.21); c.beginPath(); c.moveTo(tx, h * (0.3 - (tx / w) * 0.2)); c.lineTo(tx + w * 0.02, h * 0.88); c.stroke(); } c.globalAlpha = 1;
    c.fillStyle = '#6b7178'; c.fillRect(0, h * 0.88, w, h * 0.12); c.fillStyle = '#e6c84f'; for (var d = 0; d < 6; d++) c.fillRect(w * (0.05 + d * 0.18), h * 0.94, w * 0.08, h * 0.008);
    c.strokeStyle = '#3c4349'; c.lineWidth = 1; for (var f = 0; f < 40; f++) { c.beginPath(); c.moveTo(w * f / 40, h * 0.84); c.lineTo(w * f / 40, h * 0.88); c.stroke(); } c.beginPath(); c.moveTo(0, h * 0.84); c.lineTo(w, h * 0.84); c.stroke();
  };
  P.slab2 = function (c, w, h, R) {
    c.fillStyle = '#6f8f5c'; c.fillRect(0, 0, w, h); blobTrees(c, 0, w, h * 0.12, h * 0.08, 30, R, ['#4a7a48', '#5d8d55', '#b7813a', '#3d6b42']);
    var L = [[[0.02, 0.2], [0.6, 0.14], [0.98, 0.24], [0.98, 0.46], [0.5, 0.4], [0.02, 0.44]], [[0.02, 0.44], [0.5, 0.4], [0.98, 0.46], [0.98, 0.66], [0.56, 0.62], [0.02, 0.7]], [[0.02, 0.7], [0.56, 0.62], [0.98, 0.66], [0.98, 0.96], [0.02, 0.96]]];
    var cols = ['#7d8a94', '#6d7b86', '#8793a0'];
    L.forEach(function (pl, i) { poly(c, pl.map(function (p) { return [p[0] * w, p[1] * h]; }), cols[i], '#3f4850', 2); });
    speck(c, 0, h * 0.16, w, h * 0.8, w / 2, R, ['rgba(255,255,255,.12)', 'rgba(20,30,40,.14)'], 2);
    poly(c, [[w * 0.5, h * 0.74], [w * 0.74, h * 0.72], [w * 0.78, h * 0.9], [w * 0.52, h * 0.92]], '#9a5a55'); for (var s = 0; s < 40; s++) ell(c, w * (0.53 + R() * 0.22), h * (0.75 + R() * 0.15), 2, 2, 0, '#e2c9b9');
    var fc = 'rgba(30,38,46,.55)';
    for (var i = 0; i < 6; i++) { var t = i / 9; foot(c, 'ornitho', w * (0.14 + t * 0.36) , h * (0.62 - t * 0.1) + (i % 2 ? 1 : -1) * h * 0.012, h * 0.011, 1.2, fc); }
    foot(c, 'ornitho', w * 0.385, h * 0.548, h * 0.011, 1.2, fc); foot(c, 'ornitho', w * 0.385, h * 0.572, h * 0.011, 1.2, fc);
    for (var j = 0; j < 4; j++) { var u = j / 9, sd = (j % 2 ? 1 : -1) * h * 0.014; foot(c, 'ornitho', w * (0.42 + u * 0.36), h * (0.545 - u * 0.1) + sd, h * 0.011, 1.2, fc); ell(c, w * (0.445 + u * 0.36), h * (0.537 - u * 0.1) + sd * 1.6, h * 0.005, h * 0.004, 0, fc); }
    trackway(c, 'sauro', w * 0.6, h * 0.36, w * 0.92, h * 0.28, 5, h * 0.03, h * 0.03, fc); trackway(c, 'thero', w * 0.22, h * 0.82, w * 0.56, h * 0.66, 7, h * 0.016, h * 0.012, fc);
    blobTrees(c, 0, w, h * 1.0, h * 0.05, 18, R, ['#4a7a48', '#6b9a5a']);
  };
  P.tuff = function (c, w, h, R) {
    sky(c, w, h, '#c8e3f2', '#ecf4e4', 0.2); blobTrees(c, 0, w, h * 0.1, h * 0.06, 34, R, ['#4c7c4a', '#5e8f57']);
    bands(c, 0, h * 0.1, w, h * 0.1, 7, R, ['#6d6258', '#7c7064', '#5e554c'], 1);
    var g = c.createLinearGradient(0, h * 0.2, w, h * 0.72); g.addColorStop(0, '#8a9488'); g.addColorStop(1, '#737d74'); c.fillStyle = g; c.fillRect(0, h * 0.2, w, h * 0.54);
    speck(c, 0, h * 0.2, w, h * 0.54, w * 1.6, R, ['#f1ede4', '#e9c9c0', '#d9dde0', '#565d57'], 2.6);
    for (var i = 0; i < 22; i++) ell(c, R() * w, h * (0.26 + R() * 0.44), h * (0.012 + R() * 0.035), h * (0.006 + R() * 0.012), (R() - 0.5) * 0.3, '#7b4f72', 'rgba(40,20,40,.3)');
    c.strokeStyle = 'rgba(30,40,35,.35)'; c.lineWidth = 1.5; for (var j = 0; j < 5; j++) { var x = w * (0.1 + R() * 0.8); c.beginPath(); c.moveTo(x, h * 0.2); c.lineTo(x + (R() - 0.5) * w * 0.06, h * 0.74); c.stroke(); }
    c.fillStyle = '#6d4763'; c.beginPath(); c.moveTo(0, h * 0.74); for (var k = 0; k <= 12; k++) c.lineTo(w * k / 12, h * 0.74 + Math.sin(k * 1.9) * h * 0.012); c.lineTo(w, h * 0.9); c.lineTo(0, h * 0.9); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.13)'; for (var m = 1; m < 6; m++) { c.beginPath(); c.moveTo(0, h * (0.76 + m * 0.022)); c.lineTo(w, h * (0.76 + m * 0.022)); c.stroke(); }
    c.fillStyle = '#8fa173'; c.fillRect(0, h * 0.9, w, h * 0.1);
    c.fillStyle = '#e4572e'; c.fillRect(w * 0.815, h * 0.845, h * 0.016, h * 0.03); ell(c, w * 0.815 + h * 0.008, h * 0.836, h * 0.008, h * 0.008, 0, '#f1c9a5'); c.fillStyle = '#2b3a55'; c.fillRect(w * 0.815, h * 0.875, h * 0.016, h * 0.025);
  };
  P.stromat = function (c, w, h, R) {
    c.fillStyle = '#34383d'; c.fillRect(0, 0, w, h); speck(c, 0, 0, w, h, w, R, ['rgba(255,255,255,.05)', 'rgba(0,0,0,.2)'], 2);
    c.strokeStyle = 'rgba(255,255,255,.08)'; for (var k = 0; k < 9; k++) { c.beginPath(); c.moveTo(0, h * (0.74 + k * 0.03)); c.lineTo(w, h * (0.74 + k * 0.03)); c.stroke(); }
    var domes = [[0.28, 0.34], [0.58, 0.28], [0.84, 0.2]];
    for (var L = 0; L < 26; L++) { var t = L / 26; c.beginPath(); for (var x = 0; x <= 60; x++) { var u = x / 60, y = 0.7 - t * 0.38; domes.forEach(function (d) { y -= t * d[1] * Math.exp(-Math.pow((u - d[0]) / 0.13, 2)); }); y += Math.sin(u * 40 + L) * 0.003; if (x) c.lineTo(u * w, y * h); else c.moveTo(u * w, y * h); } c.strokeStyle = L % 2 ? '#d9cfb8' : '#7a7466'; c.lineWidth = Math.max(1.5, h * (L % 2 ? 0.012 : 0.007)); c.stroke(); }
    ell(c, w * 0.82, h * 0.16, h * 0.07, h * 0.07, 0, '#b9bcc0', '#8a8d91'); c.fillStyle = '#6c6f73'; c.font = 'bold ' + Math.round(h * 0.05) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('100', w * 0.82, h * 0.165);
  };
  P.talus = function (c, w, h, R) {
    sky(c, w, h, '#c3e0f1', '#e8f2e2', 0.35); ridge(c, w, h * 0.22, h * 0.1, '#5c8c5a', R, h);
    poly(c, [[0, h * 0.14], [w * 0.5, h * 0.1], [w * 0.56, h * 0.42], [0, h * 0.5]], '#3d4248'); c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.5; for (var k = 0; k < 22; k++) { var x = w * k * 0.026; c.beginPath(); c.moveTo(x, h * 0.13); c.lineTo(x + w * 0.012, h * 0.5); c.stroke(); } c.strokeStyle = 'rgba(255,255,255,.1)'; for (var j = 0; j < 4; j++) { c.beginPath(); c.moveTo(0, h * (0.2 + j * 0.07)); c.lineTo(w * 0.55, h * (0.17 + j * 0.065)); c.stroke(); }
    poly(c, [[0, h * 0.46], [w * 0.56, h * 0.36], [w * 0.92, h * 0.8], [0, h * 0.84]], '#6a7078');
    for (var i = 0; i < 260; i++) { var u = R(), v = R(); var bx = w * (u * 0.9 * (0.35 + v * 0.65)), by = h * (0.4 + v * 0.42 - u * 0.06 * (1 - v)); var s = h * (0.01 + R() * 0.024) * (0.6 + v * 0.7); c.save(); c.translate(bx, by); c.rotate(R() * 3); c.fillStyle = ['#565c63', '#7a8088', '#484d53', '#8c9299', '#63696f'][Math.floor(R() * 5)]; c.beginPath(); c.moveTo(-s, -s * 0.6); c.lineTo(s * 0.8, -s * 0.7); c.lineTo(s, s * 0.5); c.lineTo(-s * 0.7, s * 0.7); c.closePath(); c.fill(); c.restore(); }
    c.fillStyle = '#7d6a55'; c.fillRect(w * 0.64, h * 0.62, w * 0.12, h * 0.12); poly(c, [[w * 0.62, h * 0.63], [w * 0.7, h * 0.56], [w * 0.78, h * 0.63]], '#4a4038'); c.fillStyle = '#12161a'; c.fillRect(w * 0.685, h * 0.66, w * 0.035, h * 0.08);
    c.fillStyle = '#8ea470'; c.fillRect(0, h * 0.8, w, h * 0.2); c.strokeStyle = '#6fb2d6'; c.lineWidth = h * 0.05; c.lineCap = 'round'; c.beginPath(); c.moveTo(-10, h * 0.9); c.bezierCurveTo(w * 0.2, h * 0.84, w * 0.34, h * 0.98, w * 0.56, h * 0.93); c.stroke(); for (var b = 0; b < 6; b++) ell(c, w * (0.08 + b * 0.08), h * (0.88 + R() * 0.06), h * 0.014, h * 0.01, 0, '#9aa0a6');
    var px = w * 0.86, py = h * 0.74; c.fillStyle = '#b5ad9c'; for (var t = 0; t < 5; t++) { var tw = h * (0.05 - t * 0.007); c.fillRect(px - tw, py - t * h * 0.045, tw * 2, h * 0.03); c.fillRect(px - tw * 1.25, py - t * h * 0.045 - h * 0.012, tw * 2.5, h * 0.012); } c.fillRect(px - 1.5, py - h * 0.26, 3, h * 0.05);
    blobTrees(c, w * 0.9, w, h * 0.5, h * 0.06, 8, R, ['#3f6f45', '#4f8050']);
  };
  P.caldera = function (c, w, h, R) {
    sky(c, w, h, '#b9dcf1', '#f1f5e6', 0.5); for (var q = 0; q < 4; q++) ell(c, w * (0.1 + q * 0.27 + R() * 0.05), h * (0.08 + R() * 0.08), w * 0.08, h * 0.02, 0, 'rgba(255,255,255,.75)');
    ridge(c, w, h * 0.42, h * 0.05, '#86a99a', R, h);
    function peak(cx, top, half, col) { c.fillStyle = col; c.beginPath(); c.moveTo((cx - half) * w, h * 0.56); c.quadraticCurveTo((cx - half * 0.35) * w, h * (top + 0.05), cx * w, h * top); c.quadraticCurveTo((cx + half * 0.4) * w, h * (top + 0.06), (cx + half) * w, h * 0.56); c.closePath(); c.fill(); }
    peak(0.68, 0.2, 0.34, '#4f7d57'); peak(0.3, 0.26, 0.32, '#5a8a5f');
    c.fillStyle = '#c9c2ad'; [[0.24, 0.3, 0.1], [0.33, 0.31, 0.07], [0.62, 0.25, 0.09], [0.72, 0.26, 0.08]].forEach(function (p) { c.fillRect(w * p[0], h * p[1], w * p[2], h * 0.035); c.fillStyle = '#b3ab95'; c.fillRect(w * p[0], h * (p[1] + 0.03), w * p[2], h * 0.008); c.fillStyle = '#c9c2ad'; });
    blobTrees(c, 0, w, h * 0.5, h * 0.035, 80, R, ['#3f6f49', '#4d7d52', '#356240']);
    c.fillStyle = '#a9c873'; c.fillRect(0, h * 0.56, w, h * 0.44);
    for (var r = 0; r < 6; r++) { var y0 = h * (0.57 + r * 0.07); for (var k = 0; k < 6; k++) { c.fillStyle = ['#b8d27e', '#9fc268', '#cddc8c', '#8fb65d'][Math.floor(R() * 4)]; c.fillRect(w * k / 6 + 2, y0, w / 6 - 4, h * 0.062); } }
    ell(c, w * 0.24, h * 0.74, w * 0.1, h * 0.035, 0, '#6fb2d6', 'rgba(255,255,255,.6)'); ell(c, w * 0.48, h * 0.64, w * 0.05, h * 0.016, 0, '#79b9da');
    for (var hx = 0; hx < 5; hx++) { var bx = w * (0.56 + hx * 0.085), by = h * (0.8 + (hx % 2) * 0.05); c.fillStyle = '#e9e2d0'; c.fillRect(bx, by, w * 0.06, h * 0.035); c.fillStyle = '#39424b'; c.beginPath(); c.moveTo(bx - w * 0.012, by + 2); c.quadraticCurveTo(bx + w * 0.03, by - h * 0.045, bx + w * 0.072, by + 2); c.closePath(); c.fill(); }
  };
  P.fallback = function (c, w, h, R) { sky(c, w, h, '#cfe5f2', '#edf4e4', 0.5); ridge(c, w, h * 0.5, h * 0.12, '#6f9a6a', R, h); };

  var SEED = { basin: 11, conglo: 23, cracks: 37, nuruk: 41, pillars: 53, cliff: 67, slab: 71, slab2: 83, tuff: 97, stromat: 101, talus: 113, caldera: 127 };
  function paint(canvas, id, opt) {
    opt = opt || {}; var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cw = opt.w || canvas.clientWidth || canvas.width || 320, ch = opt.h || canvas.clientHeight || canvas.height || 180;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    var c = canvas.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, cw, ch);
    (P[id] || P.fallback)(c, cw, ch, rng(SEED[id] || 7));
    return { w: cw, h: ch };
  }

  /* ---------- 시간 여행(과거 환경 겹쳐 보기) ---------- */
  function label(c, w, h, txt) { c.save(); var fs = Math.max(13, Math.round(w * 0.036)); c.font = '600 ' + fs + 'px sans-serif'; while (fs > 10 && c.measureText(txt).width + 26 > w - 104) { fs--; c.font = '600 ' + fs + 'px sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; var tw = c.measureText(txt).width + 26, cx = (w - 58) / 2; c.fillStyle = 'rgba(8,14,12,.72)'; var y = Math.min(h * 0.44, 246); c.beginPath(); if (c.roundRect) c.roundRect(cx - tw / 2, y - 17, tw, 34, 10); else c.rect(cx - tw / 2, y - 17, tw, 34); c.fill(); c.fillStyle = '#ffd36b'; c.fillText(txt, cx, y + 1); c.restore(); }
  function water(c, w, h, top, a, tm, col) { c.fillStyle = col || 'rgba(70,150,200,' + a + ')'; c.beginPath(); c.moveTo(0, h); c.lineTo(0, top); for (var x = 0; x <= w; x += w / 30) c.lineTo(x, top + Math.sin(x / w * 14 + tm * 2) * h * 0.008); c.lineTo(w, h); c.closePath(); c.fill(); }
  function arrow(c, x0, y0, x1, y1, col, lw) { var a = Math.atan2(y1 - y0, x1 - x0), s = (lw || 3) * 3.2; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw || 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - s * Math.cos(a - 0.45), y1 - s * Math.sin(a - 0.45)); c.lineTo(x1 - s * Math.cos(a + 0.45), y1 - s * Math.sin(a + 0.45)); c.closePath(); c.fill(); }
  function puff(c, x, y, r, col) { for (var i = 0; i < 5; i++) ell(c, x + Math.cos(i * 1.3) * r * 0.6, y + Math.sin(i * 1.7) * r * 0.4, r * 0.7, r * 0.6, 0, col); }
  function dinoSil(c, x, y, s, kind, ph, col) {
    c.save(); c.translate(x, y); c.fillStyle = col || 'rgba(20,35,28,.85)'; var leg = Math.sin(ph) * s * 0.12;
    if (kind === 'sauro') { ell(c, 0, -s * 0.55, s * 0.62, s * 0.3, 0, c.fillStyle); c.beginPath(); c.moveTo(s * 0.45, -s * 0.7); c.quadraticCurveTo(s * 0.9, -s * 1.3, s * 1.15, -s * 1.5); c.lineTo(s * 1.32, -s * 1.46); c.lineTo(s * 1.2, -s * 1.36); c.quadraticCurveTo(s * 0.95, -s * 1.0, s * 0.55, -s * 0.45); c.fill(); c.beginPath(); c.moveTo(-s * 0.5, -s * 0.62); c.quadraticCurveTo(-s * 1.1, -s * 0.6, -s * 1.5, -s * 0.25); c.quadraticCurveTo(-s * 1.0, -s * 0.42, -s * 0.5, -s * 0.4); c.fill(); [-0.38, -0.2, 0.22, 0.4].forEach(function (lx, i) { c.fillRect(lx * s + (i % 2 ? leg : -leg), -s * 0.4, s * 0.13, s * 0.42); }); }
    else { var bend = kind === 'ornithoQ' ? 0.25 : 0; c.rotate(bend); ell(c, 0, -s * 0.7, s * 0.42, s * 0.22, -0.25, c.fillStyle); c.beginPath(); c.moveTo(s * 0.3, -s * 0.82); c.quadraticCurveTo(s * 0.55, -s * 1.15, s * 0.72, -s * 1.12); c.lineTo(s * 0.86, -s * 1.02); c.lineTo(s * 0.62, -s * 0.98); c.quadraticCurveTo(s * 0.5, -s * 0.8, s * 0.36, -s * 0.66); c.fill(); c.beginPath(); c.moveTo(-s * 0.32, -s * 0.72); c.quadraticCurveTo(-s * 0.9, -s * 0.75, -s * 1.25, -s * 0.5); c.quadraticCurveTo(-s * 0.8, -s * 0.55, -s * 0.3, -s * 0.55); c.fill(); c.rotate(-bend); c.fillRect(-s * 0.08 + leg, -s * 0.58, s * 0.1, s * 0.6); c.fillRect(s * 0.06 - leg, -s * 0.58, s * 0.1, s * 0.6); if (kind === 'ornithoQ') { c.fillRect(s * 0.42 + leg, -s * 0.5, s * 0.07, s * 0.5); } else { c.fillRect(s * 0.3, -s * 0.72, s * 0.2, s * 0.06); } }
    c.restore();
  }
  var FX = {};
  FX.dino = function (c, w, h, t, tm, baby) {
    if (t > 0.72) { water(c, w, h, h * 0.62, 0.42, tm); c.fillStyle = 'rgba(200,170,120,.3)'; c.fillRect(0, 0, w, h * 0.62);
      if (baby) { var cyc = (tm * 0.12) % 1, x = w * (0.1 + cyc * 0.8), kind = cyc < 0.42 ? 'ornitho' : (cyc < 0.52 ? 'ornitho' : 'ornithoQ'); var ph = cyc >= 0.42 && cyc < 0.52 ? 0 : tm * 6; for (var i = 0; i < 18; i++) { var cx = 0.1 + i / 18 * 0.8; if (cx < 0.1 + cyc * 0.8) foot(c, 'ornitho', w * cx, h * 0.7 + (i % 2 ? 6 : -6), 5, Math.PI / 2, 'rgba(40,30,20,.5)'); } dinoSil(c, x, h * 0.68, w * 0.09, kind, ph); dinoSil(c, x - w * 0.16, h * 0.62, w * 0.08, kind, ph + 1); label(c, w, h, cyc < 0.42 ? '두 발로 걷는 중' : (cyc < 0.52 ? '차렷! 잠깐 멈춤' : '네 발로 천천히')); }
      else { for (var k = 0; k < 3; k++) { var xx = ((tm * 0.03 + k * 0.33) % 1.3 - 0.15) * w; dinoSil(c, xx, h * (0.62 + k * 0.06), w * (0.13 - k * 0.015), 'sauro', tm * 3 + k); } dinoSil(c, ((tm * 0.06 + 0.5) % 1.3 - 0.15) * w, h * 0.86, w * 0.07, 'ornitho', tm * 7); } }
    else if (t > 0.45) { var n = Math.floor(((tm * 0.35) % 1) * 6) + 1; for (var j = 0; j < n; j++) { c.fillStyle = j % 2 ? 'rgba(150,110,70,.55)' : 'rgba(180,140,95,.55)'; c.fillRect(0, h * (0.86 - j * 0.09), w, h * 0.09); } label(c, w, h, '새 퇴적물이 발자국을 덮는다'); }
    else if (t > 0.18) { var a = (0.5 + 0.5 * Math.sin(tm * 1.2)) * 0.7; c.save(); c.translate(w * 0.5, h * 0.55); c.rotate(-a * 0.7); c.fillStyle = 'rgba(190,150,110,.6)'; c.fillRect(-w * 0.4, -h * 0.03, w * 0.8, h * 0.06); c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(-w * 0.4, -h * 0.03, w * 0.8, h * 0.06); c.restore(); arrow(c, w * 0.78, h * 0.42, w * 0.86, h * 0.72, '#ff7a59', 4); label(c, w, h, '칼데라 쪽이 꺼지며 지층이 기운다 (' + Math.round(a * 57) + '°)'); }
  };
  FX.baby = function (c, w, h, t, tm) { FX.dino(c, w, h, t, tm, true); };
  FX.lake = function (c, w, h, t, tm, R) {
    if (t > 0.72) { water(c, w, h, h * 0.16, 0.5, tm); for (var i = 0; i < 60; i++) { var x = (i * 73 % 100) / 100 * w, y = ((i * 37 % 100) / 100 + tm * 0.03 * (1 + i % 3)) % 1; ell(c, x, h * (0.18 + y * 0.8), 1.6, 1.6, 0, 'rgba(60,50,40,.7)'); } }
    else if (t > 0.45) { water(c, w, h, h * 0.3, 0.4, tm); var n = Math.floor(((tm * 0.3) % 1) * 8) + 1; for (var j = 0; j < n; j++) { c.fillStyle = j % 2 ? 'rgba(50,55,60,.8)' : 'rgba(80,84,88,.8)'; c.fillRect(0, h * (0.96 - j * 0.035), w, h * 0.035); } label(c, w, h, '고운 진흙이 한 겹씩 가라앉는다'); }
    else if (t > 0.18) { water(c, w, h, h * (0.5 + 0.3 * ((tm * 0.1) % 1)), 0.35, tm); arrow(c, w * 0.2, h * 0.84, w * 0.5, h * 0.84, '#bfe6ff', 4); label(c, w, h, '호수가 사라지고 강이 절벽을 깎는다'); }
  };
  FX.sandwave = function (c, w, h, t, tm) {
    if (t <= 0.18) return; water(c, w, h, h * 0.3, t > 0.72 ? 0.45 : 0.3, tm);
    for (var d = 0; d < 4; d++) { var x = ((tm * 0.05 + d * 0.3) % 1.2 - 0.1) * w, y = h * 0.82; c.fillStyle = 'rgba(214,176,90,.85)'; c.beginPath(); c.moveTo(x - w * 0.16, y); c.quadraticCurveTo(x - w * 0.02, y - h * 0.13, x + w * 0.03, y - h * 0.12); c.lineTo(x + w * 0.09, y); c.closePath(); c.fill(); c.strokeStyle = 'rgba(120,85,30,.7)'; c.lineWidth = 1.5; for (var k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x - w * 0.02 + k * w * 0.014, y - h * 0.12 + k * h * 0.01); c.lineTo(x + w * 0.035 + k * w * 0.014, y); c.stroke(); } }
    for (var a = 0; a < 3; a++) arrow(c, w * (0.12 + a * 0.3), h * (0.45 + a * 0.06), w * (0.3 + a * 0.3), h * (0.45 + a * 0.06), 'rgba(255,255,255,.85)', 3);
    c.fillStyle = 'rgba(214,176,90,.85)'; c.fillRect(0, h * 0.82, w, h * 0.18); if (t <= 0.72) label(c, w, h, t > 0.45 ? '모래 언덕의 내리막에 사층리가 생긴다' : '모래가 굳어 사암이 된다');
  };
  FX.flood = function (c, w, h, t, tm) {
    if (t <= 0.18) return; if (t > 0.45) { c.fillStyle = 'rgba(150,110,70,' + (t > 0.72 ? 0.55 : 0.4) + ')'; c.fillRect(0, h * 0.25, w, h * 0.75); for (var i = 0; i < 26; i++) { var x = ((i * 0.137 + tm * (0.05 + (i % 4) * 0.02)) % 1.1 - 0.05) * w, y = h * (0.35 + (i * 0.618 % 1) * 0.55), s = 5 + (i % 5) * 4; c.save(); c.translate(x, y); c.rotate(tm * 2 + i); ell(c, 0, 0, s * 1.3, s, 0, ['#9c9a94', '#e8e3d8', '#b7a59a'][i % 3], 'rgba(40,30,20,.5)'); c.restore(); } for (var a = 0; a < 3; a++) arrow(c, w * 0.12, h * (0.4 + a * 0.18), w * 0.34, h * (0.44 + a * 0.18), 'rgba(255,255,255,.8)', 3); label(c, w, h, t > 0.72 ? '산에서 평지로: 부채꼴로 퍼지는 자갈 하천' : '홍수가 자갈과 바위를 굴린다'); }
    else { c.fillStyle = 'rgba(120,150,180,.25)'; c.fillRect(0, h * 0.7, w, h * 0.3); label(c, w, h, '물이 빠지고 자갈이 포개져 남는다'); }
  };
  FX.crack = function (c, w, h, t, tm) {
    if (t > 0.72) { water(c, w, h, h * 0.5, 0.35, tm); c.fillStyle = 'rgba(90,55,70,.5)'; c.fillRect(0, h * 0.5, w, h * 0.5); for (var i = 0; i < 40; i++) { var x = (i * 61 % 100) / 100 * w, y = ((i * 29 % 100) / 100 + tm * 0.5) % 1; c.strokeStyle = 'rgba(190,225,255,.8)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y * h * 0.5); c.lineTo(x - 3, y * h * 0.5 + 12); c.stroke(); } }
    else if (t > 0.45) { var g = (tm * 0.25) % 1; ell(c, w * 0.82, h * 0.14, h * 0.05, h * 0.05, 0, '#ffd36b'); for (var r = 0; r < 8; r++) arrow(c, w * 0.82 + Math.cos(r * 0.785) * h * 0.07, h * 0.14 + Math.sin(r * 0.785) * h * 0.07, w * 0.82 + Math.cos(r * 0.785) * h * 0.1, h * 0.14 + Math.sin(r * 0.785) * h * 0.1, '#ffd36b', 2); c.strokeStyle = '#1a1014'; c.lineWidth = 3; for (var k = 0; k < 8; k++) { var cx = w * (0.08 + k * 0.12); c.beginPath(); c.moveTo(cx, h * 0.3); c.lineTo(cx + Math.sin(k) * 6, h * (0.3 + g * (0.2 + (k % 3) * 0.08))); c.stroke(); } label(c, w, h, '건기: 진흙이 마르며 갈라진다'); }
    else if (t > 0.18) { for (var p = 0; p < 50; p++) { var px = w * (0.08 + (p % 8) * 0.12) + ((p * 7) % 9 - 4), py = ((p * 0.21 + tm * 0.4) % 1); ell(c, px, h * (0.12 + py * 0.4), 2.2, 2.2, 0, '#ecd9a6'); } arrow(c, w * 0.1, h * 0.22, w * 0.36, h * 0.22, '#ecd9a6', 4); label(c, w, h, '홍수: 모래가 틈으로 쏟아져 들어간다'); }
  };
  FX.topple = function (c, w, h, t, tm) {
    if (t <= 0.18) return; var bx = w * 0.3, by = h * 0.24, bw = w * 0.4, bh = h * 0.5;
    if (t > 0.72) { c.fillStyle = 'rgba(60,66,72,.85)'; c.fillRect(bx, by, bw, bh); c.strokeStyle = 'rgba(255,255,255,.25)'; for (var k = 1; k < 10; k++) { c.beginPath(); c.moveTo(bx, by + bh * k / 10); c.lineTo(bx + bw, by + bh * k / 10); c.stroke(); } }
    else if (t > 0.45) { c.fillStyle = 'rgba(60,66,72,.8)'; c.fillRect(bx, by, bw, bh); c.strokeStyle = '#ffd36b'; c.lineWidth = 3; var n = Math.floor(((tm * 0.3) % 1) * 4) + 1; for (var j = 1; j <= n; j++) { c.beginPath(); c.moveTo(bx + bw * j / 5, by); c.lineTo(bx + bw * j / 5, by + bh); c.stroke(); } label(c, w, h, '수직 절리가 암반을 기둥으로 나눈다'); }
    else { var a = (0.5 + 0.5 * Math.sin(tm)) * 0.5; for (var p = 0; p < 4; p++) { c.save(); c.translate(bx + bw * (p + 0.5) / 4 + p * 8, by + bh); c.rotate(a * (p / 3)); c.fillStyle = 'rgba(60,66,72,.8)'; c.fillRect(-bw / 9, -bh * (1 - p * 0.08), bw / 4.6, bh * (1 - p * 0.08)); c.restore(); } arrow(c, w * 0.7, h * 0.3, w * 0.84, h * 0.5, '#ff7a59', 4); label(c, w, h, '기둥이 비탈 쪽으로 기울어 넘어진다'); }
  };
  FX.pyro = function (c, w, h, t, tm) {
    if (t > 0.72) { c.fillStyle = 'rgba(120,180,120,.3)'; c.fillRect(0, h * 0.5, w, h * 0.5); water(c, w, h, h * 0.72, 0.5, tm); ell(c, w * 0.8, h * 0.14, h * 0.045, h * 0.045, 0, '#ffe08a'); dinoSil(c, w * 0.3, h * 0.72, w * 0.1, 'sauro', tm * 2); }
    else if (t > 0.45) { var f = (tm * 0.12) % 1; for (var i = 0; i < 9; i++) puff(c, w * (f * 1.3 - 0.2 - i * 0.07), h * (0.5 + (i % 3) * 0.12), h * (0.16 - (i % 3) * 0.02), 'rgba(120,120,118,.82)'); for (var s = 0; s < 14; s++) ell(c, w * (f * 1.3 - 0.1 - (s * 0.05)), h * (0.4 + (s * 0.31 % 0.5)), 3, 3, 0, '#ff9a4d'); label(c, w, h, '화쇄류: 뜨거운 화산재 구름이 덮친다'); }
    else if (t > 0.18) { var th = h * 0.5 * ((tm * 0.15) % 1); c.fillStyle = 'rgba(130,140,130,.75)'; c.fillRect(0, h * 0.8 - th, w, th); label(c, w, h, '화산재가 두껍게 쌓여 굳는다'); }
  };
  FX.grow = function (c, w, h, t, tm) {
    if (t <= 0.18) return; var wet = t > 0.45 && t <= 0.72 ? true : (t > 0.72 ? Math.sin(tm * 0.8) > 0 : false);
    water(c, w, h, h * (wet ? 0.12 : 0.36), 0.36, tm); for (var r = 0; r < 5; r++) { c.strokeStyle = 'rgba(255,230,140,.35)'; c.lineWidth = 6; c.beginPath(); c.moveTo(w * (0.2 + r * 0.15), 0); c.lineTo(w * (0.1 + r * 0.15), h * 0.7); c.stroke(); }
    var n = Math.floor(((tm * 0.2) % 1) * 6); for (var L = 0; L < n; L++) { c.strokeStyle = wet ? '#f2ead6' : '#5c574c'; c.lineWidth = 4; c.beginPath(); for (var x = 0; x <= 40; x++) { var u = x / 40, y = 0.32 - L * 0.02 - 0.12 * Math.exp(-Math.pow((u - 0.3) / 0.14, 2)) - 0.1 * Math.exp(-Math.pow((u - 0.6) / 0.13, 2)); if (x) c.lineTo(u * w, y * h); else c.moveTo(u * w, y * h); } c.stroke(); }
    for (var b = 0; b < 12; b++) ell(c, w * ((b * 0.083 + 0.04)), h * (0.6 - ((tm * 0.15 + b * 0.37) % 1) * 0.4), 3, 3, 0, 'rgba(255,255,255,.7)');
    label(c, w, h, t > 0.72 ? '남세균이 광합성하며 산소 방울을 낸다' : (wet ? '우기: 물이 불고 밝은 층이 자란다' : '건기: 물이 줄고 어두운 층이 생긴다'));
  };
  FX.air = function (c, w, h, t, tm) {
    var season = Math.min(3, Math.floor(t * 4)); var ph = (tm * 0.6) % 1; var cold = 'rgba(120,200,255,.95)', warm = 'rgba(255,140,90,.95)';
    function flow(x0, y0, x1, y1, col, n) { for (var i = 0; i < n; i++) { var p = (ph + i / n) % 1; var x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p; arrow(c, x, y, x + (x1 - x0) * 0.12, y + (y1 - y0) * 0.12, col, 4); } }
    if (season === 0) { flow(w * 0.5, h * 0.6, w * 0.82, h * 0.74, cold, 3); flow(w * 0.3, h * 0.26, w * 0.42, h * 0.42, warm, 2); c.fillStyle = 'rgba(255,200,120,.12)'; c.fillRect(0, 0, w, h); }
    else if (season === 1) { flow(w * 0.52, h * 0.62, w * 0.78, h * 0.72, cold, 2); flow(w * 0.42, h * 0.4, w * 0.32, h * 0.26, warm, 1); for (var i = 0; i < 8; i++) ell(c, w * (0.36 + i * 0.04), h * (0.56 + (i % 3) * 0.03), 5, 5, 0, 'rgba(220,245,255,.9)'); }
    else if (season === 2) { flow(w * 0.3, h * 0.2, w * 0.44, h * 0.44, cold, 3); flow(w * 0.44, h * 0.42, w * 0.34, h * 0.24, warm, 2); c.fillStyle = 'rgba(200,225,255,.22)'; c.fillRect(0, 0, w, h); for (var s = 0; s < 40; s++) ell(c, (s * 61 % 100) / 100 * w, ((s * 29 % 100) / 100 + tm * 0.08) % 1 * h, 2, 2, 0, '#fff'); }
    else { flow(w * 0.52, h * 0.62, w * 0.7, h * 0.7, cold, 1); flow(w * 0.42, h * 0.4, w * 0.32, h * 0.26, warm, 2); c.fillStyle = 'rgba(220,150,70,.12)'; c.fillRect(0, 0, w, h); }
    label(c, w, h, ['여름: 찬 공기는 아래로 나오고 더운 공기는 위로 들어간다', '봄: 얼음이 녹으며 0℃를 지킨다', '겨울: 찬 공기가 스며들고 위(온혈)에서 따뜻한 공기가 나온다', '가을: 냉기가 바닥나며 흐름이 약해진다'][season]);
  };
  FX.collapse = function (c, w, h, t, tm) {
    if (t > 0.72) { c.fillStyle = 'rgba(40,36,34,.5)'; c.fillRect(0, h * 0.42, w, h * 0.2); for (var i = 0; i < 5; i++) { c.strokeStyle = 'rgba(255,110,50,.9)'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); var x0 = w * 0.5, y0 = h * 0.38; c.moveTo(x0, y0); var p = (tm * 0.2 + i * 0.2) % 1; c.quadraticCurveTo(x0 + (i - 2) * w * 0.1, y0 + h * 0.06, x0 + (i - 2) * w * 0.2 * p, y0 + h * 0.2 * p); c.stroke(); } label(c, w, h, '현무암 용암이 조용히 흘러내린다'); }
    else if (t > 0.45) { var g = (tm * 0.5) % 1; for (var k = 0; k < 8; k++) puff(c, w * 0.5 + Math.sin(k * 2.1 + tm) * w * 0.05 * k * 0.3, h * (0.36 - k * 0.045 * (0.6 + g * 0.6)), h * (0.05 + k * 0.012), 'rgba(110,108,106,.85)'); for (var s = 0; s < 6; s++) puff(c, w * (0.5 + (s % 2 ? 1 : -1) * (0.08 + g * 0.3) * (1 + s * 0.1)), h * 0.44, h * 0.06, 'rgba(140,138,134,.8)'); for (var b = 0; b < 10; b++) ell(c, w * 0.5 + Math.cos(b) * w * 0.2 * g, h * 0.3 - Math.abs(Math.sin(b * 1.7)) * h * 0.2 * g + h * 0.2 * g * g, 4, 4, 0, '#ff9a4d'); label(c, w, h, '유문암질 마그마 대폭발! 화산재가 솟는다'); }
    else if (t > 0.18) { var d = (0.5 + 0.5 * Math.sin(tm * 0.9)) * h * 0.09; c.strokeStyle = '#ffd36b'; c.lineWidth = 4; for (var L = 0; L < 3; L++) { c.beginPath(); c.moveTo(w * 0.04, h * (0.5 + L * 0.05)); c.quadraticCurveTo(w * 0.5, h * (0.5 + L * 0.05) + d * 2, w * 0.96, h * (0.5 + L * 0.05)); c.stroke(); } arrow(c, w * 0.5, h * 0.3, w * 0.5, h * 0.3 + d + h * 0.06, '#ff7a59', 5); label(c, w, h, '마그마 방이 비어 가운데가 가라앉는다'); }
  };
  FX.erode = function (c, w, h, t, tm) {
    if (t <= 0.18) return; var up = h * (0.36 - 0.14 * Math.min(1, (t - 0.18) / 0.82));
    c.strokeStyle = '#ffd36b'; c.setLineDash([8, 6]); c.lineWidth = 3; c.beginPath(); c.moveTo(0, up); for (var x = 0; x <= w; x += w / 20) c.lineTo(x, up + Math.sin(x / w * 9) * h * 0.02); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(150,120,90,.25)'; c.fillRect(0, up, w, h * 0.38 - up + h * 0.02);
    if (t > 0.45 && t <= 0.72) { for (var i = 0; i < 50; i++) { var rx = (i * 61 % 100) / 100 * w, ry = ((i * 29 % 100) / 100 + tm * 0.6) % 1; c.strokeStyle = 'rgba(190,225,255,.85)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(rx, ry * h * 0.4); c.lineTo(rx - 3, ry * h * 0.4 + 12); c.stroke(); } for (var a = 0; a < 3; a++) arrow(c, w * (0.3 + a * 0.2), h * 0.5, w * (0.22 + a * 0.2), h * 0.6, '#bfe6ff', 3); }
    label(c, w, h, t > 0.72 ? '과거의 땅은 이 점선만큼 높았다' : (t > 0.45 ? '빗물이 풍화된 부스러기를 씻어 낸다' : '틈이 많은 약한 곳이 깊이 풍화된다'));
  };
  function fx(c, w, h, id, t, tm) { c.clearRect(0, 0, w, h); if (FX[id]) FX[id](c, w, h, t, tm); }

  GEO.scene = { paint: paint, fx: fx };
})();
