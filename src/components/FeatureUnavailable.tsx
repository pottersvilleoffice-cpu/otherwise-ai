import React from 'react';
import { useAI } from '../context/AIContext';
import { AlertCircle, MessageSquare, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { getFeatureConfig } from '../config/features';

interface FeatureUnavailableProps {
  featureId?: string;
  featureName?: string;
  customMessage?: string;
}

export const FeatureUnavailable: React.FC<FeatureUnavailableProps> = ({
  featureId = 'custom',
  featureName,
  customMessage,
}) => {
  const { setActiveNav } = useAI();
  const config = getFeatureConfig(featureId);

  const title = featureName || config.name;
  const message =
    customMessage ||
    config.reason ||
    'This feature is temporarily unavailable while we complete development.';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="relative rounded-3xl border border-white/[0.12] bg-[#090b10] p-8 sm:p-12 shadow-2xl overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 mb-6 shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-4">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Development in Progress</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed max-w-lg mb-8">
            {message}
          </p>

          <div className="w-full max-w-md p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-left mb-8 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-semibold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active & Working Now</span>
            </div>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              <strong className="text-white font-medium">Chat AI</strong> is fully operational and powered by real Google Gemini neural intelligence. You can chat, ask questions, explore ideas, and brainstorm right now.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveNav('ai')}
              className="px-6 py-3 rounded-xl bg-white text-black font-serif font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <MessageSquare className="w-4 h-4 text-black" />
              <span>Launch Chat AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveNav('home')}
              className="px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-mono uppercase text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
