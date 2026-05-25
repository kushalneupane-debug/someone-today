export default function AboutPage({ onBack, onShowLetters }) {
  return (
    <div className="min-h-screen bg-[#05050f] overflow-x-hidden">

      {/* Ambient top glow */}
      <div className="orb orb-emerald" style={{width:'800px',height:'500px',top:'-150px',left:'50%',transform:'translateX(-50%)',opacity:0.12,zIndex:0}} />

      {/* Back */}
      <div className="relative z-10 px-5 pt-7 max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-white/45 hover:text-white/80 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 pb-24 space-y-20">

        {/* Hero */}
        <div className="pt-10 space-y-6 animate-slide-up">
          <span className="pill">
            <span className="pill-dot animate-pulse-soft" />
            About
          </span>
          <h1 className="text-display-xl text-white">
            Everyone deserves<br />
            <span className="text-gradient-emerald-anim italic">to be heard.</span>
          </h1>
          <p className="t-body text-lg max-w-2xl leading-relaxed">
            Someone Today is a free, anonymous platform that connects people who need to talk with people who want to listen. No algorithms. No data. No accounts. Just two humans, present with each other.
          </p>
        </div>

        <div className="divider-glow" />

        {/* Why it exists */}
        <div className="grid sm:grid-cols-2 gap-10 scroll-hidden">
          <div className="space-y-4">
            <p className="text-label text-emerald-400/75">Why it exists</p>
            <h2 className="text-display-md text-white">Built for the 3am moments.</h2>
          </div>
          <div className="space-y-5">
            <p className="t-body">
              Loneliness is a quiet epidemic. Most people have felt it — that late-night feeling when you need someone but don't know who to call. Therapy is expensive. Friends are busy. The internet is loud.
            </p>
            <p className="t-body">
              Someone Today fills that gap. It's not therapy and it's not a social network — it's the digital equivalent of sitting next to a stranger and just talking. Honest. Temporary. Human.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="space-y-10 scroll-hidden">
          <div className="space-y-2">
            <p className="text-label text-emerald-400/75">What we stand for</p>
            <h2 className="text-display-md text-white">Our principles.</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Privacy first',
                desc: 'Zero data collection. No accounts. Conversations vanish when you leave. This is non-negotiable.',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3L4 7v5c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V7l-8-4z"/>
                  </svg>
                ),
              },
              {
                title: 'Radical anonymity',
                desc: 'No names. No profiles. No history. You are just a person, talking to another person.',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    <line x1="3" y1="3" x2="21" y2="21"/>
                  </svg>
                ),
              },
              {
                title: 'Free, forever',
                desc: 'Mental wellness shouldn\'t cost money. Someone Today is free and will always stay free.',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                ),
              },
            ].map(function(v, i) {
              return (
                <div key={i} className={'glass p-6 space-y-4 scroll-hidden stagger-' + (i + 1)}>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400/80">
                    {v.icon}
                  </div>
                  <h3 className="text-white font-medium text-sm">{v.title}</h3>
                  <p className="text-white/62 text-sm font-light leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How it's different */}
        <div className="glass-strong p-8 sm:p-12 space-y-8 scroll-hidden">
          <div className="space-y-2">
            <p className="text-label text-emerald-400/75">How it's different</p>
            <h2 className="text-display-md text-white">Not therapy.<br />Not social media.</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { label: 'No sign-up required', sub: 'You\'re anonymous from the first click.' },
              { label: 'No chat history', sub: 'Nothing is stored. Nothing can leak.' },
              { label: 'Real humans only', sub: 'No AI. No bots. A person who actually cares.' },
              { label: 'No judgment', sub: 'Community guidelines built around kindness.' },
            ].map(function(item, i) {
              return (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </span>
                  <div>
                    <p className="text-white/88 text-sm font-medium">{item.label}</p>
                    <p className="text-white/50 text-xs font-light mt-0.5">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center space-y-7 scroll-hidden">
          <div className="space-y-3">
            <h2 className="text-display-md text-white">Ready to connect?</h2>
            <p className="t-muted text-sm">No sign-up needed. 10 seconds to match. Always free.</p>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={onBack} className="btn-primary px-9 py-4">
              Talk with someone
            </button>
            <button onClick={onShowLetters} className="btn-ghost px-9 py-4">
              Read Letters
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
