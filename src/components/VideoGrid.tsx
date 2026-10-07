import React from 'react';
import {
  Play,
  Download,
  Plus,
  Check,
  Flame,
  Radio,
  Code,
  Music,
  Compass,
  Film,
  Sparkles,
} from 'lucide-react';
import { YouTubeVideo } from '../types/youtube';

interface VideoGridProps {
  videos: YouTubeVideo[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectVideo: (video: YouTubeVideo) => void;
  onOpenDownloadModal: (video: YouTubeVideo) => void;
  onAddToQueue: (video: YouTubeVideo) => void;
  queueVideoIds: string[];
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  selectedCategory,
  onSelectCategory,
  onSelectVideo,
  onOpenDownloadModal,
  onAddToQueue,
  queueVideoIds,
}) => {
  const categories = [
    { label: 'All', icon: Compass },
    { label: 'Trending', icon: Flame },
    { label: 'Nature & 4K', icon: Sparkles },
    { label: 'Music', icon: Music },
    { label: 'Tech & Code', icon: Code },
    { label: 'Lofi & Study', icon: Radio },
    { label: 'Science', icon: Film },
  ];

  return (
    <div className="w-full">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.label;
          return (
            <button
              key={cat.label}
              onClick={() => onSelectCategory(cat.label)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((v) => {
          const isInQueue = queueVideoIds.includes(v.id);
          return (
            <div
              key={v.id}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-xl transition-all flex flex-col group"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer" onClick={() => onSelectVideo(v)}>
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] text-white px-1.5 py-0.5 rounded font-mono font-medium backdrop-blur-xs">
                  {v.duration}
                </div>

                {/* 4K Resolution Pill */}
                <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  4K / FHD
                </div>

                {/* Hover Play Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Video Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                      <img
                        src={v.channelAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                        alt={v.channel}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        onClick={() => onSelectVideo(v)}
                        className="text-sm font-bold text-white hover:text-red-400 cursor-pointer line-clamp-2 leading-snug transition-colors"
                      >
                        {v.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 truncate">{v.channel}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-1">
                        <span>{v.views}</span>
                        <span>·</span>
                        <span className="text-zinc-400">{v.category}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-zinc-800/70 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectVideo(v)}
                    className="flex-1 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-zinc-700/60"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Now</span>
                  </button>

                  <button
                    onClick={() => onOpenDownloadModal(v)}
                    className="py-1.5 px-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 hover:border-transparent rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    title="Download this video to phone storage"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => onAddToQueue(v)}
                    disabled={isInQueue}
                    title={isInQueue ? 'Added to queue' : 'Add to queue'}
                    className={`p-2 rounded-xl border text-xs transition-colors ${
                      isInQueue
                        ? 'bg-zinc-800/40 text-zinc-500 border-zinc-800'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {isInQueue ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
