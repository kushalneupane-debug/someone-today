import { useState, useEffect, useRef } from "react";

// Heartbeat presence. Every open tab tells the server "I'm here, on this
// letter, writing or not" — the server keeps it in memory and forgets anyone
// silent for 60s. Writers watching their own letter beat faster so
// "someone is writing back" shows up quickly.

function newSid() {
  try { return crypto.randomUUID(); } catch (e) { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
}

export function usePresence(opts) {
  var letterId = opts.letterId || null;
  var writing = Boolean(opts.writing);
  var mine = opts.mine || [];
  var fast = Boolean(opts.fast);
  var mineKey = mine.join(",");

  var sid = useRef(null);
  if (!sid.current) sid.current = newSid();
  var [state, setState] = useState({ here: 0, letter: null, mine: {} });

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
        if (!stopped && typeof data.here === "number") setState({ here: data.here, letter: data.letter || null, mine: data.mine || {} });
      }).catch(function() {});
    }

    function leave() {
      try {
        navigator.sendBeacon("/api/presence", new Blob([JSON.stringify({ sid: sid.current, leaving: true })], { type: "application/json" }));
      } catch (e) {}
    }

    function onVisibility() { if (document.visibilityState === "visible") beat(); else leave(); }

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
