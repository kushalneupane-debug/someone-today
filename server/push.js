var express = require("express");
var mongoose = require("mongoose");
var webpush = require("web-push");
var router = express.Router();

// Web push for "someone wrote back". No accounts: a writer's browser hands us
// a push subscription (a URL at Google/Apple/Mozilla's push service + keys),
// we store it next to the letter id, and post an encrypted ping on reply.

var PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
var PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
var enabled = Boolean(PUBLIC_KEY && PRIVATE_KEY);
if (enabled) {
  // A typo in these settings must never take the whole site down:
  // switch notifications off and say why, instead of crashing on startup.
  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:prabesharyal346@gmail.com", PUBLIC_KEY, PRIVATE_KEY);
  } catch (err) {
    enabled = false;
    console.log("[PUSH] Bad VAPID settings, reply notifications are off: " + err.message);
  }
} else {
  console.log("[PUSH] VAPID keys not set; reply notifications are off.");
}

var KEEP_DAYS = 30;            // subscriptions delete themselves after this
var COOLDOWN_MS = 10 * 60 * 1000; // at most one ping per letter per browser per 10 min
var MAX_PER_LETTER = 10;

var subSchema = new mongoose.Schema({
  letterId: { type: mongoose.Schema.Types.ObjectId, index: true },
  endpoint: String,
  keys: { p256dh: String, auth: String },
  lastSentAt: { type: Date, default: null },
  // TTL index: MongoDB deletes the document once this time passes.
  expiresAt: { type: Date, default: function() { return new Date(Date.now() + KEEP_DAYS * 86400000); }, index: { expireAfterSeconds: 0 } },
});
subSchema.index({ letterId: 1, endpoint: 1 }, { unique: true });
var Subscription = mongoose.model("Subscription", subSchema);

function validSubscription(s) {
  return s && typeof s.endpoint === "string" && /^https:\/\//.test(s.endpoint) && s.endpoint.length < 1000 &&
    s.keys && typeof s.keys.p256dh === "string" && typeof s.keys.auth === "string" &&
    s.keys.p256dh.length < 200 && s.keys.auth.length < 100;
}

router.get("/key", function(req, res) {
  if (!enabled) return res.status(404).json({ error: "Notifications are off" });
  res.json({ key: PUBLIC_KEY });
});

router.post("/subscribe", function(req, res) {
  if (!enabled) return res.status(404).json({ error: "Notifications are off" });
  var letterId = String(req.body.letterId || "");
  var sub = req.body.subscription;
  if (!mongoose.Types.ObjectId.isValid(letterId) || !validSubscription(sub)) return res.status(400).json({ error: "Bad subscription" });
  var Letter = mongoose.model("Letter");
  Letter.exists({ _id: letterId, hidden: { $ne: true } }).then(function(found) {
    if (!found) return res.status(404).json({ error: "Letter not found" });
    return Subscription.countDocuments({ letterId: letterId }).then(function(n) {
      if (n >= MAX_PER_LETTER) return res.status(429).json({ error: "Too many devices for this letter" });
      return Subscription.updateOne(
        { letterId: letterId, endpoint: sub.endpoint },
        { $set: { keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth }, expiresAt: new Date(Date.now() + KEEP_DAYS * 86400000) } },
        { upsert: true }
      ).then(function() { res.json({ success: true }); });
    });
  }).catch(function() { res.status(500).json({ error: "Couldn't turn on notifications" }); });
});

router.post("/unsubscribe", function(req, res) {
  var letterId = String(req.body.letterId || "");
  var endpoint = String(req.body.endpoint || "");
  if (!mongoose.Types.ObjectId.isValid(letterId) || !endpoint) return res.status(400).json({ error: "Bad request" });
  Subscription.deleteOne({ letterId: letterId, endpoint: endpoint })
    .then(function() { res.json({ success: true }); })
    .catch(function() { res.status(500).json({ error: "Couldn't turn off notifications" }); });
});

// Called after a reply is saved. Fire-and-forget: a failed ping never blocks a reply.
function notifyReply(letterId) {
  if (!enabled) return Promise.resolve(0);
  var cutoff = new Date(Date.now() - COOLDOWN_MS);
  return Subscription.find({ letterId: letterId, $or: [{ lastSentAt: null }, { lastSentAt: { $lt: cutoff } }] }).then(function(subs) {
    // The lock screen is public: never include the reply's words.
    var payload = JSON.stringify({ title: "Someone wrote back", body: "Someone replied to your letter.", url: "/letter/" + letterId, tag: "letter-" + letterId });
    return Promise.all(subs.map(function(s) {
      return webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload, { TTL: 24 * 3600 })
        .then(function() { return Subscription.updateOne({ _id: s._id }, { lastSentAt: new Date() }).then(function() { return 1; }); })
        .catch(function(err) {
          // 404/410 mean the browser unsubscribed or the subscription expired.
          if (err && (err.statusCode === 404 || err.statusCode === 410)) return Subscription.deleteOne({ _id: s._id }).then(function() { return 0; });
          console.log("[PUSH] send failed:", err && err.statusCode);
          return 0;
        });
    }));
  }).then(function(results) { return results.reduce(function(a, b) { return a + b; }, 0); })
    .catch(function() { return 0; });
}

module.exports = { router: router, notifyReply: notifyReply };
