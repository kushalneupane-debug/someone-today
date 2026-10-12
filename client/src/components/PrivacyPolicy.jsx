import LegalPage from "./LegalPage";

export default function PrivacyPolicy({ onBack }) {
  return (
    <LegalPage title="Privacy" onBack={onBack}
      intro="No accounts, no names, no emails. We keep the words you choose to post and the bare minimum needed to keep this place safe. Here's exactly what that means.">

      <section>
        <h2>What we store</h2>
        <ul>
          <li><strong>Letters and replies.</strong> The text, whether it's something heavy or good news, the reply you picked, and when it was posted. Letters are public: anyone who visits can read them.</li>
          <li><strong>A scrambled code instead of your network address.</strong> To count love and reports once per person, we turn your IP address into a salted one-way hash and keep that. It can't be turned back into your address, and it isn't linked to the letters you write.</li>
          <li><strong>Short-lived limits.</strong> To stop flooding, the server remembers that same code for a few minutes after you post. It's held in memory and never written to disk.</li>
        </ul>
      </section>

      <section>
        <h2>What we never collect</h2>
        <ul>
          <li>Your name, email, phone number, or an account of any kind.</li>
          <li>Anything that ties a letter to the person who wrote it.</li>
          <li>We don't sell data, and there are no ads.</li>
        </ul>
      </section>

      <section>
        <h2>"Someone is here"</h2>
        <p>While the site is open, your browser tells our server every 20 seconds which letter you're reading and whether you're writing a reply. That's how we can show "someone is reading your letter right now." It uses a random code kept in your browser that resets every day. The server holds it only in memory and forgets it within a minute of you leaving. Each browser counts once, and search-engine bots are never counted.</p>
      </section>

      <section>
        <h2>Notifications</h2>
        <p>Only if you ask for them. When you tap "Notify me when someone replies", your browser gives us a push address, a link at Google, Apple, or Mozilla's notification service that reaches only that browser. We store it next to that one letter and use it only to say "Someone replied to your letter." The notification never includes the reply's words. Push addresses delete themselves after 30 days, and you can turn them off at any time from your letter.</p>
      </section>

      <section>
        <h2>Kept on your device, not ours</h2>
        <p>Your browser remembers a few things so the site works for you: which letters you wrote (so it can tell you when someone replies), whether you've replied before, and your theme. To check for replies, it sends us only the letter codes. We don't store or log those checks. Clearing your browser's site data erases all of it.</p>
      </section>

      <section>
        <h2>Automatic safety checks</h2>
        <p>When you post, the server reads your words to catch slurs, cruelty, and links, and to notice if you might be in danger so it can show you crisis lines first. Nothing from these checks is saved apart from the letter itself. If three different people report a letter, it's hidden automatically.</p>
      </section>

      <section>
        <h2>Analytics</h2>
        <p>We use Google Analytics to count visits and see which pages get used. Google may set cookies to do this. We never send it the contents of a letter. You can block it with any tracker blocker or Google's opt-out browser add-on.</p>
      </section>

      <section>
        <h2>How long things last</h2>
        <p>Letters and replies stay up until they're reported or removed. Since there are no accounts, we can't confirm who wrote what. If a letter identifies you or someone else, email us and we'll take it down.</p>
      </section>

      <section>
        <h2>Who handles the data</h2>
        <p>The site runs on a hosting provider and stores letters with a database provider. They process data only to run the service.</p>
      </section>

      <section>
        <h2>Age</h2>
        <p>Someone Today is for people 13 and older.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>If this policy changes, we'll update it here and change the date at the top.</p>
      </section>
    </LegalPage>
  );
}
