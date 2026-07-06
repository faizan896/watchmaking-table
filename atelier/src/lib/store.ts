import { create } from "zustand";
import {
  DEFAULT_CONFIG, WatchConfig, SectionKey, PhotoBg, PhotoLight,
} from "./config";

export type Mode = "landing" | "studio" | "photo" | "finale";

interface AtelierState {
  mode: Mode;
  config: WatchConfig;
  section: SectionKey;
  flipped: boolean;
  macro: boolean;
  storyOpen: boolean;
  soundOn: boolean;
  photoBg: PhotoBg;
  photoLight: PhotoLight;
  /** incremented to ask the crown to wind (animation + sound) */
  windPulse: number;
  /** incremented to ask the renderer for a still capture */
  capturePulse: number;

  enter: () => void;
  set: <K extends keyof WatchConfig>(key: K, value: WatchConfig[K]) => void;
  setSection: (s: SectionKey) => void;
  toggleFlip: () => void;
  toggleMacro: () => void;
  setStoryOpen: (v: boolean) => void;
  toggleSound: () => void;
  setMode: (m: Mode) => void;
  setPhotoBg: (b: PhotoBg) => void;
  setPhotoLight: (l: PhotoLight) => void;
  wind: () => void;
  capture: () => void;
  reset: () => void;
}

export const useAtelier = create<AtelierState>((set) => ({
  mode: "landing",
  config: { ...DEFAULT_CONFIG },
  section: "caseMat",
  flipped: false,
  macro: false,
  storyOpen: false,
  soundOn: true,
  photoBg: "Black",
  photoLight: "Museum",
  windPulse: 0,
  capturePulse: 0,

  enter: () => set({ mode: "studio" }),
  set: (key, value) =>
    set((s) => ({ config: { ...s.config, [key]: value } })),
  setSection: (section) => set({ section }),
  toggleFlip: () => set((s) => ({ flipped: !s.flipped })),
  toggleMacro: () => set((s) => ({ macro: !s.macro })),
  setStoryOpen: (storyOpen) => set({ storyOpen }),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  setMode: (mode) => set({ mode }),
  setPhotoBg: (photoBg) => set({ photoBg }),
  setPhotoLight: (photoLight) => set({ photoLight }),
  wind: () => set((s) => ({ windPulse: s.windPulse + 1 })),
  capture: () => set((s) => ({ capturePulse: s.capturePulse + 1 })),
  reset: () =>
    set({ mode: "studio", flipped: false, macro: false, storyOpen: false }),
}));
