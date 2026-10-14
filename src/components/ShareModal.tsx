import React, { useState } from 'react';
import { Timeline } from '../types/timeline';
import { X, Copy, Check, Share2, Download } from 'lucide-react';

interface ShareModalProps {
  timeline: Timeline;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ timeline, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareText = `OTHERWISE
${timeline.parallelSelf.archetype}

"${timeline.parallelSelf.tagline}"

TIMELINE: Age ${timeline.futureAge}
PATH: ${timeline.occupation}
LOCATION: ${timeline.location}

"Every choice creates a life you never lived."
Explore alternate timelines at OTHERWISE`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `OTHERWISE: ${timeline.parallelSelf.archetype}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0a0c10] border border-white/[0.14] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 uppercase mb-4">
          SHAREABLE ARTIFACT
        </span>

        {/* The Visual Share Card */}
        <div className="w-full relative overflow-hidden rounded-2xl border border-white/[0.15] bg-gradient-to-b from-neutral-900/90 via-[#0a0c12] to-black p-6 sm:p-7 text-center shadow-inner">
          {/* Subtle accent glow */}
          <div
            className="absolute -top-12 -left-12 w-36 h-36 rounded-full blur-3xl opacity-40 pointer-events-none"
            style={{ backgroundColor: timeline.visualTheme.accentColor }}
          />

          <div className="font-serif text-xs tracking-[0.3em] uppercase text-neutral-400 mb-6">
            OTHERWISE
          </div>

          <div className="text-xs font-mono tracking-widest text-amber-200/90 uppercase mb-2">
            PARALLEL SELF
          </div>

          <h3 className="font-serif text-xl sm:text-2xl text-white font-bold tracking-[0.12em] mb-4">
            {timeline.parallelSelf.archetype}
          </h3>

          <p className="font-serif italic text-sm text-neutral-300 leading-relaxed max-w-xs mx-auto mb-6">
            "{timeline.parallelSelf.tagline}"
          </p>

          <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-left text-[11px] font-mono text-neutral-400">
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">TIMELINE AGE</span>
              <span className="text-neutral-200">{timeline.futureAge}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">CHOSEN PATH</span>
              <span className="text-neutral-200 truncate block">{timeline.occupation}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.04] text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
            "WHAT IF YOU CHOSE DIFFERENTLY?"
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={handleNativeShare}
            className="flex-1 h-12 rounded-xl bg-white text-neutral-950 font-serif font-bold text-xs tracking-[0.16em] uppercase flex items-center justify-center gap-2 hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-black" />
            <span>SHARE THIS LIFE</span>
          </button>

          <button
            onClick={handleCopy}
            className="h-12 px-5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-neutral-300 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY TEXT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
