import { useState, useEffect } from "react";

// The send ritual is a tiny state machine: compose → flying → sent.
// We only enter "flying" after the server accepts the words, so the
// animation never celebrates something that didn't actually happen.

export var FLY_MS = 1200;

var AFFIRMATIONS = {
  letter: [
    "It's out there now. Someone will find it.",
    "You put it into words. That takes something.",
    "You don't have to carry this one alone.",
  ],
  light: [
    "Your good moment is out there now.",
    "Someone is going to smile because of this.",
    "Thank you for sharing the light.",
  ],
  reply: [
    "Your words just reached someone.",
    "That kindness will land.",
    "You showed up for a stranger today.",
  ],
};

// Pick a line for this kind of send, avoiding the one we showed last time.
export function pickAffirmation(kind, previous) {
  var set = AFFIRMATIONS[kind] || AFFIRMATIONS.letter;
  var options = set.filter(function(line) { return line !== previous; });
  return options[Math.floor(Math.random() * options.length)];
}

export function useSendRitual() {
  var [phase, setPhase] = useState("compose");

  // Fallback: animationend can be skipped (e.g. background tab), so never
  // leave someone staring at an empty screen.
  useEffect(function() {
    if (phase !== "flying") return;
    var t = setTimeout(function() { setPhase("sent"); }, FLY_MS + 400);
    return function() { clearTimeout(t); };
  }, [phase]);

  function onFlyEnd(e) {
    // animationend bubbles; only react to the paper's own flight.
    if (e.target === e.currentTarget) setPhase("sent");
  }

  return {
    phase: phase,
    fly: function() { setPhase("flying"); },
    reset: function() { setPhase("compose"); },
    onFlyEnd: onFlyEnd,
  };
}
