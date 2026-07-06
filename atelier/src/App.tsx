import { Suspense, useEffect } from "react";
import Scene from "./three/Scene";
import { Landing } from "./ui/Landing";
import { Configurator } from "./ui/Configurator";
import { Chrome, StoryPanel, PhotoPanel, Finale, Hints } from "./ui/Overlays";
import { useAtelier } from "./lib/store";
import { sfx } from "./lib/audio";

/* the quiet mechanical heartbeat of the studio */
function Ticking() {
  const mode = useAtelier((s) => s.mode);
  const soundOn = useAtelier((s) => s.soundOn);
  useEffect(() => {
    if (mode === "landing" || !soundOn) return;
    if (mode === "finale") {
      const t = setTimeout(() => sfx.bigTick(), 1500);
      return () => clearTimeout(t);
    }
    const id = setInterval(() => sfx.tick(0.55), 1000);
    return () => clearInterval(id);
  }, [mode, soundOn]);
  return null;
}

export default function App() {
  return (
    <div className="fixed inset-0">
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <Landing />
      <Chrome />
      <Configurator />
      <StoryPanel />
      <PhotoPanel />
      <Finale />
      <Hints />
      <Ticking />
    </div>
  );
}
