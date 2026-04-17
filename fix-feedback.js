var fs = require('fs');
var path = require('path');
var landingPath = path.join('client', 'src', 'components', 'LandingPage.jsx');
var landing = fs.readFileSync(landingPath, 'utf8');
var c = 0;
var b;
b=landing; landing=landing.replace("var _mood = useState(null);","var _mood = useState([]);"); if(landing!==b){c++;console.log('1. Mood state -> array');}
b=landing; landing=landing.replace("onClick={function() { setMood(m.value); }}","onClick={function() { setMood(function(prev) { return prev.includes(m.value) ? prev.filter(function(x) { return x !== m.value; }) : prev.concat([m.value]); }); }}"); if(landing!==b){c++;console.log('2. Mood toggle added');}
b=landing; landing=landing.replace("mood === m.value ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5'","mood.includes(m.value) ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5'"); if(landing!==b){c++;console.log('3. Highlight bg updated');}
b=landing; landing=landing.replace("mood === m.value ? 'text-emerald-400' : 'text-gray-400'","mood.includes(m.value) ? 'text-emerald-400' : 'text-gray-400'"); if(landing!==b){c++;console.log('4. Highlight text updated');}
b=landing; landing=landing.replace("disabled={!mood}","disabled={mood.length === 0}"); if(landing!==b){c++;console.log('5. Continue button updated');}
b=landing; landing=landing.replace("setStep('role'); setMood(null);","setStep('role'); setMood([]);"); if(landing!==b){c++;console.log('6. Back button fixed');}
b=landing; landing=landing.replace("This helps your listener understand where you are. No pressure.","Select all that apply. This helps your listener understand where you are."); if(landing!==b){c++;console.log('7. Mood subtitle updated');}
b=landing; landing=landing.replace("How long feels right?","How long would you like to chat?"); if(landing!==b){c++;console.log('8. Duration title updated');}
b=landing; landing=landing.replace("You can always step away earlier.","Pick a session length. You can always leave early \u2014 no pressure."); if(landing!==b){c++;console.log('9. Duration subtitle updated');}
fs.writeFileSync(landingPath, landing);
console.log('LandingPage.jsx: ' + c + '/9 done');
var appPath = path.join('client', 'src', 'App.jsx');
var app = fs.readFileSync(appPath, 'utf8');
var c2 = 0;
b=app; app=app.replace("const [mood, setMood] = useState(null);","const [mood, setMood] = useState([]);"); if(app!==b){c2++;console.log('10. App mood state updated');}
b=app; app=app.replace("setMood(selectedMood || null);","setMood(selectedMood || []);"); if(app!==b){c2++;console.log('11. joinQueue setMood updated');}
b=app; app=app.replace("mood: selectedMood || null","mood: selectedMood || []"); if(app!==b){c2++;console.log('12. joinQueue emit updated');}
while(app.indexOf('setMood(null)')!==-1){app=app.replace('setMood(null)','setMood([])');c2++;}
console.log('13. Remaining setMood(null) replaced');
fs.writeFileSync(appPath, app);
console.log('App.jsx: ' + c2 + ' done');
console.log('ALL DONE: ' + (c+c2) + ' total changes');
