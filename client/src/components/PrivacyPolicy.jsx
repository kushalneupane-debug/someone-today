export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-start px-5 py-12 animate-fade-in">
      <div className="max-w-2xl w-full space-y-8">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Back to home</button>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif text-white">Privacy Policy</h1>
          <p className="text-gray-600 text-sm font-light">Last updated: April 16, 2026</p>
        </div>
        <div className="space-y-8 text-gray-400 font-light leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">Our Promise</h2>
            <p>Someone Today is built on one principle: <span className="text-white font-medium">your privacy is absolute</span>. We don't collect personal information, we don't create accounts, and we don't track you. When your session ends, it's gone — like it never happened.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">What We Don't Collect</h2>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">✕</span><span>No names, emails, or personal information</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">✕</span><span>No user accounts or profiles</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">✕</span><span>No chat logs or conversation history</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">✕</span><span>No IP address logging</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">✕</span><span>No cookies for tracking</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">✕</span><span>No third-party analytics that identify you</span></li>
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">How Sessions Work</h2>
            <p>When you join Someone Today, you're connected through a temporary, encrypted WebSocket connection. Messages exist only in real-time — they are never written to a database. When the session ends, all data is permanently erased from memory.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">Notifications</h2>
            <p>If you enable push notifications, your browser's push subscription token is stored temporarily. This token cannot identify you personally. You can unsubscribe at any time.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">Abuse Reports</h2>
            <p>If you report someone, we receive a minimal, anonymous report. Reports do not contain chat transcripts or personally identifiable information.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">Age Requirement</h2>
            <p>Someone Today is intended for users aged 13 and older. If you are under 18, we encourage you to speak with a trusted adult about any issues you may be facing.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">Contact</h2>
            <p>Questions? Reach out at <a href="mailto:hello@getsomeonetoday.com" className="text-emerald-400 hover:text-emerald-300 transition-colors">hello@getsomeonetoday.com</a></p>
          </section>
          <div className="border-t border-white/10 pt-6 text-gray-600 text-sm">Someone Today — A quiet place to talk to a real person.</div>
        </div>
      </div>
    </div>
  );
}
