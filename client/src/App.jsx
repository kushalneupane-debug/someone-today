import { useEffect } from 'react';
import LetterWall from './components/LetterWall';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { useTheme } from './theme';
import { CONTACT_EMAIL } from './site';
import Wordmark from './components/Wordmark';
import { useRoute, navigate, goBack, link } from './router';

var THEMES = [['light', 'Light'], ['dark', 'Dark'], ['auto', 'Auto']];

function CrisisBar() {
  return (
    <div className="bg-accent-soft border-b border-line px-5 py-2.5 text-center text-sm font-semibold text-ink">
      Not a crisis service. If you're in danger, call or text{' '}
      <a href="tel:988" className="text-accent underline underline-offset-4">988</a>.
    </div>
  );
}

function Footer({ theme, setTheme }) {
  var linkClass = 'text-ink-muted hover:text-ink transition-colors';
  return (
    <footer className="border-t border-line mt-20 px-5 pt-12 pb-10">
      <div className="max-w-xl mx-auto">
        <Wordmark className="block h-8 w-auto text-ink" />
        <p className="mt-1 text-sm text-ink-muted">Anonymous letters from strangers, for strangers.</p>
        <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer">
          <a {...link('/privacy')} className={linkClass}>Privacy</a>
          <a {...link('/terms')} className={linkClass}>Terms</a>
          <a href={'mailto:' + CONTACT_EMAIL} className={linkClass}>Contact</a>
          <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className={linkClass}>Helplines worldwide</a>
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
  var route = useRoute();
  var [theme, setTheme] = useTheme();

  // Each page gets its own tab title. Letters stay generic on purpose:
  // a tab or history entry shouldn't show someone's private words.
  useEffect(function() {
    var titles = { privacy: 'Privacy', terms: 'Terms', write: 'Write a letter', letter: 'A letter', notfound: 'Page not found' };
    var t = route.name === 'wall' ? (route.kind === 'light' ? 'Good news' : null) : titles[route.name];
    document.title = t ? t + ' · Someone Today' : 'Someone Today: anonymous letters';
  }, [route.path]);

  function home() { goBack('/'); }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <CrisisBar />
      <main className="flex-1">
        {route.name === 'privacy' ? <PrivacyPolicy onBack={home} />
          : route.name === 'terms' ? <TermsOfService onBack={home} />
          : route.name === 'notfound' ? (
            <div className="px-5 py-24 max-w-xl mx-auto">
              <h1 className="font-display text-3xl text-ink">This page doesn't exist.</h1>
              <p className="mt-3 text-ink-muted">The link may be mistyped, or the page has moved.</p>
              <button onClick={function() { navigate('/'); }} className="mt-6 text-accent hover:underline underline-offset-4">Go to the letters</button>
            </div>
          )
          : <LetterWall route={route} />}
      </main>
      <Footer theme={theme} setTheme={setTheme} />
    </div>
  );
}

export default App;
