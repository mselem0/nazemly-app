const staticDevCoffee = "nafezly-v01"
const assets = [
  "/",
  "/manifest.json",
  "/index.html",
  "/css/style.css",
  "/css/responsive.css",
  "/css/Material+Icons.css",
  "/css/materialize.min.css",
  "/css/El-Messiri.css",
  "/css/all.min.css",
  "/css/Aref-Ruqaa.css",
  "/js/sweat-alert.min.js",
  "/js/jquery-3.3.1.min.js",
  "/js/materialize.min.js",
  "/js/DragDropTouch.js",
  "/js/main.js",
  "/fonts/Material.woff2",
  "/fonts/K2F0fZBRmr9vQ1pHEey6MoiAAhLz.woff2",
  "/fonts/K2F3fZBRmr9vQ1pHEey6OjalFyjSYFOM.woff2",
  "/fonts/K2F3fZBRmr9vQ1pHEey6OlKkFyjSYFOM.woff2",
  "/fonts/K2F3fZBRmr9vQ1pHEey6On6jFyjSYFOM.woff2",
  "/fonts/WwkbxPW1E165rajQKDulIIIoVeo5.woff2",
  "/fonts/WwkYxPW1E165rajQKDulKDwNQNAY2e_7.woff2",
  "/webfonts/fa-solid-900.woff2",
  "/webfonts/fa-solid-900.woff",
  "/webfonts/fa-solid-900.ttf",
  "/webfonts/fa-solid-900.svg",
  "/webfonts/fa-solid-900.eot",
  "/webfonts/fa-regular-400.woff2",
  "/webfonts/fa-regular-400.woff",
  "/webfonts/fa-regular-400.ttf",
  "/webfonts/fa-regular-400.svg",
  "/webfonts/fa-brands-400.eot",
  "/webfonts/fa-brands-400.woff2",
  "/webfonts/fa-brands-400.woff",
  "/webfonts/fa-brands-400.ttf",
  "/webfonts/fa-brands-400.svg",
  "/sounds/inputIsEmpty.mp3",
  "/sounds/taskAdded.mp3",
  "/icons/logo-16.png",
  "/icons/logo-32.png",
  "/icons/logo-114.png",
  "/icons/logo-120.png",
  "/icons/logo-128.png",
  "/icons/logo-144.png",
  "/icons/logo-152.png",
  "/icons/logo-180.png",
  "/icons/logo-192.png"
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDevCoffee).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
  })