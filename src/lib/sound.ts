import { useSettings } from '../stores/settingsStore';

/**
 * Tiny synthesised sound effects (Web Audio), so there are no audio files to download.
 * Silent unless the student turns sound on. Phase 5 will replace these with designed sounds.
 */
export type SoundName = 'click' | 'open' | 'notify' | 'success' | 'hint' | 'stamp' | 'boot';

const recipes: Record<
  SoundName,
  { notes: [number, number][]; type: OscillatorType; gain: number }
> = {
  click: { notes: [[880, 0.03]], type: 'square', gain: 0.03 },
  open: {
    notes: [
      [520, 0.05],
      [780, 0.07],
    ],
    type: 'sine',
    gain: 0.06,
  },
  notify: {
    notes: [
      [660, 0.09],
      [990, 0.14],
    ],
    type: 'triangle',
    gain: 0.08,
  },
  success: {
    notes: [
      [523, 0.08],
      [659, 0.08],
      [784, 0.16],
    ],
    type: 'triangle',
    gain: 0.08,
  },
  hint: {
    notes: [
      [440, 0.1],
      [392, 0.14],
    ],
    type: 'sine',
    gain: 0.07,
  },
  stamp: { notes: [[110, 0.12]], type: 'sawtooth', gain: 0.08 },
  boot: {
    notes: [
      [220, 0.06],
      [330, 0.06],
      [440, 0.12],
    ],
    type: 'square',
    gain: 0.03,
  },
};

let ctx: AudioContext | null = null;

export function playSound(name: SoundName) {
  if (useSettings.getState().muted) return;
  try {
    ctx ??= new AudioContext();
    let t = ctx.currentTime;
    const { notes, type, gain } = recipes[name];
    for (const [freq, dur] of notes) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur * 0.85;
    }
  } catch {
    // Audio is optional; ignore failures.
  }
}
