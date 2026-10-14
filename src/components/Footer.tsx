import React from 'react';
import { useAI } from '../context/AIContext';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenContact?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms, onOpenContact }) => {
  const { setActiveNav } = useAI();

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#050609] py-12 px-4 sm:px-6 lg:px-8 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand Lockup */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveNav('home')}
            className="text-left font-serif text-lg tracking-[0.25em] text-white hover:text-amber-200 transition-colors uppercase cursor-pointer block"
          >
            OTHERWISE
          </button>
          <p className="text-xs font-mono text-neutral-400 tracking-wider uppercase">
            ONE AI. EVERY POSSIBILITY.
          </p>
          <p className="text-[11px] text-neutral-500 font-light max-w-sm">
            An all-in-one platform for creative intelligence, multimodal synthesis, and alternate-life exploration.
          </p>
        </div>

        {/* Links Grid */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
          <button
            onClick={() => setActiveNav('home')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => setActiveNav('ai')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            AI
          </button>
          <button
            onClick={() => setActiveNav('create')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Create
          </button>
          <button
            onClick={() => setActiveNav('projects')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Projects
          </button>
          <button
            onClick={() => setActiveNav('otherwise')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            OTHERWISE Mode
          </button>
          <button
            onClick={() => setActiveNav('about')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => {
              setActiveNav('about');
              window.scrollTo({ top: 900, behavior: 'smooth' });
            }}
            className="text-amber-300 hover:text-white transition-colors cursor-pointer"
          >
            Meet the Author
          </button>
          <button
            onClick={onOpenPrivacy}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Privacy
          </button>
          <button
            onClick={onOpenTerms}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Terms
          </button>
          <button
            onClick={onOpenContact}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Contact
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-500 gap-4">
        <span>© OTHERWISE. All rights reserved.</span>
        <span>Created by <strong className="text-neutral-300 font-medium">David Bodunde</strong> · Built with passion & curiosity at Pottersville School.</span>
      </div>
    </footer>
  );
};
