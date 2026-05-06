import { useState } from 'react';

export default function WriteLetter({ type, onBack, onPosted }) {
  var [text, setText] = useState('');
  var [selectedTags, setSelectedTags] = useState([]);
  var [posting, setPosting] = useState(false);
  var [error, setError] = useState('');
  var isLight = type === 'light';
  var tags = isLight ? ['grateful','hopeful','healing'] : ['lonely','anxious','sad','lost','overwhelmed','angry','numb','grateful','hopeful','healing'];

  function toggleTag(tag) {
    setSelectedTags(function(prev) {
      if (prev.indexOf(tag) !== -1) return prev.filter(function(t) { return t !== tag; });
      if (prev.length >= 3) return prev;
      return prev.concat([tag]);
    });
  }

  function handleSubmit() {
    if (text.trim().length < 10) { setError('Write at least 10 characters.'); return; }
    setPosting(true); setError('');
    fetch('/api/letters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text.trim(), tags: selectedTags, type: type }) })
      .then(function(r) { return r.json(); })
      .then(function(data) { if (data.error) { setError(data.error); setPosting(false); } else { onPosted(); } })
      .catch(function() { setError('Something went wrong.'); setPosting(false); });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-5 py-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors text-sm">← Back</button>
          <h1 className={'text-xl font-serif ' + (isLight ? 'text-amber-400' : 'text-white')}>{isLight ? '✦ Share some light' : '✉ Write a letter'}</h1>
          <div className="w-12"></div>
        </div>
        <p className="text-gray-400 text-center text-sm font-light mb-8">{isLight ? 'Share a win, a moment of gratitude, or something that made you smile.' : "Say what you need to say. It's anonymous. Someone will read this."}</p>
        <textarea value={text} onChange={function(e) { setText(e.target.value); }} placeholder={isLight ? "Something good happened today..." : "What's on your heart..."} maxLength={2000} rows={8} className={'w-full bg-white/[0.03] border rounded-2xl px-5 py-4 text-white text-sm leading-relaxed placeholder-gray-600 focus:outline-none resize-none ' + (isLight ? 'border-amber-500/[0.15] focus:border-amber-500/30' : 'border-white/[0.08] focus:border-emerald-500/30')}></textarea>
        <div className="flex justify-end mt-2 mb-6"><span className={'text-xs ' + (text.length > 1800 ? 'text-red-400' : 'text-gray-600')}>{text.length}/2000</span></div>
        <div className="mb-8">
          <p className="text-gray-500 text-xs mb-3">How does this feel? (up to 3)</p>
          <div className="flex flex-wrap gap-2">
            {tags.map(function(tag) { var selected = selectedTags.indexOf(tag) !== -1; return (<button key={tag} onClick={function() { toggleTag(tag); }} className={'px-3 py-1.5 rounded-full text-xs transition-all ' + (selected ? (isLight ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30') : 'bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08]')}>{tag}</button>); })}
          </div>
        </div>
        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
        <button onClick={handleSubmit} disabled={posting} className={'w-full py-4 rounded-full text-sm font-medium transition-all ' + (isLight ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30' : 'bg-emerald-500 hover:bg-emerald-400 text-black') + (posting ? ' opacity-50' : '')}>{posting ? 'Posting...' : (isLight ? 'Share this light ✦' : 'Post anonymously')}</button>
        <p className="text-gray-600 text-xs text-center mt-4">Completely anonymous. No accounts. No tracking.</p>
      </div>
    </div>
  );
}
