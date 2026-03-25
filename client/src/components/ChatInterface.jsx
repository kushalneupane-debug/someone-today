import { useState, useRef, useEffect } from 'react';
import CrisisRedirection from './CrisisRedirection';

export default function ChatInterface({ messages, onSend, onStepAway, onReport, timeLeft, role, isPartnerTyping, onTyping, onStopTyping }) {
  var _input = useState('');
  var input = _input[0];
  var setInput = _input[1];
  var _crisis = useState(false);
  var showCrisis = _crisis[0];
  var setShowCrisis = _crisis[1];
  var messagesEnd = useRef(null);
  var typingTimeout = useRef(null);

  useEffect(function() {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  function handleSubmit(e) {
    e.preventDefault();
    var text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    onStopTyping();
  }

  function handleInputChange(e) {
    setInput(e.target.value);
    onTyping();
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(function() {
      onStopTyping();
    }, 1500);
  }

  function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + ':' + s.toString().padStart(2, '0');
  }

  function timerColor() {
    if (timeLeft > 300) return 'text-emerald-400/60';
    if (timeLeft > 60) return 'text-amber-400/60';
    return 'text-red-400/80';
  }

  var starters = [
    'How are you feeling today?',
    'What brought you here?',
    'Just wanted someone to sit with'
  ];

  if (showCrisis) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-5 animate-fade-in">
        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 max-w-sm">
          <CrisisRedirection />
        </div>
        <button onClick={function() { setShowCrisis(false); }}
          className="mt-6 text-gray-500 hover:text-gray-300 text-sm transition-colors">Return to conversation</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col max-w-lg mx-auto w-full animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
          <span className="text-xs text-gray-500 font-light">
            {role === 'seeker' ? 'Someone is here for you' : 'Someone needs you'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {timeLeft <= 300 && timeLeft > 0 && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-soft" />
          )}
          <span className={'text-xs font-mono font-light ' + timerColor()}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10 space-y-5 animate-fade-in">
            <div className="space-y-2">
              <p className="text-gray-500 text-sm font-light">The conversation has started.</p>
              <p className="text-gray-600 text-xs font-light">Say whatever feels right — or just sit here. That is okay too.</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600 text-xs font-light">Or start with something simple:</p>
              {starters.map(function(starter) {
                return (
                  <button key={starter} onClick={function() { onSend(starter); }}
                    className="block mx-auto px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-400 text-xs hover:border-emerald-500/30 hover:text-emerald-400 transition-all">
                    {starter}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map(function(msg, i) {
          return (
            <div key={i} className={'flex ' + (msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
              <div className={'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ' +
                (msg.sender === 'me'
                  ? 'bg-emerald-500/15 text-emerald-100 rounded-br-md border border-emerald-500/20'
                  : 'bg-white/[0.05] text-gray-300 rounded-bl-md border border-white/[0.08]')}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {isPartnerTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white/[0.05] rounded-2xl rounded-bl-md border border-white/[0.08] px-4 py-3">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse-soft" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse-soft [animation-delay:0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse-soft [animation-delay:0.6s]" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      <div className="border-t border-white/[0.06] bg-[#0a0a0f]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3">
          <input type="text" value={input} onChange={handleInputChange}
            placeholder="Type something\u2026" maxLength={500} autoFocus
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 transition-colors" />
          <button type="submit" disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400 disabled:opacity-20 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
        <div className="flex items-center justify-between px-4 pb-3 pt-0">
          <div className="flex gap-4">
            <button onClick={function() { setShowCrisis(true); }}
              className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Need more support?</button>
            <button onClick={function() { onReport('general'); }}
              className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Report</button>
          </div>
          <button onClick={onStepAway}
            className="text-gray-500 hover:text-red-400 text-xs font-medium transition-colors px-3 py-1 rounded-lg border border-white/[0.08] hover:border-red-500/30">
            Step away
          </button>
        </div>
      </div>
    </div>
  );
}
