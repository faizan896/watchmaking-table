import { describe, it, expect } from "vitest";
import {
  DEFAULT_CONFIG,
  CASE_MATERIALS,
  FINISH_MOD,
  DIAL_SWATCH,
  OPTIONS,
  SECTIONS,
  PHOTO_BGS,
  PHOTO_LIGHTS,
  LIGHT_RIGS,
  BG_COLORS,
  buildStory,
  WatchConfig,
} from "./config";

const HEX = /^#[0-9a-fA-F]{6}$/;

describe("static configuration data", () => {
  it("DEFAULT_CONFIG only references valid options", () => {
    expect(OPTIONS.caseMat).toContain(DEFAULT_CONFIG.caseMat);
    expect(OPTIONS.finish).toContain(DEFAULT_CONFIG.finish);
    expect(OPTIONS.dial).toContain(DEFAULT_CONFIG.dial);
    expect(OPTIONS.hands).toContain(DEFAULT_CONFIG.hands);
    expect(OPTIONS.bezel).toContain(DEFAULT_CONFIG.bezel);
    expect(OPTIONS.crystal).toContain(DEFAULT_CONFIG.crystal);
    expect(OPTIONS.strap).toContain(DEFAULT_CONFIG.strap);
  });

  it("OPTIONS are derived from their source records", () => {
    expect(OPTIONS.caseMat).toEqual(Object.keys(CASE_MATERIALS));
    expect(OPTIONS.finish).toEqual(Object.keys(FINISH_MOD));
    expect(OPTIONS.dial).toEqual(Object.keys(DIAL_SWATCH));
  });

  it("every OPTIONS list is non-empty with unique values", () => {
    for (const list of Object.values(OPTIONS)) {
      expect(list.length).toBeGreaterThan(0);
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it("SECTIONS covers exactly the OPTIONS keys in order", () => {
    expect(SECTIONS.map((s) => s.key)).toEqual(Object.keys(OPTIONS));
    for (const s of SECTIONS) expect(s.label.length).toBeGreaterThan(0);
  });

  it("case materials have valid colours and physical ranges", () => {
    for (const p of Object.values(CASE_MATERIALS)) {
      expect(p.color).toMatch(HEX);
      expect(p.metalness).toBeGreaterThanOrEqual(0);
      expect(p.metalness).toBeLessThanOrEqual(1);
      expect(p.roughness).toBeGreaterThanOrEqual(0);
      expect(p.roughness).toBeLessThanOrEqual(1);
    }
  });

  it("dial swatches are all valid hex colours", () => {
    for (const c of Object.values(DIAL_SWATCH)) expect(c).toMatch(HEX);
  });

  it("photo backgrounds and lights have complete rig/colour records", () => {
    for (const bg of PHOTO_BGS) {
      expect(BG_COLORS[bg].surface).toMatch(HEX);
      expect(BG_COLORS[bg].fog).toMatch(HEX);
    }
    for (const light of PHOTO_LIGHTS) {
      const rig = LIGHT_RIGS[light];
      expect(rig.keyColor).toMatch(HEX);
      expect(rig.fillColor).toMatch(HEX);
      expect(rig.rimColor).toMatch(HEX);
      expect(rig.key).toBeGreaterThan(0);
    }
  });
});

describe("buildStory", () => {
  it("is deterministic for identical configs", () => {
    const a = buildStory(DEFAULT_CONFIG);
    const b = buildStory({ ...DEFAULT_CONFIG });
    expect(a).toEqual(b);
  });

  it("derives model and collection from case + dial", () => {
    const story = buildStory({ ...DEFAULT_CONFIG, caseMat: "Steel", dial: "Black" });
    expect(story.model).toBe("Officier Noir");
    expect(story.collection).toBe("Officier Collection");
    expect(story.reference).toMatch(/^Ref\. AT-\d+$/);
  });

  it("adds an S suffix to the reference for a skeleton dial", () => {
    const story = buildStory({ ...DEFAULT_CONFIG, dial: "Skeleton" });
    expect(story.reference).toMatch(/S$/);
    expect(story.movement).toContain("openworked");
  });

  it("non-skeleton dials describe the self-winding calibre", () => {
    const story = buildStory({ ...DEFAULT_CONFIG, dial: "Black" });
    expect(story.reference).not.toMatch(/S$/);
    expect(story.movement).toContain("self-winding");
  });

  it("prices reflect case, dial and complication surcharges", () => {
    const parse = (c: WatchConfig) =>
      Number(buildStory(c).price.replace(/[$,]/g, ""));

    const base = parse({ ...DEFAULT_CONFIG, caseMat: "Steel", dial: "Black", bezel: "Smooth", strap: "Leather" });
    expect(base).toBe(12400);

    const meteorite = parse({ ...DEFAULT_CONFIG, caseMat: "Steel", dial: "Meteorite", bezel: "Smooth", strap: "Leather" });
    expect(meteorite).toBe(12400 + 8400);

    const fluted = parse({ ...DEFAULT_CONFIG, caseMat: "Steel", dial: "Black", bezel: "Fluted", strap: "Leather" });
    expect(fluted).toBe(12400 + 2400);

    const president = parse({ ...DEFAULT_CONFIG, caseMat: "Steel", dial: "Black", bezel: "Smooth", strap: "President" });
    expect(president).toBe(12400 + 3200);

    const loaded = parse({ ...DEFAULT_CONFIG, caseMat: "Platinum", dial: "Skeleton", bezel: "GMT", strap: "Jubilee" });
    expect(loaded).toBe(64800 + 12600 + 2400 + 3200);
  });

  it("formats the price with a thousands separator", () => {
    const story = buildStory({ ...DEFAULT_CONFIG, caseMat: "Platinum", dial: "Skeleton", bezel: "GMT", strap: "Jubilee" });
    expect(story.price).toBe("$83,000");
  });

  it("produces a story with every field populated for all options", () => {
    for (const caseMat of OPTIONS.caseMat) {
      for (const dial of OPTIONS.dial) {
        const story = buildStory({ ...DEFAULT_CONFIG, caseMat, dial });
        for (const value of Object.values(story)) {
          expect(typeof value).toBe("string");
          expect(value.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
