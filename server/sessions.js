var sessions = new Map();
var endedSessions = new Set();

function createSession(seeker, listener, duration, mood) {
  var roomId = 'room-' + Date.now();
  var now = Date.now();
  var session = {
    roomId: roomId,
    seeker: seeker,
    listener: listener,
    duration: duration,
    mood: mood || null,
    startedAt: now,
    endsAt: now + duration * 60 * 1000,
    timer: null,
    extended: false,
    extensionRequester: null
  };
  sessions.set(roomId, session);
  sessions.set(seeker, session);
  sessions.set(listener, session);
  return session;
}

function startSessionTimer(roomId, onEnd) {
  var session = sessions.get(roomId);
  if (!session) return;
  var remaining = session.endsAt - Date.now();
  session.timer = setTimeout(function() {
    onEnd(session);
  }, remaining);
}

function extendSession(roomId, extraMinutes, onEnd) {
  var session = sessions.get(roomId);
  if (!session) return null;
  if (session.extended) return null;
  if (session.timer) clearTimeout(session.timer);
  session.endsAt = session.endsAt + extraMinutes * 60 * 1000;
  session.extended = true;
  var remaining = session.endsAt - Date.now();
  session.timer = setTimeout(function() {
    onEnd(session);
  }, remaining);
  return session;
}

function endSession(roomId) {
  var session = sessions.get(roomId);
  if (!session) return null;
  if (session.timer) clearTimeout(session.timer);
  sessions.delete(roomId);
  sessions.delete(session.seeker);
  sessions.delete(session.listener);
  return session;
}

function getSessionBySocket(socketId) {
  return sessions.get(socketId) || null;
}

function markSessionEnded(socketId) {
  endedSessions.add(socketId);
}

function wasSessionEnded(socketId) {
  return endedSessions.has(socketId);
}

module.exports = {
  createSession: createSession,
  startSessionTimer: startSessionTimer,
  extendSession: extendSession,
  endSession: endSession,
  getSessionBySocket: getSessionBySocket,
  markSessionEnded: markSessionEnded,
  wasSessionEnded: wasSessionEnded
};
