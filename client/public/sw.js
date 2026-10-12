// Push notifications were removed. This replaces the old worker on returning
// visitors' browsers and then unregisters itself.
self.addEventListener('install', function() { self.skipWaiting(); });
self.addEventListener('activate', function() { self.registration.unregister(); });
