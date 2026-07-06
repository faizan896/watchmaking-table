/* ────────────────────────────────────────────────
   ATELIER — configuration data, materials, story
   ──────────────────────────────────────────────── */

export type CaseMat =
  | "Steel" | "Titanium" | "Bronze" | "White Gold" | "Rose Gold"
  | "Yellow Gold" | "Platinum" | "Ceramic" | "Carbon";
export type Finish = "Mirror Polish" | "Brushed" | "Satin" | "Sandblasted" | "Frosted";
export type DialType =
  | "Black" | "White" | "Blue" | "Green" | "Burgundy" | "Salmon"
  | "Meteorite" | "Guilloché" | "Enamel" | "Linen" | "Skeleton"
  | "Aventurine" | "Mother of Pearl" | "Lapis Lazuli" | "Malachite";
export type HandStyle = "Dauphine" | "Sword" | "Leaf" | "Alpha" | "Breguet" | "Cathedral" | "Mercedes";
export type BezelType = "Smooth" | "Coin Edge" | "Fluted" | "Ceramic" | "GMT" | "Tachymeter";
export type CrystalType = "Flat" | "Box" | "Domed" | "Double Domed";
export type StrapType = "Leather" | "Alligator" | "Rubber" | "Canvas" | "Milanese" | "Oyster" | "Jubilee" | "President";

export interface WatchConfig {
  caseMat: CaseMat;
  finish: Finish;
  dial: DialType;
  hands: HandStyle;
  bezel: BezelType;
  crystal: CrystalType;
  strap: StrapType;
}

export const DEFAULT_CONFIG: WatchConfig = {
  caseMat: "Steel",
  finish: "Mirror Polish",
  dial: "Black",
  hands: "Dauphine",
  bezel: "Smooth",
  crystal: "Domed",
  strap: "Leather",
};

/* ---------- physically-plausible material parameters ---------- */
export interface MetalParams { color: string; metalness: number; roughness: number; clearcoat?: number; }
export const CASE_MATERIALS: Record<CaseMat, MetalParams> = {
  Steel:        { color: "#cdd1d6", metalness: 1.0, roughness: 0.16 },
  Titanium:     { color: "#a9adb4", metalness: 1.0, roughness: 0.34 },
  Bronze:       { color: "#b57e42", metalness: 1.0, roughness: 0.30 },
  "White Gold": { color: "#e9e6dd", metalness: 1.0, roughness: 0.14 },
  "Rose Gold":  { color: "#d99b73", metalness: 1.0, roughness: 0.15 },
  "Yellow Gold":{ color: "#e3b54e", metalness: 1.0, roughness: 0.15 },
  Platinum:     { color: "#d9dce0", metalness: 1.0, roughness: 0.12 },
  Ceramic:      { color: "#101114", metalness: 0.05, roughness: 0.07, clearcoat: 1 },
  Carbon:       { color: "#1c1e21", metalness: 0.35, roughness: 0.42 },
};
export const FINISH_MOD: Record<Finish, { dr: number; dm: number }> = {
  "Mirror Polish": { dr: -0.06, dm: 0 },
  Brushed:         { dr: +0.22, dm: 0 },
  Satin:           { dr: +0.13, dm: 0 },
  Sandblasted:     { dr: +0.34, dm: -0.12 },
  Frosted:         { dr: +0.42, dm: -0.05 },
};

export const DIAL_SWATCH: Record<DialType, string> = {
  Black: "#101114", White: "#efece3", Blue: "#16324f", Green: "#123f2d",
  Burgundy: "#4a1420", Salmon: "#e8a87c", Meteorite: "#9aa0a8",
  "Guilloché": "#d8d4c8", Enamel: "#f4f1e8", Linen: "#e3ddcd",
  Skeleton: "#3a2e1a", Aventurine: "#101c3a", "Mother of Pearl": "#efe6ee",
  "Lapis Lazuli": "#1a2f6e", Malachite: "#0e5c3a",
};

export const OPTIONS = {
  caseMat: Object.keys(CASE_MATERIALS) as CaseMat[],
  finish: Object.keys(FINISH_MOD) as Finish[],
  dial: Object.keys(DIAL_SWATCH) as DialType[],
  hands: ["Dauphine", "Sword", "Leaf", "Alpha", "Breguet", "Cathedral", "Mercedes"] as HandStyle[],
  bezel: ["Smooth", "Coin Edge", "Fluted", "Ceramic", "GMT", "Tachymeter"] as BezelType[],
  crystal: ["Flat", "Box", "Domed", "Double Domed"] as CrystalType[],
  strap: ["Leather", "Alligator", "Rubber", "Canvas", "Milanese", "Oyster", "Jubilee", "President"] as StrapType[],
};

export type SectionKey = keyof typeof OPTIONS;
export const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "caseMat", label: "Case" },
  { key: "finish", label: "Finish" },
  { key: "dial", label: "Dial" },
  { key: "hands", label: "Hands" },
  { key: "bezel", label: "Bezel" },
  { key: "crystal", label: "Crystal" },
  { key: "strap", label: "Strap" },
];

/* ---------- photography mode ---------- */
export type PhotoBg = "Black" | "White" | "Leather" | "Concrete" | "Wood" | "Glass";
export type PhotoLight = "Morning" | "Golden Hour" | "Museum" | "Night" | "Softbox" | "Editorial";
export const PHOTO_BGS: PhotoBg[] = ["Black", "White", "Leather", "Concrete", "Wood", "Glass"];
export const PHOTO_LIGHTS: PhotoLight[] = ["Morning", "Golden Hour", "Museum", "Night", "Softbox", "Editorial"];

export interface LightRig { key: number; keyColor: string; fill: number; fillColor: string; rim: number; rimColor: string; env: number; }
export const LIGHT_RIGS: Record<PhotoLight, LightRig> = {
  Morning:       { key: 2.4, keyColor: "#ffe9c9", fill: 0.5, fillColor: "#bcd3ee", rim: 1.1, rimColor: "#fff4dd", env: 0.55 },
  "Golden Hour": { key: 3.2, keyColor: "#ffbe78", fill: 0.22, fillColor: "#6e5a8c", rim: 1.9, rimColor: "#ffd9a0", env: 0.4 },
  Museum:        { key: 2.2, keyColor: "#fff6e8", fill: 0.5, fillColor: "#e8e2d6", rim: 0.7, rimColor: "#ffffff", env: 0.6 },
  Night:         { key: 1.0, keyColor: "#a9c2e8", fill: 0.14, fillColor: "#31436a", rim: 1.6, rimColor: "#cfe0f8", env: 0.22 },
  Softbox:       { key: 2.8, keyColor: "#ffffff", fill: 1.15, fillColor: "#f4f1ea", rim: 0.85, rimColor: "#ffffff", env: 0.9 },
  Editorial:     { key: 3.6, keyColor: "#fff3df", fill: 0.08, fillColor: "#2a2622", rim: 2.3, rimColor: "#f6ead2", env: 0.3 },
};
export const BG_COLORS: Record<PhotoBg, { surface: string; fog: string }> = {
  Black:    { surface: "#111009", fog: "#070605" },
  White:    { surface: "#e9e6df", fog: "#d9d5cc" },
  Leather:  { surface: "#241610", fog: "#0d0806" },
  Concrete: { surface: "#8b8a86", fog: "#5c5b58" },
  Wood:     { surface: "#4a2f18", fog: "#1d1207" },
  Glass:    { surface: "#20262c", fog: "#0b0e12" },
};

/* ---------- the story ---------- */
function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}
function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

const DIAL_NAME: Record<DialType, string> = {
  Black: "Noir", White: "Blanc", Blue: "Azur", Green: "Vert Empire",
  Burgundy: "Grenat", Salmon: "Aurore", Meteorite: "Météore",
  "Guilloché": "Trame", Enamel: "Grand Feu", Linen: "Toile",
  Skeleton: "Squelette", Aventurine: "Nuit Étoilée",
  "Mother of Pearl": "Nacre", "Lapis Lazuli": "Lazuli", Malachite: "Impératrice",
};
const COLLECTION: Record<CaseMat, string> = {
  Steel: "Officier", Titanium: "Ingénieur", Bronze: "Marine",
  "White Gold": "Héritage", "Rose Gold": "Crépuscule", "Yellow Gold": "Souverain",
  Platinum: "Prestige", Ceramic: "Éclipse", Carbon: "Endurance",
};
const PERSONA: string[] = [
  "This watch was designed for someone who values silence over attention.",
  "This watch belongs to someone who arrives early and says little.",
  "This watch was made for a person who reads the last page first — and tells no one.",
  "This watch suits someone who keeps their promises in small, punctual ways.",
  "This watch was conceived for someone who prefers one perfect thing to ten good ones.",
  "This watch is for the kind of person who notices the hinges before the door.",
  "This watch waits well. So does its owner.",
];
const INSPIRATION: string[] = [
  "The pause between two heartbeats, measured and kept.",
  "Winter light on a drafting table in Geneva, 1962.",
  "The discipline of a single well-set line of type.",
  "A concert hall, empty, one hour before the performance.",
  "The moment a departing train becomes a distant sound.",
];
const PHILOSOPHY: string[] = [
  "Nothing was added that could not defend its presence. Every surface earns its light.",
  "Restraint is the loudest material in this design. What was left out took the longest.",
  "Proportion first, ornament never. The wearer completes the composition.",
  "Designed to be discovered slowly — the second week reveals more than the first.",
];
const NOTES: string[] = [
  "Collectors should note the hand-applied indices and the mirror-polished chamfers, executed to a tolerance visible only under a loupe.",
  "Only a small number will ever be assembled; each movement is finished by a single watchmaker, start to end.",
  "The caseback engraving is cut, not stamped — a distinction felt more than seen.",
  "Expect the patina to become part of the story. This piece is meant to be worn, not stored.",
];

const CASE_PRICE: Record<CaseMat, number> = {
  Steel: 12400, Titanium: 14800, Bronze: 11600, "White Gold": 38500,
  "Rose Gold": 36200, "Yellow Gold": 35400, Platinum: 64800, Ceramic: 17900, Carbon: 16400,
};
const DIAL_PRICE: Partial<Record<DialType, number>> = {
  Meteorite: 8400, "Guilloché": 6800, Enamel: 9800, Skeleton: 12600,
  Aventurine: 5400, "Mother of Pearl": 4800, "Lapis Lazuli": 7600, Malachite: 7900,
};

export interface Story {
  model: string; reference: string; collection: string;
  persona: string; inspiration: string; philosophy: string;
  movement: string; price: string; year: string; notes: string;
}
export function buildStory(c: WatchConfig): Story {
  const seed = hash(JSON.stringify(c));
  const collection = COLLECTION[c.caseMat];
  const model = `${collection} ${DIAL_NAME[c.dial]}`;
  const ref = `AT-${(2000 + (seed % 7000)).toString()}${c.dial === "Skeleton" ? "S" : ""}`;
  const price = CASE_PRICE[c.caseMat] + (DIAL_PRICE[c.dial] ?? 0) +
    (c.bezel === "Fluted" || c.bezel === "GMT" ? 2400 : 0) +
    (c.strap === "President" || c.strap === "Jubilee" ? 3200 : 0);
  const movement =
    c.dial === "Skeleton"
      ? "Calibre A-01, openworked. Hand-bevelled bridges, 72-hour reserve, free-sprung balance beating at 28,800 vph — visible from both sides, hidden from no one."
      : "Calibre A-01, self-winding. Geneva stripes, perlage beneath the dial, 72-hour reserve, free-sprung balance beating at 28,800 vph. Finished where no one will look, because someone will.";
  return {
    model,
    reference: `Ref. ${ref}`,
    collection: `${collection} Collection`,
    persona: pick(PERSONA, seed),
    inspiration: pick(INSPIRATION, seed >> 3),
    philosophy: pick(PHILOSOPHY, seed >> 6),
    movement,
    price: "$" + price.toLocaleString("en-US"),
    year: "Launch — Autumn 2026",
    notes: pick(NOTES, seed >> 9),
  };
}
