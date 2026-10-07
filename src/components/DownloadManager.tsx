import React, { useState } from 'react';
import {
  Download,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  X,
  HardDrive,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { DownloadTask } from '../types/youtube';

interface DownloadManagerProps {
  tasks: DownloadTask[];
  onCancelTask: (taskId: string) => void;
  onOpenVault: () => void;
}

export const DownloadManager: React.FC<DownloadManagerProps> = ({
  tasks,
  onCancelTask,
  onOpenVault,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (tasks.length === 0) return null;

  const activeTasks = tasks.filter((t) => t.status === 'downloading');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full animate-slide-up">
      <div className="bg-zinc-900/95 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Header Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 bg-zinc-950 flex items-center justify-between cursor-pointer border-b border-zinc-800"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${activeTasks.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-xs font-bold text-white tracking-tight">
              {activeTasks.length > 0
                ? `Downloading (${activeTasks.length})`
                : `Downloads (${completedTasks.length} Completed)`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-zinc-400 hover:text-white p-1">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Top Active Task Preview (always visible if not expanded) */}
        {!isExpanded && activeTasks.length > 0 && (
          <div className="p-3">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-semibold text-zinc-200 truncate max-w-[180px]">
                {activeTasks[0].title}
              </span>
              <span className="text-red-400 font-bold">{activeTasks[0].progress}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-200"
                style={{ width: `${activeTasks[0].progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
              <span>{activeTasks[0].speed}</span>
              <span>
                {activeTasks[0].downloadedMb} / {activeTasks[0].fileSizeMb} MB
              </span>
            </div>
          </div>
        )}

        {/* Expanded Tasks List */}
        {isExpanded && (
          <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800 p-2 space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-white truncate text-xs">{task.title}</h5>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                      <span className="text-red-400 font-medium">{task.qualityLabel}</span>
                      <span>·</span>
                      <span>{task.fileSizeMb} MB</span>
                    </div>
                  </div>

                  {task.status === 'downloading' ? (
                    <button
                      onClick={() => onCancelTask(task.id)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                      title="Cancel download"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>

                {/* Progress bar */}
                {task.status === 'downloading' ? (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 transition-all duration-200"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                      <span>Speed: {task.speed}</span>
                      <span>{task.progress}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      {task.targetStorage === 'phone-downloads' ? (
                        <>
                          <Smartphone className="w-3 h-3" />
                          <span>Saved to Phone Downloads</span>
                        </>
                      ) : (
                        <>
                          <HardDrive className="w-3 h-3" />
                          <span>Saved to In-App Vault</span>
                        </>
                      )}
                    </span>
                    <button
                      onClick={onOpenVault}
                      className="text-red-400 hover:text-red-300 font-semibold text-[10px]"
                    >
                      View in Vault →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
