export default function CommunityPromise() {
  return (
    <div className="max-w-sm w-full text-center space-y-6 px-2">
      <div className="w-12 h-12 mx-auto rounded-full bg-sage-50 flex items-center justify-center">
        <svg className="w-6 h-6 text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
      </div>
      <h2 className="text-xl font-display text-sand-800">Our promise to each other</h2>
      <div className="space-y-4 text-sand-500 text-sm font-light leading-relaxed text-left">
        <p>This is a place for presence — not advice, not fixing, not performing. Just being with someone.</p>
        <p>When you're here, you agree to a few simple things:</p>
        <ul className="space-y-2 pl-1">
          <li className="flex gap-2"><span className="text-sage-400 mt-0.5 shrink-0">○</span><span><span className="font-medium text-sand-600">Listen without fixing.</span> Sometimes people just need to be heard.</span></li>
          <li className="flex gap-2"><span className="text-sage-400 mt-0.5 shrink-0">○</span><span><span className="font-medium text-sand-600">Respect boundaries.</span> If someone says they need to go, let them.</span></li>
          <li className="flex gap-2"><span className="text-sage-400 mt-0.5 shrink-0">○</span><span><span className="font-medium text-sand-600">Be kind.</span> The person on the other side is human, just like you.</span></li>
          <li className="flex gap-2"><span className="text-sage-400 mt-0.5 shrink-0">○</span><span><span className="font-medium text-sand-600">Keep it safe.</span> No personal info, no links, no pressure.</span></li>
        </ul>
        <p className="text-center pt-2 text-sand-600 font-display italic">Be kind. Be present. Be human.</p>
      </div>
    </div>
  );
}
