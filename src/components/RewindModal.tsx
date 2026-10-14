import React, { useState } from 'react';
import { Timeline, UserChoice } from '../types/timeline';
import { useTimeline } from '../context/TimelineContext';
import { LIFE_QUESTIONS } from '../data/questions';
import { X, RotateCcw, GitBranch, ArrowRight, Sparkles } from 'lucide-react';

interface RewindModalProps {
  timeline: Timeline;
  onClose: () => void;
}

export const RewindModal: React.FC<RewindModalProps> = ({ timeline, onClose }) => {
  const { branchFromRewind, isGenerating } = useTimeline();

  // Selected decision to change
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [newChoiceOption, setNewChoiceOption] = useState<string | null>(null);

  const selectedChoice = timeline.choices.find((c) => c.id === selectedChoiceId);
  const questionDef = selectedChoice
    ? LIFE_QUESTIONS.find((q) => q.id === selectedChoice.questionId)
    : null;

  const handleBranch = async () => {
    if (!selectedChoiceId || !newChoiceOption) return;

    const updatedChoices: UserChoice[] = timeline.choices.map((c) => {
      if (c.id === selectedChoiceId) {
        return {
          ...c,
          selectedOption: newChoiceOption,
        };
      }
      return c;
    });

    onClose();
    await branchFromRewind(timeline, selectedChoiceId, newChoiceOption, updatedChoices);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#08090d] border border-white/[0.14] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-200 text-xs font-mono tracking-widest uppercase mb-3">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>TEMPORAL REWIND</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-wide">
            ONE DECISION CAN CHANGE EVERYTHING.
          </h2>

          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-md mx-auto">
            Select one pivotal decision from <span className="text-white font-serif">{timeline.title}</span> to reverse and watch a divergent life unfold.
          </p>
        </div>

        {/* Step 1: Pick which decision to rewind */}
        {!selectedChoiceId ? (
          <div className="space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              CHOOSE A DECISION TO REVERSE:
            </div>

            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {timeline.choices.map((choice, idx) => (
                <button
                  key={choice.id || idx}
                  onClick={() => {
                    setSelectedChoiceId(choice.id);
                    setNewChoiceOption(null);
                  }}
                  className="w-full text-left p-4 rounded-xl border border-white/[0.08] hover:border-amber-400/40 bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
                >
                  <div className="flex-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
                      DECISION {idx + 1} // {choice.questionText}
                    </span>
                    <span className="font-serif text-sm text-neutral-200 group-hover:text-white font-medium">
                      "{choice.selectedOption}"
                    </span>
                  </div>

                  <span className="text-xs font-mono text-amber-300/80 group-hover:text-amber-300 flex items-center gap-1 shrink-0">
                    <span>REWIND THIS</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Step 2: Pick the alternative choice */
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">
                  ORIGINAL CHOICE
                </span>
                <span className="font-serif text-sm text-neutral-300 line-through decoration-amber-400/70">
                  "{selectedChoice?.selectedOption}"
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedChoiceId(null);
                  setNewChoiceOption(null);
                }}
                className="text-xs font-mono text-neutral-400 hover:text-white uppercase tracking-wider underline cursor-pointer"
              >
                Change Another Decision
              </button>
            </div>

            <div className="text-xs font-mono uppercase tracking-wider text-amber-200">
              SELECT YOUR ALTERNATE RESOLUTION:
            </div>

            <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
              {questionDef?.options
                .filter((opt) => opt.label !== selectedChoice?.selectedOption)
                .map((opt, idx) => {
                  const isSelected = newChoiceOption === opt.label;
                  return (
                    <button
                      key={idx}
                      onClick={() => setNewChoiceOption(opt.label)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.12)]'
                          : 'border-white/[0.08] hover:border-white/[0.2] bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-serif text-sm sm:text-base text-white font-medium">
                          {opt.label}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase px-2 py-0.5 rounded bg-amber-400/20">
                            NEW REALITY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 font-light leading-relaxed">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedChoiceId(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white font-mono uppercase"
              >
                Back
              </button>

              <button
                onClick={handleBranch}
                disabled={!newChoiceOption || isGenerating}
                className="h-12 px-7 rounded-xl bg-gradient-to-r from-amber-200 via-white to-amber-100 text-neutral-950 font-serif font-bold text-xs tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <GitBranch className="w-4 h-4 text-black" />
                <span>SPROUT NEW TIMELINE</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
