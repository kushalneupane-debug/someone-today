var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var DATA_FILE = path.join(__dirname, 'letters.json');
var rateLimitMap = new Map();

function loadLetters() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) { console.log('[LETTERS] Error:', e.message); }
  return [];
}

function saveLetters(letters) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(letters, null, 2));
}

function getClientIP(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
}

router.get('/', function(req, res) {
  var letters = loadLetters();
  var page = parseInt(req.query.page) || 0;
  var limit = 20;
  var tag = req.query.tag || null;
  if (tag && tag !== 'all') {
    letters = letters.filter(function(l) { return l.tags && l.tags.indexOf(tag) !== -1; });
  }
  letters.sort(function(a, b) { return b.createdAt - a.createdAt; });
  var total = letters.length;
  var paged = letters.slice(page * limit, (page + 1) * limit);
  var safe = paged.map(function(l) {
    return { id: l.id, text: l.text.length > 200 ? l.text.slice(0, 200) + '...' : l.text, tags: l.tags, hearts: l.hearts || 0, replyCount: (l.replies || []).length, createdAt: l.createdAt, type: l.type || 'letter' };
  });
  res.json({ letters: safe, total: total, hasMore: (page + 1) * limit < total });
});

router.get('/:id', function(req, res) {
  var letters = loadLetters();
  var letter = letters.find(function(l) { return l.id === req.params.id; });
  if (!letter) return res.status(404).json({ error: 'Letter not found' });
  res.json(letter);
});

router.post('/', function(req, res) {
  var ip = getClientIP(req);
  var now = Date.now();
  var lastPost = rateLimitMap.get(ip);
  if (lastPost && now - lastPost < 600000) {
    var wait = Math.ceil((600000 - (now - lastPost)) / 60000);
    return res.status(429).json({ error: 'Please wait ' + wait + ' more minute(s).' });
  }
  var text = (req.body.text || '').trim();
  var tags = req.body.tags || [];
  var type = req.body.type || 'letter';
  if (!text || text.length < 10) return res.status(400).json({ error: 'Letter must be at least 10 characters.' });
  if (text.length > 2000) return res.status(400).json({ error: 'Letter must be under 2000 characters.' });
  var validTags = ['lonely','anxious','sad','lost','grateful','hopeful','overwhelmed','angry','numb','healing'];
  tags = tags.filter(function(t) { return validTags.indexOf(t) !== -1; }).slice(0, 3);
  var letter = { id: crypto.randomBytes(8).toString('hex'), text: text, tags: tags, type: type, hearts: 0, heartIPs: [], replies: [], createdAt: now };
  var letters = loadLetters();
  letters.push(letter);
  saveLetters(letters);
  rateLimitMap.set(ip, now);
  console.log('[LETTER] New ' + type + ' posted (' + letter.id + ')');
  res.json({ success: true, letter: { id: letter.id, text: letter.text, tags: letter.tags, type: letter.type, hearts: 0, replyCount: 0, createdAt: letter.createdAt } });
});

router.post('/:id/reply', function(req, res) {
  var text = (req.body.text || '').trim();
  if (!text || text.length < 2) return res.status(400).json({ error: 'Reply is too short.' });
  if (text.length > 500) return res.status(400).json({ error: 'Reply must be under 500 characters.' });
  var letters = loadLetters();
  var letter = letters.find(function(l) { return l.id === req.params.id; });
  if (!letter) return res.status(404).json({ error: 'Letter not found' });
  var reply = { id: crypto.randomBytes(6).toString('hex'), text: text, createdAt: Date.now() };
  letter.replies.push(reply);
  saveLetters(letters);
  res.json({ success: true, reply: reply });
});

router.post('/:id/heart', function(req, res) {
  var ip = getClientIP(req);
  var letters = loadLetters();
  var letter = letters.find(function(l) { return l.id === req.params.id; });
  if (!letter) return res.status(404).json({ error: 'Letter not found' });
  if (!letter.heartIPs) letter.heartIPs = [];
  var idx = letter.heartIPs.indexOf(ip);
  if (idx === -1) { letter.heartIPs.push(ip); letter.hearts = (letter.hearts || 0) + 1; }
  else { letter.heartIPs.splice(idx, 1); letter.hearts = Math.max(0, (letter.hearts || 1) - 1); }
  saveLetters(letters);
  res.json({ hearts: letter.hearts, hearted: idx === -1 });
});

module.exports = router;
