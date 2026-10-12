import { useState } from "react";
import { useSendRitual, pickAffirmation } from "../ritual";
import { rememberLetter } from "../myLetters";

var MIN_CHARS = 10;
var MAX_CHARS = 2000;

export default function WriteLetter({ type, onBack, onPosted }) {
  var [letterType, setLetterType] = useState(type === "light" ? "light" : "letter");
  var [text, setText] = useState("");
  var [posting, setPosting] = useState(false);
  var [error, setError] = useState("");
  var [focused, setFocused] = useState(false);
  var [affirmation, setAffirmation] = useState("");
  var [care, setCare] = useState(false);
  var ritual = useSendRitual();

  var isLight = letterType === "light";
  var remaining = MAX_CHARS - text.length;
  var tooShort = text.trim().length < MIN_CHARS;
  // While someone is writing, everything but the paper steps back.
  var quiet = focused && text.length > 0;

  function chooseType(next) { setLetterType(next); }

  function handleSubmit(sawCare) {
    if (tooShort || posting) return;
    setPosting(true); setError("");
    fetch("/api/letters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text.trim(), type: letterType, sawCare: sawCare === true }) })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        setPosting(false);
        if (data.needsCare) { setCare(true); window.scrollTo(0, 0); return; }
        setCare(false);
        if (data.error) { setError(data.error); return; }
        if (data.letter && data.letter.id) rememberLetter(data.letter.id);
        setAffirmation(pickAffirmation(letterType, affirmation));
        ritual.fly();
      })
      .catch(function() {
        setPosting(false);
        setError("Couldn't send just now. Your words are still here. Try again in a moment.");
      });
  }

  function writeAnother() {
    setText(""); setError("");
    ritual.reset();
  }

  var atmosphere = "min-h-screen px-5 py-8 transition-colors duration-[600ms] ease-out " + (isLight ? "bg-accent-soft" : "bg-bg");

  // The server noticed words that suggest someone may be in danger. Help comes
  // first, but they're never shut out: they can still post.
  if (care) {
    return (
      <div className="min-h-screen bg-bg px-5 py-12 flex items-center justify-center">
        <div className="max-w-md w-full animate-fade-in">
          <p className="font-display text-2xl sm:text-3xl text-ink leading-snug">Before this goes out, are you safe right now?</p>
          <p className="text-ink-muted mt-4 leading-relaxed">What you wrote sounds really heavy. You deserve someone trained for exactly this, and they're there right now. Free, any time.</p>
          <div className="mt-8 space-y-3">
            <a href="tel:988" className="btn-primary w-full flex items-center justify-center">Call 988</a>
            <a href="sms:988" className="block w-full text-center py-3.5 rounded-[14px] border border-line bg-surface text-ink hover:border-ink/25 transition-colors">Text 988</a>
            <a href="sms:741741?&body=HOME" className="block w-full text-center py-3.5 rounded-[14px] border border-line bg-surface text-ink hover:border-ink/25 transition-colors">Text HOME to 741741</a>
          </div>
          <p className="text-ink-faint text-xs mt-4 text-center">Outside the US? <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">Find a helpline near you</a>.</p>
          <div className="mt-10 pt-6 border-t border-line flex items-center justify-between text-sm">
            <button onClick={function() { setCare(false); }} className="text-ink-muted hover:text-ink transition-colors">Back to my letter</button>
            <button onClick={function() { handleSubmit(true); }} disabled={posting} className="text-accent hover:text-ink transition-colors">{posting ? "Sending..." : "Post my letter too"}</button>
          </div>
          {error && <p role="alert" className="text-danger text-sm mt-4 text-center">{error}</p>}
        </div>
      </div>
    );
  }

  if (ritual.phase === "sent") {
    return (
      <div className={atmosphere + " flex items-center justify-center"}>
        <div className="max-w-md text-center" aria-live="polite">
          <p className="ritual-appear font-display text-2xl sm:text-3xl text-ink leading-snug">{affirmation}</p>
          <p className="ritual-appear-late mt-4 text-sm text-ink-muted">If someone replies, you'll see it here.</p>
          <div className="ritual-appear-late mt-10 flex items-center justify-center gap-6 text-sm">
            <button onClick={onPosted} className="text-ink-muted hover:text-ink transition-colors">Read other letters</button>
            <span className="w-1 h-1 rounded-full bg-line" aria-hidden="true" />
            <button onClick={writeAnother} className="text-accent hover:text-ink transition-colors">Write another</button>
          </div>
        </div>
      </div>
    );
  }

  var leaving = ritual.phase === "flying";
  var chrome = "transition-opacity duration-700 " + (leaving ? "ritual-recede" : quiet ? "opacity-40" : "opacity-100");

  return (
    <div className={atmosphere}>
      <div className="max-w-xl mx-auto animate-fade-in">
        <h1 className="sr-only">Write a letter</h1>

        <div className={"flex items-center justify-between mb-10 " + chrome}>
          <button onClick={onBack} className="text-ink-muted hover:text-ink transition-colors text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <div className="flex items-center gap-1 text-sm" role="group" aria-label="What kind of letter">
            {[["letter", "Something heavy"], ["light", "Good news"]].map(function(opt) {
              var active = letterType === opt[0];
              return (
                <button key={opt[0]} onClick={function() { chooseType(opt[0]); }} aria-pressed={active}
                  className={"px-2 py-1 transition-colors underline-offset-4 " + (active ? "text-ink underline decoration-accent" : "text-ink-muted hover:text-ink")}>
                  {opt[1]}
                </button>
              );
            })}
          </div>
        </div>

        <p className={"text-ink-muted mb-4 " + chrome}>
          Take your time. There's no rush here.
        </p>

        <div className={"paper " + (leaving ? "ritual-fly" : "")} onAnimationEnd={leaving ? ritual.onFlyEnd : undefined}>
          <textarea value={text} onChange={function(e) { setText(e.target.value); }}
            onFocus={function() { setFocused(true); }} onBlur={function() { setFocused(false); }}
            readOnly={leaving} aria-label="Your letter"
            placeholder={isLight ? "Something good happened today..." : "Dear someone..."}
            maxLength={MAX_CHARS} rows={10}
            className="paper-text block w-full bg-transparent px-5 py-4 text-ink placeholder-ink-faint focus:outline-none resize-none" />
        </div>

        <div className={"flex justify-between mt-2 mb-6 text-sm min-h-[1.25rem] " + (leaving ? "ritual-recede" : "")}>
          <span className="text-ink-faint">{text.length > 0 && tooShort ? "A few more words" : ""}</span>
          {remaining <= 300 && <span className={remaining <= 50 ? "text-danger" : "text-ink-faint"}>{remaining} left</span>}
        </div>

        <div className={leaving ? "ritual-recede" : ""}>
          {error && <p role="alert" className="text-danger text-sm mb-4">{error}</p>}

          <div className="flex items-center justify-between gap-4">
            <p className="text-ink-faint text-sm">No name. No account.</p>
            <button onClick={function() { handleSubmit(false); }} disabled={tooShort || posting} className="btn-primary py-2.5 px-6">
              {posting ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
