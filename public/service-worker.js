const APP_PREFIX = 'my-site-cache-';
const VERSION = 'v1';
const CACHE_NAME = `${APP_PREFIX}${VERSION}`;
const DATA_CACHE = `data-cache-${VERSION}`;

const FILES_TO_CACHE = [
    '/',
    './index.html',
    './js/idb.js',
    './js/index.js',
    './manifest.json',
    'icon-72x72.png',
    'icon-96x96.png',
    'icon-128x128.png',
    'icon-144x144.png',
    'icon-152x152.png',
    'icon-192x192.png',
    'icon-384x384.png',
    'icon-512x512.png'
]

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log(`${CACHE_NAME} is installing`)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

self.addEventListener('fetch', event => {
    if(event.request.url.includes('/api/')) {
        event.respondWith(
            caches.open(DATA_CACHE)
            .then(cache => {
                return fetch(event.request)
                .then(res => {
                    if (res.status === 200) {
                        cache.put(event.request.url, res.clone())
                    }
                    return res
                })
                .catch(err => {
                    return cache.match(event.request)
                })
            })
            .catch(err => console.error(err))
        )
        return
    }

    event.respondWith(
        fetch(event.request)
        .catch(() => {
            return caches.match(event.request)
            .then(res => {
                if(res) {
                    return res
                } else if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/')
                }                
            })
        })
    )
})

self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keylist => {
        let cacheKeepList =  keylist.filter(key => key.indexOf(APP_PREFIX))
        cacheKeepList.push(CACHE_NAME)
        return Promise.all(keylist.map((key, index) => {
            if (cacheKeepList.indexOf(key) === -1) {
                console.log(`deleting ${keylist[index]}`)
                return caches.delete(keylist[index])
            }
        }))
    }))
})