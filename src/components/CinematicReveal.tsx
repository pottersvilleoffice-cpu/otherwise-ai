import React, { useEffect, useState } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { ArrowDown, Sparkles, ArrowRight } from 'lucide-react';

export const CinematicReveal: React.FC = () => {
  const { activeTimeline, setActiveTab } = useTimeline();
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    // Stage 0: YOUR CHOICE
    // Stage 1: YOUR PATH
    // Stage 2: YOUR OTHERWISE
    // Stage 3: Progressive narrative lines
    // Stage 4: "STEP INTO THIS LIFE" button
    const t0 = setTimeout(() => setStage(1), 700);
    const t1 = setTimeout(() => setStage(2), 1700);
    const t2 = setTimeout(() => setStage(3), 2700);
    const t3 = setTimeout(() => setStage(4), 3800);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (!activeTimeline) {
    return null;
  }

  const revealLines =
    activeTimeline.cinematicRevealSequence && activeTimeline.cinematicRevealSequence.length > 0
      ? activeTimeline.cinematicRevealSequence
      : [
          'Five years after your quiet turning point...',
          `You're living in ${activeTimeline.location}, far from the path you once assumed was mandatory.`,
          'Your decision changed the direction of your life.',
          'Here is the alternate self you gave birth to.',
        ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between items-center px-4 py-8 sm:py-16 text-center max-w-3xl mx-auto">
      {/* Top Triad: YOUR CHOICE ↓ YOUR PATH ↓ YOUR OTHERWISE */}
      <div className="w-full space-y-4 pt-4">
        <div className="flex flex-col items-center gap-2">
          <div
            className={`transition-all duration-700 transform ${
              stage >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-neutral-400">
              YOUR CHOICE
            </span>
          </div>

          <div
            className={`transition-all duration-500 transform ${
              stage >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5 text-neutral-400" />
          </div>

          <div
            className={`transition-all duration-700 transform ${
              stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-amber-200/90 font-semibold">
              YOUR PATH
            </span>
          </div>

          <div
            className={`transition-all duration-500 transform ${
              stage >= 2 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5 text-neutral-400" />
          </div>

          <div
            className={`transition-all duration-700 transform ${
              stage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <span className="font-serif text-sm tracking-[0.25em] uppercase text-white font-bold bg-white/[0.08] px-4 py-1.5 rounded-full border border-white/[0.12]">
              YOUR OTHERWISE
            </span>
          </div>
        </div>
      </div>

      {/* Center Emotional Narrative Reveal */}
      <div className="my-auto py-8 max-w-xl space-y-6">
        <div
          className={`transition-all duration-1000 transform ${
            stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="space-y-4">
            {revealLines.map((line, idx) => (
              <p
                key={idx}
                className={`font-serif text-lg sm:text-2xl leading-relaxed tracking-wide ${
                  idx === revealLines.length - 1
                    ? 'text-amber-100 font-semibold'
                    : 'text-neutral-300 font-light'
                }`}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Archetype banner teaser */}
          <div className="mt-8 pt-8 border-t border-white/[0.08] inline-block">
            <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase block mb-1">
              PARALLEL SELF DISCOVERED
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-[0.12em]">
              {activeTimeline.title}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 italic max-w-md">
              "{activeTimeline.parallelSelf.tagline}"
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA to enter the full world view */}
      <div className="w-full flex items-center justify-center gap-4 pb-4">
        <button
          onClick={() => setActiveTab('timeline')}
          className="h-13 px-8 rounded-xl bg-white text-neutral-950 font-serif font-bold text-xs tracking-[0.2em] uppercase shadow-[0_0_35px_rgba(255,255,255,0.2)] hover:bg-neutral-200 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>ENTER YOUR TIMELINE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
