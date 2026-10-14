import React from 'react';
import { useTimeline } from '../context/TimelineContext';
import { OpeningHero } from './OpeningHero';
import { QuestionWizard } from './QuestionWizard';
import { CinematicReveal } from './CinematicReveal';
import { TimelineDetailView } from './TimelineDetailView';
import { TimelineTree } from './TimelineTree';
import { CompareView } from './CompareView';
import { MyWorldsView } from './MyWorldsView';
import { ExploreView } from './ExploreView';
import { Compass, GitBranch, Scale, Globe, Sparkles } from 'lucide-react';

export const OtherwiseModeContainer: React.FC = () => {
  const { activeTab, setActiveTab, timelines, startNewJourney } = useTimeline();

  // If in active immersion flow (wizard or reveal), show full screen
  if (activeTab === 'wizard') return <QuestionWizard />;
  if (activeTab === 'reveal') return <CinematicReveal />;

  return (
    <div className="w-full">
      {/* Sub-header specifically for OTHERWISE Mode */}
      <div className="border-b border-white/[0.06] bg-black/40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-serif text-sm tracking-widest uppercase text-white font-semibold">
              OTHERWISE MODE
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400 text-[11px] hidden sm:inline">
              "What if you chose differently?"
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Origin
            </button>

            <button
              onClick={() => setActiveTab('worlds')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'worlds'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              My Worlds {timelines.length > 0 && `(${timelines.length})`}
            </button>

            <button
              onClick={() => setActiveTab('tree')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'tree'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Timeline Tree
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'compare'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Compare
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Explore Archive
            </button>

            <button
              onClick={startNewJourney}
              className="ml-2 px-3 py-1 rounded-lg bg-white text-black font-semibold uppercase text-[10px] tracking-wider hover:bg-neutral-200 cursor-pointer"
            >
              + New Life
            </button>
          </div>
        </div>
      </div>

      {/* Render active sub-tab */}
      <div>
        {activeTab === 'home' && <OpeningHero />}
        {activeTab === 'timeline' && <TimelineDetailView />}
        {activeTab === 'tree' && <TimelineTree />}
        {activeTab === 'compare' && <CompareView />}
        {activeTab === 'worlds' && <MyWorldsView />}
        {activeTab === 'explore' && <ExploreView />}
      </div>
    </div>
  );
};
