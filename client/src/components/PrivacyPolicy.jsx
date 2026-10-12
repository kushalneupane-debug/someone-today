export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-start px-5 py-12 animate-fade-in">
      <div className="max-w-2xl w-full space-y-8">
        <button onClick={onBack} className="text-ink-muted hover:text-ink text-sm transition-colors">← Back to letters</button>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif text-ink">Privacy</h1>
          <p className="text-ink-faint text-sm">Last updated: October 11, 2026</p>
        </div>
        <div className="space-y-8 text-ink-muted leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">The short version</h2>
            <p>No accounts. No names. No emails. We keep the words you post and the bare minimum needed to stop abuse.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">What we keep</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>The letters and replies you post, with the moods you pick and the time you posted.</li>
              <li>To count love and reports once per person, we keep a scrambled code made from your network address (a salted one-way hash), not the address itself. It can't be turned back into your address.</li>
              <li>To stop flooding, the server briefly remembers that same scrambled code after you post. That's held in memory only, never written to disk.</li>
            </ul>
            <p>Letters stay up unless a few people report them. Then they're hidden automatically.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">What we don't keep</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Your name, email, phone number, or any account.</li>
              <li>Anything that ties a letter to the person who wrote it.</li>
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">"Someone is here"</h2>
            <p>While the site is open, your browser quietly tells our server every 20 seconds which letter you're on and whether you're writing a reply. That's how we can say "someone is reading your letter right now." It uses a random code that changes every visit, lives only in memory, and is forgotten 60 seconds after you leave.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">Letters you write</h2>
            <p>Your browser remembers which letters you wrote, so it can tell you when someone replies. That list stays on your device. To check for replies, it sends us only the letter codes, and we don't store or log those checks.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">Analytics</h2>
            <p>We use Google Analytics to count visits and see which pages are used. Google may set cookies to do this. We don't send it the contents of any letter.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">Before you post</h2>
            <p>Letters are public. Anyone who visits can read them. Please don't include your name, where you live, or anything that could identify you or someone else.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-ink">Age</h2>
            <p>Someone Today is for people 13 and older.</p>
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
