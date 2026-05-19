import { useState, useEffect } from "react";
import WriteLetter from "./WriteLetter";
import LetterDetail from "./LetterDetail";

var tagEmojis = { all: "\u2728", lonely: "\uD83C\uDF19", anxious: "\u26A1", sad: "\uD83C\uDF27\uFE0F", lost: "\uD83C\uDF0D", overwhelmed: "\uD83C\uDF0A", angry: "\uD83D\uDD25", numb: "\uD83E\uDDCA", grateful: "\uD83D\uDE4F", hopeful: "\uD83C\uDF31", healing: "\uD83E\uDE77" };

export default function LetterWall({ onBack }) {
  var [letters, setLetters] = useState([]);
  var [loading, setLoading] = useState(true);
  var [activeTag, setActiveTag] = useState("all");
  var [view, setView] = useState("wall");
  var [selectedLetter, setSelectedLetter] = useState(null);
  var [writeType, setWriteType] = useState("letter");
  var [page, setPage] = useState(0);
  var [hasMore, setHasMore] = useState(false);
  var [copiedId, setCopiedId] = useState(null);
  var tags = ["all","lonely","anxious","sad","lost","overwhelmed","angry","numb","grateful","hopeful","healing"];

  function fetchLetters(tagFilter, pageNum) {
    setLoading(true);
    var url = "/api/letters?page=" + (pageNum || 0);
    if (tagFilter && tagFilter !== "all") url += "&tag=" + tagFilter;
    fetch(url).then(function(r) { return r.json(); }).then(function(data) {
      if (pageNum > 0) { setLetters(function(prev) { return prev.concat(data.letters); }); }
      else { setLetters(data.letters); }
      setHasMore(data.hasMore); setLoading(false);
    }).catch(function() { setLoading(false); });
  }

  useEffect(function() { fetchLetters(activeTag, 0); setPage(0); }, [activeTag]);

  function handleHeart(letterId, e) {
    e.stopPropagation();
    var btn = e.currentTarget;
    btn.style.transform = "scale(1.4)";
    setTimeout(function() { btn.style.transform = "scale(1)"; }, 300);
    fetch("/api/letters/" + letterId + "/heart", { method: "POST" }).then(function(r) { return r.json(); }).then(function(data) {
      setLetters(function(prev) { return prev.map(function(l) { if (l.id === letterId) return Object.assign({}, l, { hearts: data.hearts }); return l; }); });
    });
  }

  function shareLetter(letter, e) {
    e.stopPropagation();
    var preview = letter.text.length > 160 ? letter.text.slice(0, 160) + '…' : letter.text;
    var shareText = '"' + preview + '"\n\n— anonymous on getsomeonetoday.com/letters';
    if (navigator.share) {
      navigator.share({ text: shareText, url: 'https://getsomeonetoday.com' }).catch(function() {});
    } else {
      navigator.clipboard.writeText(shareText).then(function() {
        setCopiedId(letter.id);
        setTimeout(function() { setCopiedId(null); }, 2000);
      }).catch(function() {});
    }
  }

  function timeAgo(ts) {
    var diff = Date.now() - ts; var mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now"; if (mins < 60) return mins + "m ago";
    var hrs = Math.floor(mins / 60); if (hrs < 24) return hrs + "h ago";
    return Math.floor(hrs / 24) + "d ago";
  }

  if (view === "write") return <WriteLetter type={writeType} onBack={function() { setView("wall"); }} onPosted={function() { setView("wall"); fetchLetters(activeTag, 0); setPage(0); }} />;
  if (view === "detail" && selectedLetter) return <LetterDetail letterId={selectedLetter} onBack={function() { setView("wall"); fetchLetters(activeTag, 0); }} />;

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-20px); opacity: 0.6; } }
        .letter-card { animation: fadeInUp 0.6s ease-out both; }
        .letter-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(16, 185, 129, 0.08); }
        .floating-dot { animation: float linear infinite; position: absolute; border-radius: 50%; pointer-events: none; }
        .heart-btn { transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .heart-btn:hover { transform: scale(1.2); }
        .write-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-dot bg-emerald-400/20 w-1 h-1" style={{top:"10%",left:"15%",animationDuration:"8s"}}></div>
        <div className="floating-dot bg-emerald-400/20 w-1.5 h-1.5" style={{top:"25%",right:"20%",animationDuration:"12s",animationDelay:"2s"}}></div>
        <div className="floating-dot bg-amber-400/20 w-1 h-1" style={{top:"60%",left:"80%",animationDuration:"10s",animationDelay:"4s"}}></div>
        <div className="floating-dot bg-emerald-400/10 w-2 h-2" style={{top:"75%",left:"10%",animationDuration:"14s"}}></div>
      </div>

      <div className="px-5 py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-wide">Letters</h1>
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto mt-2"></div>
            </div>
            <div className="w-14"></div>
          </div>

          <p className="text-gray-400/80 text-center text-sm font-light mb-8 leading-relaxed font-serif italic">
            Write what\'s on your heart. No names, no judgment.<br />
            <span className="text-emerald-400/50">Someone will read this.</span>
          </p>

          <div className="flex gap-3 mb-8">
            <button onClick={function() { setWriteType("letter"); setView("write"); }} className="write-btn flex-1 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/20 rounded-2xl py-4 px-5 text-left group transition-all">
              <div className="flex items-center gap-3">
                <span className="text-xl opacity-70 group-hover:opacity-100 transition-opacity">{"\u2709\uFE0F"}</span>
                <div>
                  <span className="text-white text-sm font-medium">Write a letter</span>
                  <p className="text-gray-500 text-xs mt-0.5">Share what\'s on your mind</p>
                </div>
              </div>
            </button>
            <button onClick={function() { setWriteType("light"); setView("write"); }} className="write-btn flex-1 bg-amber-500/[0.03] hover:bg-amber-500/[0.08] border border-amber-500/[0.1] hover:border-amber-500/25 rounded-2xl py-4 px-5 text-left group transition-all">
              <div className="flex items-center gap-3">
                <span className="text-xl opacity-70 group-hover:opacity-100 transition-opacity">{"\u2728"}</span>
                <div>
                  <span className="text-amber-300 text-sm font-medium">Share some light</span>
                  <p className="text-amber-400/40 text-xs mt-0.5">Spread positivity</p>
                </div>
              </div>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {tags.map(function(tag) {
              var emoji = tagEmojis[tag] || "";
              return (
                <button key={tag} onClick={function() { setActiveTag(tag); }} className={"whitespace-nowrap px-3.5 py-2 rounded-full text-xs transition-all duration-200 flex items-center gap-1.5 " + (activeTag === tag ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10" : "bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:bg-white/[0.06] hover:text-gray-300")}>
                  <span>{emoji}</span><span>{tag}</span>
                </button>
              );
            })}
          </div>

          {loading && letters.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                Loading letters...
              </div>
            </div>
          ) : letters.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4 opacity-30">{"\u2709\uFE0F"}</div>
              <p className="text-gray-500 text-sm mb-6 font-light">No letters yet. Be the first.</p>
              <button onClick={function() { setWriteType("letter"); setView("write"); }} className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full px-8 py-3 text-sm hover:bg-emerald-500/25 transition-all">Write the first letter</button>
            </div>
          ) : (
            <div className="space-y-4">
              {letters.map(function(letter, index) {
                var isLight = letter.type === "light";
                return (
                  <div key={letter.id} onClick={function() { setSelectedLetter(letter.id); setView("detail"); }}
                    className={"letter-card rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-300 " + (isLight ? "bg-gradient-to-br from-amber-500/[0.04] to-amber-600/[0.02] border border-amber-500/[0.12] hover:border-amber-500/25" : "bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06] hover:border-emerald-500/20")}
                    style={{animationDelay: (index * 0.08) + "s"}}
                  >
                    {isLight && <div className="flex items-center gap-2 mb-3"><span className="text-amber-400 text-xs">{"\u2728"}</span><span className="text-amber-400/60 text-xs font-light tracking-wide uppercase">Wall of Light</span></div>}
                    <p className={"text-sm sm:text-base leading-relaxed mb-4 font-serif " + (isLight ? "text-amber-100/80" : "text-gray-300/90")}>{letter.text}</p>
                    {letter.tags && letter.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mb-3">{letter.tags.map(function(tag) { return <span key={tag} className="text-[10px] text-emerald-400/50 bg-emerald-500/[0.06] px-2.5 py-1 rounded-full flex items-center gap-1"><span>{tagEmojis[tag] || ""}</span> {tag}</span>; })}</div>}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                      <span className="text-gray-600 text-xs">{timeAgo(letter.createdAt)}</span>
                      <div className="flex items-center gap-4">
                        <button onClick={function(e) { handleHeart(letter.id, e); }} className="heart-btn flex items-center gap-1.5 text-gray-500 hover:text-rose-400 transition-colors"><span className="text-sm">{"\u2665"}</span><span className="text-xs">{letter.hearts || 0}</span></button>
                        <div className="flex items-center gap-1.5 text-gray-600"><span className="text-xs">{"\uD83D\uDCAC"}</span><span className="text-xs">{letter.replyCount || 0}</span></div>
                        <button onClick={function(e) { shareLetter(letter, e); }} className="flex items-center gap-1 text-gray-600 hover:text-emerald-400 transition-colors" title="Share this letter">
                          {copiedId === letter.id
                            ? <span className="text-[10px] text-emerald-400">Copied!</span>
                            : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185z" /></svg>
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {hasMore && <button onClick={function() { var n = page + 1; setPage(n); fetchLetters(activeTag, n); }} className="w-full text-center py-4 text-gray-500 hover:text-emerald-400 text-sm transition-colors">Load more letters...</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}