var express = require('express');
var http = require('http');
var path = require('path');
var Server = require('socket.io').Server;
var cors = require('cors');
var reportRoutes = require('./reports');
var matching = require('./matching');
var addToQueue = matching.addToQueue;
var removeFromQueue = matching.removeFromQueue;
var sessions = require('./sessions');
var createSession = sessions.createSession;
var startSessionTimer = sessions.startSessionTimer;
var endSession = sessions.endSession;
var getSessionBySocket = sessions.getSessionBySocket;
var wasSessionEnded = sessions.wasSessionEnded;
var markSessionEnded = sessions.markSessionEnded;

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

app.use(express.static(path.join(__dirname, '../client/dist')));

var io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

var messageCooldown = new Map();

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
    if (match) startMatch(match);
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

  var message = reason === 'time-expired'
    ? 'Your time together has ended. Thank you for being here.'
    : reason === 'step-away'
    ? 'The other person has stepped away. Thank you for being here.'
    : 'The session has ended.';

  io.to(session.roomId).emit('session-ended', { reason: reason, message: message });

  var seekerSocket = io.sockets.sockets.get(session.seeker);
  var listenerSocket = io.sockets.sockets.get(session.listener);
  if (seekerSocket) seekerSocket.leave(session.roomId);
  if (listenerSocket) listenerSocket.leave(session.roomId);

  console.log('[ACTIVE SESSIONS] ' + activeSessionCount);
}

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

server.listen(PORT, function() {
  console.log('\n  Someone Today is listening on port ' + PORT + '\n');
});
