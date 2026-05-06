import { useState, useEffect, useRef } from 'react';

export default function LetterDetail({ letterId, onBack }) {
  var [letter, setLetter] = useState(null);
  var [loading, setLoading] = useState(true);
  var [replyText, setReplyText] = useState('');
  var [replying, setReplying] = useState(false);
  var [error, setError] = useState('');
  var bottomRef = useRef(null);

  useEffect(function() {
    fetch('/api/letters/' + letterId).then(function(r) { return r.json(); }).then(function(data) { setLetter(data); setLoading(false); }).catch(function() { setLoading(false); });
  }, [letterId]);

  function handleHeart() {
    fetch('/api/letters/' + letterId + '/heart', { method: 'POST' }).then(function(r) { return r.json(); }).then(function(data) { setLetter(function(prev) { return Object.assign({}, prev, { hearts: data.hearts }); }); });
  }

  function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim() || replyText.trim().length < 2) { setError('Write at least a couple words.'); return; }
    setReplying(true); setError('');
    fetch('/api/letters/' + letterId + '/reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: replyText.trim() }) })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) { setError(data.error); } else {
          setLetter(function(prev) { return Object.assign({}, prev, { replies: (prev.replies || []).concat([data.reply]) }); });
          setReplyText('');
          setTimeout(function() { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' }); }, 100);
        }
        setReplying(false);
      }).catch(function() { setError('Something went wrong.'); setReplying(false); });
  }

  function timeAgo(ts) {
    var diff = Date.now() - ts; var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now'; if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60); if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><p className="text-gray-500 text-sm">Loading...</p></div>;
  if (!letter) return <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-5"><p className="text-gray-400 mb-4">Letter not found.</p><button onClick={onBack} className="text-emerald-400 text-sm">← Go back</button></div>;

  var isLight = letter.type === 'light';
  return (
    <div className="min-h-screen bg-[#0a0a0f] px-5 py-8">
      <div className="max-w-xl mx-auto">
        <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors text-sm mb-8 block">← Back to letters</button>
        <div className={'rounded-2xl p-6 sm:p-8 mb-8 ' + (isLight ? 'bg-amber-500/[0.04] border border-amber-500/[0.1]' : 'bg-white/[0.02] border border-white/[0.06]')}>
          {isLight && <div className="flex items-center gap-1.5 mb-4"><span className="text-amber-400 text-xs">✦</span><span className="text-amber-400/70 text-xs font-light">Wall of Light</span></div>}
          <p className={'text-base sm:text-lg leading-relaxed mb-6 font-light ' + (isLight ? 'text-amber-100/90' : 'text-gray-200')}>{letter.text}</p>
          {letter.tags && letter.tags.length > 0 && <div className="flex gap-2 mb-4">{letter.tags.map(function(tag) { return <span key={tag} className="text-xs text-emerald-400/60 bg-emerald-500/[0.08] px-2 py-0.5 rounded-full">{tag}</span>; })}</div>}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs">{timeAgo(letter.createdAt)}</span>
            <button onClick={handleHeart} className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 transition-colors"><span className="text-sm">♥</span><span className="text-xs">{letter.hearts || 0}</span></button>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-white text-sm font-medium mb-4">{(letter.replies || []).length > 0 ? 'Replies (' + letter.replies.length + ')' : 'No replies yet — be the first'}</h3>
          <div className="space-y-3">
            {(letter.replies || []).map(function(reply) { return (
              <div key={reply.id} className="bg-emerald-500/[0.04] border border-emerald-500/[0.08] rounded-xl px-4 py-3">
                <p className="text-gray-300 text-sm leading-relaxed">{reply.text}</p>
                <span className="text-gray-600 text-xs mt-2 block">{timeAgo(reply.createdAt)}</span>
              </div>
            ); })}
          </div>
          <div ref={bottomRef}></div>
        </div>
        <form onSubmit={handleReply} className="border-t border-white/[0.06] pt-4">
          <p className="text-gray-500 text-xs mb-3">Reply with kindness</p>
          <div className="flex gap-3">
            <input type="text" value={replyText} onChange={function(e) { setReplyText(e.target.value); }} placeholder="You're not alone in this..." maxLength={500} className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/30" />
            <button type="submit" disabled={replying || !replyText.trim()} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl px-5 py-3 text-sm font-medium transition-colors disabled:opacity-30">{replying ? '...' : 'Send'}</button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
