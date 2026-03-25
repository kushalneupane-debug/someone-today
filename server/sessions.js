const { v4: uuidv4 } = require('uuid');

const sessions = new Map();
const endedSessionUsers = new Set();

function createSession(seekerSocketId, listenerSocketId, durationMinutes) {
  const roomId = `room-${uuidv4()}`;
  const durationMs = durationMinutes * 60 * 1000;

  const session = {
    roomId,
    seeker: seekerSocketId,
    listener: listenerSocketId,
    duration: durationMinutes,
    startedAt: Date.now(),
    endsAt: Date.now() + durationMs,
    timer: null,
    ended: false
  };

  sessions.set(roomId, session);
  return session;
}

function startSessionTimer(roomId, onEnd) {
  const session = sessions.get(roomId);
  if (!session) return;

  const remaining = session.endsAt - Date.now();
  session.timer = setTimeout(() => {
    endSession(roomId);
    onEnd(session);
  }, remaining);
}

function endSession(roomId) {
  const session = sessions.get(roomId);
  if (!session || session.ended) return null;

  session.ended = true;
  if (session.timer) {
    clearTimeout(session.timer);
    session.timer = null;
  }

  endedSessionUsers.add(session.seeker);
  endedSessionUsers.add(session.listener);

  setTimeout(() => { sessions.delete(roomId); }, 5000);
  return session;
}

function getSessionBySocket(socketId) {
  for (const [roomId, session] of sessions) {
    if (!session.ended &&
        (session.seeker === socketId || session.listener === socketId)) {
      return session;
    }
  }
  return null;
}

function getRemainingTime(roomId) {
  const session = sessions.get(roomId);
  if (!session || session.ended) return 0;
  return Math.max(0, session.endsAt - Date.now());
}

function wasSessionEnded(socketId) {
  return endedSessionUsers.has(socketId);
}

setInterval(() => { endedSessionUsers.clear(); }, 30 * 60 * 1000);

module.exports = {
  createSession,
  startSessionTimer,
  endSession,
  getSessionBySocket,
  getRemainingTime,
  wasSessionEnded
};
