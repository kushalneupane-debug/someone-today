import { useState, useRef, useEffect } from 'react';
import CrisisRedirection from './CrisisRedirection';

const NUDGES = {
  down: [
    "It's okay to just be here. No pressure to say anything.",
    "Sometimes just knowing someone is here helps.",
    "Take all the time you need. I'm not going anywhere."
  ],
  anxious: [
    "Take your time. There's no rush here.",
    "Would it help to share what's on your mind?",
    "Deep breath. This is a safe space."
  ],
  lonely: [
    "You're not alone right now.",
    "I'm right here with you.",
    "Sometimes company is all we need."
  ],
  overwhelmed: [
    "One thing at a time. What feels biggest?",
    "It's okay to not have it all figured out.",
    "You don't have to carry it all right now."
  ],
  talk: [
    "What's been on your mind lately?",
    "Tell me about your day.",
    "Anything interesting happen recently?"
  ],
  default: [
    "Take your time. I'm here.",
    "What's on your mind?",
    "No rush — say whatever feels right."
  ]
};

const LISTENER_NUDGES = [
  "Maybe ask how they're doing today?",
  "A simple 'I'm here' can go a long way.",
  "Try sharing something small about your day.",
  "Sometimes just saying 'tell me more' helps."
];

export default function ChatInterface({
  messages,
  onSend,
  timeLeft,
  role,
  mood,
  isPartnerTyping,
  onStepAway,
  onReport,
  onTyping,
  onStopTyping
}) {
  const [input, setInput] = useState('');
  const [showCrisis, setShowCrisis] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [nudge, setNudge] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const nudgeTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(function() {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isPartnerTyping, nudge]);

  useEffect(function() {
    lastActivityRef.current = Date.now();
    setNudge(null);

    if (nudgeTimerRef.current) {
      clearTimeout(nudgeTimerRef.current);
    }

    var delay = 30000 + Math.random() * 30000;
    nudgeTimerRef.current = setTimeout(function() {
      var pool;
      if (role === 'listener') {
        pool = LISTENER_NUDGES;
      } else {
        pool = NUDGES[mood] || NUDGES['default'];
      }
      var pick = pool[Math.floor(Math.random() * pool.length)];
      setNudge(pick);
    }, delay);

    return function() {
      if (nudgeTimerRef.current) {
        clearTimeout(nudgeTimerRef.current);
      }
    };
  }, [messages.length, role, mood]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
    onStopTyping();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }

  function handleInputChange(e) {
    var val = e.target.value;
    if (val.length > 500) return;
    setInput(val);

    onTyping();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(function() {
      onStopTyping();
    }, 2000);
  }

  function formatTime(s) {
    if (s === null || s === undefined) return '--:--';
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function getTimerColor() {
    if (timeLeft === null) return 'text-white/50';
    if (timeLeft > 300) return 'text-emerald-400';
    if (timeLeft > 60) return 'text-amber-400';
    return 'text-red-400';
  }

  var starters = [
    'How are you feeling today?',
    'What brought you here?',
    'Just wanted someone to sit with'
  ];

  if (showCrisis) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur">
            <CrisisRedirection />
          </div>
          <button
            onClick={function() { setShowCrisis(false); }}
            className="mt-4 w-full text-white/40 hover:text-white/60 text-sm transition-colors"
          >
            Return to conversation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft"></div>
          <span className="text-white/60 text-sm">
            {role === 'seeker' ? 'Your listener' : 'Your seeker'}
          </span>
        </div>
        <div className={'font-mono text-sm ' + getTimerColor()}>
          {formatTime(timeLeft)}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={function() { setShowCrisis(true); }}
            className="text-white/30 hover:text-white/50 text-xs transition-colors"
          >
            Need help?
          </button>
          <button
            onClick={function() { setShowReport(!showReport); }}
            className="text-white/30 hover:text-white/50 text-xs transition-colors"
          >
            Report
          </button>
        </div>
      </div>

      {showReport && (
        <div className="p-3 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex flex-wrap gap-2 justify-center">
            {['Inappropriate', 'Harmful', 'Spam', 'Other'].map(function(reason) {
              return (
                <button
                  key={reason}
                  onClick={function() { onReport(reason); setShowReport(false); }}
                  className="px-3 py-1 rounded-full text-xs bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/20 transition-all"
                >
                  {reason}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !nudge && (
          <div className="flex flex-col items-center justify-center h-full gap-3 animate-fade-in">
            <p className="text-white/30 text-sm mb-2">Start the conversation...</p>
            {role === 'seeker' && starters.map(function(s, i) {
              return (
                <button
                  key={i}
                  onClick={function() { onSend(s); }}
                  className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/40 text-sm hover:text-white/60 hover:border-white/20 transition-all"
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}

        {messages.map(function(msg, i) {
          var isMe = msg.sender === 'me';
          return (
            <div
              key={i}
              className={'flex ' + (isMe ? 'justify-end' : 'justify-start')}
            >
              <div
                className={'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ' + (isMe ? 'bg-emerald-500/20 text-emerald-100 rounded-br-md' : 'bg-white/[0.05] text-white/80 rounded-bl-md')}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {nudge && (
          <div className="flex justify-center animate-fade-in">
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-400/[0.06] border border-emerald-400/[0.12] text-emerald-300/70 text-sm text-center max-w-[85%]">
              <span className="text-emerald-400/40 mr-1.5">✦</span>
              {nudge}
            </div>
          </div>
        )}

        {isPartnerTyping && (
          <div className="flex justify-start">
            <div className="bg-white/[0.05] px-4 py-2.5 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      <div className="px-4 pb-1 flex justify-center">
        <button
          onClick={onStepAway}
          className="text-white/20 hover:text-white/40 text-xs transition-colors"
        >
          Step away gently
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.08]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-400/30 transition-colors"
            autoFocus
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 py-3 bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 rounded-xl text-sm hover:bg-emerald-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
