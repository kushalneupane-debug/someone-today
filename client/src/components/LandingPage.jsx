import { useState, useEffect } from 'react';
import CommunityPromise from './CommunityPromise';

export default function LandingPage({ onJoin }) {
  const [step, setStep] = useState('role');
  const [role, setRole] = useState(null);
  const [duration, setDuration] = useState(15);
  const [activeCount, setActiveCount] = useState(0);
  const [showPromise, setShowPromise] = useState(false);

  useEffect(function() {
    fetch('/api/active')
      .then(function(r) { return r.json(); })
      .then(function(data) { setActiveCount(data.active || 0); })
      .catch(function() {});
    var interval = setInterval(function() {
      fetch('/api/active')
        .then(function(r) { return r.json(); })
        .then(function(data) { setActiveCount(data.active || 0); })
        .catch(function() {});
    }, 15000);
    return function() { clearInterval(interval); };
  }, []);

  if (showPromise) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-5 animate-fade-in">
        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 max-w-sm">
          <CommunityPromise />
        </div>
        <button onClick={function() { setShowPromise(false); }}
          className="mt-6 text-gray-500 hover:text-gray-300 text-sm transition-colors">← Back</button>
      </div>
    );
  }

  if (step === 'duration') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-5 animate-fade-in relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-8 max-w-sm w-full">
          <button onClick={function() { setStep('role'); }}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Back</button>

          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif text-white">How long feels right?</h2>
            <p className="text-gray-500 text-sm font-light">You can always step away earlier.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={function() { setDuration(15); }}
              className={'flex-1 py-5 rounded-2xl text-center transition-all border backdrop-blur ' +
                (duration === 15
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
              <span className="block text-3xl font-serif">15</span>
              <span className="block text-xs mt-1 opacity-60">minutes</span>
            </button>
            <button onClick={function() { setDuration(30); }}
              className={'flex-1 py-5 rounded-2xl text-center transition-all border backdrop-blur ' +
                (duration === 30
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
              <span className="block text-3xl font-serif">30</span>
              <span className="block text-xs mt-1 opacity-60">minutes</span>
            </button>
          </div>

          <button onClick={function() { onJoin(role, duration); }}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25">
            {role === 'seeker' ? 'Find someone' : 'Start listening'}
          </button>

          <p className="text-gray-600 text-xs font-light">
            Nothing is recorded. Nothing is saved. Just two people, sharing a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-5 animate-fade-in relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/3 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center space-y-10 max-w-md w-full">
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
            </svg>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-serif text-white leading-tight tracking-tight">
              You don't have to go<br />through today alone
            </h1>
            <p className="text-gray-500 text-sm sm:text-base font-light leading-relaxed max-w-xs mx-auto">
              A quiet place to talk to a real person. No profiles, no history. Just presence.
            </p>
          </div>
        </div>

        {activeCount > 0 && (
          <div className="flex items-center justify-center gap-2 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft shadow-lg shadow-emerald-400/50" />
            <p className="text-emerald-400/70 text-xs font-light">
              {activeCount} {activeCount === 1 ? 'conversation' : 'conversations'} happening right now
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button onClick={function() { setRole('seeker'); setStep('duration'); }}
            className="w-full py-5 px-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all text-left group backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/10 transition-all">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.502-4.688-4.502-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.748 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-[15px] font-medium text-white group-hover:text-emerald-300 transition-colors">I need someone today</span>
                <p className="text-gray-500 text-xs mt-0.5 font-light">Be matched with someone who is here to listen</p>
              </div>
              <svg className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button onClick={function() { setRole('listener'); setStep('duration'); }}
            className="w-full py-5 px-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all text-left group backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/10 transition-all">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-[15px] font-medium text-white group-hover:text-emerald-300 transition-colors">I can be someone today</span>
                <p className="text-gray-500 text-xs mt-0.5 font-light">Be there for someone who needs a quiet presence</p>
              </div>
              <svg className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <span className="text-xs text-gray-600 font-light">Private</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="text-xs text-gray-600 font-light">15-30 min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <span className="text-xs text-gray-600 font-light">Nothing saved</span>
            </div>
          </div>

          <button onClick={function() { setShowPromise(true); }}
            className="text-xs text-gray-600 hover:text-emerald-400 transition-colors font-light">
            Our community promise
          </button>
        </div>
      </div>
    </div>
  );
}
