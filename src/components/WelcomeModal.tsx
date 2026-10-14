import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAI } from '../context/AIContext';
import { Sparkles, PenTool, Music, Box, Folder, Compass, MessageSquare, ArrowRight } from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const { isFirstLoginWelcome, dismissWelcome, user } = useAuth();
  const { setActiveNav, setCreateSubTab } = useAI();

  if (!isFirstLoginWelcome) return null;

  const handleAction = (nav: 'home' | 'ai' | 'create' | 'projects' | 'otherwise', subTab?: any) => {
    if (subTab) setCreateSubTab(subTab);
    setActiveNav(nav);
    dismissWelcome();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#090b10] border border-amber-400/40 rounded-3xl p-6 sm:p-10 shadow-[0_0_60px_rgba(251,191,36,0.15)] text-center">
        {/* Glow */}
        <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-5 text-amber-300">
          <Sparkles className="w-7 h-7" />
        </div>

        <div className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 uppercase mb-2">
          NEW HORIZON INITIALIZED
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl text-white font-bold tracking-wide mb-2">
          WELCOME TO OTHERWISE{user?.name ? `, ${user.name.toUpperCase()}` : ''}
        </h2>

        <p className="font-serif italic text-base text-amber-100 font-light max-w-md mx-auto mb-6">
          “Every great creation starts with a possibility.”
        </p>

        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-6">
          WHAT DO YOU WANT TO EXPLORE FIRST?
        </p>

        {/* Action Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left mb-6">
          <button
            onClick={() => handleAction('ai')}
            className="p-3.5 rounded-xl border border-white/[0.08] hover:border-amber-400/40 bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer group"
          >
            <MessageSquare className="w-4 h-4 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xs text-white font-semibold block">ASK AI</span>
            <span className="text-[10px] text-neutral-400 font-light">Direct intelligence</span>
          </button>

          <button
            onClick={() => handleAction('create', 'write')}
            className="p-3.5 rounded-xl border border-white/[0.08] hover:border-amber-400/40 bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer group"
          >
            <PenTool className="w-4 h-4 text-amber-300 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xs text-white font-semibold block">WRITE</span>
            <span className="text-[10px] text-neutral-400 font-light">Stories, essays, scripts</span>
          </button>

          <button
            onClick={() => handleAction('create', 'song')}
            className="p-3.5 rounded-xl border border-white/[0.08] hover:border-amber-400/40 bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer group"
          >
            <Music className="w-4 h-4 text-fuchsia-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xs text-white font-semibold block">MAKE A SONG</span>
            <span className="text-[10px] text-neutral-400 font-light">Lyrics, BPM, chords</span>
          </button>

          <button
            onClick={() => handleAction('create', '3d')}
            className="p-3.5 rounded-xl border border-white/[0.08] hover:border-amber-400/40 bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer group"
          >
            <Box className="w-4 h-4 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xs text-white font-semibold block">CREATE 3D</span>
            <span className="text-[10px] text-neutral-400 font-light">Interactive viewport</span>
          </button>

          <button
            onClick={() => handleAction('projects')}
            className="p-3.5 rounded-xl border border-white/[0.08] hover:border-amber-400/40 bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer group"
          >
            <Folder className="w-4 h-4 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xs text-white font-semibold block">BUILD A PROJECT</span>
            <span className="text-[10px] text-neutral-400 font-light">Games, lore, assets</span>
          </button>

          <button
            onClick={() => handleAction('otherwise')}
            className="p-3.5 rounded-xl border border-amber-400/40 bg-amber-400/10 hover:border-amber-300 transition-all cursor-pointer group"
          >
            <Compass className="w-4 h-4 text-amber-300 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xs text-amber-200 font-semibold block">OTHERWISE MODE</span>
            <span className="text-[10px] text-neutral-300 font-light">Alternate timeline</span>
          </button>
        </div>

        <button
          onClick={dismissWelcome}
          className="w-full h-11 rounded-xl bg-white text-neutral-950 font-serif font-bold text-xs uppercase tracking-[0.2em] hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
        >
          ENTER WORKSPACE
        </button>
      </div>
    </div>
  );
};
