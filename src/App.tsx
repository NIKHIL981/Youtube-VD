import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { UniversalPlayer } from './components/UniversalPlayer';
import { DownloadModal } from './components/DownloadModal';
import { OfflineVaultView } from './components/OfflineVaultView';
import { VideoGrid } from './components/VideoGrid';
import { DownloadManager } from './components/DownloadManager';
import { QueueDrawer } from './components/QueueDrawer';
import { YouTubeVideo, ResolutionOption, StoredOfflineVideo, DownloadTask, StorageQuotaInfo } from './types/youtube';
import {
  getAllVaultVideos,
  getStorageQuotaInfo,
  deleteVaultVideo,
  clearAllVaultVideos,
} from './services/indexedDbService';
import { executeDownloadTask } from './services/downloadEngine';
import {
  Sparkles,
  WifiOff,
  Flame,
  Search,
  CheckCircle,
  AlertCircle,
  HardDrive,
  Download,
} from 'lucide-react';

const INITIAL_VIDEO_ID = 'LXb3EKWsInQ'; // Costa Rica in 4K 60fps HDR

export default function App() {
  const [activeTab, setActiveTab] = useState<'browse' | 'vault' | 'queue'>('browse');
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [catalogVideos, setCatalogVideos] = useState<YouTubeVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vaultVideos, setVaultVideos] = useState<StoredOfflineVideo[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageQuotaInfo | null>(null);
  const [queue, setQueue] = useState<YouTubeVideo[]>([]);
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [modalVideo, setModalVideo] = useState<YouTubeVideo | null>(null);
  const [modalPreselectedRes, setModalPreselectedRes] = useState<ResolutionOption | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Cancellation refs map
  const cancelTokens = useRef<{ [taskId: string]: { current: boolean } }>({});

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Load: Stored Videos & Quota
  useEffect(() => {
    refreshVault();
    loadVideoDetails(INITIAL_VIDEO_ID);
    loadCatalog('All');
  }, []);

  const refreshVault = async () => {
    try {
      const stored = await getAllVaultVideos();
      setVaultVideos(stored);
      const quota = await getStorageQuotaInfo();
      setStorageInfo(quota);
    } catch (err) {
      console.error('Failed to load vault data:', err);
    }
  };

  // 2. Load Single Video with Resolutions
  const loadVideoDetails = async (urlOrId: string) => {
    try {
      const res = await fetch(`/api/youtube/info?url=${encodeURIComponent(urlOrId)}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentVideo(data);
        return data;
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to fetch video details', 'error');
      }
    } catch {
      // Fallback
    }
  };

  // 3. Load Catalog / Search
  const loadCatalog = async (category: string, query: string = '') => {
    try {
      const url = `/api/youtube/search?category=${encodeURIComponent(category)}&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCatalogVideos(data.results || []);
      }
    } catch {
      // Fallback
    }
  };

  // 4. Handle Search or URL Input
  const handleSearchOrUrl = async (input: string) => {
    // Check if it's a URL or direct YouTube ID
    const isUrl = input.includes('youtube.com') || input.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(input.trim());
    if (isUrl) {
      showToast('Resolving YouTube video & analyzing resolutions...', 'info');
      const loaded = await loadVideoDetails(input);
      if (loaded) {
        setActiveTab('browse');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast(`Loaded: ${loaded.title}`, 'success');
      }
    } else {
      // Search
      loadCatalog(selectedCategory, input);
      setActiveTab('browse');
    }
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    loadCatalog(cat);
  };

  const handleSelectVideo = async (video: YouTubeVideo) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await loadVideoDetails(video.id);
  };

  // 5. Download Trigger Handler
  const handleOpenDownloadModal = (video: YouTubeVideo, preselected?: ResolutionOption) => {
    setModalVideo(video);
    setModalPreselectedRes(preselected);
    setIsDownloadModalOpen(true);
  };

  const handleStartDownload = async (
    video: YouTubeVideo,
    resolution: ResolutionOption,
    targetStorage: 'phone-downloads' | 'offline-vault'
  ) => {
    const isCancel = { current: false };

    showToast(`Downloading "${video.title.substring(0, 30)}..." in ${resolution.label}`, 'info');

    try {
      const result = await executeDownloadTask(
        video,
        resolution,
        targetStorage,
        (taskUpdate) => {
          setTasks((prev) => {
            const index = prev.findIndex((t) => t.id === taskUpdate.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = taskUpdate;
              return updated;
            } else {
              return [taskUpdate, ...prev];
            }
          });
        },
        isCancel
      );

      if (result) {
        await refreshVault();
        const destName = targetStorage === 'phone-downloads' ? 'Phone Files' : 'Phone Storage Vault';
        showToast(`Saved to ${destName} in ${resolution.qualityBadge}! Available for offline viewing.`, 'success');
      }
    } catch (err) {
      console.error('Download error:', err);
      showToast('Download interrupted. Please try again.', 'error');
    }
  };

  const handleCancelTask = (taskId: string) => {
    if (cancelTokens.current[taskId]) {
      cancelTokens.current[taskId].current = true;
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Download cancelled', 'info');
  };

  // 6. Queue Handlers
  const handleAddToQueue = (video: YouTubeVideo) => {
    if (!queue.some((item) => item.id === video.id)) {
      setQueue((prev) => [...prev, video]);
      showToast(`Added "${video.title.substring(0, 25)}..." to queue`, 'success');
    }
  };

  const handleRemoveFromQueue = (videoId: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== videoId));
  };

  const handleClearQueue = () => {
    setQueue([]);
    showToast('Queue cleared', 'info');
  };

  const handleDownloadAllQueue = async () => {
    if (queue.length === 0) return;
    showToast(`Queuing ${queue.length} videos for offline phone download...`, 'info');
    for (const v of queue) {
      const details = await loadVideoDetails(v.id);
      if (details?.resolutions?.[2]) {
        handleStartDownload(details, details.resolutions[2], 'offline-vault');
      }
    }
  };

  // 7. Vault Deletions
  const handleDeleteVaultVideo = async (id: string) => {
    await deleteVaultVideo(id);
    await refreshVault();
    showToast('Video removed from phone storage', 'info');
  };

  const handleClearAllVault = async () => {
    if (window.confirm('Delete all offline videos from phone memory?')) {
      await clearAllVaultVideos();
      await refreshVault();
      showToast('All saved videos removed from phone storage', 'info');
    }
  };

  const activeDownloads = tasks.filter((t) => t.status === 'downloading');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-slide-down border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600/90 border-emerald-500 text-white'
              : toastMessage.type === 'error'
              ? 'bg-rose-600/90 border-rose-500 text-white'
              : 'bg-zinc-800/95 border-zinc-700 text-zinc-100'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-200 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearchOrUrl={handleSearchOrUrl}
        storageInfo={storageInfo}
        offlineMode={offlineMode}
        setOfflineMode={setOfflineMode}
        activeDownloadsCount={activeDownloads.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        {activeTab === 'browse' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
            {/* Featured Active Player */}
            {currentVideo && (
              <UniversalPlayer
                video={currentVideo}
                onOpenDownloadModal={handleOpenDownloadModal}
                onAddToQueue={handleAddToQueue}
                offlineMode={offlineMode}
                isInQueue={queue.some((q) => q.id === currentVideo.id)}
              />
            )}

            {/* Quick Link Pasting Hero Box */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Paste Any YouTube Link to Play & Download</h3>
                  <p className="text-xs text-zinc-400">
                    Supports 4K, 1440p, 1080p, 720p, 480p, 360p & MP3 directly to your phone storage
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => {
                    const sampleUrl = 'https://www.youtube.com/watch?v=LXb3EKWsInQ';
                    handleSearchOrUrl(sampleUrl);
                  }}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-700 transition-colors whitespace-nowrap"
                >
                  Test 4K Video Link
                </button>
                <button
                  onClick={() => {
                    const sampleUrl = 'https://www.youtube.com/watch?v=jfKfPfyJRdk';
                    handleSearchOrUrl(sampleUrl);
                  }}
                  className="px-3.5 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold rounded-xl border border-red-500/30 transition-all whitespace-nowrap"
                >
                  Test Lofi Stream
                </button>
              </div>
            </div>

            {/* Video Exploration Catalog */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-bold text-white tracking-tight">Explore & Discover</h2>
                </div>
                <span className="text-xs text-zinc-400">Select any video to play or download</span>
              </div>

              <VideoGrid
                videos={catalogVideos}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                onSelectVideo={handleSelectVideo}
                onOpenDownloadModal={handleOpenDownloadModal}
                onAddToQueue={handleAddToQueue}
                queueVideoIds={queue.map((q) => q.id)}
              />
            </div>
          </div>
        )}

        {/* Offline Phone Vault View */}
        {activeTab === 'vault' && (
          <OfflineVaultView
            videos={vaultVideos}
            storageInfo={storageInfo}
            onDeleteVideo={handleDeleteVaultVideo}
            onClearAll={handleClearAllVault}
            offlineMode={offlineMode}
            setOfflineMode={setOfflineMode}
          />
        )}

        {/* Playback Queue View */}
        {activeTab === 'queue' && (
          <QueueDrawer
            queue={queue}
            currentVideoId={currentVideo?.id}
            onSelectVideo={(v) => {
              handleSelectVideo(v);
              setActiveTab('browse');
            }}
            onRemoveFromQueue={handleRemoveFromQueue}
            onClearQueue={handleClearQueue}
            onDownloadAll={handleDownloadAllQueue}
          />
        )}
      </main>

      {/* Floating Active Downloads Indicator */}
      <DownloadManager
        tasks={tasks}
        onCancelTask={handleCancelTask}
        onOpenVault={() => setActiveTab('vault')}
      />

      {/* Modal: Resolution Quality & Storage Destination Picker */}
      <DownloadModal
        video={modalVideo}
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onStartDownload={handleStartDownload}
        storageInfo={storageInfo}
        preselectedQuality={modalPreselectedRes}
      />
    </div>
  );
}
