import React, { useState } from 'react';
import {
  X,
  Download,
  HardDrive,
  CheckCircle2,
  FileVideo,
  Music,
  Smartphone,
  Info,
  Sparkles,
} from 'lucide-react';
import { YouTubeVideo, ResolutionOption, StorageQuotaInfo } from '../types/youtube';

interface DownloadModalProps {
  video: YouTubeVideo | null;
  isOpen: boolean;
  onClose: () => void;
  onStartDownload: (
    video: YouTubeVideo,
    resolution: ResolutionOption,
    targetStorage: 'phone-downloads' | 'offline-vault'
  ) => void;
  storageInfo: StorageQuotaInfo | null;
  preselectedQuality?: ResolutionOption;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  video,
  isOpen,
  onClose,
  onStartDownload,
  storageInfo,
  preselectedQuality,
}) => {
  if (!isOpen || !video) return null;

  const resolutions = video.resolutions || [];
  const videoResolutions = resolutions.filter((r) => r.format === 'MP4');
  const audioResolutions = resolutions.filter((r) => r.format === 'MP3');

  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedResId, setSelectedResId] = useState<string>(
    preselectedQuality?.id || (activeTab === 'video' ? '1080p' : 'audio-320')
  );
  const [targetStorage, setTargetStorage] = useState<'phone-downloads' | 'offline-vault'>('phone-downloads');

  const currentList = activeTab === 'video' ? videoResolutions : audioResolutions;
  const currentSelected =
    currentList.find((r) => r.id === selectedResId) || currentList[0] || resolutions[0];

  const handleDownload = () => {
    if (currentSelected && video) {
      onStartDownload(video, currentSelected, targetStorage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Download to Phone Storage</h2>
              <p className="text-[11px] text-zinc-400">Select any video resolution or audio format for offline viewing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview Snippet */}
        <div className="p-4 bg-zinc-950/40 border-b border-zinc-800/80 flex items-center gap-3">
          <div className="w-20 h-14 rounded-lg overflow-hidden relative shrink-0 bg-zinc-800 border border-zinc-700">
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
            <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1 py-0.2 rounded font-mono">
              {video.duration}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-semibold text-white truncate">{video.title}</h3>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">{video.channel}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
              <span className="text-red-400 font-medium">Available in 4K & FHD</span>
              <span aria-hidden="true">·</span>
              <span>Direct offline export</span>
            </div>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-zinc-800/60 bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
            <button
              onClick={() => {
                setActiveTab('video');
                setSelectedResId('1080p');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'video'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileVideo className="w-3.5 h-3.5" />
              <span>Video (MP4)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('audio');
                setSelectedResId('audio-320');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'audio'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Audio Only (MP3)</span>
            </button>
          </div>

          {storageInfo && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-400">
              <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
              <span>Free Phone Storage: <strong>{(storageInfo.freeMb / 1024).toFixed(1)} GB</strong></span>
            </div>
          )}
        </div>

        {/* Resolution Quality List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 custom-scrollbar">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Available {activeTab === 'video' ? 'Video Resolutions' : 'Audio Bitrates'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentList.map((res) => {
              const isSelected = selectedResId === res.id;
              return (
                <div
                  key={res.id}
                  onClick={() => setSelectedResId(res.id)}
                  className={`relative p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-950/30 border-red-500 shadow-md ring-1 ring-red-500/50'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950/90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-white">{res.label}</span>
                        {res.recommended && (
                          <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-red-500/30">
                            Recommended
                          </span>
                        )}
                        {res.hdr && (
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                            HDR
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {res.resolution} · {res.fps} · {res.codec}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-zinc-100">~{res.estimatedSizeMb} MB</span>
                      <p className="text-[10px] text-zinc-400">{res.bitrate}</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400">{res.tag}</span>
                    {isSelected && (
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Phone Storage Destination Options */}
          <div className="mt-4 pt-3 border-t border-zinc-800">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Save Location on Your Device
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Option A: Direct Device Download */}
              <div
                onClick={() => setTargetStorage('phone-downloads')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  targetStorage === 'phone-downloads'
                    ? 'bg-zinc-800/90 border-red-500 ring-1 ring-red-500/40'
                    : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Phone Storage / Downloads</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Saves file to phone Files, Downloads & Gallery for any media player.
                  </p>
                </div>
              </div>

              {/* Option B: Offline Vault */}
              <div
                onClick={() => setTargetStorage('offline-vault')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  targetStorage === 'offline-vault'
                    ? 'bg-zinc-800/90 border-red-500 ring-1 ring-red-500/40'
                    : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <HardDrive className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">In-App Phone Vault</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    100% offline playback in TubeVault with zero data or wifi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Download Action */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Format: <strong>.{currentSelected?.format.toLowerCase()}</strong> ({currentSelected?.label})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-600/25 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>
                Download Now (~{currentSelected?.estimatedSizeMb} MB)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
