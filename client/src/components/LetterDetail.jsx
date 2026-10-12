import { useState, useEffect } from "react";
import { useSendRitual, pickAffirmation } from "../ritual";
import { isMine, markSeen, seenCount, saidMeToo, setSaidMeToo } from "../myLetters";

var WARMTH = {
  letter: ["You're not alone", "Sending strength", "I've been there too", "This will pass"],
  light: ["So proud of you", "This made my day", "You deserve this"],
};
var REPLIED_KEY = "someone-today:has-replied";

function hasRepliedBefore() { try { return localStorage.getItem(REPLIED_KEY) === "1"; } catch (e) { return false; } }
function rememberReplied() { try { localStorage.setItem(REPLIED_KEY, "1"); } catch (e) {} }

function timeAgo(ts) {
  var mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now"; if (mins < 60) return mins + "m ago";
  var hrs = Math.floor(mins / 60); if (hrs < 24) return hrs + "h ago";
  return Math.floor(hrs / 24) + "d ago";
}

function TypingDots() {
  return <span className="inline-flex items-center gap-1 ml-1" aria-hidden="true"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></span>;
}

export default function LetterDetail({ letterId, onBack, onWrite, presence, onWritingChange }) {
  var mine = isMine(letterId);
  var [letter, setLetter] = useState(null);
  var [status, setStatus] = useState("loading"); // loading | ready | missing | error
  // Replies past this index arrived since the writer last looked.
  var [seenBefore] = useState(function() { return mine ? seenCount(letterId) : Infinity; });
  var [warmth, setWarmth] = useState("");
  var [note, setNote] = useState("");
  var [sending, setSending] = useState(false);
  var [error, setError] = useState("");
  var [pendingReply, setPendingReply] = useState(null);
  var [affirmation, setAffirmation] = useState("");
  var [hearted, setHearted] = useState(false);
  var [meToo, setMeToo] = useState(function() { return saidMeToo(letterId); });
  var [report, setReport] = useState("idle"); // idle | confirm | done
  var [firstReply] = useState(function() { return !hasRepliedBefore(); });
  var ritual = useSendRitual();

  function load() {
    return fetch("/api/letters/" + letterId)
      .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d }; }); })
      .then(function(res) {
        if (!res.ok) { setStatus(res.data && res.data.error === "Letter not found" ? "missing" : "error"); return; }
        setLetter(function(prev) {
          // Don't let a background refresh overwrite a reply that's mid-flight.
          if (prev && res.data.replies.length < prev.replies.length) return prev;
          return res.data;
        });
        setStatus("ready");
      })
      .catch(function() { setStatus(function(s) { return s === "ready" ? s : "error"; }); });
  }

  useEffect(function() { load(); }, [letterId]);

  // Writers watching their own letter see new replies arrive without reloading.
  useEffect(function() {
    if (!mine) return;
    var t = setInterval(function() { if (document.visibilityState === "visible") load(); }, 10000);
    return function() { clearInterval(t); };
  }, [mine, letterId]);

  // Opening your own letter means you've now seen every reply on it.
  useEffect(function() {
    if (mine && letter) markSeen(letterId, letter.replies.length);
  }, [mine, letter, letterId]);

  // Tell presence when we're composing, so the writer feels someone writing back.
  var composing = !mine && ritual.phase === "compose" && (warmth !== "" || note.trim().length > 0);
  useEffect(function() {
    if (onWritingChange) onWritingChange(composing);
  }, [composing]);
  useEffect(function() { return function() { if (onWritingChange) onWritingChange(false); }; }, []);

  // The reply joins the list only once it has "landed" — after the flight.
  useEffect(function() {
    if (ritual.phase !== "sent" || !pendingReply) return;
    setLetter(function(prev) { return Object.assign({}, prev, { replies: prev.replies.concat([pendingReply]) }); });
    setPendingReply(null); setWarmth(""); setNote("");
  }, [ritual.phase, pendingReply]);

  function handleHeart() {
    setHearted(true);
    setTimeout(function() { setHearted(false); }, 700);
    fetch("/api/letters/" + letterId + "/heart", { method: "POST" }).then(function(r) { return r.json(); }).then(function(data) {
      if (typeof data.hearts === "number") setLetter(function(prev) { return Object.assign({}, prev, { hearts: data.hearts }); });
    }).catch(function() {});
  }

  function toggleMeToo() {
    var next = !meToo;
    setMeToo(next); setSaidMeToo(letterId, next);
    // Show the change right away; the server's count corrects it if needed.
    setLetter(function(prev) { return Object.assign({}, prev, { meToo: Math.max(0, (prev.meToo || 0) + (next ? 1 : -1)) }); });
    fetch("/api/letters/" + letterId + "/metoo", { method: "POST" }).then(function(r) { return r.json(); }).then(function(data) {
      if (typeof data.meToo !== "number") return;
      setLetter(function(prev) { return Object.assign({}, prev, { meToo: data.meToo }); });
      setMeToo(data.pressed); setSaidMeToo(letterId, data.pressed);
    }).catch(function() {});
  }

  function handleReply(e) {
    e.preventDefault();
    if (sending || (!warmth && note.trim().length < 2)) return;
    setSending(true); setError("");
    fetch("/api/letters/" + letterId + "/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ warmth: warmth, text: note.trim() }) })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        setSending(false);
        if (data.error) { setError(data.error); return; }
        rememberReplied();
        setPendingReply(data.reply);
        setAffirmation(pickAffirmation("reply", affirmation));
        ritual.fly();
      })
      .catch(function() { setSending(false); setError("Couldn't send just now. Your words are still here. Try again in a moment."); });
  }

  function sendReport() {
    fetch("/api/letters/" + letterId + "/report", { method: "POST" }).catch(function() {});
    setReport("done");
  }

  var back = (
    <button onClick={onBack} className="text-ink-muted hover:text-ink transition-colors text-sm mb-8 flex items-center gap-1">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      Back to letters
    </button>
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg px-5 py-8"><div className="max-w-xl mx-auto">{back}
        <div className="space-y-3 animate-pulse" aria-label="Opening letter">
          <div className="h-4 bg-line rounded w-11/12" /><div className="h-4 bg-line rounded w-10/12" /><div className="h-4 bg-line rounded w-7/12" />
        </div>
      </div></div>
    );
  }
  if (status !== "ready") {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5 text-center">
        <p className="font-display text-2xl text-ink mb-2">{status === "missing" ? "This letter isn't here anymore." : "We couldn't open this letter."}</p>
        <p className="text-ink-muted text-sm mb-6">{status === "missing" ? "It may have been taken down." : "Check your connection and try again."}</p>
        <button onClick={onBack} className="text-accent text-sm">Back to letters</button>
      </div>
    );
  }

  var isLight = letter.type === "light";
  var options = WARMTH[isLight ? "light" : "letter"];
  var others = presence ? presence.reading + presence.writing : 0;
  var newCount = mine ? Math.max(0, letter.replies.length - seenBefore) : 0;
  var flying = ritual.phase === "flying";

  return (
    <div className="min-h-screen bg-bg px-5 py-8">
      <div className="max-w-xl mx-auto animate-fade-in">
        {back}

        <article className="mb-4">
          <p className="letter-text text-[1.375rem] text-ink whitespace-pre-line">{letter.text}</p>
          <p className="mt-4 text-sm text-ink-faint">
            {mine ? "You wrote this · " : ""}{timeAgo(letter.createdAt)}{isLight ? " · good news" : ""} ·{" "}
            <button onClick={handleHeart} aria-label="Send love" className={"transition-colors " + (hearted ? "text-accent" : "hover:text-accent")}>{"♥"} {letter.hearts || 0}</button>
          </p>
        </article>

        {/* "Me too": the plainest way to say you're not the only one. */}
        {!isLight && (mine ? (
          letter.meToo > 0 && <p className="mb-6 letter-text text-accent">{letter.meToo === 1 ? "1 person feels this too." : letter.meToo + " people feel this too."}</p>
        ) : (
          <div className="mb-6 flex items-center gap-4">
            <button onClick={toggleMeToo} aria-pressed={meToo}
              className={"px-4 py-2 rounded-full border text-sm transition-colors " + (meToo ? "bg-accent text-surface border-accent" : "bg-surface text-ink border-line hover:border-accent/50")}>
              {meToo ? "You feel this too" : "Me too"}
            </button>
            {letter.meToo > 0 && <span className="text-sm text-ink-muted">{letter.meToo === 1 ? "1 person feels this too" : letter.meToo + " people feel this too"}</span>}
          </div>
        ))}

        {/* Live presence — only ever real numbers, never shown when zero. */}
        <div className="min-h-[1.5rem] mb-10 px-1 text-sm" aria-live="polite">
          {mine && presence && presence.writing > 0 && <p className="animate-fade-in text-accent flex items-center">Someone is writing back to you<TypingDots /></p>}
          {mine && presence && presence.writing === 0 && presence.reading > 0 && <p className="animate-fade-in text-ink-muted flex items-center gap-2"><span className="presence-dot" />Someone is reading your letter right now.</p>}
          {!mine && others > 0 && <p className="animate-fade-in text-ink-muted flex items-center gap-2"><span className="presence-dot" />{others === 1 ? "Someone else is here with this letter too." : others + " others are here with this letter too."}</p>}
        </div>

        <section className="mb-10" aria-label="Replies">
          {letter.replies.length === 0 ? (
            <p className="text-ink-muted text-sm">{mine ? "No replies yet. Someone will find it." : "No one has written back yet. Yours could be the first."}</p>
          ) : (
            <>
              <h2 className="text-sm font-medium text-ink border-b border-line pb-3">{letter.replies.length === 1 ? "1 reply" : letter.replies.length + " replies"}</h2>
              {newCount > 0 && <p className="ritual-appear text-accent mt-4">Someone read your letter and wrote back.</p>}
              <ul>
                {letter.replies.map(function(reply, i) {
                  var isNew = i >= seenBefore;
                  return (
                    <li key={reply.id} className={"py-5 border-b border-line " + (isNew ? "ritual-appear" : "")}
                      style={isNew ? { animationDelay: (0.4 + (i - seenBefore) * 0.35) + "s" } : undefined}>
                      {reply.warmth && <p className={"letter-text " + (isNew ? "text-accent" : "text-ink")}>{reply.warmth}</p>}
                      {reply.text && <p className={"leading-relaxed " + (reply.warmth ? "text-ink-muted mt-1" : "letter-text text-ink")}>{reply.text}</p>}
                      <span className="text-ink-faint text-sm mt-2 block">{timeAgo(reply.createdAt)}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        {mine ? null : ritual.phase === "sent" ? (
          <div className="border-t border-line pt-10 pb-4 text-center" aria-live="polite">
            <p className="ritual-appear font-display text-2xl text-ink leading-snug">{affirmation}</p>
            <div className="ritual-appear-late mt-8 flex items-center justify-center gap-6 text-sm">
              <button onClick={onBack} className="text-ink-muted hover:text-ink transition-colors">Read other letters</button>
              <span className="w-1 h-1 rounded-full bg-line" aria-hidden="true" />
              <button onClick={onWrite} className="text-accent hover:text-ink transition-colors">Write your own</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReply} className="pt-2">
            <div className={flying ? "ritual-recede" : ""}>
              <p className="text-sm font-medium text-ink mb-1">Write back</p>
              {firstReply && <p className="text-ink-muted text-sm mb-4">Reply the way you'd want someone to reply to you.</p>}
              <div className="flex flex-wrap gap-2 mb-4 mt-3" role="group" aria-label="Choose a reply">
                {options.map(function(opt) {
                  var on = warmth === opt;
                  return (
                    <button type="button" key={opt} aria-pressed={on} onClick={function() { setWarmth(on ? "" : opt); }}
                      className={"px-4 py-2 rounded-full text-sm border transition-colors " + (on ? "bg-accent text-surface border-accent" : "bg-surface text-ink border-line hover:border-accent/40")}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={"paper " + (flying ? "ritual-fly" : "")} onAnimationEnd={flying ? ritual.onFlyEnd : undefined}>
              {warmth && <p className="letter-text text-ink px-5 pt-4">{warmth}</p>}
              <textarea value={note} onChange={function(e) { setNote(e.target.value); }} readOnly={flying}
                aria-label="Add a few words" placeholder={warmth ? "Add a few words, if you want" : "Or write a few words of your own"} maxLength={280} rows={2}
                className={"paper-text block w-full bg-transparent px-5 pb-4 text-ink placeholder-ink-faint focus:outline-none resize-none " + (warmth ? "pt-1" : "pt-4")} />
            </div>
            <div className={"mt-3 flex items-center justify-between gap-3 " + (flying ? "ritual-recede" : "")}>
              {error ? <p role="alert" className="text-danger text-sm">{error}</p> : <span className="text-ink-faint text-xs">{note.length > 200 ? 280 - note.length + " left" : ""}</span>}
              <button type="submit" disabled={sending || (!warmth && note.trim().length < 2)} className="btn-primary py-2.5 px-6 text-sm">{sending ? "Sending..." : "Send"}</button>
            </div>
          </form>
        )}

        {!mine && (
          <div className="mt-16 text-sm text-ink-faint">
            {report === "idle" && <button onClick={function() { setReport("confirm"); }} className="hover:text-ink transition-colors">Report this letter</button>}
            {report === "confirm" && (
              <p>Report this letter? It's hidden once a few people report it.{" "}
                <button onClick={sendReport} className="text-danger underline underline-offset-2 ml-1">Report</button>
                <button onClick={function() { setReport("idle"); }} className="underline underline-offset-2 ml-3">Cancel</button>
              </p>
            )}
            {report === "done" && <p>Thanks for looking out for this place.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
