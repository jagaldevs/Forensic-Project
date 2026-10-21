import { useSettings } from '../stores/settingsStore';

/**
 * Synthesised sound effects (Web Audio), so there are no audio files to download.
 * Silent unless the student turns sound on (settings start muted).
 *
 * Each sound is a short "recipe" built from two helpers: `tone()` (one note) and
 * `noise()` (a burst of filtered hiss). Everything goes through one quiet master
 * level and a gentle compressor, so several sounds at once never clip.
 */
export type SoundName =
  | 'open'
  | 'close'
  | 'drop'
  | 'pin'
  | 'link'
  | 'success'
  | 'hint'
  | 'granted'
  | 'refused'
  | 'submit'
  | 'boot';

/** Overall volume (0–1). Kept modest: these play in a classroom. */
const MASTER_LEVEL = 0.5;
/** The same sound requested again within this many milliseconds is ignored. */
const THROTTLE_MS = 60;
/** Exponential ramps can't reach 0, so "silent" is this tiny level instead. */
const SILENT = 0.0001;

type Recipe = (ctx: AudioContext, out: AudioNode, t: number) => void;

interface ToneOptions {
  /** Pitch in Hz. */
  freq: number;
  /** Length in seconds (attack + decay). */
  dur: number;
  /** Peak level (before the master level). */
  gain: number;
  /** Start, in seconds after the recipe's start time. */
  at?: number;
  type?: OscillatorType;
  /** Fade-in time in seconds. */
  attack?: number;
  /** Pitch to slide to by the end (Hz). */
  glideTo?: number;
  /** Lowpass cutoff in Hz, to soften bright waveforms. */
  lowpass?: number;
}

interface NoiseOptions {
  dur: number;
  gain: number;
  at?: number;
  attack?: number;
  filter: BiquadFilterType;
  /** Filter frequency in Hz. */
  freq: number;
  /** Filter resonance (higher = narrower band). */
  q?: number;
}

/** Fades a gain node in, then away to silence. Returns the node. */
function envelope(ctx: AudioContext, start: number, attack: number, end: number, peak: number) {
  const env = ctx.createGain();
  env.gain.setValueAtTime(SILENT, start);
  env.gain.exponentialRampToValueAtTime(peak, start + attack);
  env.gain.exponentialRampToValueAtTime(SILENT, end);
  return env;
}

/** Disconnects every node once the source has finished playing. */
function cleanUpAfter(source: AudioScheduledSourceNode, nodes: AudioNode[]) {
  source.onended = () => {
    for (const node of nodes) node.disconnect();
  };
}

/** Plays one note with a soft envelope. */
function tone(ctx: AudioContext, out: AudioNode, t: number, o: ToneOptions) {
  const start = t + (o.at ?? 0);
  const end = start + o.dur;
  const osc = ctx.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, start);
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, end);

  const env = envelope(ctx, start, Math.min(o.attack ?? 0.008, o.dur / 2), end, o.gain);
  const chain: AudioNode[] = [osc];
  if (o.lowpass) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(o.lowpass, start);
    chain.push(filter);
  }
  chain.push(env);
  for (let i = 0; i < chain.length - 1; i++) chain[i]!.connect(chain[i + 1]!);
  env.connect(out);

  osc.start(start);
  osc.stop(end + 0.02);
  cleanUpAfter(osc, chain);
}

let noiseBuffer: AudioBuffer | null = null;

/** One second of white noise, made once and reused by every noise burst. */
function getNoiseBuffer(ctx: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/** Plays a short burst of filtered noise (taps, stamps, swishes). */
function noise(ctx: AudioContext, out: AudioNode, t: number, o: NoiseOptions) {
  const start = t + (o.at ?? 0);
  const end = start + o.dur;
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = o.filter;
  filter.frequency.setValueAtTime(o.freq, start);
  filter.Q.setValueAtTime(o.q ?? 1, start);

  const env = envelope(ctx, start, Math.min(o.attack ?? 0.002, o.dur / 2), end, o.gain);
  src.connect(filter).connect(env).connect(out);

  src.start(start);
  src.stop(end + 0.02);
  cleanUpAfter(src, [src, filter, env]);
}

/** A rubber stamp: a papery thwack plus a low thud. Lower `pitch` = duller stamp. */
function stamp(ctx: AudioContext, out: AudioNode, t: number, pitch: number) {
  noise(ctx, out, t, {
    dur: 0.07,
    gain: 0.35 * pitch,
    filter: 'bandpass',
    freq: 1100 * pitch,
    q: 0.9,
  });
  tone(ctx, out, t, {
    freq: 130 * pitch,
    glideTo: 50 * pitch,
    dur: 0.14,
    gain: 0.45,
    attack: 0.003,
  });
}

/** The sound recipes. Times are in seconds from `t`; notes named for the curious. */
const recipes: Record<SoundName, Recipe> = {
  // Window opens: a soft airy swish and two quiet rising notes (E5 → A5).
  open: (ctx, out, t) => {
    noise(ctx, out, t, { dur: 0.12, gain: 0.05, attack: 0.04, filter: 'highpass', freq: 3500 });
    tone(ctx, out, t, { freq: 659, dur: 0.09, gain: 0.08 });
    tone(ctx, out, t, { at: 0.06, freq: 880, dur: 0.14, gain: 0.07 });
  },

  // Window closes or minimises: the reverse (A5 → E5), quieter, with a duller swish.
  close: (ctx, out, t) => {
    noise(ctx, out, t, { dur: 0.1, gain: 0.035, attack: 0.03, filter: 'highpass', freq: 2500 });
    tone(ctx, out, t, { freq: 880, dur: 0.08, gain: 0.055 });
    tone(ctx, out, t, { at: 0.055, freq: 659, dur: 0.12, gain: 0.05 });
  },

  // New evidence arrived: a bell-like three-note chime (G5, C6, E6) with a faint overtone.
  drop: (ctx, out, t) => {
    const notes = [784, 1047, 1319];
    notes.forEach((freq, i) => {
      const at = i * 0.1;
      const dur = i === notes.length - 1 ? 0.42 : 0.25;
      tone(ctx, out, t, { at, freq, dur, gain: 0.12, type: 'triangle', lowpass: 4000 });
      tone(ctx, out, t, { at, freq: freq * 2, dur: dur * 0.6, gain: 0.025 });
    });
  },

  // Evidence pinned: a tiny tack click (bright noise tick) over a soft low thump.
  pin: (ctx, out, t) => {
    noise(ctx, out, t, { dur: 0.025, gain: 0.3, filter: 'bandpass', freq: 3200, q: 1.2 });
    tone(ctx, out, t, { freq: 170, glideTo: 60, dur: 0.09, gain: 0.35, attack: 0.002 });
  },

  // String linked: a soft plucked twang (G4) that sags slightly in pitch as it fades.
  link: (ctx, out, t) => {
    const pluck = { dur: 0.4, attack: 0.003, lowpass: 1600 };
    tone(ctx, out, t, { ...pluck, freq: 392, glideTo: 380, gain: 0.12, type: 'triangle' });
    tone(ctx, out, t, { ...pluck, freq: 196, glideTo: 190, gain: 0.05, type: 'sawtooth' });
  },

  // Judgement check passed: a warm rising C major arpeggio (C5, E5, G5, C6).
  success: (ctx, out, t) => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const last = i === notes.length - 1;
      tone(ctx, out, t, {
        at: i * 0.07,
        freq,
        dur: last ? 0.34 : 0.16,
        gain: last ? 0.11 : 0.09,
        type: 'triangle',
        lowpass: 2600,
      });
    });
  },

  // Check needs another look: two gentle descending notes (E5 → C5). Not a buzzer.
  hint: (ctx, out, t) => {
    tone(ctx, out, t, { freq: 659, dur: 0.15, gain: 0.08, attack: 0.015 });
    tone(ctx, out, t, { at: 0.13, freq: 523, dur: 0.24, gain: 0.07, attack: 0.015 });
  },

  // Warrant granted: the stamp, then a small positive two-note tone (G5 → C6).
  granted: (ctx, out, t) => {
    stamp(ctx, out, t, 1);
    tone(ctx, out, t, { at: 0.14, freq: 784, dur: 0.12, gain: 0.07, type: 'triangle' });
    tone(ctx, out, t, { at: 0.22, freq: 1047, dur: 0.26, gain: 0.07, type: 'triangle' });
  },

  // Warrant refused: the stamp alone, lower and duller. No tone afterwards.
  refused: (ctx, out, t) => {
    stamp(ctx, out, t, 0.72);
  },

  // Report submitted ("case closed"): a stamp, a quick rising run, then a soft C major chord.
  submit: (ctx, out, t) => {
    stamp(ctx, out, t, 1);
    [392, 523, 659].forEach((freq, i) => {
      tone(ctx, out, t, { at: 0.12 + i * 0.06, freq, dur: 0.12, gain: 0.07, type: 'triangle' });
    });
    for (const freq of [523, 659, 784, 1047]) {
      const chord = { at: 0.32, dur: 0.55, attack: 0.02, lowpass: 2400 };
      tone(ctx, out, t, { ...chord, freq, gain: 0.05, type: 'triangle' });
    }
  },

  // Boot sequence: a very quiet low hum that rises an octave (A2 → A3) and fades.
  boot: (ctx, out, t) => {
    const hum = { dur: 0.55, attack: 0.18, lowpass: 900 };
    tone(ctx, out, t, { ...hum, freq: 110, glideTo: 220, gain: 0.07 });
    tone(ctx, out, t, { ...hum, freq: 165, glideTo: 330, gain: 0.03, type: 'triangle' });
  },
};

let ctx: AudioContext | null = null;
let master: AudioNode | null = null;
const lastPlayed = new Map<SoundName, number>();

/** The shared output: master level → gentle compressor → speakers. Made once. */
function getOutput(audio: AudioContext) {
  if (!master) {
    const compressor = audio.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    compressor.connect(audio.destination);

    const level = audio.createGain();
    level.gain.value = MASTER_LEVEL;
    level.connect(compressor);
    master = level;
  }
  return master;
}

/** Plays a sound effect, unless sound is muted. Never throws: audio is optional. */
export function playSound(name: SoundName): void {
  if (useSettings.getState().muted) return;

  const now = performance.now();
  const last = lastPlayed.get(name);
  if (last !== undefined && now - last < THROTTLE_MS) return;
  lastPlayed.set(name, now);

  try {
    ctx ??= new AudioContext();
    // iPad Safari starts the context suspended until a user gesture.
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    // Schedule slightly ahead so the first envelope point is never in the past.
    recipes[name](ctx, getOutput(ctx), ctx.currentTime + 0.01);
  } catch {
    // Audio is optional; ignore failures.
  }
}
