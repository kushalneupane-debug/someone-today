export default function CrisisRedirection() {
  return (
    <div className="max-w-sm w-full text-center space-y-6 px-2">
      <div className="w-12 h-12 mx-auto rounded-full bg-clay-50 flex items-center justify-center">
        <svg className="w-6 h-6 text-clay-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-display text-sand-800">If things feel heavy right now</h2>
      <div className="space-y-4 text-sand-500 text-sm font-light leading-relaxed text-left">
        <p>What you're feeling is real, and it matters.</p>
        <p>This space is meant for company — but if you're going through something that feels bigger than a conversation, please know there are people trained to help.</p>
        <div className="bg-white rounded-xl p-4 border border-sand-100 space-y-2">
          <p className="text-sand-600"><span className="font-medium">Talk to someone you trust</span> — a friend, a family member, a teacher, anyone who feels safe.</p>
          <p className="text-sand-600"><span className="font-medium">Reach out to local support</span> — your local emergency services are always available.</p>
        </div>
        <p className="text-center text-sand-400 italic font-display">You're not a burden. Reaching out is brave.</p>
      </div>
    </div>
  );
}
