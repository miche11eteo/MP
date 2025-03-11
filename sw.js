const CACHE_NAME = `Mechanical Power v1`;

self.addEventListener("install", event => {
    event.waitUntil((async () => {
        // Cache all resources required for the PWA
        const cache = await caches.open(CACHE_NAME);
        cache.addAll([
            "/",

            "/fonts/roboto/Roboto-Regular.ttf",
            "/fonts/geist/Geist-Regular.woff",
            "/fonts/geist/Geist-Bold.woff",
            "/fonts/sharetechmono/default.woff2",

            "/default.css",
            "/fonts.css",
            
            "/js3party/rhu/html.js",
            "/js3party/rhu/signal.js",
            "/js3party/rhu/style.js",
            "/js3party/rhu/weak.js",
            "/js3party/rhu/rest.js",
            "/js3party/rhu/theme.js",
            "/app.js",
        ]);
    })());
});

self.addEventListener("fetch", event => {
    event.respondWith((async () => {
        // Load stored resources from cache
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        } else {
            // If the resources are not in the cache, try to fetch from the network.
            try {
                const fetchResponse = await fetch(event.request);

                // Save the resource in the cache and return it.
                cache.put(event.request, fetchResponse.clone());

                return fetchResponse;
            } catch (e) {
                console.error(`Failed to fetch resources: ${e}`);
            }
        }
    })());
});