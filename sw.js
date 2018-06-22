//Installing event to cache specific files

  var restaurant_cache = 'mws-restaurant-part02';

  var urlToCache = [
    "/",
    "/index.html",
    "/restaurant.html",
    "/css/styles.css",
    "/data/restaurants.json",
    "/js/",
    "/js/dbhelper.js",
    "/js/main.js",
    "/js/register.js",
    "/js/restaurant_info.js"
  ];

  //Open a cache
  self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(restaurant_cache).then(function(cache) {
      return cache.addAll(urlToCache);
    })
  );
});

//Gather and eliminate most caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('mws-restaurant-part') && cacheName != restaurant_cache;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

//fetch
self.addEventListener('fetch', function(event) {
  //Handles the issue of restaurant.html(id)
  if(event.request.url.indexOf('restaurant.html') > -1) {
    event.respondWith(caches.match('restaurant.html'));
  }
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if(response) {
          console.log('[serviceWorker] Found in cache', event.request.url);
          return response;
        }

        //If not in cache, lets add it
        var cloneRequest = event.request.clone();
        fetch(cloneRequest).then(function(response) {
          if(!response) {
            console.log('serviceWorker: No fetch response');
            return response;
          }

          var cloneResponse = response.clone();

          caches.open(restaurant_cache).then(function(cache) {
            cache.put(event.request, cloneResponse);
            return response;
          });

        }).catch(function(error) {
          console.log('Fetch error', error);
        })
        return fetch(event.request);
      })
    );

}); //End of fetch listener
