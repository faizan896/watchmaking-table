/* Web-Audio: every sound is synthesized — no assets, no network. */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;

export async function initAudio(): Promise<boolean> {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.85;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") await ctx.resume();
    return true;
  } catch (error) {
    console.warn("Audio initialization failed; continuing without sound.", error);
    ctx = null;
    master = null;
    return false;
  }
}
export function setAudioEnabled(v: boolean) { enabled = v; }

function tone(freq: number, dur: number, vol: number, type: OscillatorType = "sine", delay = 0, bendTo?: number) {
  if (!ctx || !master || !enabled) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (bendTo) o.frequency.exponentialRampToValueAtTime(bendTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}
function burst(dur: number, vol: number, freq: number, q = 1.5, delay = 0) {
  if (!ctx || !master || !enabled) return;
  const t = ctx.currentTime + delay;
  const n = Math.max(1, (ctx.sampleRate * dur) | 0);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource();
  s.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain(); g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(master);
  s.start(t);
}

export const sfx = {
  tick(vol = 1) { burst(0.012, 0.09 * vol, 5200, 2.2); burst(0.014, 0.05 * vol, 2300, 2, 0.012); },
  bigTick() { burst(0.03, 0.5, 3400, 1.6); tone(1500, 0.08, 0.12, "triangle"); tone(220, 0.22, 0.16, "sine", 0.01, 140); },
  click() { burst(0.03, 0.32, 3200, 1.5); tone(1900, 0.045, 0.07, "triangle"); },
  wind(n = 6) { for (let i = 0; i < n; i++) { burst(0.016, 0.22, 3600, 2, i * 0.05); tone(2400, 0.02, 0.04, "square", i * 0.05); } },
  shutter() { burst(0.02, 0.4, 2600, 1); burst(0.04, 0.3, 900, 1, 0.05); },
  whoosh() { burst(0.28, 0.1, 480, 0.5); },
  chime() { [660, 990, 1318].forEach((f, i) => tone(f, 2.0 - i * 0.3, 0.09 - i * 0.02, "sine", i * 0.15)); },
};
