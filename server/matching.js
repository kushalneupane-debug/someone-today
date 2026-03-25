const queue = {
  seekers: [],
  listeners: []
};

const activeSessions = new Set();

function addToQueue(socketId, role, duration) {
  if (activeSessions.has(socketId)) return null;
  removeFromQueue(socketId);
  const entry = { socketId, duration };

  if (role === 'seeker') {
    queue.seekers.push(entry);
  } else if (role === 'listener') {
    queue.listeners.push(entry);
  }

  return tryMatch();
}

function tryMatch() {
  for (let i = 0; i < queue.seekers.length; i++) {
    const seeker = queue.seekers[i];
    for (let j = 0; j < queue.listeners.length; j++) {
      const listener = queue.listeners[j];

      if (seeker.duration === listener.duration) {
        queue.seekers.splice(i, 1);
        queue.listeners.splice(j, 1);
        activeSessions.add(seeker.socketId);
        activeSessions.add(listener.socketId);

        return {
          seeker: seeker.socketId,
          listener: listener.socketId,
          duration: seeker.duration
        };
      }
    }
  }
  return null;
}

function removeFromQueue(socketId) {
  queue.seekers = queue.seekers.filter(e => e.socketId !== socketId);
  queue.listeners = queue.listeners.filter(e => e.socketId !== socketId);
}

function markSessionEnded(socketId) {
  activeSessions.delete(socketId);
}

function isInSession(socketId) {
  return activeSessions.has(socketId);
}

module.exports = {
  addToQueue,
  removeFromQueue,
  markSessionEnded,
  isInSession
};
