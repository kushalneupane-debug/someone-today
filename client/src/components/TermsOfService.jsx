export default function TermsOfService({ onBack }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-start px-5 py-12 animate-fade-in">
      <div className="max-w-2xl w-full space-y-8">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Back to home</button>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif text-white">Terms of Service</h1>
          <p className="text-gray-600 text-sm font-light">Last updated: April 16, 2026</p>
        </div>
        <div className="space-y-8 text-gray-400 font-light leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">What Someone Today Is</h2>
            <p>Someone Today is a free, anonymous peer support platform. It connects two strangers for a brief, real-time conversation. We are <span className="text-white font-medium">not</span> a crisis service, therapy provider, or mental health organization.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">Not a Crisis Service</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <p>If you are in immediate danger or experiencing a mental health crisis:</p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span><span><span className="text-white font-medium">988 Suicide & Crisis Lifeline</span> — Call or text 988</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span><span><span className="text-white font-medium">Crisis Text Line</span> — Text HOME to 741741</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">•</span><span><span className="text-white font-medium">Emergency Services</span> — Call 911</span></li>
              </ul>
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">Age Requirement</h2>
            <p>You must be at least 13 years old to use Someone Today.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">Community Guidelines</h2>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2"><span className="text-emerald-400">•</span><span>Treat the other person with kindness and respect</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">•</span><span>No hate speech, slurs, or discriminatory language</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">•</span><span>No sexually explicit or violent content</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">•</span><span>No harassment, threats, or bullying</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">•</span><span>No collecting personal information from others</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">•</span><span>No links, ads, or spam</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">•</span><span>No impersonating a therapist or medical professional</span></li>
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">For Listeners</h2>
            <p>As a listener, you are offering your presence — not professional advice. Do not diagnose, prescribe, or promise outcomes. If someone appears to be in crisis, gently encourage them to contact a professional service.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">No Warranty & Limitation of Liability</h2>
            <p>Someone Today is provided "as is" without warranty. We are not responsible for the content of conversations or any outcomes from using this platform. Peer conversations are not a substitute for professional help.</p>
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
