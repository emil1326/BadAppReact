import type { WebStorage } from 'redux-persist/lib/types';

/**
 * Minimal redux-persist storage adapter backed by window.localStorage.
 *
 * We define this ourselves instead of importing `redux-persist/lib/storage`
 * because that package's default export gets mangled by Vite's CJS interop
 * (resulting in `storage.getItem is not a function` at runtime).
 */
export const localStorageAdapter: WebStorage = {
  getItem: async (key) => window.localStorage.getItem(key),
  setItem: async (key, value) => {
    window.localStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    window.localStorage.removeItem(key);
  },
};
