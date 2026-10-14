import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Bookmark,
  Sparkles,
  Music2,
  Disc3,
  Sliders,
  FileText,
  Radio,
  Share2,
  Check,
} from 'lucide-react';
import { SongData } from '../types/ai';

interface LyriaMusicPlayerProps {
  song: SongData;
  onSave?: () => void;
  onExtend?: (targetDuration: number) => void;
  isSaved?: boolean;
  compact?: boolean;
}

export const LyriaMusicPlayer: React.FC<LyriaMusicPlayerProps> = ({
  song,
  onSave,
  onExtend,
  isSaved = false,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(song.duration || 30);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'lyrics' | 'instruments'>('player');
  const [copied, setCopied] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync duration when audio metadata is loaded
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Visualizer Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 32;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount;

      phase += isPlaying ? 0.08 : 0.01;

      for (let i = 0; i < barCount; i++) {
        // Generate dynamic organic wave heights
        const wave1 = Math.sin(phase + i * 0.25);
        const wave2 = Math.cos(phase * 0.7 + i * 0.15);
        let amplitude = (Math.abs(wave1 * 0.6 + wave2 * 0.4) + 0.15) * height * 0.75;

        if (!isPlaying) {
          amplitude *= 0.25; // Gentle idle pulse
        }

        const x = i * barWidth + barWidth * 0.15;
        const barActualWidth = barWidth * 0.7;
        const y = height - amplitude;

        // Gradient styling
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, 'rgba(217, 70, 239, 0.4)');
        grad.addColorStop(0.5, 'rgba(251, 191, 36, 0.8)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0.9)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barActualWidth, amplitude, [4, 4, 0, 0]);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Playback error:', e);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDownload = () => {
    if (!song.audioUrl) return;
    const a = document.createElement('a');
    a.href = song.audioUrl;
    a.download = `${song.title.toLowerCase().replace(/\s+/g, '_')}_lyria.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out "${song.title}" created with OTHERWISE & Lyria 3.5`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-3xl border border-white/[0.14] bg-[#090b10] shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-fuchsia-600/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hidden Audio Element */}
      {song.audioUrl && (
        <audio
          ref={audioRef}
          src={song.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={(e) => {
            const d = (e.target as HTMLAudioElement).duration;
            if (d && !isNaN(d)) setDuration(d);
          }}
        />
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-[10px] font-mono text-fuchsia-300 uppercase tracking-widest font-semibold">
              <Disc3 className={`w-3 h-3 ${isPlaying ? 'animate-spin' : ''}`} />
              GOOGLE LYRIA 3.5 MUSIC ENGINE
            </span>
            <span className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono text-amber-300">
              {song.bpm} BPM
            </span>
            {(song.isPreview || (song.duration && song.duration <= 30)) ? (
              <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-[10px] font-mono text-amber-300 font-semibold">
                PREVIEW ({song.duration || 30}s)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-semibold">
                FULL TRACK ({song.duration || 60}s)
              </span>
            )}
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-wide">
            {song.title}
          </h3>
          <p className="text-xs font-mono text-neutral-400">
            {song.genre} · {song.mood} · {song.vocalStyle}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onExtend && (song.isPreview || (song.duration && song.duration <= 30)) && (
            <button
              onClick={() => onExtend(60)}
              title="Extend track to 60s"
              className="px-3 py-1.5 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/40 text-xs font-mono text-fuchsia-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Extend Track (60s)</span>
            </button>
          )}
          {song.audioUrl && (
            <button
              onClick={handleDownload}
              title="Download Audio File"
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleShare}
            title="Share Song Link"
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          {onSave && (
            <button
              onClick={onSave}
              className="px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-xs font-mono text-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved' : 'Save Track'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('player')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'player'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>MUSIC PLAYER</span>
        </button>
        <button
          onClick={() => setActiveTab('lyrics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'lyrics'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>LYRICS & ARRANGEMENT</span>
        </button>
        <button
          onClick={() => setActiveTab('instruments')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'instruments'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>INSTRUMENTS & MIX</span>
        </button>
      </div>

      {/* Tab 1: Interactive Music Player */}
      {activeTab === 'player' && (
        <div className="space-y-6">
          {/* Animated Waveform Visualizer */}
          <div className="relative w-full h-28 sm:h-36 rounded-2xl bg-[#06070a] border border-white/[0.08] overflow-hidden p-4 flex flex-col justify-end">
            <canvas
              ref={canvasRef}
              width={600}
              height={120}
              className="w-full h-full object-cover"
            />
            {/* Center Status Badge */}
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                {isPlaying ? 'PLAYING TRACK' : 'READY TO PLAY'}
              </span>
            </div>
          </div>

          {/* Time Scrubber Bar */}
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={duration || 30}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Player Controls Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <button
                onClick={handleRestart}
                title="Restart Track"
                className="p-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="h-14 w-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-neutral-950 font-bold flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.3)] hover:scale-105 transition-transform cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-neutral-950" />
                ) : (
                  <Play className="w-6 h-6 fill-neutral-950 ml-1" />
                )}
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-20 sm:w-28 h-1 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Synced Lyrics & Structure */}
      {activeTab === 'lyrics' && (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
          {song.lyrics && song.lyrics.length > 0 ? (
            song.lyrics.map((sec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2"
              >
                <div className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                  [{sec.section}]
                </div>
                <div className="space-y-1">
                  {sec.lines.map((line, lIdx) => (
                    <p key={lIdx} className="text-sm font-sans text-neutral-200 font-light">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-400 italic">No lyrics provided for this track.</p>
          )}
        </div>
      )}

      {/* Tab 3: Instruments & Mix Notes */}
      {activeTab === 'instruments' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <span className="text-amber-300 font-bold uppercase tracking-wider block">
              INSTRUMENT ARRANGEMENT
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {song.instruments && song.instruments.length > 0 ? (
                song.instruments.map((inst, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.1] text-neutral-200"
                  >
                    {inst}
                  </span>
                ))
              ) : (
                <span className="text-neutral-400">Synthesizers, Bassline, Drum Machine, Lead Melody</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <span className="text-sky-300 font-bold uppercase tracking-wider block">
              LYRIA 3.5 PRODUCTION PROMPT
            </span>
            <p className="text-neutral-300 font-light text-[11px] leading-relaxed">
              {song.musicGenerationPrompt || `${song.genre} track at ${song.bpm} BPM with ${song.mood} atmosphere and rich harmonic layers.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
