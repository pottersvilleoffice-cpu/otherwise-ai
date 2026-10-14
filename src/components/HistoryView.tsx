import React, { useState, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import { AIGenerationHistoryItem, AICard } from '../types/ai';
import { AICardComponent } from './AICardComponent';
import { LyriaMusicPlayer } from './LyriaMusicPlayer';
import { VeoVideoPlayer } from './VeoVideoPlayer';
import { ImageDisplayCard } from './ImageDisplayCard';
import {
  Clock,
  Sparkles,
  Search,
  RotateCcw,
  Share2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Video,
  Music,
  ImageIcon,
  Code,
  FileText,
  HelpCircle,
  Download,
  Filter,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { setActiveNav, setCreateSubTab, sendMessage } = useAI();
  const [historyItems, setHistoryItems] = useState<AIGenerationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCap, setFilterCap] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shareModalCard, setShareModalCard] = useState<AICard | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        if (data.history) {
          setHistoryItems(data.history);
        }
      }
    } catch (e) {
      console.warn('[History] Fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error('Delete history item error:', e);
    }
  };

  const handleRetry = async (item: AIGenerationHistoryItem) => {
    if (item.capability === 'image') {
      setCreateSubTab('image');
      setActiveNav('create');
    } else if (item.capability === 'song') {
      setCreateSubTab('song');
      setActiveNav('create');
    } else if (item.capability === 'video') {
      setCreateSubTab('video');
      setActiveNav('create');
    } else {
      setActiveNav('ai');
      sendMessage(item.prompt, item.capability);
    }
  };

  const handleCreateCard = async (item: AIGenerationHistoryItem) => {
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.prompt.slice(0, 40) || 'AI Creation',
          description: item.resultText?.slice(0, 140) || 'Generated in OTHERWISE AI Studio',
          aiTool: item.aiToolName || 'OTHERWISE Engine',
          capability: item.capability,
          mediaType: item.mediaType || 'text',
          mediaUrl: item.mediaUrl,
          audioData: item.audioData,
          videoData: item.videoData,
          imageData: item.imageData,
          content: item.resultText,
          requestId: item.requestId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.card) {
          setShareModalCard(data.card);
        }
      }
    } catch (e) {
      console.error('Card creation error:', e);
    }
  };

  const handleShareToCommunity = async (card: AICard) => {
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `Check out my new ${card.aiTool} creation!`,
          card,
        }),
      });
      if (res.ok) {
        setShareModalCard(null);
        setActiveNav('community');
      }
    } catch (e) {
      console.error('Share to community error:', e);
    }
  };

  const filteredItems = historyItems.filter((item) => {
    const matchesCap = filterCap === 'all' || item.capability === filterCap;
    const matchesSearch =
      !searchQuery ||
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requestId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCap && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-amber-400" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Private AI Generation History
            </h1>
          </div>
          <p className="text-xs text-neutral-400 font-light">
            Every request tagged with a unique request ID, model provider info, and status tracking.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by prompt or request ID..."
            className="w-full bg-[#0c0e14] border border-white/[0.1] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 font-mono text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'video', label: 'Video AI' },
            { id: 'song', label: 'Music AI' },
            { id: 'image', label: 'Image AI' },
            { id: 'write', label: 'Writing' },
            { id: 'code', label: 'Code' },
            { id: 'chat', label: 'Chat' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCap(tab.id)}
              className={`px-3 py-2 rounded-xl border text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                filterCap === tab.id
                  ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-bold'
                  : 'bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Items List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono text-neutral-400">Loading AI Generation Records...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-white/[0.08] bg-[#080a0f]">
          <Clock className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="font-serif text-lg text-white mb-1">No Generation Records Found</h3>
          <p className="text-xs text-neutral-400 mb-6 max-w-md mx-auto">
            {searchQuery || filterCap !== 'all'
              ? 'No matching requests for this filter.'
              : 'Requests you submit across Chat, Video AI, Song AI, Image AI, or Writing AI will appear here.'}
          </p>
          <button
            onClick={() => setActiveNav('create')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-black font-semibold text-xs transition-all cursor-pointer shadow-lg hover:brightness-110"
          >
            Start Creating in Studio
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/[0.1] bg-[#0a0c12] p-4 sm:p-5 transition-all duration-200 hover:border-white/20 shadow-xl"
            >
              {/* Record Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      item.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    <span>{item.status}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 text-[10px] uppercase font-bold">
                    {item.capability}
                  </span>

                  <span className="text-neutral-500 text-[10px]">Req: {item.requestId}</span>
                </div>

                <div className="flex items-center gap-3 text-neutral-400 text-[10px]">
                  <span>{item.aiToolName || 'OTHERWISE Engine'}</span>
                  <span>·</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Prompt Box */}
              <div className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-white font-medium italic">"{item.prompt}"</p>
              </div>

              {/* Status Content / Media Preview */}
              {item.status === 'completed' && (
                <div className="mb-4">
                  {item.audioData && (
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 p-2">
                      <LyriaMusicPlayer song={item.audioData} compact />
                    </div>
                  )}

                  {item.videoData && (
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                      <VeoVideoPlayer video={item.videoData} compact />
                    </div>
                  )}

                  {item.imageData && (
                    <div className="max-w-md rounded-xl overflow-hidden border border-white/10">
                      <img src={item.imageData.url} alt="Result" className="w-full h-auto object-cover max-h-64" />
                    </div>
                  )}

                  {item.resultText && !item.audioData && !item.videoData && !item.imageData && (
                    <div className="p-3 rounded-xl bg-black/30 text-xs text-neutral-200 font-light leading-relaxed max-h-48 overflow-y-auto scrollbar-thin">
                      {item.resultText}
                    </div>
                  )}
                </div>
              )}

              {/* Error Details if Failed */}
              {item.status === 'failed' && item.errorDetails && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs font-mono space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Generation Failed: {item.errorDetails.message}</span>
                  </div>
                  {item.errorDetails.providerRequired && (
                    <p className="text-[11px] text-neutral-300">
                      <strong className="text-amber-300">Provider Required:</strong> {item.errorDetails.providerRequired}
                    </p>
                  )}
                  {item.errorDetails.modelRequired && (
                    <p className="text-[11px] text-neutral-300">
                      <strong className="text-cyan-300">Model Required:</strong> {item.errorDetails.modelRequired}
                    </p>
                  )}
                  {item.errorDetails.envVarRequired && (
                    <p className="text-[11px] text-neutral-300">
                      <strong className="text-emerald-300">Server Key Needed:</strong> {item.errorDetails.envVarRequired}
                    </p>
                  )}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-xs font-mono">
                <div className="flex items-center gap-2">
                  {item.status === 'failed' ? (
                    <button
                      onClick={() => handleRetry(item)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Request</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCreateCard(item)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Create AI Card</span>
                      </button>

                      <button
                        onClick={() => handleRetry(item)}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reopen in Studio</span>
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-950/30 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete history record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share / AI Card Modal */}
      {shareModalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#090b10] border border-white/[0.16] rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-lg text-white font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>AI Card Created!</span>
            </h3>
            <p className="text-xs text-neutral-300 font-light">
              Your AI result is now formatted as a shareable card. Publish it to Community or copy its link.
            </p>

            <AICardComponent card={shareModalCard} compact />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => setShareModalCard(null)}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 text-xs font-mono cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleShareToCommunity(shareModalCard)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-black font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-lg"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Publish to Community</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
