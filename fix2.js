var fs = require('fs');
var lp = fs.readFileSync('client/src/components/LandingPage.jsx', 'utf8');
var sy4 = lp.indexOf('className="space-y-4"');
if (sy4 === -1) { console.log('No space-y-4 found'); process.exit(0); }
var canBe = lp.indexOf('I can be someone today', sy4);
if (canBe === -1) { console.log('Cannot find button'); process.exit(1); }
var badges = lp.indexOf('flex items-center justify-center gap-6', canBe);
if (badges === -1) { console.log('Cannot find badges'); process.exit(1); }
var badgesDivStart = lp.lastIndexOf('<div', badges);
lp = lp.slice(0, badgesDivStart) + '</div>\n\n          ' + lp.slice(badgesDivStart);
fs.writeFileSync('client/src/components/LandingPage.jsx', lp);
console.log('Fixed! Added missing </div>');
