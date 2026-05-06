import { useState, useEffect, useRef } from "react";

var tagEmojis = { lonely: "\uD83C\uDF19", anxious: "\u26A1", sad: "\uD83C\uDF27\uFE0F", lost: "\uD83C\uDF0D", overwhelmed: "\uD83C\uDF0A", angry: "\uD83D\uDD25", numb: "\uD83E\uDDCA", grateful: "\uD83D\uDE4F", hopeful: "\uD83C\uDF31", healing: "\uD83E\uDE77" };

export default function LetterDetail({ letterId, onBack }) {
  var [letter, setLetter] = useState(null);
  var [loading, setLoading] = useState(true);
  var [replyText, setReplyText] = useState("");
  var [replying, setReplying] = useState(false);
  var [error, setError] = useState("");
  var [hearted, setHearted] = useState(false);
  var bottomRef = useRef(null);

  useEffect(function() {
    fetch("/api/letters/" + letterId).then(function(r) { return r.json(); }).then(function(data) { setLetter(data); setLoading(false); }).catch(function() { setLoading(false); });
  }, [letterId]);

  function handleHeart() {
    setHearted(true);
    setTimeout(function() { setHearted(false); }, 600);
    fetch("/api/letters/" + letterId + "/heart", { method: "POST" }).then(function(r) { return r.json(); }).then(function(data) { setLetter(function(prev) { return Object.assign({}, prev, { hearts: data.hearts }); }); });
  }

  function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim() || replyText.trim().length < 2) { setError("Write at least a couple words."); return; }
    setReplying(true); setError("");
    fetch("/api/letters/" + letterId + "/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: replyText.trim() }) })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) { setError(data.error); } else {
          setLetter(function(prev) { return Object.assign({}, prev, { replies: (prev.replies || []).concat([data.reply]) }); });
          setReplyText("");
          setTimeout(function() { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" }); }, 100);
        }
        setReplying(false);
      }).catch(function() { setError("Something went wrong."); setReplying(false); });
  }

  function timeAgo(ts) {
    var diff = Date.now() - ts; var mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now"; if (mins < 60) return mins + "m ago";
    var hrs = Math.floor(mins / 60); if (hrs < 24) return hrs + "h ago";
    return Math.floor(hrs / 24) + "d ago";
  }

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><p className="text-gray-500 text-sm">Opening letter...</p></div>;
  if (!letter) return <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-5"><p className="text-gray-400 mb-4">Letter not found.</p><button onClick={onBack} className="text-emerald-400 text-sm">{"\u2190 Go back"}</button></div>;

  var isLight = letter.type === "light";
  return (
    <div className="min-h-screen bg-[#0a0a0f] px-5 py-8">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heartBeat { 0% { transform: scale(1); } 25% { transform: scale(1.3); } 50% { transform: scale(0.95); } 100% { transform: scale(1); } }
        @keyframes replySlide { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        .fade-in { animation: fadeInUp 0.5s ease-out both; }
        .heart-beat { animation: heartBeat 0.5s ease-out; }
        .reply-card { animation: replySlide 0.4s ease-out both; }
      `}</style>
      <div className="max-w-xl mx-auto">
        <button onClick={onBack} className="fade-in text-gray-500 hover:text-white transition-colors text-sm mb-8 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to letters
        </button>

        <div className={"fade-in rounded-3xl p-7 sm:p-10 mb-8 relative overflow-hidden " + (isLight ? "bg-gradient-to-br from-amber-500/[0.05] to-amber-600/[0.02] border border-amber-500/[0.12]" : "bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06]")} style={{animationDelay:"0.1s"}}>
          <div className={"absolute top-4 right-6 text-6xl font-serif opacity-[0.04] select-none " + (isLight ? "text-amber-300" : "text-white")}>{"\u201C"}</div>
          {isLight && <div className="flex items-center gap-2 mb-5"><span className="text-amber-400 text-sm">{"\u2728"}</span><span className="text-amber-400/50 text-xs font-light tracking-widest uppercase">Wall of Light</span></div>}
          <p className={"text-lg sm:text-xl leading-relaxed mb-6 font-serif font-light relative z-10 " + (isLight ? "text-amber-100/90" : "text-gray-200")}>{letter.text}</p>
          {letter.tags && letter.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mb-5">{letter.tags.map(function(tag) { return <span key={tag} className="text-[10px] text-emerald-400/50 bg-emerald-500/[0.06] px-2.5 py-1 rounded-full flex items-center gap-1"><span>{tagEmojis[tag] || ""}</span> {tag}</span>; })}</div>}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
            <span className="text-gray-600 text-xs">{timeAgo(letter.createdAt)}</span>
            <button onClick={handleHeart} className={"flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 " + (hearted ? "bg-rose-500/20 text-rose-400" : "bg-white/[0.03] text-gray-500 hover:text-rose-400 hover:bg-rose-500/10")}>
              <span className={"text-base " + (hearted ? "heart-beat" : "")}>{"\u2665"}</span>
              <span className="text-xs font-medium">{letter.hearts || 0}</span>
            </button>
          </div>
        </div>

        <div className="fade-in mb-6" style={{animationDelay:"0.2s"}}>
          <h3 className="text-white text-sm font-medium mb-4">{(letter.replies || []).length > 0 ? "Replies (" + letter.replies.length + ")" : "No replies yet \u2014 be the first"}</h3>
          <div className="space-y-3">
            {(letter.replies || []).map(function(reply, i) {
              return (
                <div key={reply.id} className="reply-card bg-emerald-500/[0.03] border border-emerald-500/[0.08] rounded-2xl px-5 py-4 hover:bg-emerald-500/[0.06] transition-colors" style={{animationDelay: (i * 0.1) + "s"}}>
                  <p className="text-gray-300 text-sm leading-relaxed">{reply.text}</p>
                  <span className="text-gray-600 text-xs mt-2 block">{timeAgo(reply.createdAt)}</span>
                </div>
              );
            })}
          </div>
          <div ref={bottomRef}></div>
        </div>

        <form onSubmit={handleReply} className="fade-in border-t border-white/[0.06] pt-5" style={{animationDelay:"0.3s"}}>
          <p className="text-gray-500 text-xs mb-3 font-light">Reply with kindness</p>
          <div className="flex gap-3">
            <input type="text" value={replyText} onChange={function(e) { setReplyText(e.target.value); }} placeholder="You\'re not alone in this..." maxLength={500} className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600/50 focus:outline-none focus:border-emerald-500/20 transition-all" />
            <button type="submit" disabled={replying || !replyText.trim()} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl px-5 py-3 text-sm font-medium transition-all disabled:opacity-30 hover:-translate-y-0.5">{replying ? "..." : "Send"}</button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}