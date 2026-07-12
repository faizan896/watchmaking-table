import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  dialTexture,
  movementTexture,
  rotorTexture,
  backdropTexture,
  bezelInsertTexture,
  strapTexture,
  strapIsMetal,
  stageTexture,
  shadowTexture,
  smudgeTexture,
} from "./textures";
import { DEFAULT_CONFIG, OPTIONS } from "./config";

describe("strapIsMetal", () => {
  it("recognises bracelet-style straps as metal", () => {
    for (const t of ["Milanese", "Oyster", "Jubilee", "President"] as const) {
      expect(strapIsMetal(t)).toBe(true);
    }
  });

  it("treats leather/fabric/rubber straps as non-metal", () => {
    for (const t of ["Leather", "Alligator", "Rubber", "Canvas"] as const) {
      expect(strapIsMetal(t)).toBe(false);
    }
  });
});

describe("bezelInsertTexture", () => {
  it("returns null for bezels without a printed insert", () => {
    for (const t of ["Smooth", "Coin Edge", "Fluted"] as const) {
      expect(bezelInsertTexture(t)).toBeNull();
    }
  });

  it("draws an insert for GMT, Tachymeter and Ceramic bezels", () => {
    for (const t of ["GMT", "Tachymeter", "Ceramic"] as const) {
      expect(bezelInsertTexture(t)).toBeInstanceOf(THREE.CanvasTexture);
    }
  });
});

describe("procedural textures", () => {
  it("dialTexture produces an sRGB canvas texture for every dial", () => {
    for (const dial of OPTIONS.dial) {
      const t = dialTexture({ ...DEFAULT_CONFIG, dial });
      expect(t).toBeInstanceOf(THREE.CanvasTexture);
      expect(t.colorSpace).toBe(THREE.SRGBColorSpace);
    }
  });

  it("strapTexture produces a texture for every strap", () => {
    for (const strap of OPTIONS.strap) {
      expect(strapTexture(strap)).toBeInstanceOf(THREE.CanvasTexture);
    }
  });

  it("stageTexture produces a texture for every photo background", () => {
    for (const bg of ["Black", "White", "Leather", "Concrete", "Wood", "Glass"] as const) {
      expect(stageTexture(bg)).toBeInstanceOf(THREE.CanvasTexture);
    }
  });

  it("parameterless textures return canvas textures", () => {
    expect(movementTexture()).toBeInstanceOf(THREE.CanvasTexture);
    expect(rotorTexture()).toBeInstanceOf(THREE.CanvasTexture);
    expect(backdropTexture()).toBeInstanceOf(THREE.CanvasTexture);
    expect(shadowTexture()).toBeInstanceOf(THREE.CanvasTexture);
    expect(smudgeTexture()).toBeInstanceOf(THREE.CanvasTexture);
  });
});
