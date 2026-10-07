import React, { useState } from 'react';
import {
  Play,
  Download,
  HardDrive,
  Search,
  Clipboard,
  Wifi,
  WifiOff,
  Sparkles,
  Layers,
} from 'lucide-react';
import { StorageQuotaInfo } from '../types/youtube';

interface HeaderProps {
  activeTab: 'browse' | 'vault' | 'queue';
  setActiveTab: (tab: 'browse' | 'vault' | 'queue') => void;
  onSearchOrUrl: (queryOrUrl: string) => void;
  storageInfo: StorageQuotaInfo | null;
  offlineMode: boolean;
  setOfflineMode: (offline: boolean) => void;
  activeDownloadsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSearchOrUrl,
  storageInfo,
  offlineMode,
  setOfflineMode,
  activeDownloadsCount,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearchOrUrl(inputValue.trim());
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputValue(text);
          onSearchOrUrl(text);
          setPasteNotice('Pasted from clipboard!');
          setTimeout(() => setPasteNotice(null), 2500);
          return;
        }
      }
      setPasteNotice('Please paste link manually into input');
      setTimeout(() => setPasteNotice(null), 2500);
    } catch {
      setPasteNotice('Clipboard permission denied');
      setTimeout(() => setPasteNotice(null), 2500);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('browse')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">TubeVault</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">
                  4K Offline
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">YouTube Player & Phone Downloader</p>
            </div>
          </div>

          {/* Search & URL Bar */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-auto relative hidden md:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Paste any YouTube URL or search videos, music, 4K..."
                className="w-full bg-zinc-900/90 text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-24 py-2 rounded-xl border border-zinc-700/60 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all shadow-inner"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  title="Paste link from clipboard"
                  className="px-2 py-1 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors flex items-center gap-1"
                >
                  <Clipboard className="w-3 h-3 text-red-400" />
                  <span>Paste</span>
                </button>
              </div>
            </div>
            {pasteNotice && (
              <div className="absolute left-0 -bottom-7 text-[11px] text-red-400 font-medium animate-fade-in">
                {pasteNotice}
              </div>
            )}
          </form>

          {/* Right Controls: Tabs, Offline Mode & Phone Storage */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Airplane / Offline Simulator Switch */}
            <button
              onClick={() => setOfflineMode(!offlineMode)}
              title={offlineMode ? 'Airplane Mode ON (Offline)' : 'Online Mode'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                offlineMode
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {offlineMode ? <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden lg:inline">{offlineMode ? 'Offline Mode' : 'Online'}</span>
            </button>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'browse'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore</span>
              </button>

              <button
                onClick={() => setActiveTab('vault')}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'vault'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5 text-red-400" />
                <span>Phone Vault</span>
                {storageInfo && storageInfo.tubeVaultCount > 0 && (
                  <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {storageInfo.tubeVaultCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('queue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hidden sm:flex items-center gap-1.5 ${
                  activeTab === 'queue'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Queue</span>
              </button>
            </div>

            {/* Active Downloads Indicator */}
            {activeDownloadsCount > 0 && (
              <div
                title={`${activeDownloadsCount} active download(s)`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold animate-pulse"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{activeDownloadsCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste YouTube URL or search..."
              className="w-full bg-zinc-900 text-xs text-zinc-100 placeholder-zinc-500 pl-9 pr-20 py-2 rounded-xl border border-zinc-700/60 focus:border-red-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="absolute right-1.5 px-2 py-1 text-[11px] text-zinc-300 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center gap-1"
            >
              <Clipboard className="w-3 h-3 text-red-400" />
              <span>Paste</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};
