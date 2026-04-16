var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var Server = require('socket.io').Server;
var cors = require('cors');
var reportRoutes = require('./reports');
var matching = require('./matching');
var addToQueue = matching.addToQueue;
var removeFromQueue = matching.removeFromQueue;
var getQueueCounts = matching.getQueueCounts;
var sessions = require('./sessions');
var createSession = sessions.createSession;
var startSessionTimer = sessions.startSessionTimer;
var extendSession = sessions.extendSession;
var endSession = sessions.endSession;
var getSessionBySocket = sessions.getSessionBySocket;
var wasSessionEnded = sessions.wasSessionEnded;
var markSessionEnded = sessions.markSessionEnded;
var push = require('./push');

var app = express();
var server = http.createServer(app);
var PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/report', reportRoutes);

app.get('/api/health', function(req, res) {
  res.json({ status: 'ok', message: 'Someone is here.' });
});

var activeSessionCount = 0;
app.get('/api/active', function(req, res) {
  res.json({ active: activeSessionCount });
});

app.get('/api/push/vapid-public-key', function(req, res) {
  res.json({ key: push.getVapidPublicKey() });
});

app.post('/api/push/subscribe', function(req, res) {
  var subscription = req.body.subscription;
  var role = req.body.role;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }
  push.subscribe(subscription, role || 'listener');
  res.json({ success: true });
});

app.post('/api/push/unsubscribe', function(req, res) {
  var endpoint = req.body.endpoint;
  if (!endpoint) {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }
  push.unsubscribe(endpoint);
  res.json({ success: true });
});

app.use(express.static(path.join(__dirname, '../client/dist')));

var io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

var messageCooldown = new Map();
var lastDiscordNotify = 0;

function sendDiscordWebhook(reason) {
  console.log('[DISCORD] sendDiscordWebhook called - reason: ' + reason);
  var webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('[DISCORD] ERROR: DISCORD_WEBHOOK_URL not set');
    return;
  }
  var now = Date.now();
  if (now - lastDiscordNotify < 15000) {
    console.log('[DISCORD] Skipped - 15s cooldown');
    return;
  }
  lastDiscordNotify = now;
  var body = JSON.stringify({ content: '**Someone needs help!** A seeker is waiting on Someone Today and no listeners are online. https://someone-today.onrender.com' });
  try {
    var parsed = new URL(webhookUrl);
    var options = { hostname: parsed.hostname, path: parsed.pathname + parsed.search, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
    var r = https.request(options, function(resp) {
      var d = '';
      resp.on('data', function(c) { d += c; });
      resp.on('end', function() {
        console.log('[DISCORD] status: ' + resp.statusCode + ' body: ' + d);
      });
    });
    r.on('error', function(e) { console.log('[DISCORD] error: ' + e.message); });
    r.write(body);
    r.end();
    console.log('[DISCORD] Request sent (' + reason + ')');
  } catch(e) {
    console.log('[DISCORD] Failed: ' + e.message);
  }
}

io.on('connection', function(socket) {
  console.log('[CONNECT] ' + socket.id);

  socket.on('join-queue', function(data) {
    var role = data.role;
    var duration = data.duration;
    var mood = data.mood || null;
    if (role !== 'seeker' && role !== 'listener') return;
    if (duration !== 15 && duration !== 30) return;

    if (wasSessionEnded(socket.id)) {
      socket.emit('session-ended', {
        reason: 'previous-session',
        message: 'Your previous session has ended. Please refresh.'
      });
      return;
    }

    console.log('[QUEUE] ' + socket.id + ' joined as ' + role + ' for ' + duration + ' min' + (mood ? ' (mood: ' + mood + ')' : ''));
    socket.emit('waiting', { message: 'Looking for someone...' });

    var match = addToQueue(socket.id, role, duration, mood);
    if (match) {
      startMatch(match);
    } else if (role === 'seeker') {
      console.log('[SEEKER] No match - sending Discord webhook NOW');
      socket.emit('no-listeners');
      push.notifyListeners();
      sendDiscordWebhook('seeker-no-match');

      setTimeout(function() {
        var counts = getQueueCounts();
        if (counts.seekers > 0 && counts.listeners === 0) {
          console.log('[SEEKER] Still waiting after 2 min - retrying');
          sendDiscordWebhook('seeker-retry-2min');
        }
      }, 120000);
    }
  });

  socket.on('send-message', function(data) {
    var session = getSessionBySocket(socket.id);
    if (!session) return;
    var now = Date.now();
    var last = messageCooldown.get(socket.id) || 0;
    if (now - last < 500) return;
    messageCooldown.set(socket.id, now);
    var safeText = (data.text || '').trim().slice(0, 500);
    if (!safeText) return;
    io.to(session.roomId).emit('new-message', {
      from: socket.id === session.seeker ? 'seeker' : 'listener',
      text: safeText,
      time: Date.now()
    });
  });

  socket.on('typing', function() {
    var session = getSessionBySocket(socket.id);
    if (!session) return;
    var target = socket.id === session.seeker ? session.listener : session.seeker;
    io.to(target).emit('user-typing');
  });

  socket.on('stop-typing', function() {
    var session = getSessionBySocket(socket.id);
    if (!session) return;
    var target = socket.id === session.seeker ? session.listener : session.seeker;
    io.to(target).emit('user-stopped-typing');
  });

  socket.on('request-extend', function() {
    var session = getSessionBySocket(socket.id);
    if (!session) return;
    if (session.extended) return;
    session.extensionRequester = socket.id;
    var target = socket.id === session.seeker ? session.listener : session.seeker;
    io.to(target).emit('extension-requested');
    console.log('[EXTEND] ' + socket.id + ' requested extension');
  });

  socket.on('respond-extend', function(data) {
    var session = getSessionBySocket(socket.id);
    if (!session) return;
    if (session.extended) return;
    if (!session.extensionRequester) return;
    if (data.accepted) {
      var updated = extendSession(session.roomId, 5, function(endedSession) {
        console.log('[TIMER] Session ' + endedSession.roomId + ' ended');
        handleSessionEnd(endedSession, 'time-expired');
      });
      if (updated) {
        io.to(session.roomId).emit('extension-accepted', { newEndsAt: updated.endsAt });
        console.log('[EXTEND] Extension accepted for ' + session.roomId);
      }
    } else {
      io.to(session.extensionRequester).emit('extension-declined');
      session.extensionRequester = null;
      console.log('[EXTEND] Extension declined for ' + session.roomId);
    }
  });

  socket.on('step-away', function() {
    var session = getSessionBySocket(socket.id);
    if (!session) return;
    console.log('[STEP AWAY] ' + socket.id);
    handleSessionEnd(session, 'step-away');
  });

  socket.on('leave-queue', function() {
    removeFromQueue(socket.id);
  });

  socket.on('session-feedback', function(data) {
    if (data.rating !== 'positive' && data.rating !== 'neutral' && data.rating !== 'negative') return;
    console.log('[FEEDBACK] ' + socket.id + ' rated: ' + data.rating);
  });

  socket.on('disconnect', function() {
    console.log('[DISCONNECT] ' + socket.id);
    removeFromQueue(socket.id);
    messageCooldown.delete(socket.id);
    var session = getSessionBySocket(socket.id);
    if (session) handleSessionEnd(session, 'disconnect');
  });
});

function startMatch(match) {
  var session = createSession(match.seeker, match.listener, match.duration, match.mood);
  var seekerSocket = io.sockets.sockets.get(match.seeker);
  var listenerSocket = io.sockets.sockets.get(match.listener);
  if (!seekerSocket || !listenerSocket) {
    endSession(session.roomId);
    markSessionEnded(match.seeker);
    markSessionEnded(match.listener);
    return;
  }
  seekerSocket.join(session.roomId);
  listenerSocket.join(session.roomId);
  activeSessionCount++;
  io.to(session.roomId).emit('matched', {
    roomId: session.roomId,
    duration: session.duration,
    startsAt: session.startedAt,
    endsAt: session.endsAt,
    mood: session.mood
  });
  console.log('[MATCH] ' + match.seeker + ' <-> ' + match.listener + ' for ' + match.duration + ' min');
  console.log('[ACTIVE SESSIONS] ' + activeSessionCount);
  startSessionTimer(session.roomId, function(endedSession) {
    console.log('[TIMER] Session ' + endedSession.roomId + ' ended');
    handleSessionEnd(endedSession, 'time-expired');
  });
}

function handleSessionEnd(session, reason) {
  var ended = endSession(session.roomId);
  if (!ended) return;
  activeSessionCount = Math.max(0, activeSessionCount - 1);
  markSessionEnded(session.seeker);
  markSessionEnded(session.listener);
  messageCooldown.delete(session.seeker);
  messageCooldown.delete(session.listener);
  var message =
    reason === 'time-expired' ? 'Your time together has ended. Thank you for being here.' :
    reason === 'step-away' ? 'The other person has stepped away. Thank you for being here.' :
    'The session has ended.';
  io.to(session.roomId).emit('session-ended', { reason: reason, message: message });
  var seekerSocket = io.sockets.sockets.get(session.seeker);
  var listenerSocket = io.sockets.sockets.get(session.listener);
  if (seekerSocket) seekerSocket.leave(session.roomId);
  if (listenerSocket) listenerSocket.leave(session.roomId);
  console.log('[ACTIVE SESSIONS] ' + activeSessionCount);
}

app.get('/api/test-discord', function(req, res) {
  var webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.json({ ok: false, error: 'DISCORD_WEBHOOK_URL is NOT set' });
  }
  sendDiscordWebhook('test-endpoint');
  res.json({ ok: true, message: 'Webhook fired! Check Discord.' });
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

server.listen(PORT, function() {
  console.log('\n Someone Today is listening on port ' + PORT + '\n');
});
