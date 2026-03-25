const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const reportRoutes = require('./reports');
const {
  addToQueue, removeFromQueue, markSessionEnded
} = require('./matching');
const {
  createSession, startSessionTimer, endSession,
  getSessionBySocket, wasSessionEnded
} = require('./sessions');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/report', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Someone is here.' });
});

// Active session counter endpoint
let activeSessionCount = 0;

app.get('/api/active', (req, res) => {
  res.json({ active: activeSessionCount });
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Rate limiting map
const messageCooldown = new Map();

io.on('connection', (socket) => {
  console.log('[CONNECT] ' + socket.id);

  socket.on('join-queue', ({ role, duration }) => {
    if (!['seeker', 'listener'].includes(role)) return;
    if (![15, 30].includes(duration)) return;

    if (wasSessionEnded(socket.id)) {
      socket.emit('session-ended', {
        reason: 'previous-session',
        message: 'Your previous session has ended. Please refresh.'
      });
      return;
    }

    console.log('[QUEUE] ' + socket.id + ' joined as ' + role + ' for ' + duration + ' min');
    socket.emit('waiting', { message: 'Looking for someone...' });

    const match = addToQueue(socket.id, role, duration);
    if (match) startMatch(match);
  });

  socket.on('send-message', ({ text }) => {
    const session = getSessionBySocket(socket.id);
    if (!session) return;

    // Rate limiting - 500ms minimum between messages
    const now = Date.now();
    const last = messageCooldown.get(socket.id) || 0;
    if (now - last < 500) return;
    messageCooldown.set(socket.id, now);

    const safeText = (text || '').trim().slice(0, 500);
    if (!safeText) return;

    io.to(session.roomId).emit('new-message', {
      from: socket.id === session.seeker ? 'seeker' : 'listener',
      text: safeText,
      time: Date.now()
    });
  });

  // Typing indicators
  socket.on('typing', () => {
    const session = getSessionBySocket(socket.id);
    if (!session) return;
    const target = socket.id === session.seeker ? session.listener : session.seeker;
    io.to(target).emit('user-typing');
  });

  socket.on('stop-typing', () => {
    const session = getSessionBySocket(socket.id);
    if (!session) return;
    const target = socket.id === session.seeker ? session.listener : session.seeker;
    io.to(target).emit('user-stopped-typing');
  });

  socket.on('step-away', () => {
    const session = getSessionBySocket(socket.id);
    if (!session) return;
    console.log('[STEP AWAY] ' + socket.id);
    handleSessionEnd(session, 'step-away');
  });

  socket.on('leave-queue', () => {
    removeFromQueue(socket.id);
  });

  // Session feedback
  socket.on('session-feedback', ({ rating }) => {
    if (!['positive', 'neutral', 'negative'].includes(rating)) return;
    console.log('[FEEDBACK] ' + socket.id + ' rated: ' + rating);
  });

  socket.on('disconnect', () => {
    console.log('[DISCONNECT] ' + socket.id);
    removeFromQueue(socket.id);
    messageCooldown.delete(socket.id);
    const session = getSessionBySocket(socket.id);
    if (session) handleSessionEnd(session, 'disconnect');
  });
});

function startMatch(match) {
  const session = createSession(match.seeker, match.listener, match.duration);
  const seekerSocket = io.sockets.sockets.get(match.seeker);
  const listenerSocket = io.sockets.sockets.get(match.listener);

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
    endsAt: session.endsAt
  });

  console.log('[MATCH] ' + match.seeker + ' <-> ' + match.listener + ' for ' + match.duration + ' min');
  console.log('[ACTIVE SESSIONS] ' + activeSessionCount);

  startSessionTimer(session.roomId, (endedSession) => {
    console.log('[TIMER] Session ' + endedSession.roomId + ' ended');
    handleSessionEnd(endedSession, 'time-expired');
  });
}

function handleSessionEnd(session, reason) {
  const ended = endSession(session.roomId);
  if (!ended) return;

  activeSessionCount = Math.max(0, activeSessionCount - 1);

  markSessionEnded(session.seeker);
  markSessionEnded(session.listener);

  // Clean up rate limiting
  messageCooldown.delete(session.seeker);
  messageCooldown.delete(session.listener);

  const message = reason === 'time-expired'
    ? 'Your time together has ended. Thank you for being here.'
    : reason === 'step-away'
    ? 'The other person has stepped away. Thank you for being here.'
    : 'The session has ended.';

  io.to(session.roomId).emit('session-ended', { reason, message });

  const seekerSocket = io.sockets.sockets.get(session.seeker);
  const listenerSocket = io.sockets.sockets.get(session.listener);
  if (seekerSocket) seekerSocket.leave(session.roomId);
  if (listenerSocket) listenerSocket.leave(session.roomId);

  console.log('[ACTIVE SESSIONS] ' + activeSessionCount);
}

server.listen(PORT, () => {
  console.log('\n  Someone Today is listening on port ' + PORT + '\n');
});
