var express = require("express");
var crypto = require("crypto");
var mongoose = require("mongoose");
var moderation = require("./moderation");
var push = require("./push");
var router = express.Router();

var MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/someonetoday";
mongoose.connect(MONGO_URI).then(function() { console.log("[LETTERS] Connected to MongoDB"); }).catch(function(err) { console.log("[LETTERS] MongoDB error:", err.message); });

var WARMTH = {
  letter: ["You're not alone", "Sending strength", "I've been there too", "This will pass"],
  light: ["So proud of you", "This made my day", "You deserve this"],
};
var ALL_WARMTH = WARMTH.letter.concat(WARMTH.light);
var VALID_TAGS = ["lonely","anxious","sad","lost","grateful","hopeful","overwhelmed","angry","numb","healing"];
var HIDE_AFTER_REPORTS = 3;

var replySchema = new mongoose.Schema({ warmth: String, text: String, createdAt: { type: Number, default: Date.now } });
var letterSchema = new mongoose.Schema({
  text: { type: String, required: true },
  tags: [String],
  type: { type: String, default: "letter" },
  hearts: { type: Number, default: 0 },
  heartIPs: [String],   // hashed network addresses, one per person
  meToo: { type: Number, default: 0 },
  meTooKeys: [String],  // hashed network addresses, one per person
  reports: [String],    // hashed network addresses, one per person
  hidden: { type: Boolean, default: false },
  replies: [replySchema],
  createdAt: { type: Number, default: Date.now },
});
var Letter = mongoose.model("Letter", letterSchema);

// We never store a raw network address. A salted hash lets us tell
// "same person" apart without knowing who anyone is.
var SALT = process.env.IP_SALT || "someone-today-dev-salt";
if (!process.env.IP_SALT) console.log("[LETTERS] IP_SALT not set; using a dev salt. Set it in production.");
function visitorKey(req) {
  var ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  return crypto.createHash("sha256").update(SALT + ip).digest("hex").slice(0, 32);
}

// Simple in-memory cooldowns (reset on restart, which is fine).
var cooldowns = new Map();
function onCooldown(key, ms) {
  var last = cooldowns.get(key) || 0;
  if (Date.now() - last < ms) return Math.ceil((ms - (Date.now() - last)) / 1000);
  cooldowns.set(key, Date.now());
  return 0;
}
setInterval(function() { var cut = Date.now() - 3600 * 1000; cooldowns.forEach(function(t, k) { if (t < cut) cooldowns.delete(k); }); }, 600 * 1000).unref();

var VISIBLE = { hidden: { $ne: true } };

function preview(l) {
  return { id: l._id, text: l.text.length > 200 ? l.text.slice(0, 200) + "..." : l.text, tags: l.tags, hearts: l.hearts || 0, meToo: l.meToo || 0, replyCount: (l.replies || []).length, createdAt: l.createdAt, type: l.type || "letter" };
}

router.get("/", function(req, res) {
  var page = parseInt(req.query.page) || 0;
  var limit = 20;
  var filter = Object.assign({}, VISIBLE);
  // Heavy letters and good news live on separate tabs, never mixed.
  if (req.query.type === "light") filter.type = "light";
  else if (req.query.type === "letter") filter.type = { $ne: "light" };
  Letter.countDocuments(filter).then(function(total) {
    return Letter.find(filter).sort({ createdAt: -1 }).skip(page * limit).limit(limit).then(function(letters) {
      res.json({ letters: letters.map(preview), total: total, hasMore: (page + 1) * limit < total });
    });
  }).catch(function() { res.status(500).json({ error: "Failed to load letters" }); });
});

// Heavy letters nobody has answered yet, oldest first, so they get seen.
router.get("/waiting", function(req, res) {
  Letter.find(Object.assign({ type: { $ne: "light" }, replies: { $size: 0 } }, VISIBLE)).sort({ createdAt: 1 }).limit(5)
    .then(function(letters) { res.json({ letters: letters.map(preview) }); })
    .catch(function() { res.status(500).json({ error: "Failed to load letters" }); });
});

// Reply counts for the letters this browser wrote. Must sit above "/:id",
// or Express would treat "status" as a letter id.
router.get("/status", function(req, res) {
  var ids = String(req.query.ids || "").split(",").filter(function(id) { return mongoose.Types.ObjectId.isValid(id); }).slice(0, 50);
  if (ids.length === 0) return res.json({ statuses: [] });
  Letter.aggregate([
    { $match: Object.assign({ _id: { $in: ids.map(function(id) { return new mongoose.Types.ObjectId(id); }) } }, VISIBLE) },
    { $project: { text: { $substrCP: ["$text", 0, 120] }, createdAt: 1, meToo: { $ifNull: ["$meToo", 0] }, replyCount: { $size: { $ifNull: ["$replies", []] } } } }
  ]).then(function(rows) {
    res.json({ statuses: rows.map(function(r) { return { id: r._id, text: r.text, createdAt: r.createdAt, meToo: r.meToo, replyCount: r.replyCount }; }) });
  }).catch(function() { res.status(500).json({ error: "Failed to load status" }); });
});

router.get("/:id", function(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: "Letter not found" });
  Letter.findOne(Object.assign({ _id: req.params.id }, VISIBLE)).then(function(letter) {
    if (!letter) return res.status(404).json({ error: "Letter not found" });
    res.json({
      id: letter._id, text: letter.text, tags: letter.tags, type: letter.type || "letter", hearts: letter.hearts || 0, meToo: letter.meToo || 0, createdAt: letter.createdAt,
      replies: (letter.replies || []).map(function(r) { return { id: r._id, warmth: r.warmth || "", text: r.text || "", createdAt: r.createdAt }; }),
    });
  }).catch(function() { res.status(404).json({ error: "Letter not found" }); });
});

router.post("/", function(req, res) {
  var text = String(req.body.text || "").trim();
  var type = req.body.type === "light" ? "light" : "letter";
  var tags = (Array.isArray(req.body.tags) ? req.body.tags : []).filter(function(t) { return VALID_TAGS.indexOf(t) !== -1; }).slice(0, 3);
  if (text.length < 10) return res.status(400).json({ error: "Letter must be at least 10 characters." });
  if (text.length > 2000) return res.status(400).json({ error: "Letter must be under 2000 characters." });
  var problem = moderation.checkLetter(text);
  if (problem) return res.status(400).json({ error: problem });

  // If someone may be in danger, show them help first. They can still post.
  if (moderation.needsCare(text) && !req.body.sawCare) return res.json({ needsCare: true });

  var key = visitorKey(req);
  var wait = onCooldown("letter:" + key, 10 * 60 * 1000);
  if (wait) return res.status(429).json({ error: "You just posted. You can write again in " + Math.ceil(wait / 60) + " minute(s)." });

  new Letter({ text: text, tags: tags, type: type, createdAt: Date.now() }).save().then(function(saved) {
    res.json({ success: true, letter: preview(saved) });
  }).catch(function() { cooldowns.delete("letter:" + key); res.status(500).json({ error: "Failed to save letter" }); });
});

router.post("/:id/reply", function(req, res) {
  var warmth = String(req.body.warmth || "");
  var text = String(req.body.text || "").trim();
  if (warmth && ALL_WARMTH.indexOf(warmth) === -1) return res.status(400).json({ error: "Pick one of the replies." });
  if (!warmth && text.length < 2) return res.status(400).json({ error: "Pick a reply or write a few words." });
  if (text.length > 280) return res.status(400).json({ error: "Keep it under 280 characters." });
  var problem = text ? moderation.checkReply(text) : null;
  if (problem) return res.status(400).json({ error: problem });

  var wait = onCooldown("reply:" + visitorKey(req), 15 * 1000);
  if (wait) return res.status(429).json({ error: "Give it a few seconds, then try again." });

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: "Letter not found" });
  Letter.findOneAndUpdate(
    Object.assign({ _id: req.params.id }, VISIBLE),
    { $push: { replies: { warmth: warmth, text: text, createdAt: Date.now() } } },
    { new: true, projection: { replies: { $slice: -1 } } }
  ).then(function(letter) {
    if (!letter) return res.status(404).json({ error: "Letter not found" });
    var r = letter.replies[0];
    res.json({ success: true, reply: { id: r._id, warmth: r.warmth, text: r.text, createdAt: r.createdAt } });
    push.notifyReply(letter._id);
  }).catch(function() { res.status(500).json({ error: "Failed to send reply" }); });
});

router.post("/:id/heart", function(req, res) {
  var key = visitorKey(req);
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: "Letter not found" });
  Letter.findOne(Object.assign({ _id: req.params.id }, VISIBLE)).then(function(letter) {
    if (!letter) return res.status(404).json({ error: "Letter not found" });
    var already = (letter.heartIPs || []).indexOf(key) !== -1;
    var update = already ? { $pull: { heartIPs: key }, $inc: { hearts: -1 } } : { $addToSet: { heartIPs: key }, $inc: { hearts: 1 } };
    return Letter.findByIdAndUpdate(letter._id, update, { new: true }).then(function(updated) {
      res.json({ hearts: Math.max(0, updated.hearts), hearted: !already });
    });
  }).catch(function() { res.status(404).json({ error: "Letter not found" }); });
});

// "Me too" on a heavy letter: tells the writer they're not the only one.
// One per person, pressing again takes it back.
router.post("/:id/metoo", function(req, res) {
  var key = visitorKey(req);
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: "Letter not found" });
  Letter.findOne(Object.assign({ _id: req.params.id, type: { $ne: "light" } }, VISIBLE)).then(function(letter) {
    if (!letter) return res.status(404).json({ error: "Letter not found" });
    var already = (letter.meTooKeys || []).indexOf(key) !== -1;
    var update = already ? { $pull: { meTooKeys: key }, $inc: { meToo: -1 } } : { $addToSet: { meTooKeys: key }, $inc: { meToo: 1 } };
    return Letter.findByIdAndUpdate(letter._id, update, { new: true }).then(function(updated) {
      res.json({ meToo: Math.max(0, updated.meToo || 0), pressed: !already });
    });
  }).catch(function() { res.status(404).json({ error: "Letter not found" }); });
});

// Three different people reporting a letter hides it. No human review needed.
router.post("/:id/report", function(req, res) {
  var key = visitorKey(req);
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: "Letter not found" });
  Letter.findByIdAndUpdate(req.params.id, { $addToSet: { reports: key } }, { new: true }).then(function(letter) {
    if (!letter) return res.status(404).json({ error: "Letter not found" });
    if ((letter.reports || []).length >= HIDE_AFTER_REPORTS && !letter.hidden) {
      return Letter.updateOne({ _id: letter._id }, { hidden: true }).then(function() { res.json({ success: true }); });
    }
    res.json({ success: true });
  }).catch(function() { res.status(500).json({ error: "Failed to report" }); });
});

module.exports = router;
