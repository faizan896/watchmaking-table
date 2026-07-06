/* ────────────────────────────────────────────────
   The watch — every component built independently:
   case, bezel, crystal, dial, hands, crown, lugs,
   strap, caseback, movement, rotor.
   ──────────────────────────────────────────────── */
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAtelier } from "../lib/store";
import { CASE_MATERIALS, FINISH_MOD, WatchConfig } from "../lib/config";
import {
  dialTexture, movementTexture, rotorTexture, bezelInsertTexture,
  strapTexture, strapIsMetal, smudgeTexture,
} from "../lib/textures";
import { sfx } from "../lib/audio";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* ---------- shared case material ---------- */
function useCaseMaterial(cfg: WatchConfig) {
  return useMemo(() => {
    const base = CASE_MATERIALS[cfg.caseMat];
    const mod = FINISH_MOD[cfg.finish];
    const m = new THREE.MeshPhysicalMaterial({
      color: base.color,
      metalness: clamp(base.metalness + mod.dm, 0, 1),
      roughness: clamp(base.roughness + mod.dr, 0.03, 1),
      clearcoat: base.clearcoat ?? 0,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.15,
    });
    if (cfg.finish === "Brushed" || cfg.finish === "Satin") {
      m.anisotropy = cfg.finish === "Brushed" ? 0.85 : 0.5;
    }
    return m;
  }, [cfg.caseMat, cfg.finish]);
}

/* ---------- hands ---------- */
function polyShape(pts: [number, number][]): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
}
function leafShape(L: number, W: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, -0.18);
  s.quadraticCurveTo(W * 1.5, L * 0.3, 0, L);
  s.quadraticCurveTo(-W * 1.5, L * 0.3, 0, -0.18);
  return s;
}
function handShape(style: string, L: number, W: number): THREE.Shape | null {
  switch (style) {
    case "Dauphine": return polyShape([[0, -0.2], [W, 0.02], [0, L], [-W, 0.02]]);
    case "Sword": return polyShape([[-W * 0.7, -0.2], [W * 0.7, -0.2], [W * 0.45, L * 0.84], [0, L], [-W * 0.45, L * 0.84]]);
    case "Leaf": return leafShape(L, W);
    case "Alpha": return polyShape([
      [-W * 0.4, -0.2], [W * 0.4, -0.2], [W * 1.15, L * 0.2], [W * 0.28, L * 0.3],
      [W * 0.13, L], [-W * 0.13, L], [-W * 0.28, L * 0.3], [-W * 1.15, L * 0.2]]);
    default: return null;
  }
}
interface HandProps { style: string; L: number; W: number; mat: THREE.Material; z: number; }
function Hand({ style, L, W, mat, z }: HandProps) {
  const geo = useMemo(() => {
    const sh = handShape(style, L, W);
    if (!sh) return null;
    return new THREE.ExtrudeGeometry(sh, { depth: 0.016, bevelEnabled: false });
  }, [style, L, W]);
  if (geo) return <mesh geometry={geo} material={mat} position-z={z} />;
  /* composed styles — Breguet / Cathedral / Mercedes */
  if (style === "Breguet") {
    return (
      <group position-z={z}>
        <mesh material={mat} position-y={L * 0.32}>
          <boxGeometry args={[W * 0.9, L * 0.98, 0.016]} />
        </mesh>
        <mesh material={mat} position-y={L * 0.76}>
          <torusGeometry args={[L * 0.085, W * 0.42, 12, 32]} />
        </mesh>
        <mesh material={mat} position-y={L * 0.95}>
          <coneGeometry args={[W * 0.9, L * 0.14, 4]} />
        </mesh>
      </group>
    );
  }
  if (style === "Cathedral") {
    return (
      <group position-z={z}>
        <mesh material={mat} position-y={L * 0.36}>
          <boxGeometry args={[W * 0.8, L * 1.05, 0.016]} />
        </mesh>
        <mesh material={mat} position-y={L * 0.4}>
          <torusGeometry args={[L * 0.14, W * 0.42, 12, 32]} />
        </mesh>
        <mesh material={mat} position-y={L * 0.4} rotation-z={Math.PI / 4}>
          <boxGeometry args={[W * 0.7, L * 0.27, 0.014]} />
        </mesh>
        <mesh material={mat} position-y={L * 0.74}>
          <torusGeometry args={[L * 0.08, W * 0.4, 12, 28]} />
        </mesh>
        <mesh material={mat} position-y={L * 0.96}>
          <coneGeometry args={[W * 0.85, L * 0.12, 4]} />
        </mesh>
      </group>
    );
  }
  /* Mercedes */
  return (
    <group position-z={z}>
      <mesh material={mat} position-y={L * 0.28}>
        <boxGeometry args={[W * 1.05, L * 0.82, 0.016]} />
      </mesh>
      <mesh material={mat} position-y={L * 0.72}>
        <torusGeometry args={[L * 0.145, W * 0.5, 12, 36]} />
      </mesh>
      {[0, 2.094, -2.094].map((a) => (
        <mesh key={a} material={mat} position-y={L * 0.72} rotation-z={a}>
          <boxGeometry args={[W * 0.5, L * 0.14, 0.014]} />
        </mesh>
      ))}
      <mesh material={mat} position-y={L * 0.98}>
        <coneGeometry args={[W * 0.8, L * 0.14, 4]} />
      </mesh>
    </group>
  );
}

function Hands({ cfg, caseMat }: { cfg: WatchConfig; caseMat: THREE.Material }) {
  const hourRef = useRef<THREE.Group>(null);
  const minRef = useRef<THREE.Group>(null);
  const secRef = useRef<THREE.Group>(null);
  const goldCase = ["Yellow Gold", "Rose Gold", "Bronze"].includes(cfg.caseMat);
  const secMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: goldCase ? "#d4af37" : "#24406e",
      metalness: 0.9, roughness: 0.2, envMapIntensity: 1.2,
    }),
    [goldCase]
  );
  useFrame(() => {
    const now = new Date();
    const ms = now.getMilliseconds() / 1000;
    const s = now.getSeconds() + ms;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    if (hourRef.current) hourRef.current.rotation.z = -(h / 12) * Math.PI * 2;
    if (minRef.current) minRef.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (secRef.current) secRef.current.rotation.z = -(s / 60) * Math.PI * 2;
  });
  return (
    <group position-z={0.24}>
      <group ref={hourRef}>
        <Hand style={cfg.hands} L={0.95} W={0.115} mat={caseMat} z={0} />
      </group>
      <group ref={minRef}>
        <Hand style={cfg.hands} L={1.5} W={0.085} mat={caseMat} z={0.035} />
      </group>
      <group ref={secRef} position-z={0.07}>
        <mesh material={secMat} position-y={0.62}>
          <boxGeometry args={[0.028, 1.95, 0.012]} />
        </mesh>
        <mesh material={secMat} position-y={-0.42}>
          <torusGeometry args={[0.08, 0.028, 10, 24]} />
        </mesh>
      </group>
      <mesh material={caseMat} position-z={0.1} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.085, 0.085, 0.06, 24]} />
      </mesh>
    </group>
  );
}

/* ---------- bezel ---------- */
function Bezel({ cfg, caseMat }: { cfg: WatchConfig; caseMat: THREE.Material }) {
  const insert = useMemo(() => bezelInsertTexture(cfg.bezel), [cfg.bezel]);
  const insertMat = useMemo(() => {
    if (!insert) return null;
    return new THREE.MeshPhysicalMaterial({
      map: insert, metalness: 0.2, roughness: 0.12,
      clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.9,
    });
  }, [insert]);
  const knurl = useMemo(() => {
    if (cfg.bezel !== "Coin Edge") return null;
    const g = new THREE.Group();
    return g;
  }, [cfg.bezel]);
  void knurl;
  return (
    <group position-z={0.3}>
      {cfg.bezel === "Fluted" ? (
        <mesh material={caseMat} scale-z={0.62}>
          <torusGeometry args={[1.94, 0.185, 7, 88]} />
        </mesh>
      ) : (
        <mesh material={caseMat} scale-z={0.7}>
          <torusGeometry args={[1.94, 0.175, 24, 96]} />
        </mesh>
      )}
      {cfg.bezel === "Coin Edge" &&
        Array.from({ length: 84 }).map((_, i) => {
          const a = (i / 84) * Math.PI * 2;
          return (
            <mesh
              key={i}
              material={caseMat}
              position={[Math.cos(a) * 2.1, Math.sin(a) * 2.1, -0.02]}
              rotation-z={a}
            >
              <boxGeometry args={[0.028, 0.09, 0.16]} />
            </mesh>
          );
        })}
      {insertMat && (
        <mesh material={insertMat} position-z={0.128}>
          <ringGeometry args={[1.78, 2.1, 96]} />
        </mesh>
      )}
    </group>
  );
}

/* ---------- crystal ---------- */
function Crystal({ cfg }: { cfg: WatchConfig }) {
  const smudge = useMemo(() => smudgeTexture(), []);
  void smudge;
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        transmission: 1, thickness: 0.22, roughness: 0.02,
        ior: 1.52, envMapIntensity: 0.5,
        clearcoat: 0.4, clearcoatRoughness: 0.05, transparent: true,
      }),
    []
  );
  switch (cfg.crystal) {
    case "Flat":
      return (
        <mesh material={mat} position-z={0.36} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[1.76, 1.76, 0.07, 72]} />
        </mesh>
      );
    case "Box":
      return (
        <mesh material={mat} position-z={0.43} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[1.7, 1.76, 0.24, 72]} />
        </mesh>
      );
    case "Double Domed":
      return (
        <mesh material={mat} position-z={0.3} scale={[1, 1, 0.5]}>
          <sphereGeometry args={[1.78, 64, 32]} />
        </mesh>
      );
    default: // Domed
      return (
        <mesh material={mat} position-z={0.26} scale={[1, 1, 0.36]}>
          <sphereGeometry args={[1.86, 64, 32]} />
        </mesh>
      );
  }
}

/* ---------- strap — tapered, stitched, buckled ---------- */
function strapShape(wTop: number, wEnd: number, len: number): THREE.Shape {
  const s = new THREE.Shape();
  const hT = wTop / 2, hE = wEnd / 2, r = wEnd * 0.28;
  s.moveTo(-hT, 0);
  s.lineTo(hT, 0);
  s.lineTo(hE, -len + r);
  s.quadraticCurveTo(hE, -len, hE - r, -len);
  s.lineTo(-hE + r, -len);
  s.quadraticCurveTo(-hE, -len, -hE, -len + r);
  s.closePath();
  return s;
}
function Strap({ cfg, caseMat }: { cfg: WatchConfig; caseMat: THREE.Material }) {
  const t = useMemo(() => strapTexture(cfg.strap), [cfg.strap]);
  const metal = strapIsMetal(cfg.strap);
  const mat = useMemo(() => {
    t.repeat.set(0.62, 0.38);
    t.offset.set(0.19, 0);
    return new THREE.MeshPhysicalMaterial({
      map: t,
      metalness: metal ? (cfg.strap === "Milanese" ? 0.75 : 0.55) : 0.02,
      roughness: metal ? 0.28 : cfg.strap === "Rubber" ? 0.5 : 0.62,
      clearcoat: metal ? 0 : cfg.strap === "Rubber" ? 0.25 : 0.18,
      clearcoatRoughness: 0.5,
      envMapIntensity: metal ? 1.15 : 0.32,
    });
  }, [t, metal, cfg.strap]);
  const w = metal ? 1.6 : 1.48;
  const geoTop = useMemo(
    () => new THREE.ExtrudeGeometry(strapShape(w, metal ? w : w * 0.84, 2.45), { depth: 0.1, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 2 }),
    [w, metal]
  );
  return (
    <group>
      {/* top strap: wide at the lugs, tapering upward */}
      <group position={[0, 2.08, -0.16]} rotation={[-0.18, 0, Math.PI]}>
        <mesh material={mat} geometry={geoTop} />
      </group>
      {/* bottom strap: tapering down toward the buckle */}
      <mesh material={mat} geometry={geoTop} position={[0, -2.08, -0.16]} rotation-x={0.18} />
      {!metal && (
        /* buckle at the end of the lower strap */
        <group position={[0, -4.42, -0.22]} rotation-x={0.22}>
          <mesh material={caseMat}>
            <torusGeometry args={[0.52, 0.055, 12, 32]} />
          </mesh>
          <mesh material={caseMat} position-y={0.28} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.04, 0.04, 1.0, 12]} />
          </mesh>
          <mesh material={caseMat} position-y={-0.18} rotation-x={0.5}>
            <boxGeometry args={[0.07, 0.5, 0.045]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ---------- lugs — extruded trapezoids with bevelled edges ---------- */
function Lugs({ caseMat }: { caseMat: THREE.Material }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    // gentle horn: wide at case, narrowing outward
    s.moveTo(-0.19, 0);
    s.lineTo(0.19, 0);
    s.lineTo(0.145, 0.66);
    s.quadraticCurveTo(0.14, 0.73, 0.075, 0.74);
    s.lineTo(-0.075, 0.74);
    s.quadraticCurveTo(-0.14, 0.73, -0.145, 0.66);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, {
      depth: 0.21, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.045, bevelSegments: 3,
    });
  }, []);
  return (
    <>
      {[
        [1.06, 1.78, 0, -0.26], [-1.06, 1.78, 0, -0.26],
        [1.06, -1.78, Math.PI, 0.26], [-1.06, -1.78, Math.PI, 0.26],
      ].map(([x, y, rz, rx], i) => (
        <group key={i} position={[x, y, -0.18]} rotation={[rx, 0, rz]}>
          <mesh geometry={geo} material={caseMat} />
        </group>
      ))}
    </>
  );
}

/* ---------- caseback + movement + rotor ---------- */
function Caseback({ caseMat, rotationVel }: { caseMat: THREE.Material; rotationVel: React.MutableRefObject<number> }) {
  const movement = useMemo(() => movementTexture(), []);
  const rotorTex = useMemo(() => rotorTexture(), []);
  const rotor = useRef<THREE.Mesh>(null);
  const rotorVel = useRef(2.6); // a gentle first swing so the rotor is discovered alive
  const movMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: movement, metalness: 0.6, roughness: 0.38 }),
    [movement]
  );
  const rotorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: rotorTex, metalness: 0.75, roughness: 0.3,
        transparent: true, alphaTest: 0.4, side: THREE.DoubleSide,
      }),
    [rotorTex]
  );
  useFrame((_, dt) => {
    // the rotor picks up momentum from how the watch is being turned
    rotorVel.current += rotationVel.current * 2.2;
    rotorVel.current = clamp(rotorVel.current, -9, 9);
    rotorVel.current *= 1 - Math.min(1, dt * 1.4);
    if (rotor.current) rotor.current.rotation.z += rotorVel.current * dt;
  });
  return (
    <group rotation-y={Math.PI}>
      <mesh material={caseMat} position-z={0.36} scale-z={0.55}>
        <torusGeometry args={[1.86, 0.22, 24, 96]} />
      </mesh>
      <mesh material={movMat} position-z={0.3}>
        <circleGeometry args={[1.62, 96]} />
      </mesh>
      {/* shadow pool beneath the rotor for depth */}
      <mesh position-z={0.38}>
        <circleGeometry args={[1.27, 64]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} />
      </mesh>
      <mesh
        ref={rotor}
        material={rotorMat}
        position-z={0.395}
        onClick={(e) => { e.stopPropagation(); rotorVel.current += 6; sfx.whoosh(); }}
      >
        <circleGeometry args={[1.24, 72]} />
      </mesh>
      {/* sapphire over the movement */}
      <mesh position-z={0.46}>
        <circleGeometry args={[1.66, 96]} />
        <meshPhysicalMaterial
          transmission={1} thickness={0.2} roughness={0.05}
          ior={1.5} transparent envMapIntensity={1.1}
        />
      </mesh>
    </group>
  );
}

/* ---------- crown ---------- */
function Crown({ caseMat }: { caseMat: THREE.Material }) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const windPulse = useAtelier((s) => s.windPulse);
  const seen = useRef(0);
  useEffect(() => {
    if (windPulse !== seen.current) {
      seen.current = windPulse;
      spin.current += 14;
      sfx.wind(7);
    }
  }, [windPulse]);
  useFrame((_, dt) => {
    if (!g.current) return;
    const step = spin.current * Math.min(1, dt * 5);
    g.current.rotation.x -= step;
    spin.current -= step;
  });
  const wind = useAtelier((s) => s.wind);
  return (
    <group
      position={[2.22, 0, 0]}
      onClick={(e) => { e.stopPropagation(); wind(); }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <group ref={g}>
        <mesh material={caseMat} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.19, 0.19, 0.24, 14, 1]} />
        </mesh>
        <mesh material={caseMat} rotation-z={Math.PI / 2} position-x={0.13}>
          <cylinderGeometry args={[0.13, 0.16, 0.06, 14]} />
        </mesh>
      </group>
      <mesh material={caseMat} rotation-z={Math.PI / 2} position-x={-0.16}>
        <cylinderGeometry args={[0.09, 0.09, 0.14, 16]} />
      </mesh>
    </group>
  );
}

/* ---------- the whole watch ---------- */
export function Watch({ rotationVel }: { rotationVel: React.MutableRefObject<number> }) {
  const cfg = useAtelier((s) => s.config);
  const caseMat = useCaseMaterial(cfg);
  const dialTex = useMemo(() => dialTexture(cfg), [cfg]);
  const dialMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: dialTex,
        roughness: ["Enamel", "Lapis Lazuli", "Malachite", "Aventurine"].includes(cfg.dial) ? 0.12 : 0.5,
        metalness: ["Meteorite", "Guilloché"].includes(cfg.dial) ? 0.55 : 0.08,
      }),
    [dialTex, cfg.dial]
  );

  const caseProfile = useMemo(() => {
    const pts: THREE.Vector2[] = [
      new THREE.Vector2(1.5, -0.44),
      new THREE.Vector2(1.98, -0.36),
      new THREE.Vector2(2.1, -0.12),
      new THREE.Vector2(2.1, 0.16),
      new THREE.Vector2(1.98, 0.3),
      new THREE.Vector2(1.78, 0.32),
    ];
    return new THREE.LatheGeometry(pts, 96);
  }, []);

  return (
    <group>
      {/* case body */}
      <mesh geometry={caseProfile} material={caseMat} rotation-x={Math.PI / 2} />
      {/* lugs — machined, bevelled, hugging the case */}
      <Lugs caseMat={caseMat} />
      <Bezel cfg={cfg} caseMat={caseMat} />
      {/* dial + rehaut */}
      <mesh material={caseMat} position-z={0.2} scale-z={0.4}>
        <torusGeometry args={[1.73, 0.05, 12, 96]} />
      </mesh>
      <mesh material={dialMat} position-z={0.18}>
        <circleGeometry args={[1.72, 96]} />
      </mesh>
      <Hands cfg={cfg} caseMat={caseMat} />
      <Crystal cfg={cfg} />
      <Crown caseMat={caseMat} />
      <Strap cfg={cfg} caseMat={caseMat} />
      <Caseback caseMat={caseMat} rotationVel={rotationVel} />
    </group>
  );
}
