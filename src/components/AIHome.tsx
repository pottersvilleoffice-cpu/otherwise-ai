import React, { useState, useRef } from 'react';
import { useAI } from '../context/AIContext';
import { ChatAttachment } from '../types/ai';
import {
  MessageSquare,
  Sparkles,
  Paperclip,
  Mic,
  MicOff,
  Send,
  X,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

interface AIHomeProps {
  onStartMessage?: (userId: string) => void;
  onOpenProfile?: (userId: string) => void;
}

export const AIHome: React.FC<AIHomeProps> = ({ onStartMessage, onOpenProfile }) => {
  const { sendMessage, setActiveNav, startNewChat } = useAI();

  const [inputPrompt, setInputPrompt] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Curated prompts that invoke real Chat AI reasoning
  const suggestedPrompts = [
    'Explain how neural attention mechanisms work in simple terms',
    'Brainstorm 5 unique sci-fi story concepts set on a terraformed moon',
    'Help me draft a concise, compelling message to pitch a creative idea',
    'What are the most fascinating unsolved mysteries in astrophysics?',
    'Write a python script explaining Dijkstra algorithm with examples',
    'How do I build a healthy daily creative writing habit?',
  ];

  // Handle voice speech-to-text dictation
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use keyboard input.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Handle file attachment
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      if (file.type.startsWith('image/')) {
        reader.onload = (event) => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type,
              size: file.size,
              dataUrl: event.target?.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (event) => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type,
              size: file.size,
              textContent: (event.target?.result as string)?.slice(0, 15000),
            },
          ]);
        };
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputPrompt.trim();
    if (!trimmed && attachments.length === 0) return;

    // Switch to Chat AI and send the exact user prompt
    setActiveNav('ai');
    await sendMessage(trimmed, 'chat', attachments);
    setInputPrompt('');
    setAttachments([]);
  };

  const handleSelectPrompt = async (promptText: string) => {
    setActiveNav('ai');
    await sendMessage(promptText, 'chat');
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-5xl mx-auto">
      {/* Brand Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono tracking-[0.2em] text-neutral-400 uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-semibold">CHAT AI IS ACTIVE</span>
          <span className="text-neutral-600">·</span>
          <span>POWERED BY GOOGLE GEMINI</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-[0.14em] text-white drop-shadow-xl mb-3">
          ASK OTHERWISE
        </h1>

        <p className="font-sans text-sm sm:text-base text-neutral-300 font-light max-w-lg mx-auto leading-relaxed">
          Intelligent conversation, reasoning, creative writing, and knowledge exploration with real-time neural AI.
        </p>
      </div>

      {/* Modern Large Prompt Box */}
      <div className="w-full max-w-3xl relative mb-10">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-2xl sm:rounded-3xl border border-white/[0.14] bg-[#090b10]/95 backdrop-blur-xl p-4 sm:p-5 shadow-2xl transition-all duration-300 focus-within:border-amber-300/60 focus-within:shadow-[0_0_40px_rgba(251,191,36,0.12)]"
        >
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs text-neutral-300 font-mono"
                >
                  {att.type.startsWith('image/') ? (
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                  )}
                  <span className="truncate max-w-[140px]">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-neutral-500 hover:text-white ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main Textarea */}
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask anything, explore ideas, solve problems, or chat..."
            rows={3}
            className="w-full bg-transparent text-white text-base sm:text-lg placeholder:text-neutral-500 focus:outline-none resize-none font-sans font-light leading-relaxed"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] mt-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.csv,.json,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach image or document"
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleToggleVoice}
                title="Dictate with voice"
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] font-mono text-neutral-400">
                Press Enter ↵
              </span>
              <button
                type="submit"
                disabled={!inputPrompt.trim() && attachments.length === 0}
                className="h-10 px-5 rounded-xl bg-white text-neutral-950 font-serif font-bold text-xs tracking-[0.16em] uppercase hover:bg-neutral-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Suggested Chat Starters */}
      <div className="w-full max-w-3xl mb-12">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-mono tracking-[0.2em] text-neutral-400 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>TRY ASKING CHAT AI</span>
          </span>
          <button
            onClick={() => {
              startNewChat('chat');
              setActiveNav('ai');
            }}
            className="text-[11px] font-mono text-amber-300 hover:text-white transition-colors"
          >
            Open Chat Room →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPrompt(p)}
              className="p-3.5 rounded-2xl border border-white/[0.08] bg-[#090b10]/60 hover:bg-white/[0.05] hover:border-white/20 transition-all text-left text-xs text-neutral-300 hover:text-white flex items-center justify-between group cursor-pointer"
            >
              <span className="line-clamp-2 leading-relaxed font-light">{p}</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-amber-300 shrink-0 ml-2 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Primary Platform Pillars */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {/* Chat AI Card */}
        <div
          onClick={() => setActiveNav('ai')}
          className="p-5 rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-950/20 to-[#090b10] hover:border-amber-400/60 transition-all cursor-pointer group shadow-xl"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-serif text-base font-bold text-white">Chat AI</h3>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-light leading-relaxed mb-4">
            Direct conversational intelligence with multi-turn context and reasoning.
          </p>
          <span className="text-xs font-mono text-amber-300 font-semibold flex items-center gap-1">
            <span>Start Chatting</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Community Card */}
        <div
          onClick={() => setActiveNav('community')}
          className="p-5 rounded-3xl border border-white/[0.1] bg-[#090b10] hover:border-white/20 transition-all cursor-pointer group shadow-xl"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 mb-3 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-bold text-white mb-1">Community</h3>
          <p className="text-xs text-neutral-400 font-light leading-relaxed mb-4">
            Browse public posts, creator cards, discussions, reactions, and community creations.
          </p>
          <span className="text-xs font-mono text-indigo-300 font-semibold flex items-center gap-1">
            <span>Explore Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Messages Card */}
        <div
          onClick={() => setActiveNav('messages')}
          className="p-5 rounded-3xl border border-white/[0.1] bg-[#090b10] hover:border-white/20 transition-all cursor-pointer group shadow-xl"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300 mb-3 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-bold text-white mb-1">Messages</h3>
          <p className="text-xs text-neutral-400 font-light leading-relaxed mb-4">
            Private 1-on-1 direct conversations. Search creators, chat in real time, and stay in touch.
          </p>
          <span className="text-xs font-mono text-emerald-300 font-semibold flex items-center gap-1">
            <span>Open Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
