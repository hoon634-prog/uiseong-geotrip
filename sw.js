/* 의성 지오트립 — 오프라인 캐시. 파일을 고친 뒤에는 VER 숫자를 올리면 모든 기기가 새 파일을 받습니다. */
var VER = 'geotrip-v2';
var CORE = [
  './', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-180.png',
  'css/app.css',
  'js/data-sites-1.js', 'js/data-sites-2.js', 'js/data-study.js', 'js/scenes.js', 'js/figs.js', 'js/core.js',
  'js/views-a.js', 'js/views-b.js', 'js/tools.js', 'js/ar.js'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VER).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VER && k !== VER + '-rt'; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin === location.origin) {
    // 저장해 둔 파일을 먼저 보여 주고, 뒤에서 새 파일을 받아 다음 번에 반영합니다.
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(VER).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () { return hit || new Response('', { status: 504 }); });
      return hit || net;
    }));
  } else if (/(^|\.)fonts\.(googleapis|gstatic)\.com$|(^|\.)cdnjs\.cloudflare\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) { var copy = res.clone(); caches.open(VER + '-rt').then(function (c) { c.put(req, copy); }); return res; });
    }));
  }
});
