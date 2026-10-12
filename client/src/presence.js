import { useState, useEffect, useRef } from "react";

// Heartbeat presence. Every open tab tells the server "I'm here, on this
// letter, writing or not" — the server keeps it in memory and forgets anyone
// silent for 60s. Writers watching their own letter beat faster so
// "someone is writing back" shows up quickly.

function randomId() {
  try { return crypto.randomUUID(); } catch (e) { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
}

// One code per browser (shared by all its tabs, so one person with three tabs
// counts once), replaced every day so it never becomes a long-term identifier.
var SID_KEY = "someone-today:presence";
function browserSid() {
  var today = new Date().toISOString().slice(0, 10);
  try {
    var saved = JSON.parse(localStorage.getItem(SID_KEY));
    if (saved && saved.day === today && saved.sid) return saved.sid;
    var fresh = { sid: randomId(), day: today };
    localStorage.setItem(SID_KEY, JSON.stringify(fresh));
    return fresh.sid;
  } catch (e) { return randomId(); }
}

export function usePresence(opts) {
  var letterId = opts.letterId || null;
  var writing = Boolean(opts.writing);
  var mine = opts.mine || [];
  var fast = Boolean(opts.fast);
  var mineKey = mine.join(",");

  var sid = useRef(null);
  if (!sid.current) sid.current = browserSid();
  var [state, setState] = useState({ others: 0, letter: null, mine: {} });

  // Keep the latest values readable from timers without restarting them.
  var latest = useRef({});
  latest.current = { letterId: letterId, writing: writing, mine: mine };

  useEffect(function() {
    var stopped = false;

    function beat() {
      if (document.visibilityState !== "visible") return;
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid: sid.current, letterId: latest.current.letterId, writing: latest.current.writing, mine: latest.current.mine }),
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (!stopped && typeof data.others === "number") setState({ others: data.others, letter: data.letter || null, mine: data.mine || {} });
      }).catch(function() {});
    }

    function leave() {
      try {
        navigator.sendBeacon("/api/presence", new Blob([JSON.stringify({ sid: sid.current, leaving: true })], { type: "application/json" }));
      } catch (e) {}
    }

    // Hidden tabs just stop beating and fade out within a minute. We only send an
    // explicit goodbye on close, since other tabs may share this browser's code.
    function onVisibility() { if (document.visibilityState === "visible") beat(); }

    beat();
    var timer = setInterval(beat, fast ? 8000 : 20000);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", leave);
    return function() {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", leave);
    };
  }, [letterId, writing, mineKey, fast]);

  return state;
}
