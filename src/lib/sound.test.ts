import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { SoundName } from './sound';

const allSounds: SoundName[] = [
  'open',
  'close',
  'drop',
  'pin',
  'link',
  'success',
  'hint',
  'granted',
  'refused',
  'submit',
  'boot',
];

/** Every node the fake context creates, by kind. */
let created: string[] = [];
let constructed = 0;

function fakeParam() {
  return {
    value: 0,
    setValueAtTime: () => {},
    linearRampToValueAtTime: () => {},
    exponentialRampToValueAtTime: () => {},
  };
}

function fakeNode(kind: string) {
  created.push(kind);
  return {
    type: '',
    buffer: null,
    onended: null,
    frequency: fakeParam(),
    gain: fakeParam(),
    Q: fakeParam(),
    threshold: fakeParam(),
    knee: fakeParam(),
    ratio: fakeParam(),
    attack: fakeParam(),
    release: fakeParam(),
    connect: <T>(next: T) => next,
    disconnect: () => {},
    start: () => {},
    stop: () => {},
  };
}

/** Just enough of AudioContext for the sound recipes. */
class FakeAudioContext {
  currentTime = 0;
  sampleRate = 8000;
  state = 'running';
  destination = {};
  constructor() {
    constructed++;
  }
  resume = () => Promise.resolve();
  createOscillator = () => fakeNode('oscillator');
  createBufferSource = () => fakeNode('bufferSource');
  createGain = () => fakeNode('gain');
  createBiquadFilter = () => fakeNode('filter');
  createDynamicsCompressor = () => fakeNode('compressor');
  createBuffer = (_channels: number, length: number) => ({
    getChannelData: () => new Float32Array(length),
  });
}

/** Loads a fresh copy of the module, so the cached AudioContext starts empty. */
async function load(muted: boolean) {
  vi.resetModules();
  const { useSettings } = await import('../stores/settingsStore');
  useSettings.setState({ muted });
  return import('./sound');
}

const sources = () => created.filter((k) => k === 'oscillator' || k === 'bufferSource').length;

beforeEach(() => {
  created = [];
  constructed = 0;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('playSound', () => {
  test('does nothing when muted (the default)', async () => {
    vi.resetModules();
    const { useSettings } = await import('../stores/settingsStore');
    expect(useSettings.getState().muted).toBe(true);
    vi.stubGlobal('AudioContext', FakeAudioContext);
    const { playSound } = await import('./sound');
    for (const name of allSounds) playSound(name);
    expect(constructed).toBe(0);
    expect(created).toEqual([]);
  });

  test('plays every sound when unmuted, through one shared context', async () => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    const { playSound } = await load(false);
    for (const name of allSounds) {
      const before = sources();
      expect(() => playSound(name)).not.toThrow();
      expect(sources(), name).toBeGreaterThan(before);
    }
    expect(constructed).toBe(1);
    expect(created.filter((k) => k === 'compressor')).toHaveLength(1);
  });

  test('ignores the same sound repeated within 60 ms', async () => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    const { playSound } = await load(false);
    playSound('pin');
    const after = created.length;
    playSound('pin');
    expect(created.length).toBe(after);
    playSound('link');
    expect(created.length).toBeGreaterThan(after);
  });

  test('does not throw if the AudioContext constructor throws', async () => {
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('Audio not allowed');
        }
      },
    );
    const { playSound } = await load(false);
    for (const name of allSounds) expect(() => playSound(name)).not.toThrow();
  });
});
