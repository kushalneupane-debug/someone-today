import { useState } from 'react';
import LetterWall from './components/LetterWall';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

function App() {
  var [page, setPage] = useState('letters');

  function goHome() { setPage('letters'); window.scrollTo(0, 0); }

  if (page === 'privacy') return <PrivacyPolicy onBack={goHome} />;
  if (page === 'terms') return <TermsOfService onBack={goHome} />;

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <main className="flex-1">
        <LetterWall />
      </main>
      <footer className="border-t border-line px-5 py-8">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-faint">
          <p>
            Not a crisis service. If you're in danger, call or text{' '}
            <a href="tel:988" className="text-ink-muted underline underline-offset-2 hover:text-ink">988</a>.
          </p>
          <nav className="flex gap-5">
            <button onClick={function() { setPage('privacy'); }} className="hover:text-ink transition-colors">Privacy</button>
            <button onClick={function() { setPage('terms'); }} className="hover:text-ink transition-colors">Terms</button>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default App;
