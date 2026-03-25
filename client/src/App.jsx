import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import LandingPage from './components/LandingPage';
import WaitingScreen from './components/WaitingScreen';
import ChatInterface from './components/ChatInterface';
import SessionEnded from './components/SessionEnded';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || '';

function playNotifSound() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 520;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [role, setRole] = useState(null);
  const [messages, setMessages] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const socketRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    var socket = io(SOCKET_URL, { autoConnect: true, reconnection: true, reconnectionAttempts: 5 });
    socketRef.current = socket;

    socket.on('connect', function() { console.log('[Connected]', socket.id); });
    socket.on('waiting', function() { setScreen('waiting'); });

    socket.on('matched', function(data) {
      setMessages([]);
      setSessionDuration(data.duration);
      var remaining = Math.max(0, Math.round((data.endsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      setIsPartnerTyping(false);
      setScreen('chat');
      startTimer(remaining);
    });

    socket.on('session-ended', function() {
      stopTimer();
      setIsPartnerTyping(false);
      setScreen('ended');
    });

    socket.on('user-typing', function() {
      setIsPartnerTyping(true);
    });

    socket.on('user-stopped-typing', function() {
      setIsPartnerTyping(false);
    });

    socket.on('disconnect', function() { console.log('[Disconnected]'); });

    return function() { stopTimer(); socket.disconnect(); };
  }, []);

  useEffect(() => {
    var socket = socketRef.current;
    if (!socket) return;

    function handleMessage(data) {
      setMessages(function(prev) {
        return prev.concat([{ text: data.text, sender: data.from === role ? 'me' : 'them' }]);
      });
      if (data.from !== role) {
        playNotifSound();
        setIsPartnerTyping(false);
      }
    }

    socket.off('new-message');
    socket.on('new-message', handleMessage);
    return function() { socket.off('new-message', handleMessage); };
  }, [role]);

  function startTimer(seconds) {
    stopTimer();
    var remaining = seconds;
    setTimeLeft(remaining);
    timerRef.current = setInterval(function() {
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) stopTimer();
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  var handleJoin = useCallback(function(selectedRole, duration) {
    setRole(selectedRole);
    setSessionDuration(duration);
    setScreen('waiting');
    if (socketRef.current) socketRef.current.emit('join-queue', { role: selectedRole, duration: duration });
  }, []);

  var handleLeaveQueue = useCallback(function() {
    if (socketRef.current) socketRef.current.emit('leave-queue');
    setScreen('landing');
    setRole(null);
  }, []);

  var handleSendMessage = useCallback(function(text) {
    if (socketRef.current) socketRef.current.emit('send-message', { text: text });
    if (socketRef.current) socketRef.current.emit('stop-typing');
  }, []);

  var handleStepAway = useCallback(function() {
    if (socketRef.current) socketRef.current.emit('step-away');
    stopTimer();
    setIsPartnerTyping(false);
    setScreen('ended');
  }, []);

  var handleGoHome = useCallback(function() {
    setScreen('landing');
    setRole(null);
    setMessages([]);
    setTimeLeft(0);
    setIsPartnerTyping(false);
  }, []);

  var handleReport = useCallback(function(reason) {
    fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason, timestamp: Date.now() }),
    }).catch(function() {});
  }, []);

  var handleTyping = useCallback(function() {
    if (socketRef.current) socketRef.current.emit('typing');
  }, []);

  var handleStopTyping = useCallback(function() {
    if (socketRef.current) socketRef.current.emit('stop-typing');
  }, []);

  var handleFeedback = useCallback(function(rating) {
    if (socketRef.current) socketRef.current.emit('session-feedback', { rating: rating });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-sand-50">
      {screen === 'landing' && <LandingPage onJoin={handleJoin} />}
      {screen === 'waiting' && <WaitingScreen role={role} onLeave={handleLeaveQueue} />}
      {screen === 'chat' && (
        <ChatInterface messages={messages} onSend={handleSendMessage}
          onStepAway={handleStepAway} onReport={handleReport}
          timeLeft={timeLeft} role={role}
          isPartnerTyping={isPartnerTyping}
          onTyping={handleTyping} onStopTyping={handleStopTyping} />
      )}
      {screen === 'ended' && (
        <SessionEnded role={role} onGoHome={handleGoHome}
          onReport={handleReport} onFeedback={handleFeedback} />
      )}
    </div>
  );
}
