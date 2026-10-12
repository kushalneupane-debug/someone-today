import { useState, useEffect } from "react";

// A tiny router on top of the browser's History API.
// navigate() changes the address bar with pushState (no page reload) and
// tells the app; Back/Forward fire "popstate", which we listen for too.
// Deep links work because the server sends index.html for every path.

var ROUTES = [
  { name: "wall", kind: "letter", re: /^\/$/ },
  { name: "wall", kind: "light", re: /^\/good-news\/?$/ },
  { name: "write", re: /^\/write\/?$/ },
  { name: "letter", re: /^\/letter\/([a-f0-9]{24})\/?$/i },
  { name: "privacy", re: /^\/privacy\/?$/ },
  { name: "terms", re: /^\/terms\/?$/ },
];

export function parse(path) {
  for (var i = 0; i < ROUTES.length; i++) {
    var m = path.match(ROUTES[i].re);
    if (m) return { name: ROUTES[i].name, kind: ROUTES[i].kind, id: m[1] || null, path: path };
  }
  return { name: "notfound", path: path };
}

var listeners = [];
function notify() { listeners.forEach(function(fn) { fn(location.pathname); }); }

// We restore scroll ourselves so "Back" returns you to where you were in the feed.
if (typeof history !== "undefined" && "scrollRestoration" in history) history.scrollRestoration = "manual";

export function navigate(path, opts) {
  opts = opts || {};
  if (path === location.pathname) return;
  // Remember where this page was scrolled, for when someone comes Back to it.
  history.replaceState(Object.assign({}, history.state, { scroll: window.scrollY }), "");
  history[opts.replace ? "replaceState" : "pushState"]({ inApp: true, scroll: 0 }, "", path);
  notify();
  if (!opts.keepScroll) window.scrollTo(0, 0);
}

// Back if we got here from inside the site; otherwise go to a sensible page.
export function goBack(fallback) {
  if (history.state && history.state.inApp) history.back();
  else navigate(fallback || "/", { replace: true });
}

export function useRoute() {
  var [path, setPath] = useState(location.pathname);
  useEffect(function() {
    function onPop(e) {
      setPath(location.pathname);
      var y = e.state && typeof e.state.scroll === "number" ? e.state.scroll : 0;
      // Wait a frame so the restored page has rendered before scrolling.
      requestAnimationFrame(function() { window.scrollTo(0, y); });
    }
    listeners.push(setPath);
    window.addEventListener("popstate", onPop);
    return function() {
      listeners = listeners.filter(function(fn) { return fn !== setPath; });
      window.removeEventListener("popstate", onPop);
    };
  }, []);
  return parse(path);
}

// Props for an in-app <a>: a normal click navigates without reloading, but
// Cmd/Ctrl/Shift/middle-click still open a new tab like any real link.
export function link(path) {
  return {
    href: path,
    onClick: function(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      navigate(path);
    },
  };
}
