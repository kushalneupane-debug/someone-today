import { useState, useEffect, useRef } from "react";
import WriteLetter from "./WriteLetter";
import LetterDetail from "./LetterDetail";
import { useMyLetters, isMine } from "../myLetters";
import { usePresence } from "../presence";
import Wordmark from "./Wordmark";
import { navigate, goBack, link } from "../router";

function timeAgo(ts) {
  var mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now"; if (mins < 60) return mins + "m ago";
  var hrs = Math.floor(mins / 60); if (hrs < 24) return hrs + "h ago";
  return Math.floor(hrs / 24) + "d ago";
}

function replies(n) { return n === 1 ? "1 reply" : n + " replies"; }

// Heavy letters and good news never share a feed.
var KINDS = {
  letter: { tab: "Something heavy", about: "People going through a hard time. One kind word can change someone's night.", empty: "No heavy letters right now." },
  light: { tab: "Good news", about: "Wins, big and small. Celebrate them with someone.", empty: "No good news yet." },
};

// Which screen shows is decided by the URL (see router.js), not local state.
export default function LetterWall({ route }) {
  var [letters, setLetters] = useState([]);
  var [status, setStatus] = useState("loading"); // loading | ready | error
  var view = route.name; // "wall" | "write" | "letter"
  var selectedLetter = route.name === "letter" ? route.id : null;
  var [page, setPage] = useState(0);
  var [hasMore, setHasMore] = useState(false);
  var [replyingNow, setReplyingNow] = useState(false);
  // The tab comes from the URL (/ or /good-news); remember it while reading a letter.
  var [kind, setKind] = useState(route.kind || "letter");
  useEffect(function() { if (route.name === "wall" && route.kind !== kind) setKind(route.kind); }, [route.path]);
  var mine = useMyLetters();
  var viewingLetter = selectedLetter;
  var presence = usePresence({
    letterId: viewingLetter,
    writing: replyingNow,
    mine: mine.letters.map(function(l) { return l.id; }),
    fast: Boolean(viewingLetter && isMine(viewingLetter)),
  });

  function fetchLetters(pageNum, forKind) {
    var k = forKind || kind;
    fetch("/api/letters?type=" + k + "&page=" + pageNum).then(function(r) { return r.json(); }).then(function(data) {
      // An error response has no letters list; treat it as a failed load, not a crash.
      if (!Array.isArray(data.letters)) throw new Error(data.error || "Bad response");
      if (k !== kindRef.current) return; // a newer tab was picked meanwhile
      setLetters(function(prev) { return pageNum > 0 ? prev.concat(data.letters) : data.letters; });
      setHasMore(data.hasMore); setPage(pageNum); setStatus("ready");
    }).catch(function() { setStatus(function(s) { return s === "ready" ? s : "error"; }); });
  }

  var kindRef = useRef(kind);
  kindRef.current = kind;
  useEffect(function() { setStatus("loading"); setLetters([]); fetchLetters(0, kind); }, [kind]);

  // Coming back to the wall (after writing or reading) refreshes everything.
  var firstView = useRef(true);
  useEffect(function() {
    if (firstView.current) { firstView.current = false; return; }
    if (view === "wall") { mine.refresh(); fetchLetters(0); }
  }, [view]);

  var wallPath = kind === "light" ? "/good-news" : "/";
  function openLetter(id) { navigate("/letter/" + id); }
  function write() { navigate("/write"); }
  function backToWall() { goBack(wallPath); }
  function showKind(k) { navigate(k === "light" ? "/good-news" : "/", { replace: true, keepScroll: true }); }

  if (view === "write") return <WriteLetter onBack={backToWall} onPosted={function() { navigate(wallPath, { replace: true }); }} />;
  if (view === "letter" && selectedLetter) return <LetterDetail letterId={selectedLetter} presence={presence.letter} onWritingChange={setReplyingNow} onBack={backToWall} onWrite={write} />;

  return (
    <div className="px-5">
      <div className="max-w-xl mx-auto">
        <header className="pt-10 sm:pt-14">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-ink"><Wordmark className="block h-11 sm:h-14 w-auto" /></h1>
            <button onClick={write} className="btn-primary flex-shrink-0 py-2.5 px-5 text-sm">Write a letter</button>
          </div>
          <p className="mt-4 text-ink-muted leading-relaxed text-pretty">Anonymous letters from strangers. Write one, or answer one.</p>
          <div className={"mt-3 min-h-[1.5rem] flex flex-wrap items-center gap-x-3 gap-y-2 transition-opacity duration-700 " + (presence.others >= 1 ? "opacity-100" : "opacity-0")} aria-live="polite">
            <span className="flex items-center gap-1.5" aria-hidden="true">
              <span className="light light-you" title="You" />
              {Array.from({ length: Math.min(presence.others, 12) }).map(function(_, i) {
                return <span key={i} className="light" style={{ animationDelay: (i * 0.37 % 3) + "s" }} />;
              })}
              {presence.others > 12 && <span className="text-xs text-ink-faint ml-1">+{presence.others - 12}</span>}
            </span>
            <span className="text-sm text-ink-muted">
              {presence.others === 1 ? "You and 1 other person are here right now." : presence.others > 1 ? "You and " + presence.others + " others are here right now." : ""}
            </span>
          </div>
        </header>

        {mine.letters.length > 0 && (
          <section className="mt-10" aria-labelledby="your-letters">
            <h2 id="your-letters" className="text-sm font-medium text-ink mb-1">Your letters</h2>
            <ul>
              {mine.letters.map(function(l) {
                var p = presence.mine[l.id];
                var note = p && p.writing > 0 ? "someone is writing back"
                  : l.newReplies > 0 ? l.newReplies + " new"
                  : p ? "someone is reading it"
                  : l.replyCount > 0 ? replies(l.replyCount)
                  : l.meToo > 0 ? l.meToo + " feel this too"
                  : "no replies yet";
                var lively = Boolean(p) || l.newReplies > 0;
                return (
                  <li key={l.id}>
                    <a {...link("/letter/" + l.id)} className="flex items-baseline gap-4 py-2 text-left group">
                      <span className="flex-1 min-w-0 truncate text-ink-muted group-hover:text-ink transition-colors">{l.text}</span>
                      <span className={"flex-shrink-0 text-sm " + (lively ? "text-accent" : "text-ink-faint")}>{note}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-12 flex gap-6 border-b border-line" role="tablist" aria-label="Kind of letters">
          {Object.keys(KINDS).map(function(k) {
            var on = kind === k;
            return (
              <button key={k} role="tab" aria-selected={on} onClick={function() { showKind(k); }}
                className={"-mb-px pb-3 border-b-2 transition-colors " + (on ? "border-accent text-ink font-medium" : "border-transparent text-ink-muted hover:text-ink")}>
                {KINDS[k].tab}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-ink-muted">{KINDS[kind].about}</p>

        <section className="mt-4 border-t border-line" role="tabpanel" aria-label={KINDS[kind].tab}>
          {status === "loading" && <p className="py-10 text-ink-faint">Loading letters…</p>}
          {status === "error" && <p className="py-10 text-ink-muted">Couldn't load letters. Check your connection and refresh.</p>}
          {status === "ready" && letters.length === 0 && (
            <p className="py-10 text-ink-muted">{KINDS[kind].empty} <button onClick={write} className="text-accent hover:underline underline-offset-4">Be the first to share.</button></p>
          )}
          <ul>
            {letters.map(function(letter) {
              var unanswered = !letter.replyCount && letter.type !== "light" && !isMine(letter.id);
              return (
                <li key={letter.id} className="border-b border-line">
                  <a {...link("/letter/" + letter.id)} className="block text-left py-7 group">
                    <p className="letter-text text-ink">{letter.text}</p>
                    <p className="mt-3 text-sm text-ink-faint">
                      {timeAgo(letter.createdAt)}
                      {letter.meToo > 0 && <span> · {letter.meToo} feel this too</span>}
                      {letter.hearts > 0 && <span> · {"♥"} {letter.hearts}</span>}
                      {unanswered
                        ? <span className="text-accent"> · No replies yet · <span className="group-hover:underline underline-offset-4">Write back</span></span>
                        : letter.replyCount > 0 && <span> · {replies(letter.replyCount)}</span>}
                    </p>
                  </a>
                </li>
              );
            })}
          </ul>
          {hasMore && <button onClick={function() { fetchLetters(page + 1, kind); }} className="w-full py-8 text-ink-muted hover:text-ink">Older letters</button>}
        </section>
      </div>
    </div>
  );
}
