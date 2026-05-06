import { useState, useEffect } from "react";

var tagData = {
  lonely: { emoji: "\uD83C\uDF19", label: "lonely" },
  anxious: { emoji: "\u26A1", label: "anxious" },
  sad: { emoji: "\uD83C\uDF27\uFE0F", label: "sad" },
  lost: { emoji: "\uD83C\uDF0D", label: "lost" },
  overwhelmed: { emoji: "\uD83C\uDF0A", label: "overwhelmed" },
  angry: { emoji: "\uD83D\uDD25", label: "angry" },
  numb: { emoji: "\uD83E\uDDCA", label: "numb" },
  grateful: { emoji: "\uD83D\uDE4F", label: "grateful" },
  hopeful: { emoji: "\uD83C\uDF31", label: "hopeful" },
  healing: { emoji: "\uD83E\uDE77", label: "healing" }
};

export default function WriteLetter({ type, onBack, onPosted }) {
  var [text, setText] = useState("");
  var [selectedTags, setSelectedTags] = useState([]);
  var [posting, setPosting] = useState(false);
  var [error, setError] = useState("");
  var [sent, setSent] = useState(false);
  var isLight = type === "light";
  var tagKeys = isLight ? ["grateful","hopeful","healing"] : Object.keys(tagData);

  function toggleTag(tag) {
    setSelectedTags(function(prev) {
      if (prev.indexOf(tag) !== -1) return prev.filter(function(t) { return t !== tag; });
      if (prev.length >= 3) return prev;
      return prev.concat([tag]);
    });
  }

  function handleSubmit() {
    if (text.trim().length < 10) { setError("Write at least 10 characters."); return; }
    setPosting(true); setError("");
    fetch("/api/letters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text.trim(), tags: selectedTags, type: type }) })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) { setError(data.error); setPosting(false); }
        else { setSent(true); setTimeout(function() { onPosted(); }, 2500); }
      })
      .catch(function() { setError("Something went wrong."); setPosting(false); });
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-5">
        <style>{`
          @keyframes envelopeFly { 0% { transform: scale(1) translateY(0); opacity: 1; } 40% { transform: scale(1.1) translateY(-10px); } 100% { transform: scale(0.3) translateY(-200px); opacity: 0; } }
          @keyframes fadeInSlow { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .envelope-fly { animation: envelopeFly 2s ease-in-out forwards; }
          .sent-text { animation: fadeInSlow 0.8s ease-out 1.2s both; }
        `}</style>
        <div className="text-center">
          <div className="envelope-fly text-6xl mb-8">{isLight ? "\u2728" : "\u2709\uFE0F"}</div>
          <h2 className="sent-text text-xl font-serif text-white mb-3">{isLight ? "Your light is out there" : "Your letter has been sent"}</h2>
          <p className="sent-text text-gray-500 text-sm font-light" style={{animationDelay:"1.5s"}}>{isLight ? "Someone will feel warmer today" : "Someone will read this. You\'re not alone."}</p>
        </div>
      </div>
    );
  }

  var charPercent = Math.min((text.length / 2000) * 100, 100);

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-5 py-8">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeInUp 0.5s ease-out both; }
        .paper-area { background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%); }
        .paper-area:focus { box-shadow: 0 0 40px rgba(16, 185, 129, 0.05); }
        .char-ring { transition: stroke-dashoffset 0.3s ease; }
      `}</style>
      <div className="max-w-xl mx-auto">
        <div className="fade-in flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <div className="text-center">
            <h1 className={"text-xl font-serif " + (isLight ? "text-amber-300" : "text-white")}>{isLight ? "\u2728 Share some light" : "\u2709\uFE0F Write a letter"}</h1>
            <div className={"w-8 h-0.5 mx-auto mt-2 " + (isLight ? "bg-amber-500/30" : "bg-emerald-500/30")}></div>
          </div>
          <div className="w-14"></div>
        </div>

        <p className="fade-in text-gray-400/70 text-center text-sm font-light mb-8 font-serif italic" style={{animationDelay:"0.1s"}}>{isLight ? "Share a win, a moment of gratitude, or something that made you smile." : "Say what you need to say. It\'s anonymous. Someone will read this."}</p>

        <div className="fade-in relative mb-2" style={{animationDelay:"0.15s"}}>
          <textarea value={text} onChange={function(e) { setText(e.target.value); }} placeholder={isLight ? "Something good happened today..." : "Dear someone..."} maxLength={2000} rows={10}
            className={"paper-area w-full border rounded-2xl px-6 py-5 text-white text-sm sm:text-base leading-relaxed placeholder-gray-600/50 focus:outline-none resize-none font-serif transition-all duration-300 " + (isLight ? "border-amber-500/[0.12] focus:border-amber-500/25" : "border-white/[0.06] focus:border-emerald-500/20")}
          ></textarea>
          <div className="absolute bottom-4 right-4 w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2"></circle>
              <circle cx="18" cy="18" r="15" fill="none" className="char-ring" stroke={charPercent > 90 ? "#f87171" : (isLight ? "#fbbf24" : "#34d399")} strokeWidth="2" strokeDasharray="94.2" strokeDashoffset={94.2 - (94.2 * charPercent / 100)} strokeLinecap="round"></circle>
            </svg>
            <span className={"absolute inset-0 flex items-center justify-center text-[8px] " + (charPercent > 90 ? "text-red-400" : "text-gray-600")}>{2000 - text.length}</span>
          </div>
        </div>

        <div className="h-4"></div>

        <div className="fade-in mb-8" style={{animationDelay:"0.2s"}}>
          <p className="text-gray-500 text-xs mb-3 font-light">How does this feel? <span className="text-gray-600">(up to 3)</span></p>
          <div className="flex flex-wrap gap-2">
            {tagKeys.map(function(key) {
              var tag = tagData[key];
              var selected = selectedTags.indexOf(key) !== -1;
              return (
                <button key={key} onClick={function() { toggleTag(key); }}
                  className={"px-3.5 py-2 rounded-full text-xs transition-all duration-200 flex items-center gap-1.5 " + (selected ? (isLight ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10") : "bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:bg-white/[0.06] hover:text-gray-300")}
                ><span>{tag.emoji}</span><span>{tag.label}</span></button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-rose-400 text-sm text-center mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl py-2 px-4">{error}</p>}

        <button onClick={handleSubmit} disabled={posting}
          className={"fade-in w-full py-4 rounded-2xl text-sm font-medium transition-all duration-300 " + (isLight ? "bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/25" : "bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-semibold shadow-lg shadow-emerald-500/20") + (posting ? " opacity-50" : " hover:shadow-xl hover:-translate-y-0.5")}
          style={{animationDelay:"0.25s"}}
        >{posting ? "Sending..." : (isLight ? "Share this light \u2728" : "Send your letter \u2709\uFE0F")}</button>

        <p className="fade-in text-gray-600 text-xs text-center mt-5 flex items-center justify-center gap-2" style={{animationDelay:"0.3s"}}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
          Completely anonymous. No accounts. No tracking.
        </p>
      </div>
    </div>
  );
}