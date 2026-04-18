// AgriRomagna Service Worker — Offline-first with background sync
const CACHE_NAME = "agriromagna-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/offline",
  "/manifest.json",
];

// Install: precache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests — queue them for background sync
  if (request.method !== "GET") {
    if (request.method === "POST" && url.pathname.startsWith("/api/")) {
      event.respondWith(
        fetch(request.clone()).catch(async () => {
          // Store failed mutations for background sync
          const body = await request.clone().text();
          await storeForSync(url.pathname, body);
          return new Response(
            JSON.stringify({ queued: true, message: "Salvato offline, sincronizzazione automatica." }),
            { status: 202, headers: { "Content-Type": "application/json" } }
          );
        })
      );
    }
    return;
  }

  // API requests: network-first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Navigation: network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Background sync for queued mutations
self.addEventListener("sync", (event) => {
  if (event.tag === "agri-sync") {
    event.waitUntil(processSyncQueue());
  }
});

// IndexedDB helpers for sync queue
function openSyncDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("agri-sync-queue", 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore("mutations", { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeForSync(url, body) {
  const db = await openSyncDB();
  const tx = db.transaction("mutations", "readwrite");
  tx.objectStore("mutations").add({ url, body, timestamp: Date.now() });
  await new Promise((resolve) => { tx.oncomplete = resolve; });
  // Request background sync
  if (self.registration && self.registration.sync) {
    await self.registration.sync.register("agri-sync");
  }
}

async function processSyncQueue() {
  const db = await openSyncDB();
  const tx = db.transaction("mutations", "readonly");
  const store = tx.objectStore("mutations");
  const items = await new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });

  for (const item of items) {
    try {
      await fetch(item.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: item.body,
      });
      // Remove synced item
      const deleteTx = db.transaction("mutations", "readwrite");
      deleteTx.objectStore("mutations").delete(item.id);
    } catch {
      // Will retry on next sync
      break;
    }
  }
}
