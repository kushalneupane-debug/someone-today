var queue = { seekers: [], listeners: [] };
var activeSessions = new Set();

function addToQueue(socketId, role, duration, mood) {
  if (activeSessions.has(socketId)) return null;
  removeFromQueue(socketId);
  var entry = { socketId: socketId, duration: duration, mood: mood || null };
  if (role === 'seeker') {
    queue.seekers.push(entry);
  } else if (role === 'listener') {
    queue.listeners.push(entry);
  }
  return tryMatch();
}

function tryMatch() {
  for (var i = 0; i < queue.seekers.length; i++) {
    var seeker = queue.seekers[i];
    for (var j = 0; j < queue.listeners.length; j++) {
      var listener = queue.listeners[j];
      if (seeker.duration === listener.duration) {
        queue.seekers.splice(i, 1);
        queue.listeners.splice(j, 1);
        activeSessions.add(seeker.socketId);
        activeSessions.add(listener.socketId);
        return {
          seeker: seeker.socketId,
          listener: listener.socketId,
          duration: seeker.duration,
          mood: seeker.mood
        };
      }
    }
  }
  return null;
}

function removeFromQueue(socketId) {
  queue.seekers = queue.seekers.filter(function(e) { return e.socketId !== socketId; });
  queue.listeners = queue.listeners.filter(function(e) { return e.socketId !== socketId; });
}

function getQueueCounts() {
  return { seekers: queue.seekers.length, listeners: queue.listeners.length };
}

function markSessionEnded(socketId) {
  activeSessions.delete(socketId);
}

function isInSession(socketId) {
  return activeSessions.has(socketId);
}

module.exports = {
  addToQueue: addToQueue,
  removeFromQueue: removeFromQueue,
  getQueueCounts: getQueueCounts,
  markSessionEnded: markSessionEnded,
  isInSession: isInSession
};
