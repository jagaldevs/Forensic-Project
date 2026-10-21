import '@testing-library/jest-dom/vitest';

// jsdom has no layout, so it has no ResizeObserver; components only need it not to throw.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
