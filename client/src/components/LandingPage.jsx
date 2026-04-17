import { useState, useEffect } from 'react';
import CommunityPromise from './CommunityPromise';

var moods = [
  { emoji: '😔', label: 'Feeling down', value: 'down' },
  { emoji: '😰', label: 'Feeling anxious', value: 'anxious' },
  { emoji: '🫂', label: 'Feeling lonely', value: 'lonely' },
  { emoji: '😮‍💨', label: 'Overwhelmed', value: 'overwhelmed' },
  { emoji: '💭', label: 'Just want to talk', value: 'talk' },
  { emoji: '🤐', label: 'Rather not say', value: 'unspecified' }
];

export default function LandingPage({ onJoin, pushEnabled, onSubscribePush, onShowPrivacy, onShowTerms }) {
  var _step = useState('role');
  var step = _step[0]; var setStep = _step[1];
  var _role = useState(null);
  var role = _role[0]; var setRole = _role[1];
  var _duration = useState(15);
  var duration = _duration[0]; var setDuration = _duration[1];
  var _mood = useState([]);
  var mood = _mood[0]; var setMood = _mood[1];
  var _active = useState(0);
  var activeCount = _active[0]; var setActiveCount = _active[1];
  var _promise = useState(false);
  var showPromise = _promise[0]; var setShowPromise = _promise[1];

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
        <button onClick={function() { setShowPromise(false); }} className="mt-6 text-gray-500 hover:text-gray-300 text-sm transition-colors">← Back</button>
      </div>
    );
  }

  if (step === 'duration') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-5 animate-fade-in relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 text-center space-y-8 max-w-sm w-full">
          <button onClick={function() { setStep(role === 'seeker' ? 'mood' : 'role'); }} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Back</button>
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif text-white">How long would you like to chat?</h2>
            <p className="text-gray-500 text-sm font-light">Pick a session length. You can always leave early — no pressure.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={function() { setDuration(15); }} className={'flex-1 py-5 rounded-2xl text-center transition-all border backdrop-blur ' + (duration === 15 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
              <span className="block text-3xl font-serif">15</span>
              <span className="block text-xs mt-1 opacity-60">minutes</span>
            </button>
            <button onClick={function() { setDuration(30); }} className={'flex-1 py-5 rounded-2xl text-center transition-all border backdrop-blur ' + (duration === 30 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
              <span className="block text-3xl font-serif">30</span>
              <span className="block text-xs mt-1 opacity-60">minutes</span>
            </button>
          </div>
          <button onClick={function() { onJoin(role, duration, mood); }} className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25">
            {role === 'seeker' ? 'Find someone' : 'Start listening'}
          </button>
          <p className="text-gray-600 text-xs font-light">Nothing is recorded. Nothing is saved. Just two people, sharing a moment.</p>
        </div>
      </div>
    );
  }

  if (step === 'mood') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-5 animate-fade-in relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 text-center space-y-8 max-w-sm w-full">
          <button onClick={function() { setStep('role'); setMood([]); }} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Back</button>
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif text-white">How are you feeling?</h2>
            <p className="text-gray-500 text-sm font-light">Select all that apply. This helps your listener understand where you are.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {moods.map(function(m) {
              return (
                <button key={m.value} onClick={function() { setMood(function(prev) { return prev.includes(m.value) ? prev.filter(function(x) { return x !== m.value; }) : prev.concat([m.value]); }); }} className={'py-4 px-3 rounded-2xl text-center transition-all border backdrop-blur ' + (mood.includes(m.value) ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5' : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20')}>
                  <span className="block text-2xl mb-1">{m.emoji}</span>
                  <span className={'block text-xs font-light ' + (mood.includes(m.value) ? 'text-emerald-400' : 'text-gray-400')}>{m.label}</span>
                </button>
              );
            })}
          </div>
          <button onClick={function() { setStep('duration'); }} disabled={mood.length === 0} className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25 disabled:opacity-20 disabled:cursor-not-allowed">
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* Launch Announcement Bar */}
      <div className="w-full bg-emerald-500/10 border-b border-emerald-500/20 py-2.5 px-4">
        <p className="text-center text-xs sm:text-sm font-light text-emerald-300">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2 align-middle" />
          We just launched!
          <span className="text-emerald-400/60 mx-1.5">&mdash;</span>
          Be one of the first to be here for someone today.
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-5 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/3 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-10 max-w-md w-full">
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
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
            <button onClick={function() { setRole('seeker'); setStep('mood'); }} className="w-full py-5 px-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all text-left group backdrop-blur-sm">
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

            <button onClick={function() { setRole('listener'); setStep('duration'); }} className="w-full py-5 px-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all text-left group backdrop-blur-sm">
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
        </div>
      </section>

      {/* How It Works */}
      <section className="px-5 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-white">How it works</h2>
            <p className="text-gray-500 text-sm font-light max-w-md mx-auto">Three simple steps. No sign-up, no forms, no barriers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4 hover:border-emerald-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <span className="text-emerald-400 font-serif text-lg">1</span>
              </div>
              <h3 className="text-white font-medium text-sm">Choose your role</h3>
              <p className="text-gray-500 text-xs font-light leading-relaxed">Need to talk? Or want to listen? Pick what feels right for you today.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4 hover:border-emerald-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <span className="text-emerald-400 font-serif text-lg">2</span>
              </div>
              <h3 className="text-white font-medium text-sm">Get matched instantly</h3>
              <p className="text-gray-500 text-xs font-light leading-relaxed">We connect you with a real person in seconds. No profiles, no waiting rooms.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4 hover:border-emerald-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <span className="text-emerald-400 font-serif text-lg">3</span>
              </div>
              <h3 className="text-white font-medium text-sm">Talk. That's it.</h3>
              <p className="text-gray-500 text-xs font-light leading-relaxed">Have a real conversation. When the session ends, everything disappears. Nothing is saved.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built Different */}
      <section className="px-5 py-16 sm:py-24 relative">
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-emerald-500/3 blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="max-w-3xl mx-auto text-center space-y-12 relative z-10">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-white">Built different</h2>
            <p className="text-gray-500 text-sm font-light max-w-md mx-auto">We're not a social network. We're not therapy. We're a quiet space between those two things.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-left space-y-3 hover:border-emerald-500/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                  </svg>
                </div>
                <h3 className="text-white font-medium text-sm">Completely anonymous</h3>
              </div>
              <p className="text-gray-500 text-xs font-light leading-relaxed">No accounts. No names. No traces. Just two humans sharing a moment, then moving on.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-left space-y-3 hover:border-emerald-500/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </div>
                <h3 className="text-white font-medium text-sm">Nothing is saved</h3>
              </div>
              <p className="text-gray-500 text-xs font-light leading-relaxed">Conversations exist only in the moment. When you leave, it's gone — like it never happened.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-left space-y-3 hover:border-emerald-500/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.502-4.688-4.502-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.748 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium text-sm">Human-first design</h3>
              </div>
              <p className="text-gray-500 text-xs font-light leading-relaxed">No algorithms deciding who you talk to. No AI pretending to care. Real people, real presence.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-left space-y-3 hover:border-emerald-500/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium text-sm">Safe space</h3>
              </div>
              <p className="text-gray-500 text-xs font-light leading-relaxed">Community-driven guidelines, abuse reporting, and a culture of kindness built into every interaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="px-5 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-white">On the horizon</h2>
            <p className="text-gray-500 text-sm font-light max-w-md mx-auto">We're just getting started. Here's what's coming next.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-left flex items-start gap-4 hover:border-emerald-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium text-sm">Voice sessions</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium">COMING SOON</span>
                </div>
                <p className="text-gray-500 text-xs font-light leading-relaxed">Sometimes typing isn't enough. Optional voice chat for deeper connection.</p>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-left flex items-start gap-4 hover:border-emerald-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium text-sm">Multi-language</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">PLANNED</span>
                </div>
                <p className="text-gray-500 text-xs font-light leading-relaxed">Support in multiple languages so more people can find someone who understands.</p>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-left flex items-start gap-4 hover:border-emerald-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium text-sm">Listener recognition</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">PLANNED</span>
                </div>
                <p className="text-gray-500 text-xs font-light leading-relaxed">Anonymous badges and milestones for listeners who show up consistently.</p>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-left flex items-start gap-4 hover:border-emerald-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium text-sm">Mobile app</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">EXPLORING</span>
                </div>
                <p className="text-gray-500 text-xs font-light leading-relaxed">A dedicated app so you can be here for someone even when you're on the go.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-16 sm:py-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="max-w-md mx-auto text-center space-y-8 relative z-10">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-serif text-white">Ready to talk to someone?</h2>
            <p className="text-gray-500 text-sm font-light">It takes 10 seconds to connect. No sign-up needed.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xs mx-auto sm:max-w-none">
            <button onClick={function() { setRole('seeker'); setStep('mood'); }} className="flex-1 py-3.5 rounded-2xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25">
              I need someone
            </button>
            <button onClick={function() { setRole('listener'); setStep('duration'); }} className="flex-1 py-3.5 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-medium hover:bg-white/[0.1] hover:border-emerald-500/30 transition-all active:scale-[0.98]">
              I can listen
            </button>
          </div>
          {!pushEnabled && (
            <button onClick={function() { onSubscribePush('listener'); }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-400 transition-colors font-light mx-auto">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              Get notified when someone needs you
            </button>
          )}
          {pushEnabled && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500/60 font-light mx-auto">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Notifications on
            </span>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-12 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Crisis Banner */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 max-w-lg mx-auto">
            <p className="text-gray-500 text-xs font-light leading-relaxed text-center">
              <span className="mr-1">💛</span>
              Someone Today is a peer support platform, not a crisis service. If you're in immediate danger, please call{' '}
              <a href="tel:988" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">988</a>
              {' '}or text HOME to{' '}
              <a href="sms:741741&body=HOME" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">741741</a>.
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={function() { setShowPromise(true); }} className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors font-light">Our Promise</button>
            <span className="text-gray-700 text-[11px]">·</span>
            <button onClick={onShowPrivacy} className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors font-light">Privacy Policy</button>
            <span className="text-gray-700 text-[11px]">·</span>
            <button onClick={onShowTerms} className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors font-light">Terms of Service</button>
          </div>

          {/* Copyright */}
          <p className="text-center text-gray-700 text-[11px] font-light">&copy; 2026 Someone Today. Made with quiet intention.</p>
        </div>
      </footer>
    </div>
  );
}
