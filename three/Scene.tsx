/* ────────────────────────────────────────────────
   The studio — lighting rigs, leather stage, dust,
   cinematic camera, drag inertia, photo capture.
   ──────────────────────────────────────────────── */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useAtelier } from "../lib/store";
import { LIGHT_RIGS, BG_COLORS, buildStory } from "../lib/config";
import { stageTexture, shadowTexture } from "../lib/textures";
import { Watch } from "./Watch";
import { sfx } from "../lib/audio";

const lerp = THREE.MathUtils.lerp;
const damp = THREE.MathUtils.damp;

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = rt.texture;
    return () => { rt.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
}

/* floating dust in the key light */
function Dust() {
  const ref = useRef<THREE.Points>(null);
  const N = 260;
  const [positions, speeds] = useMemo(() => {
    const p = new Float32Array(N * 3);
    const s = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 7;
      p[i * 3 + 2] = (Math.random() - 0.5) * 5 + 1;
      s[i] = 0.05 + Math.random() * 0.14;
    }
    return [p, s];
  }, []);
  useFrame((st, dt) => {
    if (!ref.current) return;
    const arr = (ref.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const t = st.clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] += speeds[i] * dt;
      arr[i * 3] += Math.sin(t * 0.35 + i) * 0.0009;
      if (arr[i * 3 + 1] > 3.6) arr[i * 3 + 1] = -3.6;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffe6c0" size={0.036} sizeAttenuation
        transparent opacity={0.55} depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* lighting that eases between rigs; reveal drives the landing fade-in */
function Lights() {
  const mode = useAtelier((s) => s.mode);
  const photoLight = useAtelier((s) => s.photoLight);
  const rig = mode === "photo" ? LIGHT_RIGS[photoLight] : LIGHT_RIGS.Museum;
  const reveal = useRef(0);
  const key = useRef<THREE.SpotLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const { scene } = useThree();
  useFrame((_, dt) => {
    const target = mode === "landing" ? 0 : mode === "finale" ? 0.32 : 1;
    reveal.current = damp(reveal.current, target, 1.1, dt);
    const r = reveal.current;
    if (key.current) {
      key.current.intensity = damp(key.current.intensity, rig.key * 60 * r, 3, dt);
      key.current.color.lerp(new THREE.Color(rig.keyColor), dt * 3);
    }
    if (fill.current) {
      fill.current.intensity = damp(fill.current.intensity, rig.fill * r, 3, dt);
      fill.current.color.lerp(new THREE.Color(rig.fillColor), dt * 3);
    }
    if (rim.current) {
      rim.current.intensity = damp(rim.current.intensity, rig.rim * r, 3, dt);
      rim.current.color.lerp(new THREE.Color(rig.rimColor), dt * 3);
    }
    if (amb.current) amb.current.intensity = damp(amb.current.intensity, 0.16 * rig.env * r + 0.012, 3, dt);
    scene.environmentIntensity = damp(scene.environmentIntensity ?? 0, rig.env * r, 3, dt);
  });
  return (
    <>
      <ambientLight ref={amb} intensity={0.01} />
      <spotLight
        ref={key}
        position={[2.6, 6.5, 5.5]}
        angle={0.5}
        penumbra={0.85}
        decay={1.6}
        intensity={0}
        castShadow={false}
      />
      <directionalLight ref={fill} position={[-6, 2, 4]} intensity={0} />
      <directionalLight ref={rim} position={[-3, 5, -6]} intensity={0} />
    </>
  );
}

/* stage surface + contact shadow + fog color */
function Stage() {
  const mode = useAtelier((s) => s.mode);
  const photoBg = useAtelier((s) => s.photoBg);
  const bg = mode === "photo" ? photoBg : "Leather";
  const tx = useMemo(() => {
    const t = stageTexture(bg);
    t.repeat.set(2.2, 2.2);
    return t;
  }, [bg]);
  const shadow = useMemo(() => shadowTexture(), []);
  const { scene } = useThree();
  useEffect(() => {
    const c = new THREE.Color(BG_COLORS[bg].fog);
    scene.background = c;
    scene.fog = new THREE.Fog(c, 9, 22);
  }, [bg, scene]);
  const glassy = bg === "Glass";
  return (
    <group position-y={-3.55}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[40, 40]} />
        <meshPhysicalMaterial
          map={tx}
          roughness={glassy ? 0.06 : bg === "White" ? 0.8 : 0.62}
          metalness={glassy ? 0.35 : 0.05}
          envMapIntensity={glassy ? 1 : 0.28}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
        <planeGeometry args={[9.5, 9.5]} />
        <meshBasicMaterial map={shadow} transparent opacity={0.75} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* museum vitrine for the finale */
function Vitrine() {
  const mode = useAtelier((s) => s.mode);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const target = mode === "finale" ? 1 : 0;
    const s = damp(ref.current.scale.x, target, 2.2, dt);
    ref.current.scale.setScalar(Math.max(0.0001, s));
    ref.current.visible = s > 0.01;
  });
  return (
    <group ref={ref} scale={0.0001}>
      <mesh position-y={0.1}>
        <boxGeometry args={[5.4, 6.9, 3.4]} />
        <meshPhysicalMaterial
          transmission={1} thickness={0.4} roughness={0.03} ior={1.5}
          transparent envMapIntensity={1.2} side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position-y={-3.5}>
        <boxGeometry args={[6.0, 0.4, 4.0]} />
        <meshPhysicalMaterial color="#151310" roughness={0.35} metalness={0.2} />
      </mesh>
    </group>
  );
}

/* drag rotation with inertia + flip + parallax + zoom */
function WatchRig() {
  const group = useRef<THREE.Group>(null);
  const flipped = useAtelier((s) => s.flipped);
  const mode = useAtelier((s) => s.mode);
  const dragY = useRef(0);          // user's rotation offset
  const dragX = useRef(0);
  const vel = useRef(0);            // angular velocity (rad/s) for rotor momentum
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0, t: 0 });
  const rotationVel = useRef(0);
  const { gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      const dt = Math.max(8, performance.now() - last.current.t);
      last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      dragY.current += dx * 0.0075;
      dragX.current = THREE.MathUtils.clamp(dragX.current + dy * 0.004, -0.55, 0.55);
      vel.current = (dx * 0.0075) / (dt / 1000);
    };
    const up = () => { dragging.current = false; };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [gl]);

  useFrame((st, dt) => {
    if (!group.current) return;
    if (!dragging.current) {
      // inertia, then a gentle settle back to rest
      dragY.current += vel.current * dt;
      vel.current *= 1 - Math.min(1, dt * 2.2);
      dragY.current = damp(dragY.current, 0, 0.55, dt);
      dragX.current = damp(dragX.current, 0, 0.8, dt);
    }
    const flipTarget = flipped ? Math.PI : 0;
    const prev = group.current.rotation.y;
    const targetY = flipTarget + dragY.current;
    group.current.rotation.y = damp(prev, targetY, 4.2, dt);
    rotationVel.current = (group.current.rotation.y - prev) / Math.max(dt, 0.001);
    group.current.rotation.x = damp(group.current.rotation.x, dragX.current, 4, dt);
    // slow cinematic idle drift + breathing
    const t = st.clock.elapsedTime;
    group.current.rotation.z = Math.sin(t * 0.23) * 0.012;
    group.current.position.y = Math.sin(t * 0.5) * 0.035 + (mode === "finale" ? 0.2 : 0);
  });

  return (
    <group ref={group} scale={0.72}>
      <Watch rotationVel={rotationVel} />
    </group>
  );
}

/* camera: parallax, scroll zoom, macro, landing dolly */
function CameraRig() {
  const { camera, gl } = useThree();
  const mode = useAtelier((s) => s.mode);
  const macro = useAtelier((s) => s.macro);
  const zoom = useRef(8.2);
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onWheel = (e: WheelEvent) => {
      if (useAtelier.getState().mode !== "studio") return;
      e.preventDefault();
      zoom.current = THREE.MathUtils.clamp(zoom.current + e.deltaY * 0.004, 3.0, 10.5);
    };
    window.addEventListener("pointermove", onMove);
    gl.domElement.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("pointermove", onMove);
      gl.domElement.removeEventListener("wheel", onWheel);
    };
  }, [gl]);
  useFrame((st, dt) => {
    const landing = mode === "landing";
    const targetZ = landing ? 10.8 : macro ? 3.1 : mode === "finale" ? 10.4 : zoom.current;
    const px = landing ? 0 : mouse.current.x * 0.42;
    const py = landing ? 0.7 : 0.35 - mouse.current.y * 0.28;
    const t = st.clock.elapsedTime;
    const drift = landing ? Math.sin(t * 0.1) * 0.35 : Math.sin(t * 0.07) * 0.14;
    camera.position.x = damp(camera.position.x, px + drift, 1.6, dt);
    camera.position.y = damp(camera.position.y, py, 1.6, dt);
    camera.position.z = damp(camera.position.z, targetZ, landing ? 0.35 : 1.8, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* still capture for photography mode */
function Capture() {
  const capturePulse = useAtelier((s) => s.capturePulse);
  const config = useAtelier((s) => s.config);
  const setCaptureError = useAtelier((s) => s.setCaptureError);
  const seen = useRef(0);
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (capturePulse === seen.current) return;
    seen.current = capturePulse;
    try {
      gl.render(scene, camera);
      const name = buildStory(config).model.replace(/\s+/g, "-").toLowerCase();
      const a = document.createElement("a");
      a.href = gl.domElement.toDataURL("image/png");
      a.download = `atelier-${name}.png`;
      a.click();
      sfx.shutter();
    } catch (error) {
      console.error("Photo capture failed.", error);
      setCaptureError("The image could not be saved. Please try again.");
    }
  }, [capturePulse, gl, scene, camera, config, setCaptureError]);
  return null;
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ fov: 38, position: [0, 0.7, 11], near: 0.1, far: 60 }}
    >
      <Env />
      <Lights />
      <Stage />
      <Dust />
      <WatchRig />
      <Vitrine />
      <CameraRig />
      <Capture />
    </Canvas>
  );
}
