import { useState, useEffect, useRef } from 'react';
import CommunityPromise from './CommunityPromise';

var moods = [
  { emoji: '😔', label: 'Feeling down', value: 'down' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '🫂', label: 'Lonely', value: 'lonely' },
  { emoji: '😮‍💨', label: 'Overwhelmed', value: 'overwhelmed' },
  { emoji: '💭', label: 'Need to talk', value: 'talk' },
  { emoji: '🤐', label: 'Rather not say', value: 'unspecified' },
];

var testimonials = [
  { text: "I talked to a stranger at 2am. They didn't give advice. They just listened. That was everything.", from: "Someone who needed it" },
  { text: "Being a listener here taught me that presence is the rarest gift you can give.", from: "A listener" },
  { text: "No sign-up. No history. No judgment. Just a real human on the other side. This is what the internet should be.", from: "First-time user" },
  { text: "I wrote a letter on the Letters wall. Someone replied with so much kindness I cried.", from: "Anonymous" },
  { text: "I came here to listen. I ended up learning something about myself too.", from: "Regular listener" },
  { text: "I was having the worst night. A stranger stayed with me for 30 minutes. It changed everything.", from: "Someone Today user" },
];

var tickerMsgs = [
  'Someone just opened a conversation',
  'New letter posted on the wall',
  'Two people just connected',
  '"Thank you — I really needed this"',
  'A late-night conversation just ended',
  'A listener replied with kindness',
  'Someone felt heard for the first time tonight',
  'A new listener just joined',
  'Someone said they feel better now',
  'An anonymous letter brought someone to tears — the good kind',
];


function AnimatedCounter({ target, duration = 2000 }) {
  var [count, setCount] = useState(0);
  var ref = useRef(null);
  var started = useRef(false);

  useEffect(function() {
    var observer = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        var start = 0;
        var step = target / (duration / 16);
        var t = setInterval(function() {
          start += step;
          if (start >= target) { setCount(target); clearInterval(t); }
          else { setCount(Math.floor(start)); }
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return function() { observer.disconnect(); };
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function ChatPreview() {
  var script = [
    { from: 'them', text: "Hey. I'm here. Take your time." },
    { from: 'me',   text: "I don't really know how to start..." },
    { from: 'them', text: "That's okay. You don't have to." },
    { from: 'them', text: "I'm just here to listen." },
    { from: 'me',   text: "I just needed someone tonight." },
    { from: 'them', text: "I'm really glad you reached out." },
  ];
  var [visible, setVisible] = useState(3);
  var [typing, setTyping] = useState(false);
  useEffect(function() {
    if (visible >= script.length) {
      var t = setTimeout(function() { setVisible(3); }, 4000);
      return function() { clearTimeout(t); };
    }
    var t1 = setTimeout(function() { setTyping(true); }, 900);
    var t2 = setTimeout(function() { setTyping(false); setVisible(function(v) { return v + 1; }); }, 2400);
    return function() { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);
  var msgs = script.slice(0, visible);
  var nextFrom = visible < script.length ? script[visible].from : null;
  return (
    <div className="chat-glow-wrap w-full">
      <div className="glass-strong overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05] bg-white/[0.02]">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm">👤</div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#04040a]" />
          </div>
          <div className="flex-1">
            <p className="text-white/88 text-sm font-medium leading-none">Anonymous listener</p>
            <p className="text-emerald-400/85 text-[11px] mt-1">● Online · matched in 8s</p>
          </div>
          <span className="text-white/15 text-sm">🔒</span>
        </div>
        <div className="px-4 py-5 space-y-2.5 min-h-[220px] flex flex-col justify-end">
          {msgs.map(function(msg, i) {
            var isNew = i === visible - 1 && visible > 3;
            return (
              <div key={i} className={'flex ' + (msg.from === 'me' ? 'justify-end' : 'justify-start') + (isNew ? ' chat-msg-in' : '')}>
                <div className={'max-w-[82%] px-3.5 py-2 rounded-2xl text-sm font-light leading-relaxed ' +
                  (msg.from === 'me'
                    ? 'bg-emerald-500/15 border border-emerald-500/20 text-white/80 rounded-br-sm'
                    : 'bg-white/[0.05] border border-white/[0.07] text-white/78 rounded-bl-sm')}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          {typing && nextFrom && (
            <div className={'flex ' + (nextFrom === 'me' ? 'justify-end' : 'justify-start') + ' chat-msg-in'}>
              <div className="px-3.5 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.07] flex items-center gap-1.5">
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-white/[0.04] bg-black/20">
          <p className="text-white/45 text-[10px] text-center font-light">Nothing is saved · Disappears when you leave</p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ onJoin, pushEnabled, onSubscribePush, onShowPrivacy, onShowTerms, onShowLetters }) {
  var [step, setStep] = useState('role');
  var [role, setRole] = useState(null);
  var [duration, setDuration] = useState(15);
  var [mood, setMood] = useState([]);
  var [activeCount, setActiveCount] = useState(0);
  var [totalSessions, setTotalSessions] = useState(0);
  var [showPromise, setShowPromise] = useState(false);
  var [testimonialIndex, setTestimonialIndex] = useState(0);
  var [mousePos, setMousePos] = useState({x: 0, y: 0});

  useEffect(function() {
    function onMouse(e) {
      setMousePos({x: (e.clientX / window.innerWidth - 0.5) * 30, y: (e.clientY / window.innerHeight - 0.5) * 20});
    }
    window.addEventListener('mousemove', onMouse, {passive: true});
    return function() { window.removeEventListener('mousemove', onMouse); };
  }, []);

  useEffect(function() {
    fetch('/api/stats').then(function(r){return r.json();}).then(function(d){setActiveCount(d.active||0);setTotalSessions(d.totalSessions||0);}).catch(function(){});
    var iv = setInterval(function(){fetch('/api/stats').then(function(r){return r.json();}).then(function(d){setActiveCount(d.active||0);setTotalSessions(d.totalSessions||0);}).catch(function(){});},15000);
    return function(){clearInterval(iv);};
  }, []);

  useEffect(function() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('scroll-visible'); });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    setTimeout(function() {
      document.querySelectorAll('.scroll-hidden').forEach(function(el) { observer.observe(el); });
    }, 100);
    return function() { observer.disconnect(); };
  }, [step]);

  useEffect(function() {
    var t = setInterval(function() { setTestimonialIndex(function(i) { return (i+1) % testimonials.length; }); }, 5000);
    return function() { clearInterval(t); };
  }, []);

  if (showPromise) {
    return (
      <div className="min-h-screen bg-[#04040a] flex flex-col items-center justify-center px-5 animate-slide-up">
        <div className="glass-strong p-8 max-w-sm w-full">
          <CommunityPromise />
        </div>
        <button onClick={function(){setShowPromise(false);}} className="mt-6 text-white/30 hover:text-white/60 text-sm transition-colors">← Back</button>
      </div>
    );
  }

  /* ── MOOD STEP ── */
  if (step === 'mood') {
    return (
      <div className="min-h-screen bg-[#04040a] flex flex-col items-center justify-center px-5 animate-slide-up relative overflow-hidden">
        <div className="orb orb-emerald orb-animate" style={{width:'500px',height:'500px',top:'20%',left:'30%',opacity:0.6}} />
        <div className="relative z-10 max-w-sm w-full space-y-8">
          <button onClick={function(){setStep('role');setMood([]);}} className="text-white/30 hover:text-white/60 text-sm transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>Back
          </button>
          <div className="space-y-2">
            <p className="text-label text-emerald-400/60">Step 1 of 2</p>
            <h2 className="text-display-md text-white">How are you feeling right now?</h2>
            <p className="text-white/65 text-sm font-light">This helps your listener understand where you are.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {moods.map(function(m) {
              return (
                <button key={m.value} onClick={function(){setMood(function(prev){return prev.includes(m.value)?prev.filter(function(x){return x!==m.value;}):prev.concat([m.value]);});}}
                  className={'py-4 px-3 rounded-2xl text-center transition-all border ' + (mood.includes(m.value) ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'bg-white/[0.025] border-white/[0.07] hover:border-white/[0.15]')}>
                  <span className="block text-2xl mb-2">{m.emoji}</span>
                  <span className={'block text-xs font-light ' + (mood.includes(m.value) ? 'text-emerald-400' : 'text-white/50')}>{m.label}</span>
                </button>
              );
            })}
          </div>
          <button onClick={function(){setStep('duration');}} disabled={mood.length===0}
            className="btn-primary w-full disabled:opacity-20 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
            Continue →
          </button>
          <p className="text-center text-white/20 text-xs">Nothing you select here is stored.</p>
        </div>
      </div>
    );
  }

  /* ── DURATION STEP ── */
  if (step === 'duration') {
    return (
      <div className="min-h-screen bg-[#04040a] flex flex-col items-center justify-center px-5 animate-slide-up relative overflow-hidden">
        <div className="orb orb-emerald orb-animate" style={{width:'500px',height:'500px',top:'20%',left:'30%',opacity:0.5}} />
        <div className="relative z-10 max-w-sm w-full space-y-8">
          <button onClick={function(){setStep(role==='seeker'?'mood':'role');}} className="text-white/30 hover:text-white/60 text-sm transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>Back
          </button>
          <div className="space-y-2">
            <p className="text-label text-emerald-400/60">{role==='seeker'?'Step 2 of 2':'Step 1 of 1'}</p>
            <h2 className="text-display-md text-white">How long do you have?</h2>
            <p className="text-white/65 text-sm font-light">You can always leave early — no pressure.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[15,30].map(function(d) {
              return (
                <button key={d} onClick={function(){setDuration(d);}}
                  className={'py-8 rounded-2xl text-center transition-all border ' + (duration===d ? 'bg-emerald-500/10 border-emerald-500/30 shadow-xl shadow-emerald-500/10' : 'bg-white/[0.025] border-white/[0.07] hover:border-white/[0.15]')}>
                  <span className={'block font-display font-light leading-none mb-1 ' + (duration===d ? 'text-emerald-300' : 'text-white/70')} style={{fontSize:'3.5rem'}}>{d}</span>
                  <span className={'block text-xs uppercase tracking-widest ' + (duration===d ? 'text-emerald-400/70' : 'text-white/30')}>minutes</span>
                </button>
              );
            })}
          </div>
          <button onClick={function(){onJoin(role,duration,mood);}} className="btn-primary w-full">
            {role==='seeker' ? 'Find someone for me' : 'Start listening'}
          </button>
          <p className="text-center text-white/20 text-xs">Nothing is recorded. Nothing is saved.</p>
        </div>
      </div>
    );
  }

  /* ── MAIN LANDING ── */
  return (
    <div className="min-h-screen bg-[#04040a] text-white overflow-x-hidden">

      {/* Ambient orb — follows mouse */}
      <div className="orb orb-emerald" style={{width:'800px',height:'800px',top:'-200px',left:'50%',transform:`translateX(calc(-50% + ${mousePos.x}px)) translateY(${mousePos.y}px)`,opacity:0.45,zIndex:0,transition:'transform 0.6s ease-out'}} />

      {/* Live stats bar */}
      <div className="relative z-10 w-full border-b border-white/[0.05] py-2.5 px-4 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="pill-dot animate-pulse-soft" />
          {totalSessions > 0
            ? <p className="text-xs text-white/65 font-light"><span className="text-emerald-400 font-medium">{totalSessions.toLocaleString()}</span> conversations have happened here — <span className="text-white/80">be part of one</span></p>
            : <p className="text-xs text-white/65 font-light">A quiet space for real conversations. No sign-up needed.</p>
          }
          {activeCount > 0 && <span className="text-[10px] text-emerald-400/70">· {activeCount} happening right now</span>}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-12 pb-20 overflow-hidden">
        <div className="hero-glow" />

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* ── Left: text + CTAs ── */}
          <div className="flex-1 text-center lg:text-left space-y-8 min-w-0">

          {/* Eyebrow */}
          <div className="flex justify-center lg:justify-start animate-slide-up" style={{animationDelay:'0.1s'}}>
            <span className="pill">
              <span className="pill-dot animate-pulse-soft" />
              Anonymous · Real · Human
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-3 animate-slide-up" style={{animationDelay:'0.2s'}}>
            <h1 className="text-display-xl text-white">
              You don't have to go
            </h1>
            <h1 className="text-display-xl text-gradient-emerald-anim italic">
              through today alone.
            </h1>
          </div>

          {/* Subheadline */}
          <p className="text-white/80 text-lg sm:text-xl font-light leading-relaxed max-w-lg mx-auto lg:mx-0 animate-slide-up" style={{animationDelay:'0.3s'}}>
            Talk to a real person. Right now. No profiles, no history, no algorithms.
            Just two humans being present for each other.
          </p>

          {/* Live indicator */}
          {activeCount > 0 ? (
            <div className="flex items-center justify-center lg:justify-start gap-3 animate-fade-in">
              <div className="relative flex-shrink-0 w-4 h-4 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping" />
                <span className="absolute -inset-1 rounded-full bg-emerald-400/10 animate-ping" style={{animationDelay:'0.45s'}} />
                <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-400 block shadow-lg shadow-emerald-400/70" />
              </div>
              <p className="text-emerald-400/70 text-sm font-light live-number">
                <span className="text-emerald-300 font-semibold">{activeCount}</span> {activeCount===1?'person is':'people are'} here right now
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center lg:justify-start gap-2.5 opacity-50">
              <span className="w-2 h-2 rounded-full bg-emerald-400/60 animate-pulse-soft" />
              <span className="match-dot-1 w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="match-dot-2 w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="match-dot-3 w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="w-2 h-2 rounded-full bg-emerald-400/60 animate-pulse-soft" style={{animationDelay:'1.3s'}} />
            </div>
          )}

          {/* CTAs */}
          <div className="space-y-4 animate-slide-up" style={{animationDelay:'0.4s'}}>
            {/* Letters */}
            <button onClick={onShowLetters}
              className="w-full max-w-sm mx-auto lg:mx-0 flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/25 hover:bg-emerald-500/[0.04] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/25 transition-all">
                <span className="text-lg">✉</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium text-sm group-hover:text-emerald-300 transition-colors">Letters — write what you feel</p>
                <p className="text-white/60 text-xs mt-0.5 font-light">Anonymous. Someone will reply with kindness.</p>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-emerald-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 max-w-sm mx-auto lg:mx-0 py-1">
              <div className="flex-1 h-px bg-white/[0.05]" />
              <span className="text-white/20 text-xs font-light">or talk live</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>

            {/* Live chat buttons */}
            <div className="flex gap-3 max-w-sm mx-auto lg:mx-0">
              <button onClick={function(){setRole('seeker');setStep('mood');}} className="btn-primary btn-ripple flex-1 py-4 text-sm sm:text-base font-semibold tracking-wide">
                I need someone
              </button>
              <button onClick={function(){setRole('listener');setStep('duration');}} className="btn-ghost btn-ripple flex-1 py-4 text-sm sm:text-base">
                I can listen
              </button>
            </div>
          </div>

          {/* Trust row */}
          <div className="flex items-center justify-center lg:justify-start gap-5 flex-wrap animate-slide-up" style={{animationDelay:'0.5s'}}>
            {['Private','Nothing saved','Anonymous','Real humans'].map(function(label) {
              return (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-400/50 flex-shrink-0" />
                  <span className="text-white/55 text-xs font-light tracking-wide">{label}</span>
                </div>
              );
            })}
          </div>
          </div>

          {/* ── Right: animated chat preview ── */}
          <div className="hidden lg:flex flex-shrink-0 w-[380px] animate-fade-in" style={{animationDelay:'0.6s'}}>
            <ChatPreview />
          </div>

        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-arrow z-10">
          <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7"/></svg>
        </div>
      </section>

      {/* ── SOCIAL PROOF TICKER ── */}
      <div className="relative z-10 ticker-wrap border-t border-b border-white/[0.04] bg-white/[0.01] py-3">
        <div className="ticker-track">
          {tickerMsgs.concat(tickerMsgs).map(function(msg, i) {
            return <span key={i} className="ticker-item">{msg}</span>;
          })}
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <section className="relative z-10 px-5 py-16 scroll-hidden">
        <div className="divider-glow mb-16" />
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: totalSessions > 0 ? totalSessions : '—', label: 'conversations', animated: totalSessions > 0 },
            { value: '0',    label: 'data stored, ever' },
            { value: '100%', label: 'free, always' },
            { value: '∞',    label: 'kindness' },
          ].map(function(s, i) {
            return (
              <div key={i} className={'space-y-2 stagger-' + (i+1)}>
                <div className="stat-number text-gradient-emerald">
                  {s.animated ? <AnimatedCounter target={s.value} /> : s.value}
                </div>
                <p className="text-label text-white/55">{s.label}</p>
              </div>
            );
          })}
        </div>
        <div className="divider-glow mt-16" />
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 px-5 py-16 sm:py-24 scroll-hidden">
        <div className="max-w-4xl mx-auto space-y-14">
          <div className="text-center space-y-4">
            <p className="text-label text-emerald-400/75">Why it works</p>
            <h2 className="text-display-lg text-white">Quiet by design.</h2>
            <p className="text-white/60 font-light max-w-md mx-auto">Not a social network. Not therapy. A quiet space between those two things.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass p-7 space-y-4 scroll-hidden stagger-1">
              <div className="feature-icon w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400/80">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </div>
              <h3 className="text-white font-medium text-base">Completely anonymous</h3>
              <p className="text-white/75 text-sm font-light leading-relaxed">No accounts. No names. No traces. Just two humans sharing a moment, then moving on.</p>
            </div>
            <div className="glass p-7 space-y-4 scroll-hidden stagger-2">
              <div className="feature-icon w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400/80">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </div>
              <h3 className="text-white font-medium text-base">Nothing is ever saved</h3>
              <p className="text-white/75 text-sm font-light leading-relaxed">Conversations exist only in the moment. When you leave, it's gone. Like it never happened.</p>
            </div>
            <div className="glass p-7 space-y-4 scroll-hidden stagger-3">
              <div className="feature-icon w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400/80">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><circle cx="15" cy="7" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6"/></svg>
              </div>
              <h3 className="text-white font-medium text-base">Real humans only</h3>
              <p className="text-white/75 text-sm font-light leading-relaxed">No AI. No bots. No algorithms deciding who you talk to. A real person who actually cares.</p>
            </div>
            <div className="glass p-7 space-y-4 scroll-hidden stagger-4">
              <div className="feature-icon w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400/80">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L4 7v5c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V7l-8-4z"/></svg>
              </div>
              <h3 className="text-white font-medium text-base">A safe space</h3>
              <p className="text-white/75 text-sm font-light leading-relaxed">Community guidelines, abuse reporting, and a culture of kindness built into every interaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LETTERS SPOTLIGHT ── */}
      <section className="relative z-10 px-5 py-16 sm:py-24 scroll-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong p-8 sm:p-12 relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div className="flex-1 space-y-4">
                <p className="text-label text-emerald-400/75">New feature</p>
                <h2 className="text-display-md text-white">Letters</h2>
                <p className="text-white/70 font-light leading-relaxed text-base max-w-lg">
                  Write what's on your heart at 3am. Someone will read it and reply with kindness.
                  No sign-up. No judgment. Just you and your words — and someone out there who genuinely cares.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {['Write a letter','Read others','Reply with kindness'].map(function(t) {
                    return <span key={t} className="pill text-xs">{t}</span>;
                  })}
                </div>
              </div>
              <button onClick={onShowLetters} className="btn-primary whitespace-nowrap flex-shrink-0">
                Open Letters →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 px-5 py-16 sm:py-24 scroll-hidden">
        <div className="max-w-4xl mx-auto space-y-14">
          <div className="text-center space-y-4">
            <p className="text-label text-emerald-400/75">Simple by design</p>
            <h2 className="text-display-lg text-white">How it works.</h2>
          </div>
          <div className="relative grid sm:grid-cols-3 gap-6 sm:gap-10">
            <div className="hidden sm:block absolute top-[22px] left-[calc(16.67%+3rem)] right-[calc(16.67%+3rem)] h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            {[
              { n:'01', title:'Choose your role', desc:'Need to talk? Want to listen? Pick what feels right for you today.' },
              { n:'02', title:'Connect instantly', desc:'We match you with a real person in seconds. No profiles, no waiting rooms, no forms.' },
              { n:'03', title:'Talk. That\'s it.', desc:'Have a real conversation. When the session ends, everything disappears. Nothing is saved.' },
            ].map(function(s, i) {
              return (
                <div key={i} className={'scroll-hidden space-y-5 stagger-' + (i+1)}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-lg font-light text-emerald-400/70 leading-none">{s.n}</span>
                    </div>
                    <div className="flex-1 h-px bg-white/[0.04] sm:hidden" />
                  </div>
                  <h3 className="text-white font-medium text-base">{s.title}</h3>
                  <p className="text-white/70 text-sm font-light leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative z-10 px-5 py-16 sm:py-24 scroll-hidden">
        <div className="max-w-2xl mx-auto space-y-12 text-center">
          <div className="space-y-4">
            <p className="text-label text-emerald-400/75">Real people, real moments</p>
            <h2 className="text-display-lg text-white">What people are saying.</h2>
          </div>
          <div className="relative min-h-[180px] flex items-center justify-center">
            <div key={testimonialIndex} className="animate-fade-in glass p-8 sm:p-10 max-w-lg mx-auto w-full">
              <div className="font-display text-5xl text-emerald-500/15 leading-none mb-5 text-left">"</div>
              <p className="text-white/85 text-lg sm:text-xl font-display font-light italic leading-relaxed">{testimonials[testimonialIndex].text}</p>
              <p className="text-emerald-400/70 text-xs font-light mt-5 tracking-wider">— {testimonials[testimonialIndex].from}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            {testimonials.map(function(_, i) {
              return <button key={i} onClick={function(){setTestimonialIndex(i);}} className={'rounded-full transition-all duration-300 ' + (i===testimonialIndex ? 'w-6 h-2 bg-emerald-400' : 'w-2 h-2 bg-white/15 hover:bg-white/30')} />;
            })}
          </div>
          <button onClick={onShowLetters} className="text-white/25 hover:text-emerald-400 text-sm font-light transition-colors underline underline-offset-4">
            Share your own story anonymously →
          </button>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section className="relative z-10 px-5 py-16 sm:py-24 scroll-hidden">
        <div className="max-w-4xl mx-auto space-y-14">
          <div className="text-center space-y-4">
            <p className="text-label text-emerald-400/75">On the horizon</p>
            <h2 className="text-display-lg text-white">What's coming next.</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { color:'purple', svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/></svg>, title:'Voice sessions', tag:'COMING SOON', desc:'Sometimes typing isn\'t enough. Optional voice for deeper connection.' },
              { color:'blue',   svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/></svg>, title:'Multi-language', tag:'PLANNED', desc:'Support in multiple languages so everyone can find someone who understands.' },
              { color:'amber',  svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, title:'Listener recognition', tag:'PLANNED', desc:'Anonymous badges for listeners who show up consistently. Presence matters.' },
              { color:'rose',   svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>, title:'Mobile app', tag:'EXPLORING', desc:'A dedicated app so you can be there for someone even on the go.' },
            ].map(function(item, i) {
              var colors = { purple:'rgba(124,58,237,0.08)', blue:'rgba(59,130,246,0.08)', amber:'rgba(245,158,11,0.08)', rose:'rgba(244,63,94,0.08)' };
              var borders = { purple:'rgba(124,58,237,0.2)', blue:'rgba(59,130,246,0.2)', amber:'rgba(245,158,11,0.2)', rose:'rgba(244,63,94,0.2)' };
              var texts = { purple:'#a78bfa', blue:'#60a5fa', amber:'#fbbf24', rose:'#fb7185' };
              return (
                <div key={i} className={'glass p-6 flex items-start gap-4 scroll-hidden stagger-' + (i+1)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:colors[item.color],border:'1px solid '+borders[item.color],color:texts[item.color]}}>
                    {item.svg}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium text-sm">{item.title}</h3>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{background:colors[item.color],border:'1px solid '+borders[item.color],color:texts[item.color]}}>{item.tag}</span>
                    </div>
                    <p className="text-white/62 text-xs font-light leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 px-5 py-20 sm:py-32 scroll-hidden">
        <div className="orb orb-emerald" style={{width:'600px',height:'600px',top:'50%',left:'50%',transform:'translate(-50%,-50%)',opacity:0.5,zIndex:0}} />
        <div className="max-w-2xl mx-auto text-center space-y-10 relative z-10">
          <div className="space-y-4">
            <h2 className="text-display-xl text-white">Ready to talk<br /><span className="text-gradient-emerald italic">to someone?</span></h2>
            <p className="text-white/62 font-light text-lg">10 seconds to connect. No sign-up needed. Just show up.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xs mx-auto sm:max-w-none">
            <button onClick={function(){setRole('seeker');setStep('mood');}} className="btn-primary text-base px-10 py-4">
              I need someone
            </button>
            <button onClick={function(){setRole('listener');setStep('duration');}} className="btn-ghost text-base px-10 py-4">
              I can listen
            </button>
          </div>
          {!pushEnabled && (
            <button onClick={function(){onSubscribePush('listener');}} className="flex items-center gap-2 text-xs text-white/20 hover:text-emerald-400 transition-colors mx-auto font-light">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg>
              Get notified when someone needs you
            </button>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-5 py-12 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Crisis */}
          <div className="glass p-5 max-w-lg mx-auto text-center">
            <p className="text-white/60 text-sm font-light leading-relaxed">
              <span className="mr-1.5">💛</span>
              Someone Today is peer support, not a crisis service. If you're in danger, call{' '}
              <a href="tel:988" className="text-emerald-400 hover:text-emerald-300 transition-colors">988</a>
              {' '}or text HOME to{' '}
              <a href="sms:741741&body=HOME" className="text-emerald-400 hover:text-emerald-300 transition-colors">741741</a>.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={function(){setShowPromise(true);}} className="text-[11px] text-white/20 hover:text-white/50 transition-colors">Our Promise</button>
            <span className="text-white/10">·</span>
            <button onClick={onShowPrivacy} className="text-[11px] text-white/20 hover:text-white/50 transition-colors">Privacy</button>
            <span className="text-white/10">·</span>
            <button onClick={onShowTerms} className="text-[11px] text-white/20 hover:text-white/50 transition-colors">Terms</button>
          </div>

          <p className="text-center text-white/10 text-xs">© 2026 Someone Today — made with quiet intention.</p>
        </div>
      </footer>
    </div>
  );
}
