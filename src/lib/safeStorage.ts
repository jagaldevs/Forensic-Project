import type { StateStorage } from 'zustand/middleware';

/**
 * localStorage wrapper that never throws.
 * If storage is unavailable (private mode, blocked by policy, quota full), values are kept
 * in memory for this session and the app keeps working. Students can still back up
 * progress with a progress code.
 */
const memory = new Map<string, string>();
let storageWorks: boolean | null = null;

function getLocalStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function isStorageAvailable(): boolean {
  if (storageWorks !== null) return storageWorks;
  try {
    const ls = getLocalStorage();
    if (!ls) return (storageWorks = false);
    const probe = '__hrsfl_probe__';
    ls.setItem(probe, probe);
    ls.removeItem(probe);
    storageWorks = true;
  } catch {
    storageWorks = false;
  }
  return storageWorks;
}

export const safeStorage: StateStorage = {
  getItem(name) {
    try {
      const value = getLocalStorage()?.getItem(name);
      if (value != null) return value;
    } catch {
      // fall through to memory
    }
    return memory.get(name) ?? null;
  },
  setItem(name, value) {
    memory.set(name, value);
    try {
      getLocalStorage()?.setItem(name, value);
    } catch {
      storageWorks = false;
    }
  },
  removeItem(name) {
    memory.delete(name);
    try {
      getLocalStorage()?.removeItem(name);
    } catch {
      // ignore
    }
  },
};

/** For tests only. */
export function __resetSafeStorageForTests() {
  memory.clear();
  storageWorks = null;
}
