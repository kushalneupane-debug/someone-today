var webpush = require('web-push');

var VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
var VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
var VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:kushal.neupane@ace.tamut.edu';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

var subscriptions = new Map();

function subscribe(subscription, role) {
  subscriptions.set(subscription.endpoint, { subscription: subscription, role: role });
}

function unsubscribe(endpoint) {
  subscriptions.delete(endpoint);
}

function getVapidPublicKey() {
  return VAPID_PUBLIC;
}

function notifyListeners() {
  var count = 0;
  subscriptions.forEach(function(entry) {
    if (entry.role === 'listener') {
      var payload = JSON.stringify({
        title: 'Someone needs you',
        body: 'A person is waiting for a listener on Someone Today.',
        url: '/'
      });
      webpush.sendNotification(entry.subscription, payload).catch(function(err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          subscriptions.delete(entry.subscription.endpoint);
        }
      });
      count++;
    }
  });
  return count;
}

module.exports = {
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  getVapidPublicKey: getVapidPublicKey,
  notifyListeners: notifyListeners
};
