import Storage from 'expo-sqlite/kv-store';

/** Native key-value store (SQLite). A localStorage-backed twin lives in kv.web.ts. */
export const kv = {
  getItemSync: (k: string): string | null => Storage.getItemSync(k),
  setItemSync: (k: string, v: string): void => Storage.setItemSync(k, v),
  removeItemSync: (k: string): void => {
    Storage.removeItemSync(k);
  },
  clearSync: (): void => {
    Storage.clearSync();
  },
  getItemAsync: (k: string) => Storage.getItemAsync(k),
  setItemAsync: (k: string, v: string) => Storage.setItemAsync(k, v),
  removeItemAsync: async (k: string): Promise<void> => {
    await Storage.removeItemAsync(k);
  },
};
