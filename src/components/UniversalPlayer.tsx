import React, { useState } from 'react';
import {
  Download,
  HardDrive,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Gauge,
  Sliders,
  Share2,
  Plus,
  Check,
  Headphones,
  Tv,
  WifiOff,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { YouTubeVideo, ResolutionOption } from '../types/youtube';

interface UniversalPlayerProps {
  video: YouTubeVideo;
  onOpenDownloadModal: (video: YouTubeVideo, preselectedQuality?: ResolutionOption) => void;
  onAddToQueue: (video: YouTubeVideo) => void;
  offlineMode: boolean;
  isInQueue?: boolean;
}

export const UniversalPlayer: React.FC<UniversalPlayerProps> = ({
  video,
  onOpenDownloadModal,
  onAddToQueue,
  offlineMode,
  isInQueue = false,
}) => {
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080p 60fps (Full HD)');
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const speedOptions = ['0.5x', '0.75x', '1x', '1.25x', '1.5x', '2x'];
  const qualityOptions = [
    { label: '4K Ultra HD (2160p 60fps)', val: '2160p' },
    { label: '2K Quad HD (1440p 60fps)', val: '1440p' },
    { label: '1080p 60fps (Full HD)', val: '1080p' },
    { label: '720p HD (60fps)', val: '720p' },
    { label: '480p Standard (SD)', val: '480p' },
    { label: '360p Data Saver', val: '360p' },
    { label: 'Auto (Best Quality)', val: 'auto' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${video.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className={`w-full transition-all duration-300 ${isTheaterMode ? 'max-w-full' : 'max-w-5xl mx-auto'}`}>
      {/* Offline Alert if in Airplane mode */}
      {offlineMode && (
        <div className="mb-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Airplane Mode Active:</strong> YouTube streaming is paused. Check your <strong>Phone Vault</strong> to play downloaded offline videos without internet.
            </span>
          </div>
        </div>
      )}

      {/* Main Video Frame */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 group">
        {/* Aspect Ratio Box */}
        <div className="relative w-full aspect-video bg-zinc-950 flex items-center justify-center">
          {offlineMode ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                <WifiOff className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-1">Network Connection Disabled</h3>
              <p className="text-xs text-zinc-400 max-w-sm mb-4">
                You are in Airplane Mode. Only videos previously saved to your Phone Storage Vault can be played offline.
              </p>
              <button
                onClick={() => onOpenDownloadModal(video)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-red-600/20"
              >
                <Download className="w-4 h-4" />
                Download This Video To Phone
              </button>
            </div>
          ) : isAudioOnly ? (
            /* Audio Only Visualizer Mode */
            <div className="w-full h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-20 bg-cover bg-center blur-2xl pointer-events-none scale-110"
                style={{ backgroundImage: `url(${video.thumbnail})` }}
              />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/60 mb-4 group-hover:scale-105 transition-transform">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-white font-bold text-base max-w-md text-center line-clamp-1">{video.title}</h4>
                <p className="text-xs text-zinc-400 mt-1">{video.channel}</p>

                {/* Animated Sound Wave Bars */}
                <div className="flex items-center gap-1.5 h-10 mt-6">
                  {[24, 40, 16, 48, 32, 56, 20, 44, 28, 52, 36, 48, 20].map((h, i) => (
                    <span
                      key={i}
                      className="w-1.5 bg-red-500 rounded-full animate-pulse"
                      style={{
                        height: `${h}px`,
                        animationDuration: `${0.6 + (i % 5) * 0.2}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-5 text-[11px] text-zinc-400">
                  <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>Acoustic Audio Mode (Screen & Battery Saver)</span>
                </div>
              </div>
            </div>
          ) : (
            /* YouTube Embedded Player */
            <iframe
              title={video.title}
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Video Player Quick Bar Overlay */}
        <div className="bg-zinc-900/90 backdrop-blur-md px-3.5 py-2.5 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-3">
            {/* Audio Mode Toggle */}
            <button
              onClick={() => setIsAudioOnly(!isAudioOnly)}
              title="Switch to Audio-Only Mode"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                isAudioOnly ? 'bg-red-600 text-white font-semibold' : 'hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>{isAudioOnly ? 'Audio Only ON' : 'Audio Mode'}</span>
            </button>

            {/* Quality Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSpeedMenu(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 hover:bg-zinc-800 rounded-lg text-zinc-300 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-red-400" />
                <span className="font-medium">{selectedQuality}</span>
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-56 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl py-1 z-30 overflow-hidden">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 border-b border-zinc-800 uppercase tracking-wider">
                    Streaming Resolution
                  </div>
                  {qualityOptions.map((q) => (
                    <button
                      key={q.val}
                      onClick={() => {
                        setSelectedQuality(q.label);
                        setShowQualityMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-800 transition-colors ${
                        selectedQuality === q.label ? 'text-red-400 font-semibold bg-zinc-800/50' : 'text-zinc-200'
                      }`}
                    >
                      <span>{q.label}</span>
                      {selectedQuality === q.label && <Check className="w-3.5 h-3.5 text-red-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Speed Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowQualityMenu(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 hover:bg-zinc-800 rounded-lg text-zinc-300 transition-colors"
              >
                <Gauge className="w-3.5 h-3.5 text-zinc-400" />
                <span>{playbackSpeed}</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-32 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl py-1 z-30">
                  <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 border-b border-zinc-800 uppercase tracking-wider">
                    Speed
                  </div>
                  {speedOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setPlaybackSpeed(s);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-800 transition-colors ${
                        playbackSpeed === s ? 'text-red-400 font-semibold' : 'text-zinc-200'
                      }`}
                    >
                      <span>{s}</span>
                      {playbackSpeed === s && <Check className="w-3 h-3 text-red-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theater Mode */}
            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              title={isTheaterMode ? 'Standard Mode' : 'Theater Cinema Mode'}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors hidden sm:block"
            >
              {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
            </button>

            {/* External YouTube Link */}
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open on YouTube"
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Video Header & Primary Action Toolbar */}
      <div className="mt-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {video.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2 flex-wrap">
              <span className="font-medium text-zinc-300">{video.views}</span>
              <span aria-hidden="true">·</span>
              <span>Duration {video.duration}</span>
              <span aria-hidden="true">·</span>
              <span className="text-red-400 font-medium">4K / 1080p Download Available</span>
            </div>
          </div>

          {/* Core Action Buttons: Download to Phone & Offline Vault */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => onOpenDownloadModal(video)}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download to Phone</span>
            </button>

            <button
              onClick={() => onOpenDownloadModal(video, video.resolutions?.[2])}
              title="Save directly to In-App Phone Vault for offline viewing"
              className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-zinc-700 transition-colors"
            >
              <HardDrive className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">Phone Vault</span>
            </button>

            <button
              onClick={() => onAddToQueue(video)}
              disabled={isInQueue}
              className={`p-2.5 rounded-xl border text-xs transition-colors flex items-center justify-center ${
                isInQueue
                  ? 'bg-zinc-800/50 text-zinc-500 border-zinc-800 cursor-not-allowed'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700'
              }`}
              title={isInQueue ? 'Already in Queue' : 'Add to Queue'}
            >
              {isInQueue ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
            </button>

            <button
              onClick={handleCopyLink}
              title="Copy Video URL"
              className="p-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Channel Details & Description */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
              <img
                src={video.channelAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                alt={video.channel}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-zinc-100">{video.channel}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </div>
              <p className="text-xs text-zinc-400">Verified YouTube Creator</p>
            </div>
          </div>
        </div>

        {/* Expandable Description */}
        <div className="mt-3 text-xs text-zinc-300 bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/60">
          <p className={isDescriptionExpanded ? '' : 'line-clamp-2'}>{video.description}</p>
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="mt-1.5 text-red-400 hover:text-red-300 font-semibold text-[11px] block"
          >
            {isDescriptionExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      </div>
    </div>
  );
};
