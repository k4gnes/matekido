const CACHE = "matekido-v1";

const CORE_URLS = [
    "/",
    "/index.html",
    "/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => cache.addAll(CORE_URLS))
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

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    cachePut(request, response);
                    return response;
                })
                .catch(() =>
                    caches.match(request).then(
                        (match) => match || caches.match("/index.html")
                    )
                )
        );
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) cachePut(request, response);
                return response;
            })
            .catch(() =>
                caches.match(request).then((match) => {
                    if (match) return match;

                    const withoutQuery = new URL(request.url);
                    withoutQuery.search = "";
                    return caches.match(withoutQuery.pathname)
                        .then((m) => m || Response.error());
                })
            )
    );
});

function cachePut(request, response) {
    const clone = response.clone();

    caches.open(CACHE).then(async (cache) => {
        await cache.put(request, clone);

        const keys = await cache.keys();
        if (keys.length > 300) {
            await cache.delete(keys[0]);
        }
    });
}
