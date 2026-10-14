import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Bookmark,
  Sparkles,
  Film,
  Layers,
  Sliders,
  Share2,
  Check,
  Clapperboard,
  Tv,
} from 'lucide-react';
import { GeneratedVideo, StoryboardScene } from '../types/ai';

interface VeoVideoPlayerProps {
  video: GeneratedVideo;
  onSave?: () => void;
  isSaved?: boolean;
  compact?: boolean;
}

export const VeoVideoPlayer: React.FC<VeoVideoPlayerProps> = ({
  video,
  onSave,
  isSaved = false,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 5);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(true);
  const [activeTab, setActiveTab] = useState<'video' | 'storyboard' | 'spec'>('video');
  const [copied, setCopied] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isDataUrlVideo = Boolean(video.url && (video.url.startsWith('data:video/') || video.url.startsWith('blob:') || video.url.startsWith('http')));

  // Handle Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Update volume on video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Update playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (isDataUrlVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleDownload = () => {
    if (isDataUrlVideo && video.url) {
      const a = document.createElement('a');
      a.href = video.url;
      a.download = `${(video.title || 'veo_video').toLowerCase().replace(/\s+/g, '_')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (video.storyboard) {
      const spec = JSON.stringify(
        {
          title: video.title,
          prompt: video.prompt,
          model: video.model || 'Google Veo 3.1',
          duration: video.duration,
          aspectRatio: video.aspectRatio,
          resolution: video.resolution,
          cameraMovement: video.cameraMovement,
          visualStyle: video.visualStyle,
          storyboard: video.storyboard,
        },
        null,
        2
      );
      const blob = new Blob([spec], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(video.title || 'storyboard').toLowerCase().replace(/\s+/g, '_')}_spec.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this video generated with OTHERWISE & Google Veo 3.1: "${video.prompt}"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full rounded-3xl border border-white/[0.1] bg-[#07090e] shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 border-b border-white/[0.08] bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-amber-300 font-bold tracking-wider">
                {video.model || 'GOOGLE VEO 2.0'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-neutral-400">
                {video.aspectRatio || '16:9'} · {video.duration || 5}s · MP4
              </span>
            </div>
            <h4 className="font-serif text-sm font-semibold text-white truncate max-w-sm sm:max-w-md">
              {video.title || video.prompt?.slice(0, 45) || 'Generated AI Video'}
            </h4>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
              activeTab === 'video'
                ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Video
          </button>
          {video.storyboard && video.storyboard.length > 0 && (
            <button
              onClick={() => setActiveTab('storyboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                activeTab === 'storyboard'
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Storyboard
            </button>
          )}
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Download MP4 Video"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Share Video"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'video' && (
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
          {/* Real Video Element if video URL exists */}
          {isDataUrlVideo ? (
            <>
              <video
                ref={videoRef}
                src={video.url}
                loop={isLooping}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => !isLooping && setIsPlaying(false)}
                onClick={togglePlay}
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* Big Center Play Overlay when paused */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-2xl backdrop-blur-md cursor-pointer z-10"
                >
                  <Play className="w-7 h-7 text-amber-300 ml-1" />
                </button>
              )}

              {/* Bottom Floating Video Control Bar */}
              <div
                className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
                  showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                } z-20`}
              >
                {/* Scrubber Progress Slider */}
                <div className="mb-2.5 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max={duration || 6}
                    step="0.05"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:h-2 transition-all"
                  />
                </div>

                {/* Bottom Controls Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-amber-300" />}
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTime(0);
                        if (videoRef.current) videoRef.current.currentTime = 0;
                      }}
                      className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Replay from start"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Timestamp */}
                    <span className="text-xs font-mono text-neutral-300 select-none">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    {/* Volume & Mute */}
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 text-neutral-400 hover:text-white cursor-pointer"
                      >
                        {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          setIsMuted(false);
                        }}
                        className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
                      className="px-2 py-1 rounded bg-white/10 text-[10px] font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {playbackSpeed}x
                    </button>

                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                        isLooping ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30' : 'text-neutral-400 hover:text-white bg-white/10'
                      }`}
                      title="Toggle Loop"
                    >
                      Loop
                    </button>

                    <button
                      onClick={handleToggleFullscreen}
                      className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-[#07090e] via-[#090d16] to-[#040508] border border-white/[0.06]">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono">
                  <Film className="w-3.5 h-3.5" />
                  <span>Google Veo 3.1 Director Pipeline</span>
                </div>

                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white mb-1.5">
                    {video.title || 'Cinematic Video Production'}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 font-mono">
                    "{video.prompt}"
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <span className="text-neutral-500 block text-[9px]">TARGET DURATION</span>
                    <span className="text-white font-bold">{video.duration || 6}s Native</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <span className="text-neutral-500 block text-[9px]">ASPECT RATIO</span>
                    <span className="text-white font-bold">{video.aspectRatio || '16:9'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <span className="text-neutral-500 block text-[9px]">RESOLUTION</span>
                    <span className="text-white font-bold">{video.resolution || '720p HD'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <span className="text-neutral-500 block text-[9px]">STORYBOARD</span>
                    <span className="text-white font-bold">{video.storyboard?.length || 4} Scenes</span>
                  </div>
                </div>
              </div>

              {/* Status & Actions Footer */}
              <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-mono text-amber-300/90 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {video.requiresBilling
                      ? 'Veo 3.1 MP4 render requires Google AI Studio billing quota (429 limit).'
                      : video.error || 'Storyboard generated strictly to user instructions.'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {video.storyboard && video.storyboard.length > 0 && (
                    <button
                      onClick={() => setActiveTab('storyboard')}
                      className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>View 4 Scenes</span>
                    </button>
                  )}
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-neutral-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Spec</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Storyboard Breakdown Tab */}
      {activeTab === 'storyboard' && video.storyboard && (
        <div className="p-6 max-h-[420px] overflow-y-auto space-y-4">
          <div className="text-xs font-mono uppercase text-amber-300 tracking-wider mb-2">
            CINEMATIC SHOT-BY-SHOT STORYBOARD
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {video.storyboard.map((scene, sIdx) => (
              <div key={sIdx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span className="text-amber-300 font-bold">SCENE {scene.sceneNumber || sIdx + 1}</span>
                  <span>{scene.shotType || 'Medium Shot'}</span>
                </div>
                <p className="text-sm text-white font-medium">{scene.visualAction}</p>
                <div className="text-xs text-neutral-400 space-y-1 font-light pt-1">
                  <div><span className="text-neutral-500 font-mono">Camera:</span> {scene.cameraMovement}</div>
                  <div><span className="text-neutral-500 font-mono">Lighting:</span> {scene.lighting}</div>
                  {scene.dialogueAudio && (
                    <div><span className="text-neutral-500 font-mono">Audio/Foley:</span> {scene.dialogueAudio}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info & Save Action */}
      <div className="px-5 py-3 border-t border-white/[0.08] bg-black/30 flex items-center justify-between text-xs font-mono text-neutral-400">
        <span className="truncate max-w-md font-light">
          Prompt: "{video.prompt}"
        </span>

        {onSave && (
          <button
            onClick={onSave}
            className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved in Creations' : 'Save Video'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
