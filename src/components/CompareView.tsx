import React, { useState } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { Timeline } from '../types/timeline';
import { EXPLORE_TIMELINES } from '../data/exploreWorlds';
import { ArrowLeft, Scale, GitCompare, Sparkles } from 'lucide-react';

export const CompareView: React.FC = () => {
  const { timelines, comparePair, setActiveTab, selectTimeline } = useTimeline();

  const allTimelines: Timeline[] = [
    ...timelines,
    ...EXPLORE_TIMELINES.filter((e) => !timelines.some((t) => t.id === e.id)),
  ];

  const initialT1 = comparePair ? comparePair[0] : allTimelines[0] || EXPLORE_TIMELINES[0];
  const initialT2 = comparePair ? comparePair[1] : allTimelines[1] || EXPLORE_TIMELINES[1];

  const [t1Id, setT1Id] = useState<string>(initialT1.id);
  const [t2Id, setT2Id] = useState<string>(initialT2.id);

  const timelineA = allTimelines.find((t) => t.id === t1Id) || allTimelines[0];
  const timelineB = allTimelines.find((t) => t.id === t2Id) || allTimelines[1] || allTimelines[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-8">
        <div>
          <button
            onClick={() => setActiveTab('timeline')}
            className="text-xs font-mono text-neutral-400 hover:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Timeline</span>
          </button>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-bold tracking-wide">
            TIMELINE A vs TIMELINE B
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-light mt-1">
            Compare two divergent paths and see what each reality cost and gave.
          </p>
        </div>

        {/* Timeline Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-300">A:</span>
            <select
              value={timelineA.id}
              onChange={(e) => setT1Id(e.target.value)}
              className="h-10 px-3 rounded-lg bg-white/[0.05] border border-white/[0.15] text-xs text-white focus:outline-none focus:border-amber-300"
            >
              {allTimelines.map((t) => (
                <option key={t.id} value={t.id} className="bg-neutral-900 text-white">
                  {t.title} ({t.parallelSelf.archetype})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-sky-300">B:</span>
            <select
              value={timelineB.id}
              onChange={(e) => setT2Id(e.target.value)}
              className="h-10 px-3 rounded-lg bg-white/[0.05] border border-white/[0.15] text-xs text-white focus:outline-none focus:border-sky-300"
            >
              {allTimelines.map((t) => (
                <option key={t.id} value={t.id} className="bg-neutral-900 text-white">
                  {t.title} ({t.parallelSelf.archetype})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* TIMELINE A COLUMN */}
        <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-b from-amber-950/15 via-black/40 to-black p-6 sm:p-7 relative overflow-hidden">
          <div className="text-xs font-mono text-amber-300 uppercase tracking-widest mb-1">
            TIMELINE A // {timelineA.parallelSelf.archetype}
          </div>
          <h3 className="font-serif text-2xl text-white font-bold tracking-wide mb-1">
            {timelineA.title}
          </h3>
          <p className="text-xs text-neutral-400 italic mb-6">
            "{timelineA.parallelSelf.tagline}"
          </p>

          <div className="space-y-5 text-sm">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                LIFE PATH & OCCUPATION
              </span>
              <p className="text-neutral-200 font-medium">{timelineA.occupation}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                ENVIRONMENT & LOCATION
              </span>
              <p className="text-neutral-200">{timelineA.location}</p>
              <p className="text-xs text-neutral-400 mt-1 font-light">{timelineA.worldAtmosphere}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                TEMPERAMENT & PERSONALITY
              </span>
              <p className="text-neutral-300 leading-relaxed font-light">{timelineA.personality}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                SIGNATURE STRENGTH
              </span>
              <p className="text-emerald-300/90 font-medium">{timelineA.biggestStrength}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                CHALLENGE & HAUNTING REGRET
              </span>
              <p className="text-neutral-400 font-light leading-relaxed">{timelineA.biggestRegret}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                PHILOSOPHY / QUOTE
              </span>
              <blockquote className="font-serif italic text-amber-100 text-xs sm:text-sm pl-3 border-l-2 border-amber-400/40">
                "{timelineA.signatureQuote}"
              </blockquote>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.08]">
            <button
              onClick={() => selectTimeline(timelineA.id)}
              className="w-full h-11 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-serif tracking-widest uppercase text-white transition-colors cursor-pointer"
            >
              Inhabit Timeline A
            </button>
          </div>
        </div>

        {/* TIMELINE B COLUMN */}
        <div className="rounded-3xl border border-sky-400/20 bg-gradient-to-b from-sky-950/15 via-black/40 to-black p-6 sm:p-7 relative overflow-hidden">
          <div className="text-xs font-mono text-sky-300 uppercase tracking-widest mb-1">
            TIMELINE B // {timelineB.parallelSelf.archetype}
          </div>
          <h3 className="font-serif text-2xl text-white font-bold tracking-wide mb-1">
            {timelineB.title}
          </h3>
          <p className="text-xs text-neutral-400 italic mb-6">
            "{timelineB.parallelSelf.tagline}"
          </p>

          <div className="space-y-5 text-sm">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                LIFE PATH & OCCUPATION
              </span>
              <p className="text-neutral-200 font-medium">{timelineB.occupation}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                ENVIRONMENT & LOCATION
              </span>
              <p className="text-neutral-200">{timelineB.location}</p>
              <p className="text-xs text-neutral-400 mt-1 font-light">{timelineB.worldAtmosphere}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                TEMPERAMENT & PERSONALITY
              </span>
              <p className="text-neutral-300 leading-relaxed font-light">{timelineB.personality}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                SIGNATURE STRENGTH
              </span>
              <p className="text-sky-300/90 font-medium">{timelineB.biggestStrength}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                CHALLENGE & HAUNTING REGRET
              </span>
              <p className="text-neutral-400 font-light leading-relaxed">{timelineB.biggestRegret}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                PHILOSOPHY / QUOTE
              </span>
              <blockquote className="font-serif italic text-sky-100 text-xs sm:text-sm pl-3 border-l-2 border-sky-400/40">
                "{timelineB.signatureQuote}"
              </blockquote>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.08]">
            <button
              onClick={() => selectTimeline(timelineB.id)}
              className="w-full h-11 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-serif tracking-widest uppercase text-white transition-colors cursor-pointer"
            >
              Inhabit Timeline B
            </button>
          </div>
        </div>
      </div>

      {/* Synthesis Section */}
      <div className="mt-12 rounded-3xl border border-white/[0.1] bg-white/[0.02] p-8 text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 block mb-2">
          THE DIVERGENCE SYNTHESIS
        </span>
        <h4 className="font-serif text-xl sm:text-2xl text-white font-medium mb-4">
          The Pivotal Polarity
        </h4>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-lg mx-auto font-light mb-8">
          In Timeline A, you chose <span className="text-amber-200 font-serif">"{timelineA.parallelSelf.coreDrive}"</span>. In Timeline B, you chose <span className="text-sky-200 font-serif">"{timelineB.parallelSelf.coreDrive}"</span>. One gave you serenity; the other gave you edge.
        </p>

        {/* Mandatory Closing Lines */}
        <div className="pt-6 border-t border-white/[0.08] space-y-1">
          <p className="font-serif text-lg sm:text-xl text-neutral-200 tracking-wide">
            "Neither life is the correct one."
          </p>
          <p className="font-serif text-xl sm:text-2xl text-amber-100 font-bold tracking-wide">
            "Both began with you."
          </p>
        </div>
      </div>
    </div>
  );
};
