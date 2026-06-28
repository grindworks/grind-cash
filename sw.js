// 💡 アップデート時はここを v2, v3... と書き換えることで更新が発火します
const CACHE_NAME = 'grindcash-v20260628-8';
const urlsToCache = [
  './',
  './index.html',
  './main.js',
  './i18n.js',
  './lang/en.js',
  './lang/ja.js',
  './lang/de.js',
  './lang/fr.js',
  './lang/es.js',
  './lang/it.js',
  './styles.css',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
  './assets/sql-wasm.js',
  './assets/sql-wasm.wasm',
];

// インストール時にキャッシュを作成
self.addEventListener('install', (event) => {
  // 新しいService Workerを即座にアクティブにする
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // ローカルファイルは通常通り一括追加
      await cache.addAll(urlsToCache.filter((url) => !url.endsWith('.wasm')));
      // WASMは個別にキャッシュ（失敗してもService Worker自体は止めない）
      cache.add('./assets/sql-wasm.wasm').catch(() => console.warn('WASM cache failed.'));
    }),
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// fetchイベントでキャッシュを返す
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      const fetchAndCache = async () => {
        try {
          const networkResponse = await fetch(event.request);
          // 正常なレスポンス、または外部ドメインからの不透明なレスポンス(Opaque)の場合、キャッシュを更新
          if (
            networkResponse &&
            (networkResponse.status === 200 || networkResponse.type === 'opaque')
          ) {
            await cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // ネットワークエラー時のフォールバック処理
          if (event.request.mode === 'navigate') {
            return (await cache.match('./index.html')) || (await cache.match(event.request));
          }
          // オフライン時はキャッシュから返す
          return await cache.match(event.request);
        }
      };

      // HTML (navigate) の場合は常に Network First
      if (
        event.request.mode === 'navigate' ||
        (event.request.headers.get('accept') &&
          event.request.headers.get('accept').includes('text/html'))
      ) {
        return await fetchAndCache();
      }

      // それ以外(静的アセットなど)は Stale-While-Revalidate 戦略
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        // キャッシュヒット。バックグラウンドで更新を試みる
        fetchAndCache();
        return cachedResponse;
      }
      // キャッシュミス。ネットワークからの応答を待つ
      return await fetchAndCache();
    })(),
  );
});
