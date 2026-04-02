self.addEventListener('push', function(event) {
  var data = { title: 'Someone Today', body: 'Someone needs you.' };
  try { data = event.data.json(); } catch(e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(self.location.origin) !== -1) {
          return list[i].focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
