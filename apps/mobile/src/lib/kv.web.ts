/** Web key-value store used for browser rendering (screenshots, QA). */
const ls = (): Storage | null => (typeof localStorage === 'undefined' ? null : localStorage);

export const kv = {
  getItemSync: (k: string): string | null => ls()?.getItem(k) ?? null,
  setItemSync: (k: string, v: string): void => ls()?.setItem(k, v),
  removeItemSync: (k: string): void => ls()?.removeItem(k),
  clearSync: (): void => ls()?.clear(),
  getItemAsync: async (k: string) => ls()?.getItem(k) ?? null,
  setItemAsync: async (k: string, v: string) => ls()?.setItem(k, v),
  removeItemAsync: async (k: string): Promise<void> => ls()?.removeItem(k),
};
