/* ────────────────────────────────────────────────
   Procedural canvas textures — dial, movement,
   bezel inserts, straps, stage surfaces.
   Everything is drawn; nothing is downloaded.
   ──────────────────────────────────────────────── */
import * as THREE from "three";
import { WatchConfig, DialType, BezelType, StrapType, PhotoBg, CASE_MATERIALS } from "./config";

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  return [c, g];
}
function tex(c: HTMLCanvasElement, srgb = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function rand(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ============ DIAL ============ */
const S = 1024, C = S / 2;

function dialBase(g: CanvasRenderingContext2D, dial: DialType) {
  const r = rand(77);
  g.save();
  g.beginPath(); g.arc(C, C, C, 0, 7); g.clip();

  const solid = (col: string, sunburst = true, dark = true) => {
    g.fillStyle = col; g.fillRect(0, 0, S, S);
    if (sunburst) {
      g.globalAlpha = 0.09;
      for (let i = 0; i < 160; i++) {
        const a = (i / 160) * Math.PI * 2;
        g.strokeStyle = i % 2 ? (dark ? "rgba(255,255,255,.4)" : "rgba(0,0,0,.2)") : "rgba(0,0,0,.35)";
        g.lineWidth = 2.6;
        g.beginPath(); g.moveTo(C, C);
        g.lineTo(C + Math.cos(a) * C, C + Math.sin(a) * C); g.stroke();
      }
      g.globalAlpha = 1;
      // anisotropic sheen — one soft diagonal band, like brushed silk
      const sheen = g.createLinearGradient(0, 0, S, S);
      sheen.addColorStop(0.32, "rgba(255,255,255,0)");
      sheen.addColorStop(0.5, dark ? "rgba(255,255,255,.075)" : "rgba(255,255,255,.16)");
      sheen.addColorStop(0.68, "rgba(255,255,255,0)");
      g.fillStyle = sheen; g.fillRect(0, 0, S, S);
    }
  };

  switch (dial) {
    case "Black": solid("#101114"); break;
    case "White": solid("#efece3", false); break;
    case "Blue": solid("#16324f"); break;
    case "Green": solid("#123f2d"); break;
    case "Burgundy": solid("#4a1420"); break;
    case "Salmon": solid("#e8a87c", true, false); break;
    case "Enamel": {
      solid("#f4f1e8", false);
      const gr = g.createRadialGradient(C - 140, C - 160, 60, C, C, C);
      gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(190,182,164,.25)");
      g.fillStyle = gr; g.fillRect(0, 0, S, S);
      break;
    }
    case "Linen": {
      solid("#e3ddcd", false);
      g.strokeStyle = "rgba(120,110,90,.30)"; g.lineWidth = 1;
      for (let i = 0; i < S; i += 5) {
        g.beginPath(); g.moveTo(i, 0); g.lineTo(i, S); g.stroke();
        g.beginPath(); g.moveTo(0, i); g.lineTo(S, i); g.stroke();
      }
      g.fillStyle = "rgba(255,255,255,.14)";
      for (let i = 0; i < 2400; i++) g.fillRect(r() * S, r() * S, 3, 3);
      break;
    }
    case "Meteorite": {
      solid("#9aa0a8", false);
      for (let band = 0; band < 90; band++) {
        const a = (band % 3) * (Math.PI / 3) + (r() - 0.5) * 0.12;
        const x = r() * S, y = r() * S, len = 120 + r() * 260;
        g.strokeStyle = band % 2 ? "rgba(226,232,238,.5)" : "rgba(52,58,66,.55)";
        g.lineWidth = 2 + r() * 5;
        g.beginPath(); g.moveTo(x, y);
        g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
      }
      break;
    }
    case "Guilloché": {
      solid("#d8d4c8", false);
      // clous de Paris: interference of two circle families
      g.lineWidth = 1.1;
      for (let i = 1; i < 46; i++) {
        g.strokeStyle = i % 2 ? "rgba(90,80,60,.35)" : "rgba(255,255,255,.5)";
        g.beginPath(); g.arc(C, C, i * 11.5, 0, 7); g.stroke();
      }
      for (let i = 0; i < 120; i++) {
        const a = (i / 120) * Math.PI * 2;
        g.strokeStyle = i % 2 ? "rgba(90,80,60,.22)" : "rgba(255,255,255,.3)";
        g.beginPath(); g.moveTo(C, C);
        g.lineTo(C + Math.cos(a) * C, C + Math.sin(a) * C); g.stroke();
      }
      break;
    }
    case "Aventurine": {
      solid("#101c3a", false);
      const gr = g.createRadialGradient(C, C, 40, C, C, C);
      gr.addColorStop(0, "rgba(40,60,120,.55)"); gr.addColorStop(1, "rgba(4,8,22,.6)");
      g.fillStyle = gr; g.fillRect(0, 0, S, S);
      for (let i = 0; i < 1500; i++) {
        const a = r();
        g.fillStyle = `rgba(${a > .85 ? "255,240,210" : "185,205,255"},${(0.25 + r() * 0.75).toFixed(2)})`;
        g.fillRect(r() * S, r() * S, r() > 0.92 ? 2.6 : 1.4, 1.4);
      }
      break;
    }
    case "Mother of Pearl": {
      const gr = g.createRadialGradient(C - 120, C - 140, 60, C, C, C * 1.1);
      gr.addColorStop(0, "#fdfbf4"); gr.addColorStop(0.4, "#f3e3ee");
      gr.addColorStop(0.7, "#dde9f4"); gr.addColorStop(1, "#efe8d8");
      g.fillStyle = gr; g.fillRect(0, 0, S, S);
      for (let i = 0; i < 60; i++) {
        g.fillStyle = `rgba(${r() > .5 ? "244,214,232" : "212,228,246"},.18)`;
        g.beginPath();
        g.ellipse(r() * S, r() * S, 60 + r() * 120, 24 + r() * 40, r() * Math.PI, 0, 7);
        g.fill();
      }
      break;
    }
    case "Lapis Lazuli": {
      solid("#1a2f6e", false);
      for (let i = 0; i < 46; i++) {
        g.fillStyle = i % 3 ? "rgba(10,18,52,.5)" : "rgba(46,74,150,.45)";
        g.beginPath();
        g.ellipse(r() * S, r() * S, 40 + r() * 130, 20 + r() * 60, r() * Math.PI, 0, 7);
        g.fill();
      }
      g.fillStyle = "rgba(230,196,120,.9)";
      for (let i = 0; i < 130; i++) g.fillRect(r() * S, r() * S, 1.6 + r() * 2.4, 1.6);
      break;
    }
    case "Malachite": {
      solid("#0e5c3a", false);
      for (let i = 0; i < 26; i++) {
        g.strokeStyle = i % 2 ? "rgba(6,44,26,.65)" : "rgba(64,168,110,.5)";
        g.lineWidth = 7 + r() * 16;
        g.beginPath();
        g.arc(C - 180 + r() * 360, C - 180 + r() * 360, 60 + i * 22, r() * 6, r() * 6 + 2.4);
        g.stroke();
      }
      break;
    }
    case "Skeleton": {
      // openworked movement seen where the dial would be
      g.fillStyle = "#171310"; g.fillRect(0, 0, S, S);
      g.strokeStyle = "rgba(200,162,75,.8)"; g.lineWidth = 4;
      const gear = (x: number, y: number, R: number, teeth: number) => {
        g.save(); g.translate(x, y);
        g.fillStyle = "rgba(190,150,66,.9)";
        g.beginPath();
        for (let i = 0; i <= teeth * 2; i++) {
          const a = (i / (teeth * 2)) * Math.PI * 2;
          const rr = i % 2 ? R : R * 0.88;
          g[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr);
        }
        g.closePath(); g.fill();
        g.fillStyle = "#171310";
        for (let s2 = 0; s2 < 4; s2++) {
          const a = (s2 / 4) * Math.PI * 2 + 0.6;
          g.beginPath(); g.arc(Math.cos(a) * R * 0.52, Math.sin(a) * R * 0.52, R * 0.26, 0, 7); g.fill();
        }
        g.fillStyle = "#b3123a";
        g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill();
        g.restore();
      };
      gear(C, C - 150, 130, 24); gear(C + 150, C + 90, 96, 18);
      gear(C - 130, C + 130, 82, 16); gear(C + 20, C + 40, 60, 12);
      // bridges
      g.strokeStyle = "rgba(120,96,44,.9)"; g.lineWidth = 26; g.lineCap = "round";
      g.beginPath(); g.moveTo(C - 300, C - 40); g.quadraticCurveTo(C - 60, C - 320, C + 280, C - 160); g.stroke();
      g.beginPath(); g.moveTo(C - 240, C + 250); g.quadraticCurveTo(C + 40, C + 340, C + 300, C + 130); g.stroke();
      g.lineWidth = 1.4; g.strokeStyle = "rgba(255,232,180,.4)";
      for (let i = -14; i < 15; i++) { g.beginPath(); g.moveTo(C + i * 36, 0); g.lineTo(C + i * 36 + 120, S); g.stroke(); }
      break;
    }
  }
  // universal soft vignette
  const v = g.createRadialGradient(C, C, C * 0.55, C, C, C);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.34)");
  g.fillStyle = v; g.fillRect(0, 0, S, S);
  g.restore();
}

const LIGHT_DIALS: DialType[] = ["White", "Salmon", "Enamel", "Linen", "Guilloché", "Mother of Pearl", "Meteorite"];

export function dialTexture(cfg: WatchConfig): THREE.CanvasTexture {
  const [c, g] = canvas(S);
  dialBase(g, cfg.dial);
  const light = LIGHT_DIALS.includes(cfg.dial);
  const metal = CASE_MATERIALS[cfg.caseMat].color;
  const goldCase = ["Yellow Gold", "Rose Gold", "Bronze"].includes(cfg.caseMat);
  const idxA = goldCase ? "#f4dd94" : "#f4f5f7";
  const idxB = goldCase ? "#8a6d1f" : "#75787f";
  const ink = light ? "rgba(30,28,24,.9)" : "rgba(235,229,215,.92)";
  const inkSoft = light ? "rgba(30,28,24,.55)" : "rgba(235,229,215,.5)";

  // minute track
  g.save(); g.translate(C, C);
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const maj = i % 5 === 0;
    g.strokeStyle = maj ? ink : inkSoft;
    g.lineWidth = maj ? 5 : 2.2;
    const r1 = maj ? 438 : 452, r2 = 472;
    g.beginPath();
    g.moveTo(Math.sin(a) * r1, -Math.cos(a) * r1);
    g.lineTo(Math.sin(a) * r2, -Math.cos(a) * r2);
    g.stroke();
  }
  // applied indices (skip 3 o'clock for date)
  for (let h = 0; h < 12; h++) {
    if (h === 3 && cfg.dial !== "Skeleton") continue;
    const a = (h / 12) * Math.PI * 2;
    g.save();
    g.translate(Math.sin(a) * 385, -Math.cos(a) * 385);
    g.rotate(a);
    const grd = g.createLinearGradient(-11, 0, 11, 0);
    grd.addColorStop(0, idxA); grd.addColorStop(0.5, idxB); grd.addColorStop(1, idxA);
    g.fillStyle = grd;
    g.strokeStyle = "rgba(0,0,0,.5)"; g.lineWidth = 1.6;
    if (h === 0) { // double baton at 12
      g.fillRect(-26, -34, 20, 68); g.strokeRect(-26, -34, 20, 68);
      g.fillRect(6, -34, 20, 68); g.strokeRect(6, -34, 20, 68);
    } else {
      g.fillRect(-11, -36, 22, 72); g.strokeRect(-11, -36, 22, 72);
    }
    g.restore();
  }
  g.restore();

  // date window at 3 — recessed aperture with a polished frame
  if (cfg.dial !== "Skeleton") {
    const dx = C + 398, dy = C;
    const fr = g.createLinearGradient(dx - 38, dy - 44, dx + 42, dy + 44);
    fr.addColorStop(0, idxA); fr.addColorStop(0.5, idxB); fr.addColorStop(1, idxA);
    g.fillStyle = fr;
    g.fillRect(dx - 38, dy - 44, 80, 88);
    g.fillStyle = "rgba(0,0,0,.75)";
    g.fillRect(dx - 33, dy - 39, 70, 78);
    g.fillStyle = light ? "#f6f3ea" : "#f2efe6";
    g.fillRect(dx - 29, dy - 35, 62, 70);
    const shade = g.createLinearGradient(dx, dy - 35, dx, dy + 35);
    shade.addColorStop(0, "rgba(0,0,0,.32)"); shade.addColorStop(0.25, "rgba(0,0,0,0)");
    shade.addColorStop(0.85, "rgba(0,0,0,0)"); shade.addColorStop(1, "rgba(0,0,0,.2)");
    g.fillStyle = shade;
    g.fillRect(dx - 29, dy - 35, 62, 70);
    g.fillStyle = "#17161a";
    g.font = "600 46px Georgia";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(String(new Date().getDate()), dx + 2, dy + 2);
  }

  // typography
  g.fillStyle = ink;
  g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "28px Didot, Georgia, serif";
  const sp = (t: string) => t.split("").join(String.fromCharCode(8202, 8202));
  g.fillText(sp("A T E L I E R"), C, C - 128);
  g.font = "italic 19px Georgia";
  g.fillStyle = inkSoft;
  g.fillText("Genève", C, C + 148);
  g.font = "15px Georgia";
  g.fillText("SWISS  MADE", C, C + 448);

  return tex(c);
}

/* ============ MOVEMENT (caseback view) ============ */
export function movementTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(S);
  const r = rand(31);
  g.beginPath(); g.arc(C, C, C, 0, 7); g.clip();
  // rhodium-gilt base
  const base = g.createRadialGradient(C - 160, C - 200, 120, C, C, C * 1.15);
  base.addColorStop(0, "#a58a54"); base.addColorStop(0.6, "#8a7143"); base.addColorStop(1, "#5e4c2b");
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  // Geneva stripes — fine, subtle, correctly scaled
  g.save(); g.translate(C, C); g.rotate(0.42); g.translate(-C, -C);
  for (let i = -8; i < 40; i++) {
    const y = i * 34;
    const band = g.createLinearGradient(0, y, 0, y + 34);
    band.addColorStop(0, "rgba(255,236,190,.16)");
    band.addColorStop(0.45, "rgba(255,236,190,.02)");
    band.addColorStop(0.55, "rgba(58,42,14,.14)");
    band.addColorStop(1, "rgba(58,42,14,.03)");
    g.fillStyle = band;
    g.fillRect(-260, y, S + 520, 34);
  }
  g.restore();
  // perlage border — small overlapping circles, two rows
  for (let row = 0; row < 2; row++) {
    const R = 470 - row * 26, n = 68 - row * 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + row * 0.05;
      const px = C + Math.cos(a) * R, py = C + Math.sin(a) * R;
      const pg = g.createRadialGradient(px - 4, py - 4, 2, px, py, 15);
      pg.addColorStop(0, "rgba(255,242,205,.32)"); pg.addColorStop(1, "rgba(60,44,16,.12)");
      g.strokeStyle = "rgba(70,52,20,.35)"; g.lineWidth = 1.2;
      g.fillStyle = pg;
      g.beginPath(); g.arc(px, py, 14, 0, 7); g.fill(); g.stroke();
    }
  }
  // train wheels — shaded, seated in recesses
  const wheel = (x: number, y: number, R: number, teeth: number) => {
    g.save(); g.translate(x, y);
    // recess shadow
    const rs = g.createRadialGradient(0, 0, R * 0.6, 0, 0, R * 1.22);
    rs.addColorStop(0, "rgba(20,12,2,.0)"); rs.addColorStop(0.8, "rgba(20,12,2,.42)"); rs.addColorStop(1, "rgba(20,12,2,0)");
    g.fillStyle = rs; g.beginPath(); g.arc(0, 0, R * 1.25, 0, 7); g.fill();
    // toothed rim
    const gold = g.createRadialGradient(-R * 0.4, -R * 0.4, R * 0.2, 0, 0, R * 1.1);
    gold.addColorStop(0, "#f0d489"); gold.addColorStop(0.55, "#c9a445"); gold.addColorStop(1, "#7c6023");
    g.fillStyle = gold;
    g.beginPath();
    for (let i = 0; i <= teeth * 2; i++) {
      const a = (i / (teeth * 2)) * Math.PI * 2;
      const rr = i % 2 ? R : R * 0.92;
      g[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr);
    }
    g.closePath(); g.fill();
    g.strokeStyle = "rgba(70,50,12,.8)"; g.lineWidth = 2; g.stroke();
    // crossing spokes (four-arm wheel)
    g.fillStyle = "rgba(34,22,6,.78)";
    for (let s2 = 0; s2 < 4; s2++) {
      const a = (s2 / 4) * Math.PI * 2 + 0.78;
      g.beginPath();
      g.ellipse(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5, R * 0.27, R * 0.21, a, 0, 7);
      g.fill();
    }
    g.strokeStyle = "rgba(255,238,196,.5)"; g.lineWidth = 1.4;
    g.beginPath(); g.arc(0, 0, R * 0.88, 0, 7); g.stroke();
    // chaton + jewel
    g.fillStyle = "#d8bd77"; g.beginPath(); g.arc(0, 0, 17, 0, 7); g.fill();
    g.strokeStyle = "rgba(70,50,12,.75)"; g.lineWidth = 1.6; g.stroke();
    const ruby = g.createRadialGradient(-3, -3, 1, 0, 0, 10);
    ruby.addColorStop(0, "#ff6a80"); ruby.addColorStop(0.55, "#b3123a"); ruby.addColorStop(1, "#5c0418");
    g.fillStyle = ruby; g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill();
    g.restore();
  };
  wheel(C + 168, C - 128, 104, 22);
  wheel(C - 58, C - 216, 80, 18);
  wheel(C - 206, C - 56, 68, 16);
  // balance — ring with screws + hairspring
  g.save(); g.translate(C - 166, C + 188);
  const bs = g.createRadialGradient(0, 0, 40, 0, 0, 108);
  bs.addColorStop(0, "rgba(16,10,2,.0)"); bs.addColorStop(0.85, "rgba(16,10,2,.45)"); bs.addColorStop(1, "rgba(16,10,2,0)");
  g.fillStyle = bs; g.beginPath(); g.arc(0, 0, 110, 0, 7); g.fill();
  g.strokeStyle = "#e3c26e"; g.lineWidth = 13;
  g.beginPath(); g.arc(0, 0, 86, 0, 7); g.stroke();
  g.strokeStyle = "rgba(90,64,16,.55)"; g.lineWidth = 2;
  g.beginPath(); g.arc(0, 0, 93, 0, 7); g.stroke();
  g.strokeStyle = "#caa74e"; g.lineWidth = 9;
  g.beginPath(); g.moveTo(-80, 0); g.lineTo(80, 0); g.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.4;
    g.fillStyle = "#f0d489";
    g.beginPath(); g.arc(Math.cos(a) * 86, Math.sin(a) * 86, 5, 0, 7); g.fill();
  }
  g.strokeStyle = "rgba(88,112,150,.95)"; g.lineWidth = 2.4;
  g.beginPath();
  for (let a = 0; a < 26; a += 0.22) {
    const rr = 5 + a * 2.6;
    g[a ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr);
  }
  g.stroke();
  g.fillStyle = "#b3123a"; g.beginPath(); g.arc(0, 0, 8, 0, 7); g.fill();
  g.restore();
  // blued screws — slotted, with polished rims
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2, R = 190 + r() * 200;
    const x = C + Math.cos(a) * R, y = C + Math.sin(a) * R;
    g.fillStyle = "#c9ad6a"; g.beginPath(); g.arc(x, y, 15.5, 0, 7); g.fill();
    const bl = g.createRadialGradient(x - 4, y - 4, 1, x, y, 12);
    bl.addColorStop(0, "#4a72b8"); bl.addColorStop(0.6, "#24406e"); bl.addColorStop(1, "#101d38");
    g.fillStyle = bl;
    g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill();
    g.strokeStyle = "rgba(0,0,0,.7)"; g.lineWidth = 3;
    const sa = r() * Math.PI;
    g.beginPath(); g.moveTo(x - Math.cos(sa) * 8, y - Math.sin(sa) * 8);
    g.lineTo(x + Math.cos(sa) * 8, y + Math.sin(sa) * 8); g.stroke();
  }
  // engraving
  g.fillStyle = "rgba(48,32,6,.85)";
  g.textAlign = "center";
  g.font = "25px Georgia";
  g.fillText("ATELIER  ·  CALIBRE A-01", C, C + 44);
  g.font = "italic 18px Georgia";
  g.fillText("twenty-one jewels · Genève", C, C + 80);
  g.font = "12px Georgia";
  g.fillText("designed by Faizan Farooq", C, C + 352);
  return tex(c);
}

/* rotor texture (drawn on upper half of a disc) */
export function rotorTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(512);
  g.clearRect(0, 0, 512, 512);
  g.beginPath(); g.arc(256, 256, 254, Math.PI, Math.PI * 2); g.closePath(); g.clip();
  // body — soft gilt gradient
  const body = g.createLinearGradient(80, 20, 400, 250);
  body.addColorStop(0, "#b89a5e"); body.addColorStop(0.5, "#93794a"); body.addColorStop(1, "#6e5834");
  g.fillStyle = body; g.fillRect(0, 0, 512, 512);
  // fine stripes
  g.save(); g.translate(256, 256); g.rotate(-0.3); g.translate(-256, -256);
  for (let i = -6; i < 22; i++) {
    const y = i * 26;
    const band = g.createLinearGradient(0, y, 0, y + 26);
    band.addColorStop(0, "rgba(255,236,190,.2)");
    band.addColorStop(0.5, "rgba(255,236,190,.02)");
    band.addColorStop(0.52, "rgba(58,42,14,.16)");
    band.addColorStop(1, "rgba(58,42,14,.02)");
    g.fillStyle = band; g.fillRect(-140, y, 800, 26);
  }
  g.restore();
  // heavy tungsten weight rim
  const rim = g.createRadialGradient(256, 256, 196, 256, 256, 254);
  rim.addColorStop(0, "rgba(0,0,0,0)"); rim.addColorStop(0.12, "rgba(40,42,48,.92)");
  rim.addColorStop(0.6, "rgba(96,100,110,.95)"); rim.addColorStop(1, "rgba(28,30,35,.98)");
  g.fillStyle = rim;
  g.beginPath(); g.arc(256, 256, 254, Math.PI, Math.PI * 2);
  g.arc(256, 256, 196, Math.PI * 2, Math.PI, true); g.closePath(); g.fill();
  // polished edges
  g.strokeStyle = "rgba(255,244,210,.5)"; g.lineWidth = 2;
  g.beginPath(); g.arc(256, 256, 196, Math.PI, Math.PI * 2); g.stroke();
  g.strokeStyle = "rgba(0,0,0,.75)"; g.lineWidth = 3;
  g.beginPath(); g.arc(256, 256, 252, Math.PI, Math.PI * 2); g.stroke();
  // openwork slots
  g.globalCompositeOperation = "destination-out";
  for (const sa of [Math.PI * 1.18, Math.PI * 1.62]) {
    g.beginPath();
    g.arc(256, 256, 150, sa, sa + 0.34);
    g.arc(256, 256, 92, sa + 0.34, sa, true);
    g.closePath(); g.fill();
  }
  g.globalCompositeOperation = "source-over";
  g.fillStyle = "rgba(48,32,6,.9)";
  g.textAlign = "center";
  g.font = "30px Didot, Georgia, serif";
  g.fillText("ATELIER", 256, 96);
  g.font = "italic 13px Georgia";
  g.fillText("automatique", 256, 122);
  return tex(c);
}

/* studio cyclorama — a warm falloff behind the product */
export function backdropTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(1024);
  const grd = g.createRadialGradient(512, 600, 60, 512, 620, 900);
  grd.addColorStop(0, "#241c13");
  grd.addColorStop(0.35, "#17110a");
  grd.addColorStop(0.7, "#0b0806");
  grd.addColorStop(1, "#050403");
  g.fillStyle = grd; g.fillRect(0, 0, 1024, 1024);
  return tex(c);
}

/* ============ BEZEL INSERT ============ */
export function bezelInsertTexture(type: BezelType): THREE.CanvasTexture | null {
  if (type !== "GMT" && type !== "Tachymeter" && type !== "Ceramic") return null;
  const [c, g] = canvas(S);
  g.beginPath(); g.arc(C, C, C, 0, 7);
  g.arc(C, C, C * 0.72, 0, 7, true); g.clip("evenodd");
  if (type === "GMT") {
    g.fillStyle = "#132c4e";
    g.fillRect(0, 0, S, S);
    g.save(); g.beginPath(); g.moveTo(C, C);
    g.arc(C, C, C, -Math.PI / 2, Math.PI / 2); g.closePath();
    g.fillStyle = "#5c1220"; g.fill(); g.restore();
  } else {
    g.fillStyle = "#0d0e11"; g.fillRect(0, 0, S, S);
  }
  g.fillStyle = "#efece0"; g.textAlign = "center"; g.textBaseline = "middle";
  if (type === "GMT") {
    g.font = "600 64px Georgia";
    for (let h = 0; h < 24; h += 2) {
      const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
      g.save();
      g.translate(C + Math.cos(a) * 438, C + Math.sin(a) * 438);
      g.rotate(a + Math.PI / 2);
      g.fillText(String(h === 0 ? 24 : h), 0, 0);
      g.restore();
    }
  } else if (type === "Tachymeter") {
    g.font = "500 42px Georgia";
    const marks = [400, 350, 300, 275, 250, 225, 200, 190, 180, 170, 160, 150, 140, 130, 120, 110, 100, 90, 80, 75, 70, 65, 60];
    marks.forEach((v) => {
      const a = ((3600 / v) / 60) * Math.PI * 2 - Math.PI / 2;
      g.save();
      g.translate(C + Math.cos(a) * 440, C + Math.sin(a) * 440);
      g.rotate(a + Math.PI / 2);
      g.fillText(String(v), 0, 0);
      g.restore();
    });
    g.font = "italic 34px Georgia";
    g.save(); g.translate(C, C + 452); g.fillText("TACHYMÈTRE", 0, 0); g.restore();
  }
  return tex(c);
}

/* ============ STRAP ============ */
export function strapTexture(type: StrapType): THREE.CanvasTexture {
  const [c, g] = canvas(512);
  const r = rand(type.length * 97);
  const grain = (base: string, pore: string, n: number) => {
    g.fillStyle = base; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < n; i++) {
      g.fillStyle = pore;
      g.globalAlpha = 0.14 + r() * 0.3;
      g.beginPath();
      g.ellipse(r() * 512, r() * 512, 1 + r() * 3, 1 + r() * 2, r() * 3, 0, 7);
      g.fill();
    }
    g.globalAlpha = 1;
  };
  const stitch = (col: string) => {
    g.setLineDash([13, 9]);
    g.strokeStyle = col; g.lineWidth = 4; g.lineCap = "round";
    for (const x of [26, 486]) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke();
    }
    g.setLineDash([]);
    // edge burnish
    for (const x of [3, 509]) {
      g.strokeStyle = "rgba(0,0,0,.55)"; g.lineWidth = 7;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke();
    }
  };
  switch (type) {
    case "Leather": grain("#53341d", "#2a1708", 2600); stitch("rgba(235,214,170,.6)"); break;
    case "Alligator": {
      grain("#2c1a0d", "#180d04", 400);
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 5; x++) {
          const w = 86 + r() * 14, h = 52 + r() * 10;
          const px = x * 102 + (y % 2) * 40 - 20, py = y * 64;
          g.strokeStyle = "rgba(10,5,2,.8)"; g.lineWidth = 5;
          g.fillStyle = `rgba(94,56,26,${0.5 + r() * 0.4})`;
          g.beginPath();
          (g as CanvasRenderingContext2D & { roundRect: (a: number, b: number, c2: number, d: number, e: number) => void })
            .roundRect(px, py, w, h, 18);
          g.fill(); g.stroke();
        }
      stitch("rgba(226,202,158,.5)");
      break;
    }
    case "Rubber": {
      g.fillStyle = "#17181b"; g.fillRect(0, 0, 512, 512);
      g.strokeStyle = "rgba(255,255,255,.05)"; g.lineWidth = 2;
      for (let i = 0; i < 512; i += 9) { g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); }
      break;
    }
    case "Canvas": {
      g.fillStyle = "#4a4a3a"; g.fillRect(0, 0, 512, 512);
      for (let ycoord = 0; ycoord < 128; ycoord++)
        for (let x = 0; x < 128; x++) {
          g.fillStyle = (x + ycoord) % 2 ? "rgba(255,250,230,.13)" : "rgba(0,0,0,.2)";
          g.fillRect(x * 4, ycoord * 4, 4, 4);
        }
      stitch("rgba(240,235,214,.4)");
      break;
    }
    case "Milanese": {
      g.fillStyle = "#84888f"; g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 44; y++)
        for (let x = 0; x < 44; x++) {
          g.fillStyle = (x + y) % 2 ? "#c9cdd4" : "#5e626a";
          g.beginPath();
          g.arc(x * 12 + (y % 2) * 6, y * 12, 5, 0, 7);
          g.fill();
        }
      break;
    }
    default: { // metal link bracelets: Oyster / Jubilee / President — banding drawn per-link
      g.fillStyle = "#b9bdc4"; g.fillRect(0, 0, 512, 512);
      const rows = type === "Jubilee" ? 5 : 3;
      const widths = type === "Jubilee" ? [0.22, 0.14, 0.28, 0.14, 0.22] : [0.33, 0.34, 0.33];
      let x0 = 0;
      for (let i = 0; i < rows; i++) {
        const w = widths[i] * 512;
        const mid = i % 2 === (type === "Jubilee" ? 1 : 0);
        const grd = g.createLinearGradient(x0, 0, x0 + w, 0);
        grd.addColorStop(0, mid ? "#f2f4f7" : "#a9adb5");
        grd.addColorStop(0.5, mid ? "#c2c7cf" : "#e5e8ee");
        grd.addColorStop(1, mid ? "#f2f4f7" : "#8e939b");
        g.fillStyle = grd; g.fillRect(x0, 0, w, 512);
        g.strokeStyle = "rgba(20,22,26,.55)"; g.lineWidth = 3;
        g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0, 512); g.stroke();
        x0 += w;
      }
      const linkH = type === "President" ? 74 : 64;
      for (let y = 0; y < 512; y += linkH) {
        g.strokeStyle = "rgba(20,22,26,.6)"; g.lineWidth = 4;
        g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke();
        g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 2;
        g.beginPath(); g.moveTo(0, y + 3); g.lineTo(512, y + 3); g.stroke();
      }
    }
  }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
export function strapIsMetal(type: StrapType) {
  return ["Milanese", "Oyster", "Jubilee", "President"].includes(type);
}

/* ============ STAGE SURFACES ============ */
export function stageTexture(bg: PhotoBg): THREE.CanvasTexture {
  const [c, g] = canvas(1024);
  const r = rand(bg.length * 131);
  switch (bg) {
    case "Leather":
    case "Black": {
      g.fillStyle = bg === "Black" ? "#141310" : "#2a1a11";
      g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 9000; i++) {
        g.fillStyle = r() > 0.5 ? "rgba(255,235,200,.03)" : "rgba(0,0,0,.14)";
        g.beginPath();
        g.ellipse(r() * 1024, r() * 1024, 1 + r() * 3.4, 1 + r() * 2.4, r() * 3, 0, 7);
        g.fill();
      }
      break;
    }
    case "White": {
      g.fillStyle = "#eae7e0"; g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 2600; i++) {
        g.fillStyle = "rgba(120,116,108,.05)";
        g.fillRect(r() * 1024, r() * 1024, 2, 2);
      }
      break;
    }
    case "Concrete": {
      g.fillStyle = "#8b8a86"; g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 12000; i++) {
        g.fillStyle = r() > 0.5 ? "rgba(255,255,255,.05)" : "rgba(30,30,30,.07)";
        g.fillRect(r() * 1024, r() * 1024, 1 + r() * 3, 1 + r() * 3);
      }
      for (let i = 0; i < 7; i++) {
        g.strokeStyle = "rgba(50,50,48,.25)"; g.lineWidth = 1;
        g.beginPath(); g.moveTo(r() * 1024, r() * 1024);
        g.lineTo(r() * 1024, r() * 1024); g.stroke();
      }
      break;
    }
    case "Wood": {
      g.fillStyle = "#4a2f18"; g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 90; i++) {
        g.strokeStyle = i % 2 ? "rgba(24,12,4,.4)" : "rgba(190,130,70,.14)";
        g.lineWidth = 2 + r() * 9;
        g.beginPath();
        g.moveTo(0, i * 12 + r() * 8);
        g.bezierCurveTo(300, i * 12 + r() * 30 - 15, 700, i * 12 + r() * 30 - 15, 1024, i * 12 + r() * 8);
        g.stroke();
      }
      break;
    }
    case "Glass": {
      const grd = g.createLinearGradient(0, 0, 1024, 1024);
      grd.addColorStop(0, "#2b333c"); grd.addColorStop(0.5, "#161b21"); grd.addColorStop(1, "#22292f");
      g.fillStyle = grd; g.fillRect(0, 0, 1024, 1024);
      g.strokeStyle = "rgba(255,255,255,.09)"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, 780); g.lineTo(1024, 560); g.stroke();
      break;
    }
  }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* soft radial contact shadow */
export function shadowTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(256);
  const grd = g.createRadialGradient(128, 128, 8, 128, 128, 126);
  grd.addColorStop(0, "rgba(0,0,0,.85)");
  grd.addColorStop(0.55, "rgba(0,0,0,.4)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  return tex(c, false);
}

/* faint smudges + hairlines for the crystal */
export function smudgeTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(256);
  const r = rand(9);
  g.fillStyle = "rgb(20,20,20)"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4; i++) {
    g.strokeStyle = "rgba(120,120,120,.5)";
    g.lineWidth = 10;
    g.beginPath();
    g.ellipse(60 + r() * 140, 60 + r() * 140, 26 + r() * 30, 14 + r() * 16, r() * 3, 0.4, 2.6);
    g.stroke();
  }
  for (let i = 0; i < 8; i++) {
    g.strokeStyle = "rgba(150,150,150,.35)"; g.lineWidth = 1;
    g.beginPath(); g.moveTo(r() * 256, r() * 256);
    g.lineTo(r() * 256, r() * 256); g.stroke();
  }
  const t = tex(c, false);
  return t;
}
