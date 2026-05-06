var fs = require('fs');

var server = fs.readFileSync('server/index.js', 'utf8');
if (server.includes('letters')) {
  console.log('server/index.js already has letters');
} else {
  var reqLine = "var lettersRouter = require('./letters');\n";
  var routeLine = "app.use('/api/letters', lettersRouter);\n";
  var lastReq = server.lastIndexOf("require('./");
  var lineEnd = server.indexOf('\n', lastReq);
  server = server.slice(0, lineEnd + 1) + reqLine + server.slice(lineEnd + 1);
  var catchAll = server.indexOf("app.get('*'");
  if (catchAll === -1) catchAll = server.indexOf('app.get("*"');
  if (catchAll > -1) server = server.slice(0, catchAll) + routeLine + '\n' + server.slice(catchAll);
  fs.writeFileSync('server/index.js', server);
  console.log('server/index.js updated');
}

var app = fs.readFileSync('client/src/App.jsx', 'utf8');
if (app.includes('LetterWall')) {
  console.log('App.jsx already has LetterWall');
} else {
  var lastImport = app.lastIndexOf('import ');
  var impEnd = app.indexOf(";\n", lastImport);
  app = app.slice(0, impEnd + 2) + "import LetterWall from './components/LetterWall';\n" + app.slice(impEnd + 2);
  var lastState = app.lastIndexOf('useState(');
  var stEnd = app.indexOf(';\n', lastState);
  app = app.slice(0, stEnd + 2) + '  const [showLetters, setShowLetters] = useState(false);\n' + app.slice(stEnd + 2);
  var termsCheck = app.indexOf('if (showTerms)');
  if (termsCheck === -1) termsCheck = app.indexOf('if (showPrivacy)');
  if (termsCheck > -1) {
    var blockSearch = app.indexOf('}\n', app.indexOf('return', termsCheck));
    var insertPoint = app.indexOf('\n', blockSearch);
    app = app.slice(0, insertPoint + 1) + '\n  if (showLetters) {\n    return <LetterWall onBack={function() { setShowLetters(false); }} />;\n  }\n' + app.slice(insertPoint + 1);
  }
  var lpIdx = app.indexOf('<LandingPage');
  if (lpIdx > -1) {
    var closeIdx = app.indexOf('/>', lpIdx);
    if (closeIdx === -1) closeIdx = app.indexOf('>', lpIdx);
    app = app.slice(0, closeIdx) + '\n        onShowLetters={function() { setShowLetters(true); }}\n        ' + app.slice(closeIdx);
  }
  fs.writeFileSync('client/src/App.jsx', app);
  console.log('App.jsx updated');
}

var lp = fs.readFileSync('client/src/components/LandingPage.jsx', 'utf8');
if (lp.includes('onShowLetters')) {
  console.log('LandingPage.jsx already has onShowLetters');
} else {
  lp = lp.replace(/onShowTerms\s*\}/, 'onShowTerms, onShowLetters }');
  if (lp.indexOf('onShowLetters') === -1) {
    lp = lp.replace(/onShowPrivacy\s*\}/, 'onShowPrivacy, onShowLetters }');
  }
  var ctaDiv = lp.indexOf('<div className="space-y-3">');
  if (ctaDiv > -1) {
    var lettersCTA = '<div className="space-y-3">\n' +
      '            {/* Letters - Primary CTA */}\n' +
      '            <button onClick={onShowLetters} className="w-full py-5 px-6 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/[0.25] hover:bg-emerald-500/[0.15] hover:border-emerald-500/40 transition-all text-left group backdrop-blur-sm shadow-lg shadow-emerald-500/5">\n' +
      '              <div className="flex items-center gap-4">\n' +
      '                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">\n' +
      '                  <span className="text-lg">✉</span>\n' +
      '                </div>\n' +
      '                <div className="flex-1">\n' +
      '                  <span className="text-base sm:text-lg font-semibold text-emerald-300">Letters</span>\n' +
      '                  <p className="text-gray-400 text-sm mt-1 font-light">Write what you feel. Read others. Reply with kindness.</p>\n' +
      '                </div>\n' +
      '                <svg className="w-5 h-5 text-emerald-500/50 group-hover:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>\n' +
      '              </div>\n' +
      '            </button>\n\n' +
      '            <div className="flex items-center gap-3 py-1">\n' +
      '              <div className="flex-1 h-px bg-white/[0.06]"></div>\n' +
      '              <span className="text-gray-600 text-xs font-light">or talk to someone live</span>\n' +
      '              <div className="flex-1 h-px bg-white/[0.06]"></div>\n' +
      '            </div>\n\n';
    lp = lp.slice(0, ctaDiv) + lettersCTA + lp.slice(ctaDiv + '<div className="space-y-3">'.length);
  }
  fs.writeFileSync('client/src/components/LandingPage.jsx', lp);
  console.log('LandingPage.jsx updated');
}

console.log('\nDone! All files modified.');
