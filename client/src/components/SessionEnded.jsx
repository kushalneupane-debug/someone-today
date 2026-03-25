import { useState } from 'react';

export default function SessionEnded({ role, onGoHome, onReport, onFeedback }) {
  var _reported = useState(false);
  var reported = _reported[0];
  var setReported = _reported[1];
  var _fbGiven = useState(false);
  var feedbackGiven = _fbGiven[0];
  var setFeedbackGiven = _fbGiven[1];
  var _selFb = useState(null);
  var selectedFeedback = _selFb[0];
  var setSelectedFeedback = _selFb[1];

  function handleReport(reason) {
    onReport(reason);
    setReported(true);
  }

  function handleFeedback(rating) {
    setSelectedFeedback(rating);
    setFeedbackGiven(true);
    if (onFeedback) onFeedback(rating);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-5 animate-fade-in relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center space-y-8 max-w-sm w-full">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-serif text-white">This moment has ended.</h2>
          <p className="text-gray-500 text-sm font-light leading-relaxed">
            {role === 'seeker'
              ? 'Thank you for reaching out. It takes courage to ask for presence.'
              : 'Thank you for being here. Your presence mattered more than you know.'}
          </p>
        </div>

        {!feedbackGiven ? (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm font-light">Did this moment help?</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={function() { handleFeedback('positive'); }}
                className="flex flex-col items-center gap-1.5 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                <span className="text-2xl">💚</span>
                <span className="text-xs text-gray-500 font-light">Yes</span>
              </button>
              <button onClick={function() { handleFeedback('neutral'); }}
                className="flex flex-col items-center gap-1.5 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-gray-500/30 hover:bg-white/[0.05] transition-all">
                <span className="text-2xl">😐</span>
                <span className="text-xs text-gray-500 font-light">Neutral</span>
              </button>
              <button onClick={function() { handleFeedback('negative'); }}
                className="flex flex-col items-center gap-1.5 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-red-500/20 hover:bg-red-500/5 transition-all">
                <span className="text-2xl">💔</span>
                <span className="text-xs text-gray-500 font-light">Not really</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in py-2">
            <p className="text-emerald-400/70 text-sm font-light">
              {selectedFeedback === 'positive' && 'We are glad it helped. \uD83D\uDC9A'}
              {selectedFeedback === 'neutral' && 'Thank you for sharing.'}
              {selectedFeedback === 'negative' && 'We hear you. Every moment is different.'}
            </p>
          </div>
        )}

        <button onClick={onGoHome}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25">
          Return home
        </button>

        {!reported ? (
          <button onClick={function() { handleReport('post-session'); }}
            className="text-xs text-gray-600 hover:text-red-400/70 transition-colors font-light">
            Something did not feel right? Report anonymously
          </button>
        ) : (
          <p className="text-xs text-emerald-400/50 font-light animate-fade-in">Thank you. Your report has been noted.</p>
        )}

        <div className="flex items-center justify-center gap-2 pt-4">
          <svg className="w-3.5 h-3.5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <p className="text-gray-700 text-xs font-light">This conversation was not saved. No one will ever see it again.</p>
        </div>
      </div>
    </div>
  );
}
