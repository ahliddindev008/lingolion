const CACHE_NAME = "lingolion-shell-v39";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/lion.svg",
  "./icons/lion-192.png",
  "./icons/lion-512.png",
  "./css/style.css",
  "./js/i18n.js",
  "./js/api.js",
  "./js/views/auth.js",
  "./js/app.js",
  "./js/pwa.js",
  "./js/views/onboarding.js",
  "./js/views/lesson-generator.js",
  "./js/speech.js",
  "./js/views/course.js",
  "./js/views/speaking-practice.js",
  "./js/topic_catalog.js",
  "./js/vocabulary_catalog.js",
  "./js/game_catalog.js",
  "./js/games/vocabulary-learning.js",
  "./js/views/communication.js",
  "./js/views/rating.js",
  "./js/views/games.js",
  "./js/views/profile.js",
  "./js/views/admin.js",
  "./locales/tj.json",
  "./locales/ru.json",
  "./locales/en.json",
  "./locales/de.json",
  "./locales/fr.json",
  "./locales/es.json",
  "./locales/it.json",
  "./locales/tr.json",
  "./locales/ar.json",
  "./locales/fa.json",
  "./locales/zh-CN.json",
  "./locales/ja.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("lingolion-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request, { cache: "no-store" });
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") return cache.match("./index.html");
      return Response.error();
    }
  })());
});