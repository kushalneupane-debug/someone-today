export default function TermsOfService({ onBack }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-start px-5 py-12 animate-fade-in">
      <div className="max-w-2xl w-full space-y-8">
        <button onClick={onBack} className="text-ink-muted hover:text-ink text-sm transition-colors">← Back to letters</button>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif text-ink">Terms</h1>
          <p className="text-ink-faint text-sm">Last updated: October 11, 2026</p>
        </div>
        <div className="space-y-8 text-ink-muted leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">What this is</h2>
            <p>Someone Today is a free, anonymous wall of letters. Strangers write what they're carrying or what went right, and other strangers answer with kindness. It is <span className="text-ink font-medium">not</span> therapy, and it is not a crisis service.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">If you're in danger</h2>
            <div className="bg-surface border border-line rounded-2xl p-5">
              <ul className="space-y-2 list-disc pl-5">
                <li><span className="text-ink font-medium">988 Suicide & Crisis Lifeline</span>: call or text 988</li>
                <li><span className="text-ink font-medium">Crisis Text Line</span>: text HOME to 741741</li>
                <li><span className="text-ink font-medium">Emergency</span>: call 911</li>
              </ul>
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">Be kind</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>No hate, slurs, harassment, or threats.</li>
              <li>No sexual or graphic violent content.</li>
              <li>No links, ads, or spam.</li>
              <li>Don't share anyone's personal details, including your own.</li>
              <li>Don't pretend to be a therapist or doctor.</li>
            </ul>
            <p>We can remove any letter or reply, at any time, without notice.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">Age</h2>
            <p>You must be at least 13 to use Someone Today.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">No warranty</h2>
            <p>Someone Today is provided as is. Letters and replies are written by anonymous strangers, and we're not responsible for what they say or for what happens because of them.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">Contact</h2>
            <p>Questions? <a href="mailto:hello@getsomeonetoday.com" className="text-accent underline underline-offset-2">hello@getsomeonetoday.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
