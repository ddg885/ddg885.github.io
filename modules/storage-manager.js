import { STORAGE_KEYS } from './constants.js';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORAGE_KEYS.DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORAGE_KEYS.DB_STORE)) {
        db.createObjectStore(STORAGE_KEYS.DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB open failed.'));
  });
}

export async function saveAppState(state) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORAGE_KEYS.DB_STORE, 'readwrite');
    transaction.objectStore(STORAGE_KEYS.DB_STORE).put(state, STORAGE_KEYS.DB_KEY);
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB save failed.'));
  });
}

export async function loadAppState() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORAGE_KEYS.DB_STORE, 'readonly');
    const request = transaction.objectStore(STORAGE_KEYS.DB_STORE).get(STORAGE_KEYS.DB_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('IndexedDB load failed.'));
  });
}

export async function clearAppState() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORAGE_KEYS.DB_STORE, 'readwrite');
    transaction.objectStore(STORAGE_KEYS.DB_STORE).clear();
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB clear failed.'));
  });
}

export function saveUiPrefs(prefs) {
  localStorage.setItem(STORAGE_KEYS.UI_PREFS, JSON.stringify(prefs));
}

export function loadUiPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.UI_PREFS) || '{}');
  } catch {
    return {};
  }
}

export function clearUiPrefs() {
  localStorage.removeItem(STORAGE_KEYS.UI_PREFS);
}
