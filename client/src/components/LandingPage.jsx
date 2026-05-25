import { useState, useEffect, useRef } from 'react';
import CommunityPromise from './CommunityPromise';
import Navbar from './Navbar';

var testimonials = [
  { text: "I talked to a stranger at 2am. They didn't give advice. They just listened. That was everything.", from: "Someone who needed it" },
  { text: "Being a listener here taught me that presence is the rarest gift you can give.", from: "A listener" },
  { text: "No sign-up. No history. No judgment. Just a real human on the other side.", from: "First-time user" },
  { text: "I was having the worst night. A stranger stayed with me for 30 minutes. It changed everything.", from: "Someone Today user" },
];

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
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#05050f]" />
          </div>
          <div className="flex-1">
            <p className="text-white/88 text-sm font-medium leading-none">Anonymous listener</p>
            <p className="text-emerald-400/85 text-[11px] mt-1">● Online · matched in 8s</p>
          </div>
          <div className="w-5 h-5 text-white/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
        </div>
        <div className="px-4 py-5 space-y-2.5 min-h-[220px] flex flex-col justify-end">
          {msgs.map(function(msg, i) {
            var isNew = i === visible - 1 && visible > 3;
            return (
              <div key={i} className={'flex ' + (msg.from === 'me' ? 'justify-end' : 'justify-start') + (isNew ? ' chat-msg-in' : '')}>
                <div className={'max-w-[82%] px-3.5 py-2 rounded-2xl text-sm font-light leading-relaxed ' +
                  (msg.from === 'me'
                    ? 'bg-emerald-500/15 border border-emerald-500/20 text-white/85 rounded-br-sm'
                    : 'bg-white/[0.05] border border-white/[0.08] text-white/78 rounded-bl-sm')}>
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

export default function LandingPage({ onJoin, pushEnabled, onSubscribePush, onShowPrivacy, onShowTerms, onShowLetters, onShowAbout, onShowBreathe }) {
  var [activeCount, setActiveCount] = useState(0);
  var [totalSessions, setTotalSessions] = useState(0);
  var [showPromise, setShowPromise] = useState(false);
  var [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  var ctaRef = useRef(null);

  useEffect(function() {
    function onMouse(e) {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 30, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    }
    window.addEventListener('mousemove', onMouse, { passive: true });
    return function() { window.removeEventListener('mousemove', onMouse); };
  }, []);

  useEffect(function() {
    fetch('/api/stats').then(function(r) { return r.json(); }).then(function(d) { setActiveCount(d.active || 0); setTotalSessions(d.totalSessions || 0); }).catch(function() {});
    var iv = setInterval(function() {
      fetch('/api/stats').then(function(r) { return r.json(); }).then(function(d) { setActiveCount(d.active || 0); setTotalSessions(d.totalSessions || 0); }).catch(function() {});
    }, 15000);
    return function() { clearInterval(iv); };
  }, []);

  useEffect(function() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('scroll-visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    setTimeout(function() {
      document.querySelectorAll('.scroll-hidden').forEach(function(el) { observer.observe(el); });
    }, 100);
    return function() { observer.disconnect(); };
  }, []);

  function handleBegin() {
    if (ctaRef.current) {
      ctaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (showPromise) {
    return (
      <div className="min-h-screen bg-[#05050f] flex flex-col items-center justify-center px-5 animate-slide-up">
        <div className="glass-strong p-8 max-w-sm w-full">
          <CommunityPromise />
        </div>
        <button onClick={function() { setShowPromise(false); }} className="mt-6 text-white/45 hover:text-white/80 text-sm transition-colors">← Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050f] text-white overflow-x-hidden">

      {/* NAV */}
      <Navbar
        onShowLetters={onShowLetters}
        onShowAbout={onShowAbout}
        onShowBreathe={onShowBreathe}
        onBegin={handleBegin}
      />

      {/* Ambient orb */}
      <div className="orb orb-emerald" style={{ width: '800px', height: '800px', top: '-200px', left: '50%', transform: `translateX(calc(-50% + ${mousePos.x}px)) translateY(${mousePos.y}px)`, opacity: 0.45, zIndex: 0, transition: 'transform 0.6s ease-out' }} />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-24 pb-20 overflow-hidden">
        <div className="hero-glow" />

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left */}
          <div className="flex-1 text-center lg:text-left space-y-8 min-w-0">

            <div className="flex justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="pill">
                <span className="pill-dot animate-pulse-soft" />
                Anonymous · Real · Human
              </span>
            </div>

            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-display-xl text-white">You don't have to go</h1>
              <h1 className="text-display-xl text-gradient-emerald-anim italic">through today alone.</h1>
            </div>

            <p className="text-white/80 text-lg sm:text-xl font-light leading-relaxed max-w-lg mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              Talk to a real person. Right now. No profiles, no history, no algorithms.
              Just two humans being present for each other.
            </p>

            {activeCount > 0 && (
              <div className="flex items-center justify-center lg:justify-start gap-3 animate-fade-in">
                <div className="relative flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping" />
                  <span className="absolute -inset-1 rounded-full bg-emerald-400/10 animate-ping" style={{ animationDelay: '0.45s' }} />
                  <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-400 block shadow-lg shadow-emerald-400/70" />
                </div>
                <p className="text-emerald-400/80 text-sm font-light live-number">
                  <span className="text-emerald-300 font-semibold">{activeCount}</span> {activeCount === 1 ? 'person is' : 'people are'} here right now
                </p>
              </div>
            )}

            {/* CTAs */}
            <div ref={ctaRef} className="space-y-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>

              <button onClick={onShowLetters}
                className="w-full max-w-sm mx-auto lg:mx-0 flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/25 hover:bg-emerald-500/[0.04] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/25 transition-all">
                  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium text-sm group-hover:text-emerald-300 transition-colors">Letters — write what you feel</p>
                  <p className="text-white/60 text-xs mt-0.5 font-light">Anonymous. Someone will reply with kindness.</p>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-emerald-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>

              <div className="flex items-center gap-4 max-w-sm mx-auto lg:mx-0 py-1">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-white/35 text-xs font-light">or talk live</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <div className="flex gap-3 max-w-sm mx-auto lg:mx-0">
                <button onClick={function() { onJoin('seeker', 15, []); }}
                  className="btn-primary btn-ripple flex-1 py-4 text-sm sm:text-base font-semibold tracking-wide">
                  I need someone
                </button>
                <button onClick={function() { onJoin('listener', 15, []); }}
                  className="btn-ghost btn-ripple flex-1 py-4 text-sm sm:text-base">
                  I can listen
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-5 flex-wrap animate-slide-up" style={{ animationDelay: '0.5s' }}>
              {['Private', 'Nothing saved', 'Anonymous', 'Real humans'].map(function(label) {
                return (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-400/50 flex-shrink-0" />
                    <span className="text-white/55 text-xs font-light tracking-wide">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: chat preview */}
          <div className="hidden lg:flex flex-shrink-0 w-[380px] animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <ChatPreview />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-arrow z-10">
          <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7"/></svg>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 px-5 py-16 sm:py-24 scroll-hidden">
        <div className="divider-glow mb-20" />
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <p className="text-label text-emerald-400/75">Why it works</p>
            <h2 className="text-display-lg text-white">Quiet by design.</h2>
            <p className="text-white/60 font-light max-w-md mx-auto">Not a social network. Not therapy. A quiet space between those two things.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Completely anonymous',
                desc: 'No accounts. No names. No traces. Just two humans sharing a moment, then moving on.',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
              },
              {
                title: 'Nothing is ever saved',
                desc: 'Conversations exist only in the moment. When you leave, it\'s gone. Like it never happened.',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
              },
              {
                title: 'Real humans only',
                desc: 'No AI. No bots. No algorithms. A real person who actually cares — matched in seconds.',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><circle cx="15" cy="7" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6"/></svg>,
              },
              {
                title: 'A safe space',
                desc: 'Community guidelines, kindness culture, and abuse reporting built into every interaction.',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L4 7v5c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V7l-8-4z"/></svg>,
              },
            ].map(function(f, i) {
              return (
                <div key={i} className={'glass p-7 space-y-4 scroll-hidden stagger-' + (i + 1)}>
                  <div className="feature-icon w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400/80">
                    {f.icon}
                  </div>
                  <h3 className="text-white font-medium text-base">{f.title}</h3>
                  <p className="text-white/75 text-sm font-light leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
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
              { n: '01', title: 'Choose your role', desc: 'Need to talk? Want to listen? Pick what feels right for you today.' },
              { n: '02', title: 'Connect instantly', desc: 'We match you with a real person in seconds. No forms, no waiting rooms.' },
              { n: '03', title: 'Talk. That\'s it.', desc: 'Have a real conversation. When it ends, everything disappears. Nothing saved.' },
            ].map(function(s, i) {
              return (
                <div key={i} className={'scroll-hidden space-y-5 stagger-' + (i + 1)}>
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
        <div className="divider-glow mt-20" />
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-5 py-16 border-t border-white/[0.08]">
        <div className="max-w-4xl mx-auto space-y-12">

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <span className="font-display text-xl text-white/80 tracking-tight">Someone Today</span>
            </div>
            <p className="text-white/45 text-sm font-light">A quiet space for real human connection.</p>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { label: 'Our Promise', action: function() { setShowPromise(true); } },
              { label: 'Privacy Policy', action: onShowPrivacy },
              { label: 'Terms of Service', action: onShowTerms },
              { label: 'Letters', action: onShowLetters },
              { label: 'About', action: onShowAbout },
              { label: 'Breathe', action: onShowBreathe },
            ].map(function(item, i, arr) {
              return (
                <span key={item.label} className="flex items-center gap-2">
                  <button onClick={item.action}
                    className="text-sm text-white/55 hover:text-emerald-400 transition-colors duration-200 font-light px-1 py-0.5">
                    {item.label}
                  </button>
                  {i < arr.length - 1 && <span className="text-white/15 text-xs">·</span>}
                </span>
              );
            })}
          </div>

          <div className="glass p-5 sm:p-6 max-w-xl mx-auto text-center">
            <p className="text-white/65 text-sm font-light leading-relaxed">
              Someone Today is peer support, not a crisis service. If you're in danger, call{' '}
              <a href="tel:988" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">988</a>
              {' '}or text HOME to{' '}
              <a href="sms:741741&body=HOME" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">741741</a>.
            </p>
          </div>

          <p className="text-center text-white/25 text-xs font-light">© 2026 Someone Today — made with quiet intention.</p>
        </div>
      </footer>

    </div>
  );
}
