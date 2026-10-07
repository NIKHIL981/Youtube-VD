import React, { useState } from 'react';
import {
  HardDrive,
  Trash2,
  Play,
  Download,
  Share2,
  FileVideo,
  Music,
  CheckCircle,
  WifiOff,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Maximize,
  Sparkles,
} from 'lucide-react';
import { StoredOfflineVideo, StorageQuotaInfo } from '../types/youtube';
import { triggerDirectPhoneDownload } from '../services/indexedDbService';

interface OfflineVaultViewProps {
  videos: StoredOfflineVideo[];
  storageInfo: StorageQuotaInfo | null;
  onDeleteVideo: (id: string) => void;
  onClearAll: () => void;
  offlineMode: boolean;
  setOfflineMode: (offline: boolean) => void;
}

export const OfflineVaultView: React.FC<OfflineVaultViewProps> = ({
  videos,
  storageInfo,
  onDeleteVideo,
  onClearAll,
  offlineMode,
  setOfflineMode,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'audio'>('all');
  const [playingVideo, setPlayingVideo] = useState<StoredOfflineVideo | null>(null);
  const [exportedNotice, setExportedNotice] = useState<string | null>(null);

  const filteredVideos = videos.filter((v) => {
    if (activeFilter === 'video') return v.format === 'MP4';
    if (activeFilter === 'audio') return v.format === 'MP3';
    return true;
  });

  const handleExportToFile = (v: StoredOfflineVideo) => {
    if (v.blob) {
      const ext = v.format.toLowerCase();
      const cleanTitle = v.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().substring(0, 45) || 'video';
      const filename = `${cleanTitle}_offline.${ext}`;
      triggerDirectPhoneDownload(v.blob, filename);
      setExportedNotice(`Exported "${cleanTitle}" to Phone Downloads`);
      setTimeout(() => setExportedNotice(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Export Notification Toast */}
      {exportedNotice && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{exportedNotice}</span>
        </div>
      )}

      {/* Top Header Card & Phone Storage Meter */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Phone Storage Vault</h1>
                <span className="text-[11px] font-semibold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                  {videos.length} Saved {videos.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Saved offline on this phone. Watch anytime without internet or cellular data.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setOfflineMode(!offlineMode)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                offlineMode
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              <WifiOff className="w-4 h-4" />
              <span>{offlineMode ? 'Airplane Mode ON' : 'Test Airplane Mode'}</span>
            </button>

            {videos.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Vault</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Phone Storage Meter */}
        {storageInfo && (
          <div className="mt-5 pt-4 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-200">Device Storage Usage</span>
                <span>·</span>
                <span className="text-red-400 font-medium">TubeVault: {storageInfo.tubeVaultSizeMb} MB</span>
              </div>
              <span className="text-zinc-300">
                <strong>{(storageInfo.freeMb / 1024).toFixed(1)} GB Free</strong> of {(storageInfo.quotaMb / 1024).toFixed(0)} GB
              </span>
            </div>

            {/* Meter Bar */}
            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${Math.max(2, Math.min(100, (storageInfo.tubeVaultSizeMb / storageInfo.quotaMb) * 100))}%` }}
                title={`TubeVault: ${storageInfo.tubeVaultSizeMb} MB`}
              />
              <div
                className="h-full bg-zinc-600 transition-all duration-500"
                style={{ width: `${Math.max(5, Math.min(95, storageInfo.percentageUsed))}%` }}
                title="Other Phone Apps"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>TubeVault Offline Videos</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-600" />
                  <span>Other Phone Apps</span>
                </span>
              </div>
              <span className="text-emerald-400 font-medium">Storage Healthy</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'all' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Items ({videos.length})
          </button>
          <button
            onClick={() => setActiveFilter('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeFilter === 'video' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileVideo className="w-3.5 h-3.5" />
            <span>Videos ({videos.filter((v) => v.format === 'MP4').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('audio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeFilter === 'audio' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Audio MP3 ({videos.filter((v) => v.format === 'MP3').length})</span>
          </button>
        </div>

        {offlineMode && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Airplane Mode active: Playing strictly from Phone Storage memory</span>
          </div>
        )}
      </div>

      {/* Videos List */}
      {filteredVideos.length === 0 ? (
        <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
            <HardDrive className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-base font-bold text-zinc-200 mb-1">No Offline Videos in Phone Vault</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-5">
            Download any YouTube video in 4K, 1080p, 720p, or MP3 to save it directly into phone memory for offline viewing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col group shadow-lg"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    {item.qualityLabel}
                  </span>
                  <span className="bg-black/70 text-zinc-200 text-[10px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-sm">
                    {item.format}
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] text-white px-1.5 py-0.5 rounded font-mono">
                  {item.duration}
                </div>

                {/* Quick Play Overlay */}
                <button
                  onClick={() => setPlayingVideo(item)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </button>
              </div>

              {/* Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">{item.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{item.channel}</p>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-2">
                    <span className="text-zinc-300 font-medium">{item.fileSizeMb} MB</span>
                    <span>·</span>
                    <span>{item.resolution}</span>
                    <span>·</span>
                    <span>{new Date(item.savedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPlayingVideo(item)}
                    className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Offline</span>
                  </button>

                  <button
                    onClick={() => handleExportToFile(item)}
                    title="Export file to Phone Downloads"
                    className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteVideo(item.id)}
                    title="Delete from phone storage"
                    className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-800 hover:bg-red-500/10 rounded-xl border border-zinc-700 hover:border-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Built-in Offline Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-tight">Offline Phone Memory Player</span>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-mono">
                  {playingVideo.qualityLabel}
                </span>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {playingVideo.format === 'MP4' ? (
                <video
                  src={playingVideo.blobUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-zinc-900">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl mb-4 border border-zinc-700">
                    <img src={playingVideo.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-white font-bold text-base mb-1">{playingVideo.title}</h4>
                  <p className="text-xs text-zinc-400 mb-6">{playingVideo.channel}</p>
                  <audio src={playingVideo.blobUrl} controls autoPlay className="w-full max-w-md" />
                </div>
              )}
            </div>

            {/* Bottom info */}
            <div className="p-4 bg-zinc-900 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">{playingVideo.title}</h3>
                <p className="text-xs text-zinc-400">{playingVideo.channel} · {playingVideo.fileSizeMb} MB</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportToFile(playingVideo)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save to Phone Files</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
