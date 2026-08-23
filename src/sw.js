importScripts("./sw-cache.js");

const CACHE = "matekido-v10";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => cache.addAll(SW_CACHE_LIST))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    cachePut(url.pathname, response);
                    return response;
                })
                .catch(() =>
                    caches.match(url.pathname).then(
                        (match) => match || caches.match("/index.html")
                    )
                )
        );
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) cachePut(url.pathname, response);
                return response;
            })
            .catch(() =>
                caches.match(url.pathname).then((match) => match || Response.error())
            )
    );
});

function cachePut(pathname, response) {
    const clone = response.clone();

    caches.open(CACHE).then(async (cache) => {
        await cache.put(pathname, clone);

        const keys = await cache.keys();
        if (keys.length > 500) {
            await cache.delete(keys[0]);
        }
    });
}
