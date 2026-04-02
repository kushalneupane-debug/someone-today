export default function WaitingScreen({ role, onLeave, noListeners, pushEnabled, onSubscribePush }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-5 animate-fade-in relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full text-center space-y-10">
        <div className="flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse-soft" />
            <div className="absolute inset-3 rounded-full bg-emerald-500/15 animate-pulse-soft [animation-delay:0.5s]" />
            <div className="absolute inset-6 rounded-full bg-emerald-500/20 animate-pulse-soft [animation-delay:1s]" />
            <div className="absolute inset-8 rounded-full bg-emerald-400/30" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-serif text-white">
            {role === 'seeker' ? 'Finding someone for you\u2026' : 'Waiting for someone who needs you\u2026'}
          </h2>
          <p className="text-gray-500 text-sm font-light leading-relaxed">
            {role === 'seeker'
              ? 'A real person will be with you soon. Take a breath.'
              : 'Thank you for being here. Someone will find you soon.'}
          </p>
        </div>

        {noListeners && role === 'seeker' && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3 animate-fade-in">
            <p className="text-gray-400 text-sm font-light">
              No listeners are online right now. We've sent a notification — someone may join soon.
            </p>
            {!pushEnabled && (
              <button
                onClick={function() { onSubscribePush('seeker'); }}
                className="flex items-center gap-1.5 mx-auto text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                Notify me when someone arrives
              </button>
            )}
            {pushEnabled && (
              <span className="flex items-center gap-1 justify-center text-xs text-emerald-500/60 font-light">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                We'll notify you
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <p className="text-gray-600 text-xs font-light">Your conversation will be private and temporary.</p>
        </div>

        <button onClick={onLeave} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
          Leave the queue
        </button>
      </div>
    </div>
  );
}
