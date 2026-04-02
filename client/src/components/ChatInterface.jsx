import { useState, useEffect, useRef } from "react";

const seekerNudges = [
  "Take your time. There's no rush here.",
  "You can share whatever feels right.",
  "Even small things matter. What's on your mind?",
  "It's okay not to have the words yet.",
  "You're not alone in this.",
];

const listenerNudges = [
  "Try: 'I hear you' or 'Tell me more'",
  "Sometimes just being here is enough.",
  "Ask: 'How long have you been feeling this way?'",
  "Reflect back what they said in your own words.",
  "Ask: 'What would feel helpful right now?'",
];

const crisisKeywords = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "self-harm",
  "cutting myself",
  "hurting myself",
];

function ChatInterface({
  role,
  messages,
  endsAt,
  onSend,
  onTyping,
  onStopTyping,
  onStepAway,
  isTyping,
  onRequestExtend,
  onRespondExtend,
  extensionRequested,
  extensionPending,
  extended,
}) {
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCrisis, setShowCrisis] = useState(false);
  const [nudgeIndex, setNudgeIndex] = useState(0);
  const [showNudge, setShowNudge] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const nudgeTimer = useRef(null);

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    nudgeTimer.current = setTimeout(() => {
      setShowNudge(true);
    }, 30000);
    return () => {
      if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    };
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender === "them") {
      const lower = lastMsg.text.toLowerCase();
      if (crisisKeywords.some((kw) => lower.includes(kw))) {
        setShowCrisis(true);
      }
    }
  }, [messages]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ":" + s.toString().padStart(2, "0");
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    onTyping();
    typingTimeout.current = setTimeout(() => {
      onStopTyping();
    }, 2000);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
    setShowNudge(false);
    setNudgeIndex((prev) => prev + 1);
    onStopTyping();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const nudges = role === "seeker" ? seekerNudges : listenerNudges;
  const currentNudge = nudges[nudgeIndex % nudges.length];
  const isLowTime = timeLeft <= 120 && timeLeft > 0;
  const canExtend = isLowTime && !extended && !extensionPending;

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center">
            <span className="text-sm">
              {role === "seeker" ? "\u{1F442}" : "\u{1F49C}"}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {role === "seeker" ? "Your Listener" : "Seeker"}
            </p>
            <p className="text-xs text-gray-500">Anonymous chat</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-lg text-sm font-mono ${
              isLowTime
                ? "bg-red-900/40 text-red-400 animate-pulse"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            {formatTime(timeLeft)}
          </div>

          {canExtend && (
            <button
              onClick={onRequestExtend}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors font-medium"
            >
              +5 min
            </button>
          )}

          {extensionPending && (
            <span className="text-xs text-yellow-400 animate-pulse">
              Waiting...
            </span>
          )}

          <button
            onClick={() => setShowReport(true)}
            className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
            title="Report"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </button>

          <button
            onClick={onStepAway}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-lg transition-colors"
          >
            Step away
          </button>
        </div>
      </div>

      {extensionRequested && (
        <div className="px-4 py-3 bg-purple-900/30 border-b border-purple-700/30 flex items-center justify-between">
          <p className="text-sm text-purple-200">
            Your partner wants to extend by 5 minutes
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onRespondExtend(true)}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => onRespondExtend(false)}
              className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {extended && timeLeft > 0 && (
        <div className="px-4 py-2 bg-green-900/20 border-b border-green-800/30 text-center">
          <p className="text-xs text-green-400">
            {"\u{2713}"} Session extended by 5 minutes
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-center text-xs text-gray-600 mb-4">
          <p>You're now connected. Be kind, be real.</p>
          <p className="mt-1">
            Everything here is anonymous and ends when the timer runs out.
          </p>
        </div>

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.sender === "me"
                  ? "bg-purple-600 text-white rounded-br-md"
                  : "bg-gray-800 text-gray-200 rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {showNudge && (
          <div className="text-center">
            <p className="text-xs text-purple-400/60 italic">{currentNudge}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showCrisis && (
        <div className="px-4 py-3 bg-red-900/30 border-t border-red-800/30">
          <p className="text-sm text-red-300 mb-2">
            It sounds like things are really tough.{" "}
            {role === "listener"
              ? "Please encourage them to reach out to a crisis helpline."
              : "Please consider reaching out to a professional who can help."}
          </p>
          <div className="flex gap-2">
            <a
              href="https://988lifeline.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
            >
              988 Lifeline
            </a>
            <button
              onClick={() => setShowCrisis(false)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showReport && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">
              Report this conversation?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              If someone is being harmful or inappropriate, you can report
              anonymously.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  fetch("/api/report", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role, timestamp: Date.now() }),
                  });
                  setShowReport(false);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors text-sm"
              >
                Report
              </button>
              <button
                onClick={() => setShowReport(false)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-800 bg-gray-900/80 backdrop-blur">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-3 rounded-xl transition-colors ${
              input.trim()
                ? "bg-purple-600 hover:bg-purple-500 text-white"
                : "bg-gray-800 text-gray-600"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
