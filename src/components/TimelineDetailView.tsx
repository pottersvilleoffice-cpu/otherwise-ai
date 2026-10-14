import React, { useState } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { RotateCcw, GitBranch, Scale, Share2, ArrowLeft, Sparkles, MapPin, Compass, ShieldAlert, Award } from 'lucide-react';
import { RewindModal } from './RewindModal';
import { ShareModal } from './ShareModal';

export const TimelineDetailView: React.FC = () => {
  const { activeTimeline, setActiveTab, openCompare, startNewJourney } = useTimeline();
  const [showRewindModal, setShowRewindModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  if (!activeTimeline) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-neutral-400 font-serif text-lg mb-4">No active timeline selected.</p>
        <button
          onClick={startNewJourney}
          className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase cursor-pointer"
        >
          Begin An Alternate Life
        </button>
      </div>
    );
  }

  const bgImage = activeTimeline.visualTheme?.bgImage || '/src/assets/images/void_horizon_portal_1791336496977.jpg';

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      {/* Top Navigation Bar inside Detail */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between">
        <button
          onClick={() => setActiveTab('worlds')}
          className="text-xs font-mono text-neutral-400 hover:text-white uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Worlds</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tree')}
            className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-mono text-neutral-300 uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5 text-amber-300" />
            <span>Timeline Tree</span>
          </button>

          <button
            onClick={() => openCompare(activeTimeline)}
            className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-mono text-neutral-300 uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-sky-300" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Cinematic Hero Banner with Visual World Artwork */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative w-full rounded-3xl overflow-hidden border border-white/[0.12] shadow-2xl min-h-[360px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-10">
          {/* Background Artwork */}
          <div className="absolute inset-0 z-0">
            <img
              src={bgImage}
              alt={activeTimeline.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.1] scale-105"
            />
            {/* Cinematic Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#06070a]/70 to-black/30" />
            <div className="absolute inset-0 bg-radial from-transparent to-[#06070a]/90" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl">
            {/* Unboxed Metadata Header */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-300 mb-3 tracking-wider uppercase">
              <span className="text-amber-300 font-semibold">{activeTimeline.parallelSelf.archetype}</span>
              <span aria-hidden="true" className="text-neutral-500">·</span>
              <span>AGE {activeTimeline.futureAge}</span>
              <span aria-hidden="true" className="text-neutral-500">·</span>
              <span className="flex items-center gap-1 text-neutral-200">
                <MapPin className="w-3 h-3 text-red-400" />
                {activeTimeline.location}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-bold tracking-tight drop-shadow-lg mb-3">
              {activeTimeline.title}
            </h1>

            <p className="font-serif italic text-base sm:text-xl text-neutral-200/95 max-w-2xl leading-relaxed mb-6 font-light">
              "{activeTimeline.parallelSelf.tagline}"
            </p>

            {/* Quick Action Ribbon */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowRewindModal(true)}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-amber-200 via-white to-amber-100 text-neutral-950 font-serif font-bold text-xs tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(251,191,36,0.25)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-black" />
                <span>REWIND THIS LIFE</span>
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="h-12 px-5 rounded-xl bg-white/[0.1] hover:bg-white/[0.18] border border-white/[0.15] text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* Fictional Disclaimer */}
        <div className="mt-3 px-3 py-1.5 flex items-center gap-2 text-[11px] font-mono text-neutral-500">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
          <span>FICTIONAL POSSIBILITY // Creative speculative scenario generated for artistic exploration.</span>
        </div>
      </div>

      {/* Main Timeline Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: The World, Turning Point, Events */}
        <div className="lg:col-span-2 space-y-8">
          {/* YOUR OTHERWISE: Parallel Self Card */}
          <div className="rounded-3xl border border-white/[0.1] bg-gradient-to-br from-white/[0.04] to-black/60 p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono tracking-[0.25em] text-amber-300/90 uppercase block mb-1">
                  PARALLEL CONSCIOUSNESS
                </span>
                <h3 className="font-serif text-2xl text-white font-bold tracking-wide">
                  YOUR OTHERWISE
                </h3>
              </div>
              <span className="font-serif text-sm px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-neutral-300">
                {activeTimeline.parallelSelf.archetype}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                  CORE DRIVE
                </span>
                <p className="text-sm sm:text-base text-neutral-200 font-light leading-relaxed">
                  {activeTimeline.parallelSelf.coreDrive}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1">
                    UNLOCKED STRENGTH
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {activeTimeline.parallelSelf.unlockedStrength}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">
                    HIDDEN VULNERABILITY
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {activeTimeline.parallelSelf.hiddenVulnerability}
                  </p>
                </div>
              </div>

              {/* Signature Quote */}
              <div className="pt-4 border-t border-white/[0.06]">
                <blockquote className="font-serif italic text-base sm:text-lg text-amber-100/90 pl-4 border-l-2 border-amber-300/60 leading-relaxed">
                  "{activeTimeline.parallelSelf.signatureQuote}"
                </blockquote>
              </div>
            </div>
          </div>

          {/* THE WORLD: Sensory Environment & Daily Life */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>THE WORLD & ENVIRONMENT</span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                  ATMOSPHERE & SENSORY TEXTURE
                </span>
                <p className="text-sm text-neutral-300 leading-relaxed font-light">
                  {activeTimeline.worldAtmosphere}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                  A TYPICAL DAY IN THIS LIFE
                </span>
                <p className="text-sm text-neutral-300 leading-relaxed font-light">
                  {activeTimeline.dailyLife}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                  THE TURNING POINT
                </span>
                <p className="text-sm text-neutral-200 font-medium leading-relaxed">
                  {activeTimeline.turningPoint}
                </p>
              </div>
            </div>

            {/* 3 Meaningful Objects */}
            {activeTimeline.keyObjects && activeTimeline.keyObjects.length > 0 && (
              <div className="pt-4 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-3">
                  MEANINGFUL ARTIFACTS OF THIS LIFE
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeTimeline.keyObjects.map((obj, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center flex flex-col items-center justify-center min-h-[70px]"
                    >
                      <span className="text-[9px] font-mono text-neutral-400 uppercase mb-1">0{idx + 1}</span>
                      <span className="text-xs font-serif text-white">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TIMELINE EVENTS PROGRESSION */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>TIMELINE MILESTONES</span>
            </div>

            <div className="relative border-l border-white/[0.12] pl-6 ml-2 space-y-8">
              {activeTimeline.events.map((ev, idx) => (
                <div key={idx} className="relative group">
                  {/* Glowing Node Dot */}
                  <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#06070a] border-2 border-amber-300 group-hover:scale-125 transition-transform" />

                  <span className="text-[11px] font-mono text-amber-300 tracking-wider uppercase block mb-1">
                    {ev.yearOffset}
                  </span>
                  <h4 className="font-serif text-base sm:text-lg text-white font-medium mb-1">
                    {ev.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                    {ev.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Highlights, Decisions made, Actions */}
        <div className="space-y-6">
          {/* Highlights & Trials Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-5">
            <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 border-b border-white/[0.06] pb-3">
              TRIALS & TRIUMPHS
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>MAJOR ACHIEVEMENT</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-light">
                {activeTimeline.majorAchievement}
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-xs font-mono text-rose-400 mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>CRITICAL TRIAL</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
                {activeTimeline.majorChallenge}
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.06]">
              <div className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                HAUNTING REGRET
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 italic leading-relaxed">
                "{activeTimeline.biggestRegret}"
              </p>
            </div>
          </div>

          {/* The Choices that created this Timeline */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                ORIGINATING CHOICES
              </span>
              <button
                onClick={() => setShowRewindModal(true)}
                className="text-[10px] font-mono text-amber-300 hover:underline cursor-pointer uppercase"
              >
                Rewind
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {activeTimeline.choices.map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs">
                  <span className="text-[10px] font-mono text-neutral-400 block mb-0.5 truncate">
                    {c.questionText}
                  </span>
                  <span className="font-serif text-neutral-200">
                    "{c.selectedOption}"
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Major Rewind CTA Banner */}
          <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-b from-amber-950/20 to-black p-6 text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300 block">
              THE OTHERWISE ENGINE
            </span>
            <h4 className="font-serif text-lg text-white font-semibold">
              Curious about another road?
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Step back into any choice and see what unfolds when you choose otherwise.
            </p>
            <button
              onClick={() => setShowRewindModal(true)}
              className="w-full h-11 rounded-xl bg-white text-black font-serif font-bold text-xs tracking-wider uppercase hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REWIND A CHOICE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRewindModal && (
        <RewindModal
          timeline={activeTimeline}
          onClose={() => setShowRewindModal(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          timeline={activeTimeline}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
