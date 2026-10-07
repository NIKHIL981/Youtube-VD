import React from 'react';
import {
  Layers,
  Play,
  Trash2,
  X,
  Download,
  ListPlus,
  ArrowRight,
} from 'lucide-react';
import { YouTubeVideo } from '../types/youtube';

interface QueueDrawerProps {
  queue: YouTubeVideo[];
  currentVideoId?: string;
  onSelectVideo: (video: YouTubeVideo) => void;
  onRemoveFromQueue: (videoId: string) => void;
  onClearQueue: () => void;
  onDownloadAll: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  queue,
  currentVideoId,
  onSelectVideo,
  onRemoveFromQueue,
  onClearQueue,
  onDownloadAll,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Playback Queue</h2>
              <p className="text-xs text-zinc-400">
                {queue.length} {queue.length === 1 ? 'Video' : 'Videos'} queued for continuous streaming
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <>
                <button
                  onClick={onDownloadAll}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Queue</span>
                </button>
                <button
                  onClick={onClearQueue}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium border border-zinc-700 transition-colors"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-3xl p-12 text-center">
          <ListPlus className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-200 mb-1">Queue is Empty</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Click the "+" icon on any video card to add videos to your continuous playback queue.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {queue.map((item, index) => {
            const isPlaying = item.id === currentVideoId;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  isPlaying
                    ? 'bg-red-950/20 border-red-500/50'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span className="text-xs font-mono font-bold text-zinc-500 w-5 text-center">
                  {index + 1}
                </span>

                {/* Thumbnail */}
                <div
                  onClick={() => onSelectVideo(item)}
                  className="w-20 h-13 rounded-lg overflow-hidden bg-zinc-800 relative cursor-pointer shrink-0 border border-zinc-700/60"
                >
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-white px-1 py-0.2 rounded font-mono">
                    {item.duration}
                  </span>
                </div>

                {/* Title & Info */}
                <div
                  onClick={() => onSelectVideo(item)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <h4 className="text-xs sm:text-sm font-semibold text-white truncate hover:text-red-400">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.channel}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onSelectVideo(item)}
                    className="p-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
                    title="Play now"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <button
                    onClick={() => onRemoveFromQueue(item.id)}
                    className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-800/80 hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
