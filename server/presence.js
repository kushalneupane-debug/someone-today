var express = require("express");
var router = express.Router();

// Live presence, held only in memory. Each open tab sends a heartbeat every
// ~20s saying which letter it's on and whether it's writing a reply. Anyone
// silent for 60s is forgotten. Nothing here is ever written to disk.

var TTL_MS = 60 * 1000;
var MAX_SESSIONS = 20000;
var sessions = new Map(); // sid -> { at, letterId, writing }

function sweep(now) {
  sessions.forEach(function(s, sid) { if (now - s.at > TTL_MS) sessions.delete(sid); });
}
setInterval(function() { sweep(Date.now()); }, 30 * 1000).unref();

function hereNow(now) {
  var n = 0;
  sessions.forEach(function(s) { if (now - s.at <= TTL_MS) n++; });
  return n;
}

function validId(v) { return typeof v === "string" && /^[a-f0-9]{24}$/i.test(v); }

// Who else is on a letter (excluding the asker).
function onLetter(letterId, exceptSid) {
  var reading = 0, writing = 0, now = Date.now();
  sessions.forEach(function(s, sid) {
    if (sid === exceptSid || s.letterId !== letterId || now - s.at > TTL_MS) return;
    if (s.writing) writing++; else reading++;
  });
  return { reading: reading, writing: writing };
}

router.post("/", function(req, res) {
  var body = req.body || {};
  var sid = typeof body.sid === "string" && /^[a-z0-9-]{8,64}$/i.test(body.sid) ? body.sid : null;
  if (!sid) return res.status(400).json({ error: "Bad session" });

  var now = Date.now();
  if (body.leaving) { sessions.delete(sid); return res.json({ ok: true }); }
  if (!sessions.has(sid) && sessions.size >= MAX_SESSIONS) sweep(now);
  if (!sessions.has(sid) && sessions.size >= MAX_SESSIONS) return res.json({ here: hereNow(now) });

  var letterId = validId(body.letterId) ? body.letterId : null;
  sessions.set(sid, { at: now, letterId: letterId, writing: Boolean(body.writing && letterId) });

  // Presence on the letters this browser wrote, so writers can feel someone there.
  var mine = {};
  (Array.isArray(body.mine) ? body.mine : []).filter(validId).slice(0, 50).forEach(function(id) {
    var p = onLetter(id, sid);
    if (p.reading || p.writing) mine[id] = p;
  });

  res.json({
    here: hereNow(now),
    letter: letterId ? onLetter(letterId, sid) : null,
    mine: mine,
  });
});

module.exports = router;
