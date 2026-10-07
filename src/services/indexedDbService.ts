import { StoredOfflineVideo, StorageQuotaInfo } from '../types/youtube';

const DB_NAME = 'TubeVault_Storage_v1';
const STORE_NAME = 'offline_videos';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('videoId', 'videoId', { unique: false });
        store.createIndex('savedAt', 'savedAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });

  return dbPromise;
}

export async function saveVideoToVault(
  videoData: Omit<StoredOfflineVideo, 'blobUrl'>,
  blob: Blob
): Promise<StoredOfflineVideo> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record = {
      ...videoData,
      blob,
    };

    const request = store.put(record);

    request.onsuccess = () => {
      const blobUrl = URL.createObjectURL(blob);
      resolve({
        ...videoData,
        blob,
        blobUrl,
      });
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to save video to offline vault'));
    };
  });
}

export async function getAllVaultVideos(): Promise<StoredOfflineVideo[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result as (StoredOfflineVideo & { blob?: Blob })[];
        const mapped: StoredOfflineVideo[] = records.map((rec) => {
          let blobUrl: string | undefined = undefined;
          if (rec.blob) {
            blobUrl = URL.createObjectURL(rec.blob);
          }
          return {
            ...rec,
            blobUrl,
          };
        });
        // Sort descending by savedAt
        mapped.sort((a, b) => b.savedAt - a.savedAt);
        resolve(mapped);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to load offline videos'));
      };
    });
  } catch (err) {
    console.error('Error fetching vault videos:', err);
    return [];
  }
}

export async function getVaultVideoById(id: string): Promise<StoredOfflineVideo | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      const rec = request.result;
      if (!rec) {
        resolve(null);
        return;
      }
      let blobUrl: string | undefined = undefined;
      if (rec.blob) {
        blobUrl = URL.createObjectURL(rec.blob);
      }
      resolve({ ...rec, blobUrl });
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteVaultVideo(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllVaultVideos(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Calculate phone storage estimates
export async function getStorageQuotaInfo(): Promise<StorageQuotaInfo> {
  let usageMb = 0;
  let quotaMb = 0;

  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      usageMb = Math.round((estimate.usage || 0) / (1024 * 1024));
      quotaMb = Math.round((estimate.quota || 1024 * 1024 * 1024 * 16) / (1024 * 1024));
    } catch {
      quotaMb = 16 * 1024; // Default fallback 16GB
      usageMb = 120;
    }
  } else {
    quotaMb = 16 * 1024;
    usageMb = 120;
  }

  const freeMb = Math.max(0, quotaMb - usageMb);
  const percentageUsed = quotaMb > 0 ? Math.min(100, Math.round((usageMb / quotaMb) * 100)) : 0;

  // Calculate vault usage
  const vaultItems = await getAllVaultVideos();
  const tubeVaultSizeMb = vaultItems.reduce((acc, item) => acc + (item.fileSizeMb || 0), 0);

  return {
    usageMb,
    quotaMb,
    freeMb,
    percentageUsed,
    tubeVaultCount: vaultItems.length,
    tubeVaultSizeMb: Math.round(tubeVaultSizeMb * 10) / 10,
  };
}

// Trigger direct native browser download to phone storage (Files / Downloads)
export function triggerDirectPhoneDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup after trigger
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
