var webpush = require('web-push');
var https = require('https');

var vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
var vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
var vapidSubject = process.env.VAPID_SUBJECT || 'mailto:test@test.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

var subscriptions = [];

function subscribe(subscription, role) {
  subscriptions = subscriptions.filter(function(s) {
    return s.subscription.endpoint !== subscription.endpoint;
  });
  subscriptions.push({ subscription: subscription, role: role || 'listener' });
  console.log('[PUSH] Subscribed (' + role + '). Total: ' + subscriptions.length);
}

function unsubscribe(endpoint) {
  subscriptions = subscriptions.filter(function(s) {
    return s.subscription.endpoint !== endpoint;
  });
  console.log('[PUSH] Unsubscribed. Total: ' + subscriptions.length);
}

function getVapidPublicKey() {
  return vapidPublicKey;
}

function notifyListeners() {
  var listeners = subscriptions.filter(function(s) { return s.role === 'listener'; });
  if (listeners.length === 0) {
    console.log('[PUSH] No listener subscriptions to notify');
    return;
  }
  var payload = JSON.stringify({
    title: 'Someone needs you',
    body: 'A seeker is waiting. Open Someone Today to connect.',
    url: '/'
  });
  listeners.forEach(function(entry) {
    webpush.sendNotification(entry.subscription, payload).catch(function(err) {
      console.log('[PUSH] Failed:', err.statusCode || err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        unsubscribe(entry.subscription.endpoint);
      }
    });
  });
  console.log('[PUSH] Notified ' + listeners.length + ' listener(s)');
}

var lastDiscordNotify = 0;

function notifyDiscord() {
  console.log('[DISCORD] >>> notifyDiscord() called!');
  var webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('[DISCORD] No webhook URL configured');
    return;
  }
  console.log('[DISCORD] Webhook URL exists: true');

  var now = Date.now();
  if (now - lastDiscordNotify < 15000) {
    console.log('[DISCORD] Rate limited (15s cooldown)');
    return;
  }
  lastDiscordNotify = now;

  var body = JSON.stringify({ content: '**Someone needs help!** A seeker is waiting on Someone Today and no listeners are online. https://someone-today.onrender.com' });

  try {
    var parsed = new URL(webhookUrl);
    var options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    var req = https.request(options, function(res) {
      var responseData = '';
      res.on('data', function(chunk) { responseData += chunk; });
      res.on('end', function() {
        console.log('[DISCORD] Webhook response - status: ' + res.statusCode + ' body: ' + responseData);
      });
    });

    req.on('error', function(err) {
      console.log('[DISCORD] Webhook error: ' + err.message);
    });

    req.write(body);
    req.end();
    console.log('[DISCORD] Webhook request sent');
  } catch (err) {
    console.log('[DISCORD] Invalid webhook URL: ' + err.message);
  }
}

module.exports = {
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  getVapidPublicKey: getVapidPublicKey,
  notifyListeners: notifyListeners,
  notifyDiscord: notifyDiscord
};
