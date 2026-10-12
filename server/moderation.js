// Word lists that do the moderating so nobody has to watch the site.
// Patterns are matched case-insensitively on word boundaries.
// Extend these lists over time; keep them boring and explicit.

function compile(list) {
  return new RegExp("\\b(" + list.join("|") + ")\\b", "i");
}

// Signs someone may be in danger. These never block a letter — they make
// sure the person sees crisis resources before it posts.
var CRISIS = compile([
  "kill(ing)? my ?self", "end(ing)? my life", "end it all", "take my (own )?life",
  "(want|wanna|going) to die", "wanna die", "wish i (was|were) dead", "better off dead",
  "better off without me", "suicid(e|al)", "kms", "no reason to (live|go on)",
  "can'?t go on", "don'?t want to (live|be alive|exist|wake up)",
  "hurt(ing)? my ?self", "self[- ]?harm", "cut(ting)? my ?self", "overdos(e|ing)",
]);

// Slurs: rejected everywhere.
var SLURS = compile([
  "n[i1]gg(er|a|ah)s?", "f[a@]gg?(ot)?s?", "retard(ed|s)?", "tr[a@]nn(y|ies)",
  "k[i1]kes?", "sp[i1]cs?", "ch[i1]nks?", "c[u*]nts?", "wh[o0]res?", "sl[u*]ts?",
]);

// Cruelty aimed at the writer: rejected in replies only (a letter may
// honestly say "I feel worthless"; a reply may not call someone that).
var CRUELTY = compile([
  "kill your ?self", "kys", "go die", "just die", "nobody cares", "no one cares",
  "attention[- ]?seek(ing|er)", "get over it", "grow up", "deserve to (suffer|die|be alone|feel (this|like this))",
  "shut up", "cringe", "hate you", "(you|ur|u)('?re| are| r)? (so |such )?(an? )?(loser|pathetic|worthless|idiot|stupid|ugly|fat|weak|dramatic|joke)",
]);

var LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|gg|ly|co|xyz|me)\b)/i;

function needsCare(text) { return CRISIS.test(text); }

function checkLetter(text) {
  if (SLURS.test(text)) return "Letters can't include slurs. Try saying it another way.";
  if (LINK.test(text)) return "Links aren't allowed in letters.";
  return null;
}

function checkReply(text) {
  if (SLURS.test(text) || CRUELTY.test(text)) return "That didn't get through. Only kind words here.";
  if (LINK.test(text)) return "Links aren't allowed in replies.";
  return null;
}

module.exports = { needsCare: needsCare, checkLetter: checkLetter, checkReply: checkReply };
