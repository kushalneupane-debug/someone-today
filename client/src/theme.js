import { useState, useEffect } from "react";

// Light is the default. "auto" follows the device, "dark" pins dark.
// The choice lives in localStorage; index.html applies it before first
// paint so there's no flash.

var KEY = "someone-today:theme";
var BG = { light: "#faf8f5", dark: "#181513" };

function stored() {
  try { var t = localStorage.getItem(KEY); return t === "dark" || t === "auto" ? t : "light"; } catch (e) { return "light"; }
}

function systemDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(choice) {
  document.documentElement.dataset.theme = choice;
  var dark = choice === "dark" || (choice === "auto" && systemDark());
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? BG.dark : BG.light);
}

export function useTheme() {
  var [choice, setChoice] = useState(stored);

  useEffect(function() {
    apply(choice);
    try { if (choice === "light") localStorage.removeItem(KEY); else localStorage.setItem(KEY, choice); } catch (e) {}
    if (choice !== "auto" || !window.matchMedia) return;
    // In auto mode, follow the device if it switches while the page is open.
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() { apply("auto"); }
    mq.addEventListener("change", onChange);
    return function() { mq.removeEventListener("change", onChange); };
  }, [choice]);

  return [choice, setChoice];
}
