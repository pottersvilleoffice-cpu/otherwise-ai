import React, { useState } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { LIFE_QUESTIONS } from '../data/questions';
import { UserChoice } from '../types/timeline';
import { ArrowRight, ArrowLeft, FastForward, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export const QuestionWizard: React.FC = () => {
  const {
    userName,
    setUserName,
    generateInitialTimeline,
    isGenerating,
    generationError,
    setActiveTab,
  } = useTimeline();

  // step 0 = name introduction; steps 1 to LIFE_QUESTIONS.length = questions
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [tempName, setTempName] = useState(userName || '');
  const [choices, setChoices] = useState<UserChoice[]>([]);
  const [customText, setCustomText] = useState('');
  const [isCustomActive, setIsCustomActive] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  const totalQuestions = LIFE_QUESTIONS.length;
  const currentQuestion = currentStep > 0 ? LIFE_QUESTIONS[currentStep - 1] : null;

  const loadingPhrases = [
    'WE FOUND A POSSIBILITY.',
    'Exploring another possibility...',
    'Following the branch...',
    'Your other life is taking shape...',
    'Calculating the divergence...',
  ];

  // Rotate loading phrases
  React.useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleNameSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = tempName.trim() || 'You';
    setUserName(finalName);
    setCurrentStep(1);
  };

  const handleSelectOption = async (optionLabel: string, custom?: string) => {
    if (!currentQuestion) return;

    const newChoice: UserChoice = {
      id: `choice-${currentQuestion.id}`,
      questionId: currentQuestion.id,
      questionText: currentQuestion.prompt,
      selectedOption: optionLabel,
      customText: custom,
    };

    const updated = [...choices.filter((c) => c.questionId !== currentQuestion.id), newChoice];
    setChoices(updated);
    setCustomText('');
    setIsCustomActive(false);

    if (currentStep < totalQuestions) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completed all questions, trigger generation!
      await generateInitialTimeline(tempName || userName || 'You', updated);
    }
  };

  const handleSkip = async () => {
    if (!currentQuestion) return;

    // Pick first default option as subtle fallback or marked skipped
    const defaultOpt = currentQuestion.options[0].label;
    const newChoice: UserChoice = {
      id: `choice-${currentQuestion.id}`,
      questionId: currentQuestion.id,
      questionText: currentQuestion.prompt,
      selectedOption: defaultOpt,
    };

    const updated = [...choices.filter((c) => c.questionId !== currentQuestion.id), newChoice];
    setChoices(updated);
    setCustomText('');
    setIsCustomActive(false);

    if (currentStep < totalQuestions) {
      setCurrentStep(currentStep + 1);
    } else {
      await generateInitialTimeline(tempName || userName || 'You', updated);
    }
  };

  // Loading state
  if (isGenerating) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 text-center">
        <div className="relative flex items-center justify-center w-28 h-28 mb-8">
          <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-ping opacity-30" />
          <div className="absolute inset-2 rounded-full border border-white/20 animate-spin opacity-40 duration-3000" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400/20 to-indigo-500/20 blur-md" />
          <Sparkles className="w-8 h-8 text-amber-200 animate-pulse relative z-10" />
        </div>

        <div className="font-serif text-2xl sm:text-3xl text-white tracking-[0.15em] mb-3">
          {loadingPhrases[loadingPhraseIndex]}
        </div>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-sm tracking-wider uppercase font-mono">
          Weaving your alternate existence from the threads of your choices
        </p>
      </div>
    );
  }

  // Error state
  if (generationError) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center mb-6 text-red-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-xl text-white tracking-wide mb-2">
          The Timeline Flickered
        </h3>
        <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
          The alternate possibility could not be crystallized. You can attempt to reconvene or alter your choices.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => generateInitialTimeline(tempName || userName || 'You', choices)}
            className="flex-1 h-12 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>
          <button
            onClick={() => setCurrentStep(totalQuestions)}
            className="flex-1 h-12 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white font-medium text-xs tracking-wider uppercase flex items-center justify-center cursor-pointer hover:bg-white/[0.12]"
          >
            CHANGE DECISION
          </button>
        </div>
      </div>
    );
  }

  // STEP 0: NAME INTRO
  if (currentStep === 0) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center max-w-xl mx-auto px-4 py-8">
        <div className="mb-2 text-xs font-mono tracking-[0.25em] text-neutral-400 uppercase">
          ORIGIN // STEP 01
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-wide mb-3">
          Tell us something about yourself.
        </h2>
        <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
          What name or moniker should we call the alternate version of you?
        </p>

        <form onSubmit={handleNameSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Your name or alter ego..."
              maxLength={40}
              autoFocus
              className="w-full h-14 px-5 rounded-xl bg-white/[0.05] border border-white/[0.15] focus:border-amber-300/60 focus:bg-white/[0.08] text-white text-lg placeholder:text-neutral-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="text-xs text-neutral-400 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="h-12 px-7 rounded-xl bg-white text-neutral-950 font-serif font-bold text-xs tracking-[0.2em] uppercase hover:bg-neutral-200 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // STEPS 1-6: QUESTIONS
  if (!currentQuestion) return null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Top indicator & Skip bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-neutral-400 uppercase">
          <span className="text-amber-300/80">{currentQuestion.title}</span>
          <span>·</span>
          <span>BRANCH {String(currentStep).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}</span>
        </div>

        <button
          onClick={handleSkip}
          className="text-xs font-mono text-neutral-400 hover:text-white transition-colors tracking-widest uppercase flex items-center gap-1 cursor-pointer py-1 px-2"
        >
          <span>SKIP</span>
          <FastForward className="w-3 h-3" />
        </button>
      </div>

      {/* Main Question Area */}
      <div className="my-auto py-6 sm:py-8">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white tracking-wide leading-tight mb-3">
          {currentQuestion.prompt}
        </h2>
        {currentQuestion.subtext && (
          <p className="text-sm sm:text-base text-neutral-400 font-light mb-8 max-w-xl">
            {currentQuestion.subtext}
          </p>
        )}

        {/* Visual Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {currentQuestion.options.map((option, idx) => {
            const isDoor = currentQuestion.id === 'door';
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option.label)}
                className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[120px] ${
                  isDoor
                    ? 'border-white/[0.14] hover:border-amber-400/50 hover:shadow-[0_0_25px_rgba(251,191,36,0.12)]'
                    : 'border-white/[0.08] hover:border-white/[0.22] hover:bg-white/[0.04]'
                } bg-gradient-to-br ${option.visualTone || 'from-white/[0.04] to-black'}`}
              >
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.03] rounded-full blur-2xl group-hover:bg-amber-300/[0.08] transition-colors" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-base sm:text-lg text-neutral-100 group-hover:text-white font-medium tracking-wide">
                      {option.label}
                    </span>
                    <span className="text-neutral-500 group-hover:text-amber-300 transition-colors text-xs font-mono opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 duration-200">
                      →
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
                    {option.description}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>SELECT PATH</span>
                  <span className="text-neutral-400 group-hover:text-neutral-300">0{idx + 1}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Answer Accordion (Optional user expression) */}
        {currentQuestion.allowCustom && (
          <div className="mt-4">
            {!isCustomActive ? (
              <button
                onClick={() => setIsCustomActive(true)}
                className="text-xs text-neutral-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
              >
                Or describe your own alternative path...
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.1] mt-2 space-y-3">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="In your own words: what would you choose?"
                  className="w-full h-11 px-4 rounded-lg bg-black/40 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-amber-300/60"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCustomActive(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (customText.trim()) {
                        handleSelectOption(customText.trim(), customText.trim());
                      }
                    }}
                    disabled={!customText.trim()}
                    className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs tracking-wider uppercase disabled:opacity-50"
                  >
                    Confirm Path
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Back Button */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(currentStep - 1)}
          className="text-xs text-neutral-400 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        <span className="text-[11px] text-neutral-400 font-mono tracking-widest">
          OTHERWISE // LIFE ENGINE
        </span>
      </div>
    </div>
  );
};
