import React, { useEffect, useState } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { Sparkles, ArrowRight, Compass, RefreshCw } from 'lucide-react';

export const OpeningHero: React.FC = () => {
  const { startNewJourney, timelines, selectTimeline, setActiveTab } = useTimeline();
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    // Cinematic phased revelation
    const t1 = setTimeout(() => setPhase(1), 300); // Reveal OTHERWISE
    const t2 = setTimeout(() => setPhase(2), 1100); // Reveal WHAT IF YOU CHOSE DIFFERENTLY?
    const t3 = setTimeout(() => setPhase(3), 1900); // Reveal supporting phrase & ENTER
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const latestTimeline = timelines.length > 0 ? timelines[0] : null;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-center">
      {/* Subtle background ambient halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full bg-indigo-950/20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        {/* Phase 1: Name Wordmark */}
        <div
          className={`transition-all duration-1000 transform ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="inline-flex items-center gap-2 mb-4 text-xs font-mono tracking-[0.25em] text-neutral-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Alternate Reality Engine</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-400 drop-shadow-2xl">
            OTHERWISE
          </h1>
        </div>

        {/* Phase 2: Tagline */}
        <div
          className={`mt-6 sm:mt-8 transition-all duration-1000 transform ${
            phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl tracking-[0.14em] text-amber-100/90 font-medium">
            WHAT IF YOU CHOSE DIFFERENTLY?
          </h2>
        </div>

        {/* Phase 3: Supporting Phrase & Enter Button */}
        <div
          className={`mt-6 transition-all duration-1000 transform ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed font-light">
            Every decision leaves behind another version of your life.
          </p>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 italic">
            "Every choice creates a life you never lived."
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
            <button
              onClick={startNewJourney}
              className="w-full sm:w-auto min-w-[200px] h-13 px-8 rounded-xl bg-gradient-to-r from-neutral-100 via-white to-neutral-200 text-neutral-950 font-serif font-bold text-sm tracking-[0.2em] uppercase shadow-[0_0_40px_rgba(255,255,255,0.18)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ENTER</span>
              <ArrowRight className="w-4 h-4 text-neutral-900" />
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className="w-full sm:w-auto h-13 px-6 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/[0.12] text-neutral-300 text-xs tracking-wider uppercase font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-neutral-400" />
              <span>Explore Worlds</span>
            </button>
          </div>

          {/* Quick resume if user has an existing timeline */}
          {latestTimeline && (
            <div className="mt-10 pt-6 border-t border-white/[0.08] text-xs text-neutral-400 flex items-center justify-center gap-3">
              <span>Resume previous timeline:</span>
              <button
                onClick={() => selectTimeline(latestTimeline.id)}
                className="text-amber-200 hover:text-white underline underline-offset-4 font-serif cursor-pointer"
              >
                {latestTimeline.title}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
