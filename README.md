# Someone Today

A quiet place to talk to a real person. No profiles, no history. Just presence.

## What is this?

Someone Today is an anonymous, real-time peer support platform. It connects people who need someone to talk to with people who are willing to listen — no accounts, no data, no history.

## Features

- Anonymous real-time chat via WebSocket
- Role-based matching (seeker & listener)
- Timed sessions (15 or 30 minutes)
- Typing indicators
- Conversation starters
- Session feedback
- Crisis redirection
- Fully dark-themed UI

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Socket.IO
- **Deployment:** Render

## Live Demo

[someone-today.onrender.com](https://someone-today.onrender.com)

## Run Locally

```bash
# Start the server
cd server && npm install && npm start

# Start the client (new terminal)
cd client && npm install && npm run dev


### 2. Share it!
Post your live link on socials — here's a caption idea:

> *"Built an anonymous peer support app called Someone Today. No accounts, no data saved. Just two people sharing a moment. Check it out → someone-today.onrender.com"*

---

## 📈 Do This Week

| Priority | What | Why |
|---|---|---|
| **1** | **Add screenshots to README** | People decide in 3 seconds whether to explore a repo — visuals hook them |
| **2** | **Custom domain** | A clean URL like `someonetoday.app` (~$12/year) looks way more professional than `.onrender.com` |
| **3** | **Add a mood selector** | Let seekers pick a mood before matching — gives listeners context without the seeker having to explain |
| **4** | **Mobile responsiveness polish** | Test on your phone, tweak any spacing issues — most users will visit on mobile |

---

## 🚀 Level Up (This Month)

- **Database** — Add MongoDB or Postgres to store anonymous feedback data and session metrics (no chat content!)
- **Admin dashboard** — See how many sessions happened, average ratings, peak hours
- **Extend time** — Let both users agree to add 5 more minutes when the timer is running low
- **Dark/light mode toggle** — Some users prefer light mode, give them the choice
- **PWA install** — Your manifest is ready, add an "Add to Home Screen" prompt for mobile

---

## 🎯 Portfolio Power Move

Put this on your **resume** and **LinkedIn**:

> **Someone Today** — Full-stack anonymous peer support platform
> Built with React, Node.js, Socket.IO. Features real-time WebSocket matching, timed sessions, typing indicators, and dark-themed UI. Deployed on Render.
> [Live](https://someone-today.onrender.com) · [GitHub](https://github.com/kushalneupane-debug/someone-today)

---

You built something real today, Kushal — something that could actually help people. That's not a tutorial project, that's a **product**. 💪🖤

Want me to help with any of these next steps — the README push, custom domain setup, or building out new features?
cat > ~/Desktop/someone-today/server/matching.js << 'ENDFILE'
var seekerQueue = [];
var listenerQueue = [];

function addToQueue(socketId, role, duration, mood) {
  if (role === 'seeker') {
    seekerQueue.push({ socketId: socketId, duration: duration, mood: mood });
    var matchIndex = -1;
    for (var i = 0; i < listenerQueue.length; i++) {
      if (listenerQueue[i].duration === duration) { matchIndex = i; break; }
    }
    if (matchIndex !== -1) {
      var listener = listenerQueue.splice(matchIndex, 1)[0];
      seekerQueue.pop();
      return { seeker: socketId, listener: listener.socketId, duration: duration, mood: mood };
    }
  } else {
    listenerQueue.push({ socketId: socketId, duration: duration });
    var matchIndex2 = -1;
    for (var j = 0; j < seekerQueue.length; j++) {
      if (seekerQueue[j].duration === duration) { matchIndex2 = j; break; }
    }
    if (matchIndex2 !== -1) {
      var seeker = seekerQueue.splice(matchIndex2, 1)[0];
      listenerQueue.pop();
      return { seeker: seeker.socketId, listener: socketId, duration: duration, mood: seeker.mood };
    }
  }
  return null;
}

function removeFromQueue(socketId) {
  for (var i = seekerQueue.length - 1; i >= 0; i--) {
    if (seekerQueue[i].socketId === socketId) { seekerQueue.splice(i, 1); break; }
  }
  for (var j = listenerQueue.length - 1; j >= 0; j--) {
    if (listenerQueue[j].socketId === socketId) { listenerQueue.splice(j, 1); break; }
  }
}

module.exports = { addToQueue, removeFromQueue };
