import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import LandingPage from './components/LandingPage';
import WaitingScreen from './components/WaitingScreen';
import ChatInterface from './components/ChatInterface';
import SessionEnded from './components/SessionEnded';
import CommunityPromise from './components/CommunityPromise';
import CrisisRedirection from './components/CrisisRedirection';

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [screen, setScreen] = useState('landing');
  const [role, setRole] = useState(null);
  const [messages, setMessages] = useState([]);
  const [endsAt, setEndsAt] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showPromise, setShowPromise] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [mood, setMood] = useState(null);
  const [noListeners, setNoListeners] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [extensionRequested, setExtensionRequested] = useState(false);
  const [extensionIncoming, setExtensionIncoming] = useState(false);
  const [extensionUsed, setExtensionUsed] = useState(false);
  const [extensionConfirmed, setExtensionConfirmed] = useState(false);
  const socketRef = useRef(null);
  const roleRef = useRef(null);

  useEffect(function() {
    roleRef.current = role;
  }, [role]);

  useEffect(function() {
    var socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('waiting', function() {
      setScreen('waiting');
    });

    socket.on('matched', function(data) {
      setRoomId(data.roomId);
      setEndsAt(data.endsAt);
      setMessages([]);
      setNoListeners(false);
      setExtensionRequested(false);
      setExtensionIncoming(false);
      setExtensionUsed(false);
      setExtensionConfirmed(false);
      setScreen('chat');
    });

    socket.on('new-message', function(msg) {
      var currentRole = roleRef.current;
      var sender = msg.from === currentRole ? 'me' : 'them';
      setMessages(function(prev) {
        return prev.concat([{ sender: sender, text: msg.text, time: msg.time }]);
      });
      setPartnerTyping(false);
    });

    socket.on('user-typing', function() {
      setPartnerTyping(true);
    });

    socket.on('user-stopped-typing', function() {
      setPartnerTyping(false);
    });

    socket.on('session-ended', function() {
      setScreen('ended');
    });

    socket.on('no-listeners', function() {
      setNoListeners(true);
    });

    socket.on('extension-requested', function() {
      setExtensionIncoming(true);
    });

    socket.on('extension-accepted', function(data) {
      setEndsAt(data.newEndsAt);
      setExtensionRequested(false);
      setExtensionIncoming(false);
      setExtensionUsed(true);
      setExtensionConfirmed(true);
      setTimeout(function() { setExtensionConfirmed(false); }, 3000);
    });

    socket.on('extension-declined', function() {
      setExtensionRequested(false);
    });

    return function() { socket.disconnect(); };
  }, []);

  var subscribeToPush = useCallback(async function() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      var reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      var resp = await fetch('/api/push/vapid-public-key');
      var json = await resp.json();
      if (!json.key) return;
      var sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: json.key
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub })
      });
      setPushEnabled(true);
    } catch (err) {
      console.error('Push subscription failed:', err);
    }
  }, []);

  var joinQueue = function(selectedRole, duration, selectedMood) {
    setRole(selectedRole);
    setMood(selectedMood || null);
    setNoListeners(false);
    if (socketRef.current) {
      socketRef.current.emit('join-queue', {
        role: selectedRole,
        duration: duration,
        mood: selectedMood || null
      });
    }
  };

  var sendMessage = function(text) {
    if (socketRef.current) {
      socketRef.current.emit('send-message', { text: text });
    }
  };

  var emitTyping = function() {
    if (socketRef.current) socketRef.current.emit('typing');
  };

  var emitStopTyping = function() {
    if (socketRef.current) socketRef.current.emit('stop-typing');
  };

  var handleStepAway = function() {
    if (socketRef.current) socketRef.current.emit('step-away');
  };

  var handleRequestExtend = function() {
    if (socketRef.current) {
      socketRef.current.emit('request-extend');
      setExtensionRequested(true);
    }
  };

  var handleRespondExtend = function(accepted) {
    if (socketRef.current) {
      socketRef.current.emit('respond-extend', { accepted: accepted });
      setExtensionIncoming(false);
    }
  };

  var goHome = function() {
    setScreen('landing');
    setRole(null);
    setMessages([]);
    setEndsAt(null);
    setRoomId(null);
    setPartnerTyping(false);
    setMood(null);
    setNoListeners(false);
    setExtensionRequested(false);
    setExtensionIncoming(false);
    setExtensionUsed(false);
    setExtensionConfirmed(false);
  };

  if (showCrisis) {
    return <CrisisRedirection onBack={function() { setShowCrisis(false); }} />;
  }
  if (showPromise) {
    return <CommunityPromise onBack={function() { setShowPromise(false); }} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {screen === 'landing' && (
        <LandingPage
          onJoin={joinQueue}
          onShowPromise={function() { setShowPromise(true); }}
          onShowCrisis={function() { setShowCrisis(true); }}
          onSubscribePush={subscribeToPush}
          pushEnabled={pushEnabled}
        />
      )}
      {screen === 'waiting' && (
        <WaitingScreen
          role={role}
          noListeners={noListeners}
          onSubscribePush={subscribeToPush}
          pushEnabled={pushEnabled}
          onLeave={function() {
            if (socketRef.current) socketRef.current.emit('leave-queue');
            goHome();
          }}
        />
      )}
      {screen === 'chat' && (
        <ChatInterface
          messages={messages}
          onSend={sendMessage}
          endsAt={endsAt}
          onStepAway={handleStepAway}
          partnerTyping={partnerTyping}
          onTyping={emitTyping}
          onStopTyping={emitStopTyping}
          role={role}
          mood={mood}
          extensionRequested={extensionRequested}
          extensionIncoming={extensionIncoming}
          extensionUsed={extensionUsed}
          extensionConfirmed={extensionConfirmed}
          onRequestExtend={handleRequestExtend}
          onRespondExtend={handleRespondExtend}
        />
      )}
      {screen === 'ended' && (
        <SessionEnded
          role={role}
          onGoHome={goHome}
          onReport={function() {}}
          onFeedback={function() {}}
        />
      )}
    </div>
  );
}

export default App;
