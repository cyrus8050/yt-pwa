const staticCache = 'static-cache';
const dynamicCache = 'dynamic-cache';
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/materialize.min.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    '/pages/fallback.html'
]
const limitCacheSize = (name, size) => {
    console.log('limit cache size')
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            console.log(keys)
            if (keys.length > size) {
                console.log('delete')
                cache.delete(keys[0]).then(limitCacheSize(name, size));

            }
        })
    })
}
const limitNumCache = (cacheName, num) => {
    caches.open(cacheName).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > num) {
                cache.delete(keys[0]).then(limitNumCache(cacheName, num));

            }
        })
    })
}
// const limitNumCache = (cacheName, num) => {
//     caches.open(cacheName).then(cache => {
//         cache.keys().then(keys => {
//             if (keys.length > num) {
//                 cache.delete(keys[0]).then(limitNumCache(cacheName, num));
//             }
//         })
//     })
// }
//install processs

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(staticCache).then(cache => {
            cache.addAll(assets)
        })

    )

})

//activate
self.addEventListener('activate', e => {
    console.log('avtivate')
})

self.addEventListener('fetch', e => {
    if (e.request.url.indexOf('firestore.googleapis.com') === -1) {
        e.respondWith(
            caches.match(e.request).then(staticRes => {
                return staticRes || fetch(e.request).then(dynamicRes => {
                    return caches.open(dynamicCache).then(cache => {
                        cache.put(e.request.url, dynamicRes.clone())
                        limitCacheSize(dynamicCache, 3)
                        return dynamicRes
                    })
                })
            }).catch(() => caches.match('/pages/fallback.html'))
        )
    }

})


