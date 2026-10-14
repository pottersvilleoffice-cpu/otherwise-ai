import React, { useState } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { Timeline } from '../types/timeline';
import { EXPLORE_TIMELINES } from '../data/exploreWorlds';
import { GitBranch, RotateCcw, ArrowRight, Sparkles, Scale } from 'lucide-react';
import { RewindModal } from './RewindModal';

export const TimelineTree: React.FC = () => {
  const {
    timelines,
    selectTimeline,
    activeTimelineId,
    openCompare,
    rewindSourceTimeline,
    startNewJourney,
  } = useTimeline();

  const [rewindTarget, setRewindTarget] = useState<Timeline | null>(rewindSourceTimeline || null);

  // Group user timelines into tree hierarchy
  // Root timelines (parentId === null)
  // Sub-branches grouped under their parentId
  const allAvailable = timelines.length > 0 ? timelines : [EXPLORE_TIMELINES[0], EXPLORE_TIMELINES[1]];

  const rootTimelines = allAvailable.filter((t) => !t.parentId);
  const getChildren = (parentId: string) => allAvailable.filter((t) => t.parentId === parentId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono tracking-widest text-neutral-400 uppercase mb-3">
          <GitBranch className="w-3.5 h-3.5 text-amber-300" />
          <span>REALITY DIVERGENCE GRAPH</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl text-white font-bold tracking-wide">
          THE TIMELINE TREE
        </h2>

        <p className="text-sm text-neutral-400 mt-2 font-light">
          Every branch represents a fictional life that exists because of a single choice. Tap any node to inhabit it.
        </p>

        {/* Unboxed metadata stats */}
        <div className="flex items-center justify-center gap-3 text-xs text-neutral-500 font-mono mt-4">
          <span>{allAvailable.length} Timelines</span>
          <span aria-hidden="true">·</span>
          <span>{allAvailable.filter((t) => t.parentId).length} Divergent Branches</span>
          <span aria-hidden="true">·</span>
          <span>Infinite Possibilities</span>
        </div>
      </div>

      {/* The Visual Tree Diagram */}
      <div className="relative flex flex-col items-center">
        {/* ROOT NODE: "YOU (ORIGIN)" */}
        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className="px-6 py-3 rounded-2xl bg-gradient-to-b from-white via-neutral-100 to-neutral-200 text-neutral-950 shadow-[0_0_35px_rgba(255,255,255,0.25)] border border-white flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-serif text-sm font-bold tracking-[0.2em] uppercase">
              YOU (THE ORIGIN)
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 mt-1.5 uppercase tracking-wider">
            All branches originate here
          </span>

          {/* Vertical Trunk Line */}
          <div className="w-[1.5px] h-10 bg-gradient-to-b from-white/60 to-white/10 mt-3" />
        </div>

        {/* BRANCHES GRID */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {rootTimelines.map((root, rootIdx) => {
            const children = getChildren(root.id);
            const isActive = activeTimelineId === root.id;

            return (
              <div
                key={root.id}
                className="flex flex-col items-center bg-white/[0.02] border border-white/[0.07] rounded-3xl p-5 sm:p-6 transition-all hover:border-white/[0.15]"
              >
                {/* Branch Node Header */}
                <div className="w-full flex items-center justify-between text-xs font-mono text-neutral-400 uppercase pb-3 border-b border-white/[0.06] mb-4">
                  <span className="text-amber-300/80 font-bold">TIMELINE {String.fromCharCode(65 + rootIdx)}</span>
                  <span>DEPTH 0 // PRIMARY PATH</span>
                </div>

                {/* Primary Timeline Node Card */}
                <div
                  className={`w-full relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                    isActive
                      ? 'border-amber-400/80 bg-amber-400/10 shadow-[0_0_25px_rgba(251,191,36,0.12)]'
                      : 'border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                        {root.parallelSelf.archetype}
                      </span>
                      <h4 className="font-serif text-lg text-white font-semibold tracking-wide">
                        {root.title}
                      </h4>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 uppercase shrink-0">
                      Age {root.futureAge}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 italic mb-4">
                    "{root.parallelSelf.tagline}"
                  </p>

                  <div className="text-[11px] font-mono text-neutral-400 border-t border-white/[0.06] pt-3 flex items-center justify-between">
                    <span className="truncate max-w-[180px]">{root.location}</span>
                    <span className="text-neutral-500">{root.occupation}</span>
                  </div>

                  {/* Actions for this node */}
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
                    <button
                      onClick={() => selectTimeline(root.id)}
                      className="flex-1 h-9 rounded-lg bg-white/[0.08] hover:bg-white/[0.16] border border-white/[0.1] text-xs font-serif tracking-wider uppercase text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setRewindTarget(root)}
                      title="Rewind this timeline"
                      className="h-9 px-3 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-200 text-xs font-mono uppercase flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Rewind</span>
                    </button>

                    <button
                      onClick={() => openCompare(root)}
                      title="Compare timeline"
                      className="h-9 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-neutral-300 text-xs font-mono uppercase flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-branches / Children */}
                {children.length > 0 && (
                  <div className="w-full mt-6 flex flex-col items-center">
                    {/* Connecting stem */}
                    <div className="w-[1.5px] h-6 bg-gradient-to-b from-white/40 to-amber-400/40" />

                    <div className="w-full space-y-3.5 mt-2">
                      <div className="text-center text-[10px] font-mono text-amber-300/80 uppercase tracking-widest">
                        ↓ DIVERGENT SUB-BRANCHES ({children.length})
                      </div>

                      {children.map((child, cIdx) => (
                        <div
                          key={child.id}
                          className="relative pl-4 border-l-2 border-amber-400/30 rounded-r-xl bg-white/[0.02] p-3.5 hover:bg-white/[0.05] transition-all"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-amber-400/90 mb-1">
                            <span>BRANCH {String.fromCharCode(65 + rootIdx)}{cIdx + 1}</span>
                            <span className="truncate max-w-[150px]">{child.branchChoiceSummary || 'Altered choice'}</span>
                          </div>

                          <div className="font-serif text-sm text-white font-medium mb-1">
                            {child.title}
                          </div>

                          <p className="text-[11px] text-neutral-400 italic line-clamp-1 mb-2.5">
                            "{child.signatureQuote}"
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => selectTimeline(child.id)}
                              className="text-[11px] font-mono text-white underline underline-offset-2 hover:text-amber-300 cursor-pointer"
                            >
                              Inhabit Branch →
                            </button>
                            <span className="text-neutral-600">·</span>
                            <button
                              onClick={() => setRewindTarget(child)}
                              className="text-[11px] font-mono text-amber-300/80 hover:text-amber-200 cursor-pointer"
                            >
                              Rewind Again
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tree footer call to action */}
        <div className="mt-12 text-center">
          <button
            onClick={startNewJourney}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-serif tracking-widest uppercase text-white transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sprout An Entirely New Life Tree</span>
          </button>
        </div>
      </div>

      {/* Rewind Modal Triggered from tree */}
      {rewindTarget && (
        <RewindModal
          timeline={rewindTarget}
          onClose={() => setRewindTarget(null)}
        />
      )}
    </div>
  );
};
