import React, { useState } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { EXPLORE_TIMELINES } from '../data/exploreWorlds';
import { Compass, Sparkles, ArrowRight, RotateCcw, Scale } from 'lucide-react';
import { Timeline } from '../types/timeline';

type CategoryFilter = 'ALL' | 'UNEXPECTED' | 'BEAUTIFUL' | 'EXTREME' | 'CREATIVE' | 'NEW_WORLDS';

export const ExploreView: React.FC = () => {
  const { selectTimeline, openRewind, openCompare, timelines } = useTimeline();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'ALL', label: 'All Possibilities' },
    { id: 'BEAUTIFUL', label: 'Most Beautiful' },
    { id: 'UNEXPECTED', label: 'Most Unexpected' },
    { id: 'EXTREME', label: 'Most Extreme' },
    { id: 'CREATIVE', label: 'Most Creative' },
    { id: 'NEW_WORLDS', label: 'New Worlds' },
  ];

  const filtered =
    activeCategory === 'ALL'
      ? EXPLORE_TIMELINES
      : EXPLORE_TIMELINES.filter((t) => t.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono tracking-widest text-neutral-400 uppercase mb-3">
          <Compass className="w-3.5 h-3.5 text-amber-300" />
          <span>CURATED ARCHIVE OF DESTINIES</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl text-white font-bold tracking-wide">
          EXPLORE ALTERNATE WORLDS
        </h2>

        <p className="text-sm text-neutral-400 mt-2 font-light leading-relaxed">
          Peer into fictional timelines lived by other versions of humanity. Inhabit any life, compare it against your own, or rewind one of their choices to spawn a new branch.
        </p>
      </div>

      {/* Interactive Filter Bar */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-8 gap-1.5 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-xs font-medium tracking-wider uppercase rounded-xl transition-all cursor-pointer whitespace-nowrap min-h-[40px] ${
                isActive
                  ? 'bg-white text-neutral-950 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Explore Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((timeline: Timeline) => {
          const bgImage = timeline.visualTheme.bgImage || '/src/assets/images/void_horizon_portal_1791336496977.jpg';
          return (
            <div
              key={timeline.id}
              className="group relative rounded-3xl border border-white/[0.1] hover:border-amber-400/50 bg-[#0a0c10] overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-[0_0_35px_rgba(251,191,36,0.12)]"
            >
              {/* Media Slot with Generated High-Fidelity Artwork */}
              <div className="relative h-60 sm:h-72 w-full overflow-hidden">
                <img
                  src={bgImage}
                  alt={timeline.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.75] contrast-[1.1]"
                />
                {/* Contrast Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/40 to-transparent" />

                {/* Top Badge Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-white/90">
                  <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 uppercase tracking-widest text-amber-300">
                    {timeline.parallelSelf.archetype}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 uppercase tracking-wider">
                    AGE {timeline.futureAge}
                  </span>
                </div>

                {/* Bottom title inside scrim */}
                <div className="absolute bottom-4 left-6 right-6">
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-wide drop-shadow-md">
                    {timeline.title}
                  </h3>
                  <div className="text-xs font-mono text-neutral-300 tracking-wider uppercase mt-1">
                    {timeline.location}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <blockquote className="font-serif italic text-sm sm:text-base text-neutral-300 leading-relaxed pl-3 border-l-2 border-amber-400/50">
                    "{timeline.parallelSelf.tagline}"
                  </blockquote>

                  <p className="text-xs text-neutral-400 leading-relaxed font-light line-clamp-2">
                    {timeline.worldAtmosphere}
                  </p>

                  <div className="pt-3 border-t border-white/[0.06] text-[11px] font-mono text-neutral-400 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">OCCUPATION:</span>
                      <span className="text-neutral-200 truncate max-w-[220px]">{timeline.occupation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">SIGNATURE STRENGTH:</span>
                      <span className="text-emerald-300/90 truncate max-w-[220px]">{timeline.biggestStrength}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Ribbon */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2">
                  <button
                    onClick={() => selectTimeline(timeline.id)}
                    className="flex-1 h-11 rounded-xl bg-white text-neutral-950 font-serif font-bold text-xs tracking-[0.16em] uppercase flex items-center justify-center gap-1.5 hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Inhabit This Life</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </button>

                  <button
                    onClick={() => openRewind(timeline)}
                    title="Rewind this fictional life"
                    className="h-11 px-3.5 rounded-xl bg-white/[0.06] hover:bg-amber-400/20 border border-white/[0.1] text-amber-200 text-xs font-mono uppercase flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Rewind</span>
                  </button>

                  <button
                    onClick={() => openCompare(timeline, timelines[0])}
                    title="Compare with another life"
                    className="h-11 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-neutral-300 text-xs font-mono uppercase flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
