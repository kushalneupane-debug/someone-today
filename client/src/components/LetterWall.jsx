import { useState, useEffect } from 'react';
import WriteLetter from './WriteLetter';
import LetterDetail from './LetterDetail';

export default function LetterWall({ onBack }) {
  var [letters, setLetters] = useState([]);
  var [loading, setLoading] = useState(true);
  var [activeTag, setActiveTag] = useState('all');
  var [view, setView] = useState('wall');
  var [selectedLetter, setSelectedLetter] = useState(null);
  var [writeType, setWriteType] = useState('letter');
  var [page, setPage] = useState(0);
  var [hasMore, setHasMore] = useState(false);
  var tags = ['all','lonely','anxious','sad','lost','overwhelmed','angry','numb','grateful','hopeful','healing'];

  function fetchLetters(tagFilter, pageNum) {
    setLoading(true);
    var url = '/api/letters?page=' + (pageNum || 0);
    if (tagFilter && tagFilter !== 'all') url += '&tag=' + tagFilter;
    fetch(url).then(function(r) { return r.json(); }).then(function(data) {
      if (pageNum > 0) { setLetters(function(prev) { return prev.concat(data.letters); }); }
      else { setLetters(data.letters); }
      setHasMore(data.hasMore);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }

  useEffect(function() { fetchLetters(activeTag, 0); setPage(0); }, [activeTag]);

  function handleHeart(letterId, e) {
    e.stopPropagation();
    fetch('/api/letters/' + letterId + '/heart', { method: 'POST' }).then(function(r) { return r.json(); }).then(function(data) {
      setLetters(function(prev) { return prev.map(function(l) { if (l.id === letterId) return Object.assign({}, l, { hearts: data.hearts }); return l; }); });
    });
  }

  function timeAgo(ts) {
    var diff = Date.now() - ts; var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now'; if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60); if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }

  if (view === 'write') return <WriteLetter type={writeType} onBack={function() { setView('wall'); }} onPosted={function() { setView('wall'); fetchLetters(activeTag, 0); setPage(0); }} />;
  if (view === 'detail' && selectedLetter) return <LetterDetail letterId={selectedLetter} onBack={function() { setView('wall'); fetchLetters(activeTag, 0); }} />;

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-5 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors text-sm">← Back</button>
          <h1 className="text-xl sm:text-2xl font-serif text-white">Letters</h1>
          <div className="w-12"></div>
        </div>
        <p className="text-gray-400 text-center text-sm font-light mb-6">Write what's on your heart. No names, no judgment.<br />Someone will read this.</p>
        <div className="flex gap-3 mb-8">
          <button onClick={function() { setWriteType('letter'); setView('write'); }} className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl py-3 px-4 text-white text-sm transition-all">✉ Write a letter</button>
          <button onClick={function() { setWriteType('light'); setView('write'); }} className="flex-1 bg-amber-500/[0.06] hover:bg-amber-500/[0.12] border border-amber-500/[0.15] rounded-xl py-3 px-4 text-amber-400 text-sm transition-all">✦ Share some light</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {tags.map(function(tag) { return (<button key={tag} onClick={function() { setActiveTag(tag); }} className={'whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition-all ' + (activeTag === tag ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08]')}>{tag}</button>); })}
        </div>
        {loading && letters.length === 0 ? (
          <div className="text-center py-16"><p className="text-gray-500 text-sm">Loading letters...</p></div>
        ) : letters.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm mb-4">No letters yet. Be the first to write one.</p>
            <button onClick={function() { setWriteType('letter'); setView('write'); }} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-6 py-2 text-sm">Write a letter</button>
          </div>
        ) : (
          <div className="space-y-4">
            {letters.map(function(letter) {
              var isLight = letter.type === 'light';
              return (
                <div key={letter.id} onClick={function() { setSelectedLetter(letter.id); setView('detail'); }} className={'rounded-2xl p-5 cursor-pointer transition-all hover:bg-white/[0.04] ' + (isLight ? 'bg-amber-500/[0.04] border border-amber-500/[0.1]' : 'bg-white/[0.02] border border-white/[0.06]')}>
                  {isLight && <div className="flex items-center gap-1.5 mb-3"><span className="text-amber-400 text-xs">✦</span><span className="text-amber-400/70 text-xs font-light">Wall of Light</span></div>}
                  <p className={'text-sm leading-relaxed mb-4 ' + (isLight ? 'text-amber-100/80' : 'text-gray-300')}>{letter.text}</p>
                  {letter.tags && letter.tags.length > 0 && <div className="flex gap-2 mb-3">{letter.tags.map(function(tag) { return <span key={tag} className="text-xs text-emerald-400/60 bg-emerald-500/[0.08] px-2 py-0.5 rounded-full">{tag}</span>; })}</div>}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">{timeAgo(letter.createdAt)}</span>
                    <div className="flex items-center gap-4">
                      <button onClick={function(e) { handleHeart(letter.id, e); }} className="flex items-center gap-1 text-gray-500 hover:text-red-400 transition-colors"><span className="text-xs">♥</span><span className="text-xs">{letter.hearts || 0}</span></button>
                      <div className="flex items-center gap-1 text-gray-500"><span className="text-xs">💬</span><span className="text-xs">{letter.replyCount || 0}</span></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {hasMore && <button onClick={function() { var n = page + 1; setPage(n); fetchLetters(activeTag, n); }} className="w-full text-center py-3 text-gray-500 hover:text-white text-sm">Load more letters</button>}
          </div>
        )}
      </div>
    </div>
  );
}
