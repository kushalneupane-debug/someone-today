import { useState } from 'react';

function getReflection(role, mood, totalMessages, durationSecs) {
  var mins = Math.floor(durationSecs / 60);
  if (totalMessages === 0) return "Sometimes just showing up is the bravest thing. You were here, and that matters.";
  if (totalMessages >= 30) {
    if (role === 'seeker') return "You had a real conversation — " + totalMessages + " messages in " + mins + " minutes. Opening up takes courage.";
    return "You exchanged " + totalMessages + " messages in " + mins + " minutes. Your willingness to listen made a difference.";
  }
  if (totalMessages >= 10) {
    if (mood === 'down') return "You reached out when things felt heavy. That takes strength.";
    if (mood === 'anxious') return "You showed up even when anxiety made it hard. That's brave.";
    if (mood === 'lonely') return "For " + mins + " minutes, you weren't alone. That connection was real.";
    if (mood === 'overwhelmed') return "You let someone share the weight, even briefly. That's okay.";
    if (role === 'listener') return "You gave someone " + mins + " minutes of your time. That's a gift.";
    return "A meaningful exchange — " + totalMessages + " messages, " + mins + " minutes of real connection.";
  }
  if (role === 'listener') return "Even a few moments of presence can mean the world to someone. Thank you.";
  return "You took a step today. That's enough.";
}

function formatDuration(secs) {
  if (!secs || secs <= 0) return '0m';
  var m = Math.floor(secs / 60);
  var s = secs % 60;
  if (m === 0) return s + 's';
  if (s === 0) return m + 'm';
  return m + 'm ' + s + 's';
}

function getShareText(role, totalMessages) {
  if (role === 'listener') {
    return totalMessages >= 10
      ? "I just spent time listening to a stranger who needed it. No names. No judgment. Just presence.\n\nThis is what the internet can be. 🫂\n\ngetsomeonetoday.com"
      : "I showed up as a listener for a stranger today. Even a few minutes can matter.\n\ngetsomeonetoday.com 🫂";
  }
  return totalMessages >= 10
    ? "I talked to a stranger today. They listened without judgment. I needed that more than I knew.\n\nNo sign-up. No history. Just two people being human.\n\ngetsomeonetoday.com 💚"
    : "Someone was there for me today. A stranger. Anonymous. Real.\n\ngetsomeonetoday.com 💚";
}

export default function SessionEnded({
  role,
  onGoHome,
  onReport,
  onFeedback,
  onShowLetters,
  sessionStats,
  myMessageCount,
  totalMessages,
  sessionStartTime
}) {
  const [feedback, setFeedback] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [copied, setCopied] = useState(false);

  var actualDuration = sessionStats
    ? sessionStats.actualDuration
    : (sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0);
  var serverTotal = sessionStats ? sessionStats.totalMessages : 0;
  var displayTotal = totalMessages || serverTotal || 0;
  var partnerMessages = displayTotal - (myMessageCount || 0);
  if (partnerMessages < 0) partnerMessages = 0;
  var reflection = getReflection(role, sessionStats ? sessionStats.mood : null, displayTotal, actualDuration);

  var feedbackOptions = [
    { value: 'positive', emoji: '💚', label: 'Yes' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'negative', emoji: '💔', label: 'Not really' }
  ];

  var feedbackResponses = {
    positive: "That means a lot. Every good conversation starts with someone showing up.",
    neutral: "That's okay. Not every moment lands — but you were here.",
    negative: "We're sorry. Thank you for being honest."
  };

  function handleFeedbackClick(val) {
    setFeedback(val);
    onFeedback(val);
  }

  function handleReport(reason) {
    onReport(reason);
    setReportSent(true);
  }

  function handleShare() {
    var text = getShareText(role, displayTotal);
    if (navigator.share) {
      navigator.share({ text: text, url: 'https://getsomeonetoday.com' }).catch(function() {});
    } else {
      navigator.clipboard.writeText(text).then(function() {
        setCopied(true);
        setTimeout(function() { setCopied(false); }, 2500);
      }).catch(function() {});
    }
  }

  function handleTweet() {
    var text = getShareText(role, displayTotal);
    var url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in space-y-6">

        <div className="text-center">
          <div className="text-3xl mb-3">✦</div>
          <h2 className="text-xl font-display text-white mb-2">
            {role === 'listener' ? 'Thank you for listening' : 'Thank you for being here'}
          </h2>
          <p className="text-white/50 text-sm">{reflection}</p>
        </div>

        {displayTotal > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 backdrop-blur">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3 text-center">Session Summary</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg text-emerald-400">{formatDuration(actualDuration)}</div>
                <div className="text-white/30 text-xs mt-1">Duration</div>
              </div>
              <div>
                <div className="text-lg text-emerald-400">{displayTotal}</div>
                <div className="text-white/30 text-xs mt-1">Messages</div>
              </div>
              <div>
                <div className="text-lg text-emerald-400">{myMessageCount || 0}</div>
                <div className="text-white/30 text-xs mt-1">You sent</div>
              </div>
            </div>
            {displayTotal >= 2 && (
              <div className="mt-3 pt-3 border-t border-white/[0.06] text-center">
                <span className="text-white/30 text-xs">
                  {myMessageCount > partnerMessages
                    ? 'You led the conversation'
                    : partnerMessages > myMessageCount
                    ? 'Your partner shared more'
                    : 'An even exchange'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 backdrop-blur text-center">
          {!feedback ? (
            <>
              <p className="text-white/50 text-sm mb-4">Did this conversation help?</p>
              <div className="flex justify-center gap-4">
                {feedbackOptions.map(function(opt) {
                  return (
                    <button
                      key={opt.value}
                      onClick={function() { handleFeedbackClick(opt.value); }}
                      className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-white/[0.05] transition-colors"
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="text-white/40 text-xs">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-white/50 text-sm">{feedbackResponses[feedback]}</p>
          )}
        </div>

        {/* Viral share moment — shown after any feedback */}
        {feedback && (
          <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl p-5 space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <p className="text-emerald-300 text-sm font-medium">Share this moment</p>
              <p className="text-gray-500 text-xs font-light">Help someone else find this space. One share can change a life.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleTweet}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/25 text-[#1DA1F2] text-sm hover:bg-[#1DA1F2]/20 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Post on X
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white/60 text-sm hover:bg-white/[0.08] transition-all"
              >
                {copied ? (
                  <><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-emerald-400">Copied!</span></>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185z" /></svg>Share / Copy</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Write a letter CTA */}
        {feedback && onShowLetters && (
          <button
            onClick={onShowLetters}
            className="w-full bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 rounded-2xl p-4 text-left group transition-all animate-fade-in"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">✉️</span>
              <div className="flex-1">
                <p className="text-white/70 text-sm font-medium group-hover:text-emerald-300 transition-colors">Write about this experience</p>
                <p className="text-gray-600 text-xs mt-0.5 font-light">Anonymous. Someone will read it and reply.</p>
              </div>
              <svg className="w-4 h-4 text-gray-700 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>
        )}

        <button
          onClick={onGoHome}
          className="w-full p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm"
        >
          Return home
        </button>

        <div className="text-center">
          {!showReport && !reportSent && (
            <button onClick={function() { setShowReport(true); }} className="text-white/20 hover:text-white/40 text-xs transition-colors">
              Report this conversation
            </button>
          )}
          {showReport && !reportSent && (
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {['Inappropriate', 'Harmful', 'Spam', 'Other'].map(function(reason) {
                return (
                  <button key={reason} onClick={function() { handleReport(reason); }}
                    className="px-3 py-1 rounded-full text-xs bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/60 transition-all">
                    {reason}
                  </button>
                );
              })}
            </div>
          )}
          {reportSent && <p className="text-white/30 text-xs">Report received. Thank you.</p>}
        </div>

        <p className="text-center text-white/20 text-xs">
          This conversation was not saved. Everything is anonymous.
        </p>
      </div>
    </div>
  );
}
