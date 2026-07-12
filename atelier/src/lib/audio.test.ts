import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/* A minimal Web-Audio mock — jsdom ships no AudioContext. */
function makeParam() {
  return { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
}
function createMockContext() {
  const nodes = {
    gains: 0,
    oscillators: 0,
    buffers: 0,
    bufferSources: 0,
    filters: 0,
  };
  const connect = vi.fn();
  const gainNode = () => ({ gain: makeParam(), connect });
  const ctx = {
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    createGain: vi.fn(() => {
      nodes.gains++;
      return gainNode();
    }),
    createOscillator: vi.fn(() => {
      nodes.oscillators++;
      return {
        type: "sine",
        frequency: makeParam(),
        connect,
        start: vi.fn(),
        stop: vi.fn(),
      };
    }),
    createBuffer: vi.fn((_ch: number, length: number) => {
      nodes.buffers++;
      return { getChannelData: () => new Float32Array(length) };
    }),
    createBufferSource: vi.fn(() => {
      nodes.bufferSources++;
      return { buffer: null, connect, start: vi.fn() };
    }),
    createBiquadFilter: vi.fn(() => {
      nodes.filters++;
      return { type: "lowpass", frequency: { value: 0 }, Q: { value: 0 }, connect };
    }),
  };
  return { ctx, nodes };
}

let mock: ReturnType<typeof createMockContext>;

beforeEach(() => {
  vi.resetModules();
  mock = createMockContext();
  // @ts-expect-error test shim
  window.AudioContext = vi.fn(() => mock.ctx);
});

afterEach(() => {
  // @ts-expect-error test shim
  delete window.AudioContext;
});

describe("audio engine", () => {
  it("initAudio constructs one context and connects a master gain", async () => {
    const audio = await import("./audio");
    audio.initAudio();
    audio.initAudio(); // idempotent — should not build a second context
    expect(window.AudioContext).toHaveBeenCalledTimes(1);
    expect(mock.ctx.createGain).toHaveBeenCalledTimes(1);
  });

  it("swallows construction errors and stays silent", async () => {
    window.AudioContext = vi.fn(() => {
      throw new Error("no audio hardware");
    });
    const audio = await import("./audio");
    expect(() => audio.initAudio()).not.toThrow();
    // sfx must be safe to call even when init failed
    expect(() => audio.sfx.tick()).not.toThrow();
  });

  it("does not synthesize anything before initAudio", async () => {
    const audio = await import("./audio");
    audio.sfx.click();
    expect(mock.ctx.createOscillator).not.toHaveBeenCalled();
    expect(mock.ctx.createBufferSource).not.toHaveBeenCalled();
  });

  it("tick synthesizes noise bursts once initialised", async () => {
    const audio = await import("./audio");
    audio.initAudio();
    audio.sfx.tick();
    expect(mock.nodes.bufferSources).toBe(2);
    expect(mock.nodes.filters).toBe(2);
  });

  it("bigTick and click mix noise bursts with tones", async () => {
    const audio = await import("./audio");
    audio.initAudio();
    audio.sfx.bigTick();
    expect(mock.ctx.createBufferSource).toHaveBeenCalled();
    expect(mock.ctx.createOscillator).toHaveBeenCalled();
  });

  it("wind emits one burst-and-tone pair per requested pulse", async () => {
    const audio = await import("./audio");
    audio.initAudio();
    audio.sfx.wind(4);
    expect(mock.nodes.bufferSources).toBe(4);
    expect(mock.nodes.oscillators).toBe(4);
  });

  it("chime plays a three-note arpeggio", async () => {
    const audio = await import("./audio");
    audio.initAudio();
    audio.sfx.chime();
    expect(mock.nodes.oscillators).toBe(3);
  });

  it("setAudioEnabled(false) mutes further synthesis", async () => {
    const audio = await import("./audio");
    audio.initAudio();
    audio.setAudioEnabled(false);
    audio.sfx.tick();
    audio.sfx.chime();
    expect(mock.ctx.createBufferSource).not.toHaveBeenCalled();
    expect(mock.ctx.createOscillator).not.toHaveBeenCalled();

    audio.setAudioEnabled(true);
    audio.sfx.tick();
    expect(mock.ctx.createBufferSource).toHaveBeenCalled();
  });
});
