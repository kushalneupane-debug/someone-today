// Someone Today service worker: shows "someone wrote back" notifications.
// The browser keeps this running in the background so pushes arrive even
// when the site is closed. It never caches pages.

self.addEventListener("install", function() { self.skipWaiting(); });
self.addEventListener("activate", function(event) { event.waitUntil(self.clients.claim()); });

self.addEventListener("push", function(event) {
  var data = { title: "Someone wrote back", body: "Someone replied to your letter.", url: "/" };
  try { data = Object.assign(data, event.data.json()); } catch (e) {}
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/badge-96.png",
    tag: data.tag,          // a newer ping for the same letter replaces the old one
    renotify: Boolean(data.tag),
    data: { url: data.url },
  }));
});

// Tapping the notification opens the letter, reusing an open tab if there is one.
self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  var url = new URL((event.notification.data && event.notification.data.url) || "/", self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].url.indexOf(self.location.origin) === 0 && "navigate" in list[i]) {
        return list[i].navigate(url).then(function(c) { return c && c.focus(); });
      }
    }
    return self.clients.openWindow(url);
  }));
});
