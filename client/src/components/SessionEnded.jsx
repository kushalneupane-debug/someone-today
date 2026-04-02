import { useState } from 'react';

function getReflection(role, mood, totalMessages, durationSecs) {
  var mins = Math.floor(durationSecs / 60);

  if (totalMessages === 0) {
    return "Sometimes just showing up is the bravest thing. You were here, and that matters.";
  }

  if (totalMessages >= 30) {
    if (role === 'seeker') {
      return "You had a real conversation — " + totalMessages + " messages in " + mins + " minutes. Opening up takes courage.";
    }
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

  if (role === 'listener') {
    return "Even a few moments of presence can mean the world to someone. Thank you.";
  }
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

export default function SessionEnded({
  role,
  onGoHome,
  onReport,
  onFeedback,
  sessionStats,
  myMessageCount,
  totalMessages,
  sessionStartTime
}) {
  const [feedback, setFeedback] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);

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

        <button
          onClick={onGoHome}
          className="w-full p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm"
        >
          Return home
        </button>

        <div className="text-center">
          {!showReport && !reportSent && (
            <button
              onClick={function() { setShowReport(true); }}
              className="text-white/20 hover:text-white/40 text-xs transition-colors"
            >
              Report this conversation
            </button>
          )}
          {showReport && !reportSent && (
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {['Inappropriate', 'Harmful', 'Spam', 'Other'].map(function(reason) {
                return (
                  <button
                    key={reason}
                    onClick={function() { handleReport(reason); }}
                    className="px-3 py-1 rounded-full text-xs bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/60 transition-all"
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          )}
          {reportSent && (
            <p className="text-white/30 text-xs">Report received. Thank you.</p>
          )}
        </div>

        <p className="text-center text-white/20 text-xs">
          This conversation was not saved. Everything is anonymous.
        </p>
      </div>
    </div>
  );
}
