import { useState, useEffect, useRef } from 'react';

var PHASES = [
  { key: 'in',    label: 'Breathe In',  duration: 4, scale: 1.0,  glowAlpha: 0.40 },
  { key: 'hold1', label: 'Hold',         duration: 4, scale: 1.0,  glowAlpha: 0.22 },
  { key: 'out',   label: 'Breathe Out', duration: 4, scale: 0.52, glowAlpha: 0.08 },
  { key: 'hold2', label: 'Rest',         duration: 4, scale: 0.52, glowAlpha: 0.06 },
];

export default function BreathePage({ onBack }) {
  var [running, setRunning] = useState(false);
  var [disp, setDisp] = useState({ phaseIdx: 0, secondsLeft: PHASES[0].duration, cycles: 0 });
  var stateRef = useRef({ phaseIdx: 0, tick: 0, cycles: 0 });
  var intervalRef = useRef(null);

  function start() {
    stateRef.current = { phaseIdx: 0, tick: 0, cycles: 0 };
    setDisp({ phaseIdx: 0, secondsLeft: PHASES[0].duration, cycles: 0 });
    setRunning(true);
  }

  function pause() {
    setRunning(false);
    clearInterval(intervalRef.current);
  }

  useEffect(function() {
    if (!running) return;
    intervalRef.current = setInterval(function() {
      var s = stateRef.current;
      s.tick += 1;
      var dur = PHASES[s.phaseIdx].duration;
      if (s.tick >= dur) {
        s.tick = 0;
        s.phaseIdx = (s.phaseIdx + 1) % PHASES.length;
        if (s.phaseIdx === 0) s.cycles += 1;
      }
      setDisp({
        phaseIdx: s.phaseIdx,
        secondsLeft: PHASES[s.phaseIdx].duration - s.tick,
        cycles: s.cycles,
      });
    }, 1000);
    return function() { clearInterval(intervalRef.current); };
  }, [running]);

  var phase = PHASES[disp.phaseIdx];

  /* transition duration: match breath duration for in/out, instant for holds */
  var circleTrans = (phase.key === 'in' || phase.key === 'out')
    ? phase.duration - 0.15 + 's'
    : '0.25s';

  return (
    <div className="min-h-screen bg-[#05050f] flex flex-col items-center justify-center relative overflow-hidden">

      {/* Ambient */}
      <div className="orb orb-emerald" style={{width:'700px',height:'700px',top:'50%',left:'50%',transform:'translate(-50%,-50%)',opacity:0.1,zIndex:0}} />

      {/* Back */}
      <button onClick={onBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-white/45 hover:text-white/80 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Back
      </button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-5 w-full max-w-md">

        {/* Header */}
        <div className="text-center space-y-2 animate-slide-up">
          <span className="pill">
            <span className="pill-dot" style={{background:'rgba(52,211,153,0.5)'}} />
            Guided Breathing
          </span>
          <h1 className="text-display-md text-white mt-4">Box Breathing</h1>
          <p className="text-white/55 text-sm font-light">4 counts each · calms your nervous system in minutes</p>
        </div>

        {/* Circle */}
        <div className="relative flex items-center justify-center" style={{width:'280px',height:'280px'}}>

          {/* Outer static ring */}
          <div className="absolute inset-0 rounded-full border border-white/[0.05]" />
          <div className="absolute rounded-full border border-white/[0.03]" style={{inset:'16px'}} />

          {/* Glow layer — expands with breath */}
          <div className="absolute rounded-full"
            style={{
              inset: '32px',
              background: `radial-gradient(circle, rgba(16,185,129,${phase.glowAlpha}) 0%, rgba(16,185,129,${phase.glowAlpha * 0.3}) 50%, transparent 80%)`,
              transform: `scale(${running ? phase.scale : 0.72})`,
              transition: `transform ${circleTrans} ease-in-out, background ${running ? '0.6s' : '0s'} ease`,
              filter: 'blur(3px)',
            }} />

          {/* Main animated circle */}
          <div className="absolute rounded-full"
            style={{
              inset: '44px',
              transform: `scale(${running ? phase.scale : 0.72})`,
              transition: `transform ${circleTrans} ease-in-out, border-color 0.6s ease, box-shadow 0.6s ease`,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: running
                ? `rgba(52,211,153,${Math.min(phase.glowAlpha * 1.8, 0.6)})`
                : 'rgba(52,211,153,0.15)',
              boxShadow: running
                ? `0 0 ${Math.round(phase.glowAlpha * 160)}px rgba(16,185,129,${phase.glowAlpha * 0.8}), inset 0 0 ${Math.round(phase.glowAlpha * 80)}px rgba(16,185,129,${phase.glowAlpha * 0.3})`
                : 'none',
              background: `radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 75%)`,
            }} />

          {/* Center text */}
          <div className="relative z-10 text-center select-none">
            {running ? (
              <>
                <p key={disp.phaseIdx + '-lbl'} className="text-white/88 text-base font-light animate-fade-in">
                  {phase.label}
                </p>
                <p className="text-emerald-400 font-display leading-none mt-2"
                  style={{fontSize:'3.5rem', fontWeight:300}}>
                  {disp.secondsLeft}
                </p>
              </>
            ) : (
              <p className="text-white/40 text-sm font-light tracking-wide">tap to begin</p>
            )}
          </div>
        </div>

        {/* Cycles */}
        {disp.cycles > 0 && (
          <p className="text-white/40 text-sm font-light -mt-4">
            {disp.cycles} {disp.cycles === 1 ? 'cycle' : 'cycles'} complete
          </p>
        )}

        {/* CTA */}
        <button
          onClick={running ? pause : start}
          className={running ? 'btn-ghost px-12 py-3.5' : 'btn-primary px-14 py-4 text-base'}>
          {running ? 'Pause' : disp.cycles > 0 ? 'Continue' : 'Begin'}
        </button>

        {/* Phase indicators */}
        <div className="grid grid-cols-4 gap-3 w-full text-center">
          {PHASES.map(function(p, i) {
            var active = running && i === disp.phaseIdx;
            return (
              <div key={i} className="space-y-1.5 transition-opacity duration-500"
                style={{opacity: active ? 1 : running ? 0.28 : 0.5}}>
                <div className={`w-1 h-1 rounded-full mx-auto transition-colors duration-500 ${active ? 'bg-emerald-400' : 'bg-white/25'}`} />
                <p className="text-white/75 text-[10px] font-medium uppercase tracking-widest leading-none">{p.label}</p>
                <p className="text-emerald-400/65 text-xs font-display">{p.duration}s</p>
              </div>
            );
          })}
        </div>

        {/* Tip */}
        {!running && (
          <p className="text-white/30 text-xs font-light text-center max-w-xs animate-fade-in">
            Box breathing reduces cortisol, lowers heart rate, and helps you feel grounded before a conversation.
          </p>
        )}

      </div>
    </div>
  );
}
