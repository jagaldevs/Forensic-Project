import { afterEach, describe, expect, test, vi } from 'vitest';
import { __resetSafeStorageForTests, isStorageAvailable, safeStorage } from './safeStorage';

afterEach(() => {
  vi.restoreAllMocks();
  __resetSafeStorageForTests();
  localStorage.clear();
});

describe('safeStorage', () => {
  test('reads and writes through to localStorage', () => {
    safeStorage.setItem('k', 'v');
    expect(localStorage.getItem('k')).toBe('v');
    expect(safeStorage.getItem('k')).toBe('v');
  });

  test('keeps working in memory when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => safeStorage.setItem('k', 'v')).not.toThrow();
    expect(safeStorage.getItem('k')).toBe('v');
    expect(isStorageAvailable()).toBe(false);
  });

  test('survives window.localStorage itself throwing', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => safeStorage.setItem('a', '1')).not.toThrow();
    expect(safeStorage.getItem('a')).toBe('1');
    expect(() => safeStorage.removeItem('a')).not.toThrow();
  });
});
