import Storage from 'expo-sqlite/kv-store';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/**
 * Synchronous key-value storage backed by SQLite. Synchronous reads let stores
 * hydrate before the first frame, so the app never flashes default settings.
 */
export const syncStorage: StateStorage = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => {
    Storage.removeItemSync(key);
  },
};

export const persistStorage = createJSONStorage(() => syncStorage);

/** Remove every locally stored key (used by sign-out and account deletion). */
export function clearAllStorage(): void {
  Storage.clearSync();
}
