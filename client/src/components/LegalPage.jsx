import { POLICY_UPDATED, CONTACT_EMAIL } from "../site";

// Shared layout for Privacy and Terms so they read the same way.
export default function LegalPage({ title, intro, onBack, children }) {
  return (
    <div className="px-5 py-10 animate-fade-in">
      <article className="max-w-xl mx-auto">
        <button onClick={onBack} className="text-sm text-ink-muted hover:text-ink transition-colors">← Back to letters</button>
        <h1 className="font-display text-4xl text-ink mt-8">{title}</h1>
        <p className="text-sm text-ink-faint mt-2">Last updated {POLICY_UPDATED}</p>
        <p className="mt-6 text-lg text-ink leading-relaxed text-pretty">{intro}</p>
        <div className="mt-10 space-y-10 text-ink-muted leading-relaxed [&_h2]:text-ink [&_h2]:font-medium [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:text-ink [&_strong]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4">
          {children}
          <section>
            <h2>Contact</h2>
            <p>Questions, or want something taken down? Email <a href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a>. One person runs this site and reads every message.</p>
          </section>
        </div>
      </article>
    </div>
  );
}
