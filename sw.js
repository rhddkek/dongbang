/* 동방전기 — 홈 화면 설치용 서비스 워커 (v347)
   · 게임 페이지: 항상 인터넷에서 먼저 받는다 (새 버전이 바로 보이게). 인터넷이 안 될 때만 지난번에 받아 둔 것을 쓴다
   · 음악·아이콘: 이름에 내용 지문이 들어 있어 바뀌면 이름도 바뀐다 → 한 번 받은 것은 그대로 쓴다
   · 다른 곳(로그인·클라우드 저장·글꼴)으로 가는 요청은 건드리지 않는다 */
const CACHE = 'dbj-1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== self.location.origin) return;
  const page = req.mode === 'navigate' || /\/(index\.html)?$/.test(url.pathname);
  const fixed = /\/audio\/[^/]+\.mp3$|\/icon-\d+\.png$/.test(url.pathname);
  if (fixed) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE), hit = await c.match(req, { ignoreSearch: true }); if (hit) return hit;
      const res = await fetch(req); if (res.ok && res.status === 200) c.put(req, res.clone()); return res;
    })());
    return;
  }
  if (page) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try { const res = await fetch(req, { cache: 'no-cache' }); if (res.ok && res.status === 200) c.put('./', res.clone()); return res; }
      catch (err) { const hit = await c.match('./'); if (hit) return hit; throw err; }
    })());
  }
});
