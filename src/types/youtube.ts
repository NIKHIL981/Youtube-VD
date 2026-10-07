export interface ResolutionOption {
  id: string;
  label: string;
  resolution: string;
  fps: string;
  format: 'MP4' | 'MP3' | 'WebM';
  codec: string;
  hdr?: boolean;
  bitrate: string;
  estimatedSizeMb: number;
  qualityBadge: string;
  recommended?: boolean;
  tag: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  channelAvatar?: string;
  channelUrl?: string;
  views: string;
  duration: string;
  durationSec: number;
  category: string;
  thumbnail: string;
  thumbnails?: { quality: string; url: string }[];
  description: string;
  resolutions?: ResolutionOption[];
}

export type DownloadStatus = 'downloading' | 'paused' | 'completed' | 'failed';

export interface DownloadTask {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  qualityId: string;
  qualityLabel: string;
  resolution: string;
  format: 'MP4' | 'MP3';
  fileSizeMb: number;
  progress: number; // 0 to 100
  downloadedMb: number;
  speed: string; // e.g. "8.4 MB/s"
  status: DownloadStatus;
  startedAt: number;
  completedAt?: number;
  blobUrl?: string;
  targetStorage: 'phone-downloads' | 'offline-vault';
}

export interface StoredOfflineVideo {
  id: string; // unique task id
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  qualityLabel: string;
  resolution: string;
  format: 'MP4' | 'MP3';
  fileSizeMb: number;
  duration: string;
  savedAt: number;
  blob?: Blob;
  blobUrl?: string;
}

export interface StorageQuotaInfo {
  usageMb: number;
  quotaMb: number;
  freeMb: number;
  percentageUsed: number;
  tubeVaultCount: number;
  tubeVaultSizeMb: number;
}
