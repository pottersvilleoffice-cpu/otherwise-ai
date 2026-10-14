import React, { useState } from 'react';
import { AICard } from '../types/ai';
import { LyriaMusicPlayer } from './LyriaMusicPlayer';
import { VeoVideoPlayer } from './VeoVideoPlayer';
import { Sparkles, Share2, Download, Check, ExternalLink, Code, Box, Music, Video, Image as ImageIcon, FileText } from 'lucide-react';

interface AICardComponentProps {
  card: AICard;
  onShareToCommunity?: (card: AICard) => void;
  compact?: boolean;
}

export const AICardComponent: React.FC<AICardComponentProps> = ({
  card,
  onShareToCommunity,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = card.shareUrl || `${window.location.origin}/?card=${card.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (card.mediaUrl && card.mediaUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = card.mediaUrl;
      const ext = card.mediaType === 'audio' ? 'wav' : card.mediaType === 'video' ? 'mp4' : 'png';
      a.download = `${card.title.replace(/\s+/g, '_')}_card.${ext}`;
      a.click();
    } else if (card.content) {
      const blob = new Blob([card.content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${card.title.replace(/\s+/g, '_')}.txt`;
      a.click();
    }
  };

  const getToolIcon = () => {
    switch (card.mediaType) {
      case 'audio':
        return Music;
      case 'video':
        return Video;
      case 'image':
        return ImageIcon;
      case 'code':
        return Code;
      case '3d':
        return Box;
      default:
        return FileText;
    }
  };

  const ToolIcon = getToolIcon();

  return (
    <div className={`group relative rounded-2xl border border-white/[0.12] bg-[#0b0e14]/90 overflow-hidden shadow-2xl transition-all duration-300 hover:border-amber-400/40 ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      {/* Luminescent Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-indigo-500 to-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Header / Creator Info */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-indigo-600 text-black font-bold flex items-center justify-center text-xs shrink-0 shadow-lg">
            {card.creator.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-white truncate group-hover:text-amber-200 transition-colors">
              {card.creator.name}
            </h4>
            <p className="text-[10px] font-mono text-neutral-400 truncate">
              {card.creator.handle} · {new Date(card.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* AI Tool Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono text-amber-300 shrink-0">
          <ToolIcon className="w-3 h-3 text-amber-400" />
          <span>{card.aiTool}</span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-3">
        <h3 className="font-serif text-sm sm:text-base font-bold text-white mb-1 leading-snug">
          {card.title}
        </h3>
        {card.description && (
          <p className="text-xs text-neutral-300 line-clamp-2 font-light">
            {card.description}
          </p>
        )}
      </div>

      {/* Media Rendering */}
      <div className="mb-4 rounded-xl overflow-hidden border border-white/[0.08] bg-black/40">
        {card.mediaType === 'audio' && card.audioData && (
          <LyriaMusicPlayer song={card.audioData} compact={compact} />
        )}

        {card.mediaType === 'video' && card.videoData && (
          <VeoVideoPlayer video={card.videoData} compact={compact} />
        )}

        {card.mediaType === 'image' && (card.mediaUrl || card.imageData?.url) && (
          <div className="relative aspect-video w-full overflow-hidden bg-black/60">
            <img
              src={card.mediaUrl || card.imageData?.url}
              alt={card.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {card.mediaType === 'code' && card.content && (
          <div className="p-3 bg-[#050609] font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-48 scrollbar-thin">
            <pre><code>{card.content.slice(0, 400)}</code></pre>
          </div>
        )}

        {card.mediaType === '3d' && (
          <div className="p-4 bg-gradient-to-br from-indigo-950/40 to-black text-center font-mono text-xs text-cyan-300 flex flex-col items-center justify-center gap-2 min-h-[120px]">
            <Box className="w-8 h-8 text-cyan-400 animate-pulse" />
            <p className="font-semibold">{card.title}</p>
            <p className="text-[10px] text-neutral-400">Interactive 3D Asset Spec · Ready in OTHERWISE Studio</p>
          </div>
        )}
      </div>

      {/* Footer / Meta & Actions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-neutral-400">
        <div className="flex items-center gap-1.5 truncate">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="truncate">Req: {card.requestId}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            title="Copy Card Share Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
            {!compact && <span>{copied ? 'Copied' : 'Link'}</span>}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            title="Download Card Asset"
          >
            <Download className="w-3.5 h-3.5" />
            {!compact && <span>Download</span>}
          </button>

          {onShareToCommunity && (
            <button
              onClick={() => onShareToCommunity(card)}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-black font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Share2 className="w-3 h-3" />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
