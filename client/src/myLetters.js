import { useState, useEffect, useCallback } from "react";

// The server never knows who wrote a letter. This browser does:
// we keep the ids of letters written here, plus how many replies we've
// already shown, in localStorage. "New replies" = server count − seen.

var KEY = "someone-today:my-letters";

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
}

function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* private mode: degrade quietly */ }
}

// Which heavy letters this browser said "me too" to, so the button stays pressed.
var ME_TOO_KEY = "someone-today:me-too";
export function saidMeToo(id) {
  try { return (JSON.parse(localStorage.getItem(ME_TOO_KEY)) || []).indexOf(id) !== -1; } catch (e) { return false; }
}
export function setSaidMeToo(id, on) {
  try {
    var list = (JSON.parse(localStorage.getItem(ME_TOO_KEY)) || []).filter(function(x) { return x !== id; });
    if (on) list.unshift(id);
    localStorage.setItem(ME_TOO_KEY, JSON.stringify(list.slice(0, 500)));
  } catch (e) {}
}

export function rememberLetter(id) {
  var list = read();
  if (list.some(function(l) { return l.id === id; })) return;
  write([{ id: id, seen: 0 }].concat(list).slice(0, 50));
}

export function myLetterIds() {
  return read().map(function(l) { return l.id; });
}

export function seenCount(id) {
  var found = read().filter(function(l) { return l.id === id; })[0];
  return found ? found.seen : 0;
}

export function isMine(id) {
  return read().some(function(l) { return l.id === id; });
}

export function markSeen(id, replyCount) {
  write(read().map(function(l) { return l.id === id ? { id: l.id, seen: replyCount } : l; }));
}

// Checks on load and whenever the tab comes back into view — never on a timer.
export function useMyLetters() {
  var [letters, setLetters] = useState([]);

  var refresh = useCallback(function() {
    var mine = read();
    if (mine.length === 0) { setLetters([]); return; }
    fetch("/api/letters/status?ids=" + mine.map(function(l) { return l.id; }).join(","))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var byId = {};
        (data.statuses || []).forEach(function(s) { byId[s.id] = s; });
        setLetters(mine.filter(function(l) { return byId[l.id]; }).map(function(l) {
          var s = byId[l.id];
          return { id: l.id, text: s.text, createdAt: s.createdAt, meToo: s.meToo || 0, replyCount: s.replyCount, newReplies: Math.max(0, s.replyCount - l.seen) };
        }));
      })
      .catch(function() { /* offline: keep showing what we had */ });
  }, []);

  useEffect(function() {
    refresh();
    function onVisible() { if (document.visibilityState === "visible") refresh(); }
    document.addEventListener("visibilitychange", onVisible);
    return function() { document.removeEventListener("visibilitychange", onVisible); };
  }, [refresh]);

  return { letters: letters, refresh: refresh };
}
