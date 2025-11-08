const CACHE_NAME = 'klap_messenger_ver3';
const urlsToCache = [
  '/',
  '/index.html',

  '/manifest.json',
  '/service-worker.js',
  '/icon-192.png',
  '/icon-512.png',

  // 他の静的ファイルも必ずここに含めてください
];

// インストールイベント: キャッシュにファイルを保存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // リスト内のファイルの一つでも取得に失敗すると、インストール全体が失敗します
        return cache.addAll(urlsToCache);
      })
      // ★ 修正点: 待機フェーズをスキップし、すぐにアクティベートイベントを発生させる
      .then(() => self.skipWaiting())
  );
});

// フェッチイベント: キャッシュからリソースを返す (Cache-First戦略)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 1. キャッシュにリソースがあればそれを返す
        if (response) {
          return response;
        }
        
        // 2. なければネットワークから取得する
        return fetch(event.request)
          .catch(() => {
            // 3. ネットワーク接続がない、またはリクエスト失敗時
            //    Navigation Request (HTMLのロード) の場合は、フォールバックとして
            //    キャッシュされた index.html を返すようにする
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
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
    // ★ 修正点: アクティベート後、すぐに開いているページを制御する
    .then(() => self.clients.claim()) 
  );
});
