import { kv } from './kv';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/**
 * Synchronous key-value storage (SQLite on device, localStorage on web). Synchronous reads let stores
 * hydrate before the first frame, so the app never flashes default settings.
 */
export const syncStorage: StateStorage = {
  getItem: (key) => kv.getItemSync(key),
  setItem: (key, value) => kv.setItemSync(key, value),
  removeItem: (key) => kv.removeItemSync(key),
};

export const persistStorage = createJSONStorage(() => syncStorage);

/** Remove every locally stored key (used by sign-out and account deletion). */
export function clearAllStorage(): void {
  kv.clearSync();
}
