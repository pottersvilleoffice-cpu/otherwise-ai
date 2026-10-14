import React from 'react';
import { useTimeline } from '../context/TimelineContext';
import { Sparkles, GitBranch, ArrowRight, RotateCcw, Clock, Trash2 } from 'lucide-react';

export const MyWorldsView: React.FC = () => {
  const { timelines, selectTimeline, openRewind, startNewJourney, deleteTimeline, setActiveTab } = useTimeline();

  const getBranchCount = (timelineId: string) => {
    return timelines.filter((t) => t.parentId === timelineId).length;
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 mb-1">
            ARCHIVE OF REALITIES
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-bold tracking-wide">
            MY WORLDS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-light mt-1">
            Every timeline you have brought into existence through your choices.
          </p>
        </div>

        <button
          onClick={startNewJourney}
          className="h-11 px-5 rounded-xl bg-white text-black font-serif font-bold text-xs tracking-wider uppercase hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Life Journey</span>
        </button>
      </div>

      {/* Timelines Grid */}
      {timelines.length === 0 ? (
        <div className="text-center py-20 px-4 max-w-md mx-auto rounded-3xl border border-white/[0.08] bg-white/[0.02]">
          <div className="w-14 h-14 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mx-auto mb-4 text-amber-300">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl text-white font-medium mb-2">
            No alternate worlds created yet.
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6 font-light">
            You haven't stepped across the threshold yet. Answer a few pivotal questions to weave your first timeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={startNewJourney}
              className="h-11 px-6 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase cursor-pointer"
            >
              CREATE FIRST TIMELINE
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className="h-11 px-5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-xs font-mono tracking-wider uppercase cursor-pointer hover:bg-white/[0.1]"
            >
              EXPLORE CURATED WORLDS
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timelines.map((timeline) => {
            const branches = getBranchCount(timeline.id);
            return (
              <div
                key={timeline.id}
                className="group relative rounded-3xl border border-white/[0.08] hover:border-amber-400/40 bg-gradient-to-b from-white/[0.04] to-black/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_25px_rgba(251,191,36,0.08)] cursor-pointer"
                onClick={() => selectTimeline(timeline.id)}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase mb-3">
                    <span className="text-amber-300 font-semibold">{timeline.parallelSelf.archetype}</span>
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(timeline.createdAt)}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-white font-bold group-hover:text-amber-100 transition-colors tracking-wide mb-2">
                    {timeline.title}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-3 font-light leading-relaxed mb-4">
                    {timeline.worldAtmosphere}
                  </p>

                  <div className="space-y-1.5 text-[11px] font-mono text-neutral-400 border-t border-white/[0.06] pt-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-400 uppercase">PATH:</span>
                      <span className="text-neutral-200 truncate max-w-[170px]">{timeline.occupation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400 uppercase">LOCATION:</span>
                      <span className="text-neutral-200 truncate max-w-[170px]">{timeline.location}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300/80">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>{branches} {branches === 1 ? 'Branch' : 'Branches'}</span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openRewind(timeline)}
                      title="Rewind this world"
                      className="p-2 rounded-lg bg-white/[0.05] hover:bg-amber-400/20 text-neutral-300 hover:text-amber-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => selectTimeline(timeline.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-serif tracking-wider uppercase flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Enter</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => deleteTimeline(timeline.id)}
                      title="Discard timeline"
                      className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
