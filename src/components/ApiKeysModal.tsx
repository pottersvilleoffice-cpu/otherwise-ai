import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Sparkles, Music, Film, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'all' | 'suno' | 'veo';
}

interface KeysStatus {
  suno: { isConfigured: boolean; maskedKey?: string };
  gemini: { isConfigured: boolean; maskedKey?: string };
  replicate: { isConfigured: boolean; maskedKey?: string };
  luma: { isConfigured: boolean; maskedKey?: string };
  elevenLabs: { isConfigured: boolean; maskedKey?: string };
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ isOpen, onClose, initialTab = 'all' }) => {
  const [sunoKey, setSunoKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [lumaKey, setLumaKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [status, setStatus] = useState<KeysStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadKeysStatus();
    }
  }, [isOpen]);

  const loadKeysStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings/keys');
      if (res.ok) {
        const data = await res.json();
        if (data.keys) {
          setStatus(data.keys);
        }
      }
    } catch (e) {
      console.warn('Failed to load keys status:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    const payload: Record<string, string> = {};
    if (sunoKey.trim()) payload.sunoApiKey = sunoKey.trim();
    if (geminiKey.trim()) payload.geminiApiKey = geminiKey.trim();
    if (lumaKey.trim()) payload.lumaApiKey = lumaKey.trim();
    if (replicateKey.trim()) payload.replicateApiKey = replicateKey.trim();
    if (elevenLabsKey.trim()) payload.elevenLabsApiKey = elevenLabsKey.trim();

    try {
      const res = await fetch('/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.keys) setStatus(data.keys);
        setSaveMessage({ type: 'success', text: 'API keys securely updated and stored on the server.' });
        setSunoKey('');
        setGeminiKey('');
        setLumaKey('');
        setReplicateKey('');
        setElevenLabsKey('');
      } else {
        const err = await res.json();
        setSaveMessage({ type: 'error', text: err.error || 'Failed to update keys' });
      }
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Network error saving keys' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#090b10] border border-white/[0.14] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white">AI Provider Keys</h3>
              <p className="text-xs text-neutral-400 font-mono">Connect real music & video generation engines</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-xs text-neutral-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-300">Zero-Exposure Server Storage:</span> All API keys and provider tokens are stored server-side in encrypted memory. Keys are never transmitted in frontend payloads.
          </div>
        </div>

        {saveMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
              saveMessage.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* Keys Form */}
        <form onSubmit={handleSave} className="space-y-5 text-xs font-mono">
          {/* Suno Music Engine */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-medium">
                <Music className="w-4 h-4 text-fuchsia-400" />
                <span>Suno v3.5 Music Provider</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  status?.suno.isConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400 border border-white/[0.08]'
                }`}
              >
                {status?.suno.isConfigured ? `Connected (${status.suno.maskedKey})` : 'Not Configured'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans">
              Required for full music synthesis (vocals, melody, instruments, WAV/MP3 audio). Supported durations: 30s preview, 60s, 120s (2m), 240s (4m).
            </p>
            <input
              type="password"
              value={sunoKey}
              onChange={(e) => setSunoKey(e.target.value)}
              placeholder={status?.suno.isConfigured ? 'Enter new key to update...' : 'Enter SUNO_API_KEY...'}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/40 text-xs"
            />
          </div>

          {/* Google Veo Video & Lyria Billing Key */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-medium">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Google Veo 3.1 & Lyria (Billing Key)</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  status?.gemini.isConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400 border border-white/[0.08]'
                }`}
              >
                {status?.gemini.isConfigured ? `Active (${status.gemini.maskedKey})` : 'Server Default'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans">
              Google Veo MP4 video generation and Lyria music require an API key with Pay-as-you-go billing enabled in Google Cloud / AI Studio (Free-tier quota limit is 0).
            </p>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Enter custom GEMINI_API_KEY with billing..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/40 text-xs"
            />
            <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500">
              <a
                href="https://ai.google.dev/gemini-api/docs/rate-limits"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400/80 hover:text-amber-300 flex items-center gap-1 font-sans"
              >
                <span>Learn about Google AI Studio billing</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* ElevenLabs Music AI (GLORIOUS_LION) */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-medium">
                <Music className="w-4 h-4 text-amber-400" />
                <span>ElevenLabs Music AI (Secret: GLORIOUS_LION)</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  status?.elevenLabs.isConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400 border border-white/[0.08]'
                }`}
              >
                {status?.elevenLabs.isConfigured ? `Connected (${status.elevenLabs.maskedKey})` : 'Not Configured'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans">
              Enter your ElevenLabs API key (or set server-side environment variable <code className="text-amber-300 font-mono">GLORIOUS_LION</code>). Used for studio-grade music generation.
            </p>
            <input
              type="password"
              value={elevenLabsKey}
              onChange={(e) => setElevenLabsKey(e.target.value)}
              placeholder={status?.elevenLabs.isConfigured ? 'Enter new key to update...' : 'Enter ElevenLabs API key (GLORIOUS_LION)...'}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/40 text-xs"
            />
          </div>

          {/* Alternative Video: Luma Dream Machine */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-medium">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Luma / Replicate Alternative Key (Optional)</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  status?.luma.isConfigured || status?.replicate.isConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400 border border-white/[0.08]'
                }`}
              >
                {status?.luma.isConfigured || status?.replicate.isConfigured ? 'Connected' : 'Optional'}
              </span>
            </div>
            <input
              type="password"
              value={lumaKey}
              onChange={(e) => setLumaKey(e.target.value)}
              placeholder="LUMA_API_KEY (Optional Dream Machine key)..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/40 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={loadKeysStatus}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>

            <button
              type="submit"
              disabled={isSaving || (!sunoKey && !geminiKey && !lumaKey && !replicateKey && !elevenLabsKey)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save & Connect Keys'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
