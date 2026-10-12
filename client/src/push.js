import { useState, useEffect } from "react";

// Reply notifications for a letter you wrote. Works per letter: turning it
// off for one letter doesn't affect the others.

var KEY = "someone-today:notify";

function notifyList() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
function saveNotify(id, on) {
  try {
    var list = notifyList().filter(function(x) { return x !== id; });
    if (on) list.unshift(id);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  } catch (e) {}
}

function supported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

// iPhone/iPad only allow web push for sites added to the Home Screen.
function iosNeedsInstall() {
  var ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  var installed = navigator.standalone === true || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
  return ios && !installed;
}

// The push service wants the public key as bytes, not base64 text.
function keyBytes(base64) {
  var padded = (base64 + "===".slice((base64.length + 3) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  var raw = atob(padded);
  var out = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function post(path, body) {
  return fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    .then(function(r) { if (!r.ok) throw new Error("request failed"); return r.json(); });
}

// state: hidden | ios-install | denied | off | on | working | error
export function useReplyNotifications(letterId) {
  var [state, setState] = useState("hidden");

  useEffect(function() {
    if (!letterId) return;
    if (iosNeedsInstall()) { setState("ios-install"); return; }
    if (!supported()) { setState("hidden"); return; }
    // Only offer it if the server has notifications switched on.
    fetch("/api/push/key").then(function(r) {
      if (!r.ok) { setState("hidden"); return; }
      if (Notification.permission === "denied") setState("denied");
      else setState(notifyList().indexOf(letterId) !== -1 && Notification.permission === "granted" ? "on" : "off");
    }).catch(function() { setState("hidden"); });
  }, [letterId]);

  function turnOn() {
    setState("working");
    var keyP = fetch("/api/push/key").then(function(r) { return r.json(); });
    var regP = navigator.serviceWorker.register("/sw.js").then(function() { return navigator.serviceWorker.ready; });
    // Ask for permission first, straight from the tap: browsers block prompts that aren't.
    Notification.requestPermission().then(function(permission) {
      if (permission !== "granted") { setState(permission === "denied" ? "denied" : "off"); return; }
      return Promise.all([keyP, regP]).then(function(res) {
        var key = res[0].key, reg = res[1];
        return reg.pushManager.getSubscription().then(function(existing) {
          return existing || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) });
        });
      }).then(function(sub) {
        return post("/api/push/subscribe", { letterId: letterId, subscription: sub.toJSON() });
      }).then(function() { saveNotify(letterId, true); setState("on"); });
    }).catch(function() { setState("error"); });
  }

  function turnOff() {
    setState("working");
    navigator.serviceWorker.ready.then(function(reg) { return reg.pushManager.getSubscription(); }).then(function(sub) {
      return sub ? post("/api/push/unsubscribe", { letterId: letterId, endpoint: sub.endpoint }) : null;
    }).then(function() { saveNotify(letterId, false); setState("off"); })
      .catch(function() { setState("error"); });
  }

  return { state: state, turnOn: turnOn, turnOff: turnOff };
}
