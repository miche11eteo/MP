const version = 'Mechanical Power v3';

self.addEventListener("install", event => {
    event.waitUntil((async () => {
        // Cache all resources required for the PWA
        const cache = await caches.open(version);
        cache.addAll([
            `/MP/`,

            `/MP/fonts/roboto/Roboto-Regular.ttf`,
            `/MP/fonts/geist/Geist-Regular.woff`,
            `/MP/fonts/geist/Geist-Bold.woff`,
            `/MP/fonts/sharetechmono/default.woff2`,

            `/MP/default.css`,
            `/MP/fonts.css`,
            
            `/MP/js3party/rhu/html.js`,
            `/MP/js3party/rhu/signal.js`,
            `/MP/js3party/rhu/style.js`,
            `/MP/js3party/rhu/weak.js`,
            `/MP/js3party/rhu/rest.js`,
            `/MP/js3party/rhu/theme.js`,
            `/MP/app.js`,
        ]);
    })());
});

  console.log('[sw] Installed successfully :');
  // self.skipWaiting();
});

self.addEventListener("fetch", event => {
    event.respondWith((async () => {
        // Load stored resources from cache
        const cache = await caches.open(version);
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

self.addEventListener('activate', event => {
  caches.keys().then(function(cacheNames) {
    cacheNames.forEach(function(cacheName) {
      if (cacheName !== version) {
        caches.delete(cacheName);
      }
    });
  });
})

