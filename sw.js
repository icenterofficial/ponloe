// sw.js - A simple Cache First Service Worker

const CACHE_NAME = 'ponloe-pwa-cache-v1'; // ប្តូរ version ពេលអ្នក Update កូដ

// បញ្ជីឯកសារ App Shell ដែលត្រូវ Cache ទុកមុន
const urlsToCache = [
  '/', // ទំព័រដើម
  '/offline.html', // ទំព័រសម្រាប់បង្ហាញពេល Offline (ត្រូវបង្កើតវា)
  'https://cdn.jsdelivr.net/gh/icenterofficial/ponloe/main/manifest.json',
  // បន្ថែម CSS, JS, និងរូបភាពសំខាន់ៗនៅទីនេះ
  'https://your-blog-theme.css', // ឧទាហរណ៍: Link ទៅ CSS របស់អ្នក
  'https://your-logo.png'      // ឧទាហរណ៍: Link ទៅ Logo
];

// 1. Install Event: ពេល Service Worker ត្រូវបានติดตั้งครั้งแรก
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Activate Event: ពេល Service Worker ចាប់ផ្តើមដំណើរการ
// ប្រើសម្រាប់លុប Cache ចាស់ៗចោល
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Fetch Event: ពេលគេហទំព័រร้องขออะไรก็ตาม (HTML, CSS, image, API...)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // បើរកឃើញក្នុង Cache, យកពី Cache មកបង្ហាញเลย (Cache First)
        if (response) {
          return response;
        }

        // បើមិនមានក្នុង Cache, ទៅទាញจาก Network
        return fetch(event.request).catch(() => {
          // បើ Fetch ពី Network បរាជ័យ (Offline), បង្ហាញទំព័រ offline.html
          return caches.match('/offline.html');
        });
      })
  );
});
