var fs = require('fs');
console.log('Fixing Letters button placement...');
var lp = fs.readFileSync('client/src/components/LandingPage.jsx', 'utf8');
var wrongSpot = lp.indexOf('{/* Letters - Primary CTA */}');
if (wrongSpot > -1) {
  var divBefore = lp.lastIndexOf('<div className="space-y-3">', wrongSpot);
  var dividerEnd = lp.indexOf('or talk to someone live', wrongSpot);
  var blockEnd = lp.indexOf('</div>\n\n', dividerEnd);
  if (blockEnd > -1) blockEnd = blockEnd + '</div>\n\n'.length;
  lp = lp.slice(0, divBefore) + '<div className="space-y-3">' + lp.slice(blockEnd);
  console.log('Removed Letters from wrong spot');
}
var heroMarker = lp.indexOf('I need someone today');
if (heroMarker > -1) {
  var heroDivStart = lp.lastIndexOf('<div className="space-y-3">', heroMarker);
  if (heroDivStart > -1 && lp.slice(heroDivStart - 500, heroDivStart).indexOf('onShowLetters') === -1) {
    var lettersCTA = '<div className="space-y-4">\n' +
      '            {/* Letters - Primary CTA */}\n' +
      '            <button onClick={onShowLetters} className="w-full py-5 px-6 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/[0.25] hover:bg-emerald-500/[0.15] hover:border-emerald-500/40 transition-all text-left group backdrop-blur-sm shadow-lg shadow-emerald-500/5">\n' +
      '              <div className="flex items-center gap-4">\n' +
      '                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">\n' +
      '                  <span className="text-lg">{"\u2709"}</span>\n' +
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
      '            </div>\n\n          ';
    lp = lp.slice(0, heroDivStart) + lettersCTA + lp.slice(heroDivStart);
    console.log('Added Letters to hero section');
  }
}
fs.writeFileSync('client/src/components/LandingPage.jsx', lp);
console.log('DONE');
