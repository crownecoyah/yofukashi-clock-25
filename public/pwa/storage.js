export const DEFAULT_SETTINGS = { boundary: 5, seconds: true, font: 'mono', size: 'normal' };
const KEY = 'yofukashi-pwa-settings-v1';
export function readSettings(storage = localStorage) {
  const saved = JSON.parse(storage.getItem(KEY) || '{}');
  return { boundary: Number.isInteger(saved.boundary) && saved.boundary >= 0 && saved.boundary <= 12 ? saved.boundary : 5,
    seconds: typeof saved.seconds === 'boolean' ? saved.seconds : true,
    font: ['mono', 'sans', 'serif'].includes(saved.font) ? saved.font : 'mono',
    size: ['normal', 'large'].includes(saved.size) ? saved.size : 'normal' };
}
export function saveSettings(settings, storage = localStorage) { storage.setItem(KEY, JSON.stringify(settings)); }
export function openStore() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('yofukashi-clock-25-pwa', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('events', { keyPath: 'id' });
    request.onsuccess = () => { request.result.onversionchange = () => request.result.close(); resolve(request.result); };
    request.onerror = () => reject(new Error('予定の保存領域を開けません。ブラウザのサイトデータ設定を確認してください。'));
    request.onblocked = () => reject(new Error('ほかのタブを閉じてから再読み込みしてください。'));
  });
}
export function listEvents(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('events', 'readonly');
    const request = tx.objectStore('events').getAll();
    tx.oncomplete = () => resolve(request.result.sort((a, b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id)));
    tx.onerror = tx.onabort = () => reject(new Error('保存済み予定を読み込めませんでした。再読み込みしてください。'));
  });
}
export function writeEvent(db, event, previous = null, remove = false) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('events', 'readwrite');
    const store = tx.objectStore('events');
    let message = '端末内保存に失敗しました。空き容量やブラウザの保存設定を確認してください。';
    const request = store.get(event.id);
    request.onsuccess = () => {
      const current = request.result;
      if ((previous && current?.updatedAt !== previous.updatedAt) || (!previous && current)) {
        message = 'ほかの画面でこの予定が変更されています。いったん閉じて予定を読み込み直してください。'; tx.abort(); return;
      }
      if (remove) store.delete(event.id); else store.put(event);
    };
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(new Error(message));
  });
}
