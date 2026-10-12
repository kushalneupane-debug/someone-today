import LegalPage from "./LegalPage";

export default function TermsOfService({ onBack }) {
  return (
    <LegalPage title="Terms" onBack={onBack}
      intro="Someone Today is a free, anonymous place to write letters and answer them with kindness. By using it, you agree to these terms. They're short on purpose.">

      <section>
        <h2>What this is, and isn't</h2>
        <p>Letters and replies come from anonymous strangers, not counselors or doctors. This is peer support. <strong>It is not therapy, and it is not a crisis service.</strong></p>
      </section>

      <section>
        <h2>If you're in danger</h2>
        <ul>
          <li><strong>988 Suicide & Crisis Lifeline:</strong> call or text <a href="tel:988">988</a> (US)</li>
          <li><strong>Crisis Text Line:</strong> text HOME to <a href="sms:741741?&body=HOME">741741</a> (US)</li>
          <li><strong>Emergency:</strong> call <a href="tel:911">911</a>, or your local emergency number</li>
          <li><strong>Outside the US:</strong> <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">findahelpline.com</a></li>
        </ul>
      </section>

      <section>
        <h2>Who can use it</h2>
        <p>You must be at least 13.</p>
      </section>

      <section>
        <h2>Your words</h2>
        <p>What you write stays yours. By posting, you let us show it publicly on Someone Today. Please leave out your name, where you live, and anything that could identify you or someone else.</p>
      </section>

      <section>
        <h2>Be kind</h2>
        <ul>
          <li>No hate, slurs, harassment, or threats.</li>
          <li>No sexual or graphic violent content.</li>
          <li>No links, ads, or spam.</li>
          <li>Don't pretend to be a therapist or doctor.</li>
          <li>Reply the way you'd want someone to reply to you.</li>
        </ul>
        <p className="mt-3">Automatic filters block the worst of it, and letters reported by three different people are hidden. We can remove any letter or reply, at any time, without notice.</p>
      </section>

      <section>
        <h2>No guarantees</h2>
        <p>Someone Today is provided as is. We can't promise it will always be available, that every letter gets a reply, or that what strangers write is accurate or helpful. We're not responsible for what people post or for what happens because of it.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>If these terms change, we'll update them here and change the date at the top.</p>
      </section>
    </LegalPage>
  );
}
