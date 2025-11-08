const CACHE_NAME = 'klap_messenger_ver3';
const urlsToCache = [
  '/',
  '/index.html',
   '/manifest.json',
  '/service-worker.js',
  '/icon-192.png',
  '/icon-512.png',, 
  // その他のCSSやJSファイルなど
];

// インストールイベント: キャッシュにファイルを保存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // ★ 注意: cache.addAll()は一つでも失敗すると全体が失敗します。
        return cache.addAll(urlsToCache);
      })
      // ★ 追加: 待機フェーズをスキップし、すぐにアクティベートイベントを発生させる
      .then(() => self.skipWaiting())
  );
});

// フェッチイベント: キャッシュからリソースを返す
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにリソースがあればそれを返す
        if (response) {
          return response;
        }
        
        // なければネットワークから取得する
        // ★ ここでネットワーク接続が失敗した場合、アプリはエラーになります。
        // ★ より高度なオフライン対応のためには、フォールバックページを用意することも検討してください。
        return fetch(event.request);
      })
  );
});

// アクティベートイベント: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // リストにない古いキャッシュを削除
            return caches.delete(cacheName);
          }
        })
      );
    })
    // ★ 追加: アクティベート後、すぐに開いているページを制御する
    .then(() => self.clients.claim()) 
  );
});
