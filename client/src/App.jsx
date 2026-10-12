import { useState, useEffect } from 'react';
import LetterWall from './components/LetterWall';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { useTheme } from './theme';
import { CONTACT_EMAIL } from './site';

var THEMES = [['light', 'Light'], ['dark', 'Dark'], ['auto', 'Auto']];

function CrisisBar() {
  return (
    <div className="bg-accent-soft border-b border-line px-5 py-2.5 text-center text-sm font-semibold text-ink">
      Not a crisis service. If you're in danger, call or text{' '}
      <a href="tel:988" className="text-accent underline underline-offset-4">988</a>.
    </div>
  );
}

function Footer({ go, theme, setTheme }) {
  var link = 'text-ink-muted hover:text-ink transition-colors';
  return (
    <footer className="border-t border-line mt-20 px-5 pt-12 pb-10">
      <div className="max-w-xl mx-auto">
        <p className="font-display text-xl text-ink">Someone Today</p>
        <p className="mt-1 text-sm text-ink-muted">Anonymous letters from strangers, for strangers.</p>
        <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer">
          <button onClick={function() { go('privacy'); }} className={link}>Privacy</button>
          <button onClick={function() { go('terms'); }} className={link}>Terms</button>
          <a href={'mailto:' + CONTACT_EMAIL} className={link}>Contact</a>
          <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className={link}>Helplines worldwide</a>
        </nav>

        <div className="mt-10 pt-6 border-t border-line flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
          <p className="text-ink-faint">© {new Date().getFullYear()} Someone Today</p>
          <div className="flex items-center gap-3" role="radiogroup" aria-label="Theme">
            <span className="text-ink-faint">Theme</span>
            <div className="flex rounded-full border border-line p-0.5">
              {THEMES.map(function(t) {
                var on = theme === t[0];
                return (
                  <button key={t[0]} role="radio" aria-checked={on} onClick={function() { setTheme(t[0]); }}
                    className={'px-3 py-1 rounded-full transition-colors ' + (on ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink')}>
                    {t[1]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function App() {
  var [page, setPage] = useState('letters');
  var [theme, setTheme] = useTheme();

  // A single-page app keeps the scroll position when the content swaps,
  // so every page change starts back at the top.
  useEffect(function() { window.scrollTo(0, 0); }, [page]);

  function go(next) { setPage(next); }
  function goHome() { setPage('letters'); }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <CrisisBar />
      <main className="flex-1">
        {page === 'privacy' ? <PrivacyPolicy onBack={goHome} />
          : page === 'terms' ? <TermsOfService onBack={goHome} />
          : <LetterWall />}
      </main>
      <Footer go={go} theme={theme} setTheme={setTheme} />
    </div>
  );
}

export default App;
