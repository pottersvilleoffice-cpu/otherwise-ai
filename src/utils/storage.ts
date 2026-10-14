// Safe, Quota-Aware Local Storage & IndexedDB Media Persistence

const DB_NAME = 'otherwise_ai_db';
const STORE_MEDIA = 'media_cache';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_MEDIA)) {
          db.createObjectStore(STORE_MEDIA);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export async function saveMediaToIDB(id: string, dataUrl: string): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_MEDIA, 'readwrite');
    tx.objectStore(STORE_MEDIA).put(dataUrl, id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    // Non-fatal, in-memory copy will serve active session
    console.warn('[Storage] Failed to save media to IndexedDB:', err);
  }
}

export async function getMediaFromIDB(id: string): Promise<string | null> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_MEDIA, 'readonly');
    const req = tx.objectStore(STORE_MEDIA).get(id);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Strip large base64 data URLs (>5KB) before putting into localStorage to prevent QuotaExceededError
export function sanitizeForLocalStorage(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.length > 5000 && (obj.startsWith('data:') || obj.startsWith('blob:'))) {
      return '[PERSISTED_IN_CACHE]';
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForLocalStorage(item));
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [k, v] of Object.entries(obj)) {
      cleaned[k] = sanitizeForLocalStorage(v);
    }
    return cleaned;
  }
  return obj;
}

export function safeLocalStorageSet(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = sanitizeForLocalStorage(data);
    const serialized = JSON.stringify(sanitized);
    localStorage.setItem(key, serialized);
  } catch (err: any) {
    console.warn(`[Storage] Quota notice on ${key}, applying aggressive prune:`, err?.message);
    try {
      if (Array.isArray(data)) {
        const trimmed = data.slice(-5);
        const sanitized = sanitizeForLocalStorage(trimmed);
        localStorage.setItem(key, JSON.stringify(sanitized));
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore secondary quota limits to prevent application crash
    }
  }
}

export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved);
  } catch (err) {
    console.warn(`[Storage] Error reading ${key}:`, err);
    return fallback;
  }
}
