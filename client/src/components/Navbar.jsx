import { useState, useEffect } from 'react';

export default function Navbar({ onShowLetters, onShowAbout, onShowBreathe, onBegin }) {
  var [scrolled, setScrolled] = useState(false);
  var [mobileOpen, setMobileOpen] = useState(false);

  useEffect(function() {
    function onScroll() { setScrolled(window.scrollY > 30); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return function() { window.removeEventListener('scroll', onScroll); };
  }, []);

  function closeAndRun(fn) {
    setMobileOpen(false);
    if (fn) fn();
  }

  var links = [
    {
      label: 'Letters',
      action: onShowLetters,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      ),
    },
    {
      label: 'Talk with Someone',
      action: onBegin,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      label: 'Breathe',
      action: onShowBreathe,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
        </svg>
      ),
    },
    {
      label: 'About',
      action: onShowAbout,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#05050f]/92 backdrop-blur-2xl border-b border-white/[0.07] shadow-xl shadow-black/30' : ''}`}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

        {/* Brand */}
        <button onClick={onBegin} className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
          </div>
          <span className="font-display text-[1.15rem] text-white/85 group-hover:text-white transition-colors tracking-tight">Someone Today</span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {links.map(function(link) {
            return (
              <button key={link.label}
                onClick={function() { link.action && link.action(); }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm text-white/55 hover:text-white/90 hover:bg-white/[0.05] transition-all duration-200 font-light">
                <span className="opacity-60">{link.icon}</span>
                {link.label}
              </button>
            );
          })}
          <button onClick={onBegin} className="ml-3 btn-primary py-2.5 px-5 text-sm font-medium">
            Begin →
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={function() { setMobileOpen(function(o) { return !o; }); }}
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl hover:bg-white/[0.05] transition-colors"
          aria-label="Toggle menu">
          <span className={`block h-px w-5 bg-white/65 origin-center transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block h-px w-5 bg-white/65 transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block h-px w-5 bg-white/65 origin-center transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#08080f]/98 backdrop-blur-2xl border-b border-white/[0.07] px-4 pt-2 pb-6 space-y-1 animate-slide-up">
          {links.map(function(link) {
            return (
              <button key={link.label}
                onClick={function() { closeAndRun(link.action); }}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm text-white/65 hover:text-white hover:bg-white/[0.05] transition-all text-left">
                <span className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/50 flex-shrink-0">
                  {link.icon}
                </span>
                <span className="font-light">{link.label}</span>
                <svg className="w-3.5 h-3.5 text-white/20 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            );
          })}
          <div className="pt-3 px-1">
            <button onClick={function() { closeAndRun(onBegin); }}
              className="btn-primary w-full py-4 text-sm">
              Begin talking →
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
