import { describe, it, expect, beforeEach } from "vitest";
import { useAtelier } from "./store";
import { DEFAULT_CONFIG } from "./config";

const initial = useAtelier.getState();
const get = useAtelier.getState;

describe("useAtelier store", () => {
  beforeEach(() => {
    useAtelier.setState(initial, true);
  });

  it("starts on the landing screen with the default config", () => {
    const s = get();
    expect(s.mode).toBe("landing");
    expect(s.config).toEqual(DEFAULT_CONFIG);
    expect(s.section).toBe("caseMat");
    expect(s.flipped).toBe(false);
    expect(s.macro).toBe(false);
    expect(s.storyOpen).toBe(false);
    expect(s.soundOn).toBe(true);
    expect(s.windPulse).toBe(0);
    expect(s.capturePulse).toBe(0);
  });

  it("enter() moves to the studio", () => {
    get().enter();
    expect(get().mode).toBe("studio");
  });

  it("set() updates a single config key without touching the others", () => {
    get().set("dial", "Meteorite");
    expect(get().config.dial).toBe("Meteorite");
    expect(get().config.caseMat).toBe(DEFAULT_CONFIG.caseMat);
  });

  it("setSection() changes the active section", () => {
    get().setSection("strap");
    expect(get().section).toBe("strap");
  });

  it("toggleFlip() and toggleMacro() flip their booleans", () => {
    get().toggleFlip();
    expect(get().flipped).toBe(true);
    get().toggleFlip();
    expect(get().flipped).toBe(false);

    get().toggleMacro();
    expect(get().macro).toBe(true);
  });

  it("setStoryOpen() sets the story visibility", () => {
    get().setStoryOpen(true);
    expect(get().storyOpen).toBe(true);
  });

  it("toggleSound() flips the sound flag", () => {
    get().toggleSound();
    expect(get().soundOn).toBe(false);
  });

  it("setMode/setPhotoBg/setPhotoLight assign their values", () => {
    get().setMode("photo");
    expect(get().mode).toBe("photo");
    get().setPhotoBg("Wood");
    expect(get().photoBg).toBe("Wood");
    get().setPhotoLight("Night");
    expect(get().photoLight).toBe("Night");
  });

  it("wind() and capture() monotonically increment their pulses", () => {
    get().wind();
    get().wind();
    expect(get().windPulse).toBe(2);
    get().capture();
    expect(get().capturePulse).toBe(1);
  });

  it("reset() returns to the studio and clears view toggles", () => {
    get().setMode("finale");
    get().toggleFlip();
    get().toggleMacro();
    get().setStoryOpen(true);
    get().set("dial", "Malachite");

    get().reset();

    const s = get();
    expect(s.mode).toBe("studio");
    expect(s.flipped).toBe(false);
    expect(s.macro).toBe(false);
    expect(s.storyOpen).toBe(false);
    // reset keeps the chosen configuration
    expect(s.config.dial).toBe("Malachite");
  });
});
