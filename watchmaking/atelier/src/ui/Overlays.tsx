import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtelier } from "../lib/store";
import { buildStory, PHOTO_BGS, PHOTO_LIGHTS } from "../lib/config";
import { initAudio, sfx, setAudioEnabled } from "../lib/audio";

/* ---------- top chrome ---------- */
export function Chrome() {
  const mode = useAtelier((s) => s.mode);
  const st = useAtelier();
  if (mode === "landing") return null;
  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-[4.5vw] pt-7 select-none"
    >
      <div className="font-display tracking-luxe text-[15px] uppercase pl-[0.42em] text-bone/90">Atelier</div>
      <div className="flex gap-4 items-center flex-wrap justify-end">
        {mode === "studio" && (
          <>
            <button className={`lnk ${st.macro ? "active" : ""}`}
              onClick={() => { st.toggleMacro(); sfx.whoosh(); }}>
              {st.macro ? "Withdraw" : "Loupe"}
            </button>
            <button className={`lnk ${st.flipped ? "active" : ""}`}
              onClick={() => { st.toggleFlip(); sfx.whoosh(); }}>
              {st.flipped ? "Dial" : "Movement"}
            </button>
            <button className={`lnk ${st.storyOpen ? "active" : ""}`}
              onClick={() => { st.setStoryOpen(!st.storyOpen); sfx.click(); }}>
              Story
            </button>
            <button className="lnk" onClick={() => { st.setMode("photo"); sfx.whoosh(); }}>
              Photography
            </button>
            <button
              className="lnk opacity-60 hover:opacity-100"
              onClick={async () => {
                const nextSoundOn = !st.soundOn;
                const audioReady = !nextSoundOn || await initAudio();
                st.setSoundOn(nextSoundOn && audioReady);
                setAudioEnabled(nextSoundOn && audioReady);
              }}
              aria-label="Toggle sound"
            >
              {st.soundOn ? "Sound" : "Muted"}
            </button>
            <span className="lnk-sep" />
            <button className="lnk lnk-primary" onClick={() => { st.setMode("finale"); sfx.chime(); }}>
              Complete
            </button>
          </>
        )}
        {mode === "photo" && (
          <button className="lnk active" onClick={() => { st.setMode("studio"); sfx.click(); }}>
            Return to studio
          </button>
        )}
      </div>
    </motion.header>
  );
}

/* ---------- the story / certificate ---------- */
export function StoryPanel() {
  const open = useAtelier((s) => s.storyOpen);
  const setOpen = useAtelier((s) => s.setStoryOpen);
  const config = useAtelier((s) => s.config);
  const story = useMemo(() => buildStory(config), [config]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          className="fixed inset-0 z-40 flex items-center justify-center px-5"
          style={{ background: "rgba(6,5,4,.78)", backdropFilter: "blur(10px)" }}
          onClick={() => setOpen(false)}
        >
          <motion.article
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-[min(620px,94vw)] max-h-[86vh] overflow-y-auto scroll-thin border hairline px-[7%] py-12 text-center"
            style={{ background: "linear-gradient(168deg, #16130f, #0c0a08)" }}
          >
            <div className="label mb-6">{story.collection}</div>
            <h2 className="font-display text-[clamp(26px,4vw,40px)] tracking-[0.18em] uppercase">
              {story.model}
            </h2>
            <div className="text-champagne/80 text-[11px] tracking-[0.3em] mt-2">{story.reference}</div>
            <div className="w-14 h-px bg-champagne/50 mx-auto my-8" />
            <p className="italic text-[15.5px] leading-8 text-bone/90">{story.persona}</p>

            {([
              ["Inspiration", story.inspiration],
              ["Design Philosophy", story.philosophy],
              ["The Movement", story.movement],
              ["Collector's Notes", story.notes],
            ] as const).map(([k, v]) => (
              <div key={k} className="mt-8">
                <div className="label mb-2.5">{k}</div>
                <p className="text-[13.5px] leading-7 text-bone/70">{v}</p>
              </div>
            ))}

            <div className="w-14 h-px bg-champagne/50 mx-auto my-9" />
            <div className="flex justify-center gap-12 text-[12px] tracking-[0.2em] uppercase text-bone/75">
              <span>{story.price}</span>
              <span>{story.year}</span>
            </div>
            <div className="mt-9 text-[10px] tracking-[0.34em] uppercase text-bone/40">
              Certificate of Design · Atelier Genève
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- photography controls ---------- */
export function PhotoPanel() {
  const mode = useAtelier((s) => s.mode);
  const st = useAtelier();
  if (mode !== "photo") return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-[5vh] inset-x-0 z-30 flex flex-col items-center gap-5 select-none px-4"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-baseline gap-5 flex-wrap justify-center">
          <span className="label opacity-50">Surface</span>
          {PHOTO_BGS.map((b) => (
            <button key={b}
              className={`lnk ${st.photoBg === b ? "active" : ""}`}
              onClick={() => { st.setPhotoBg(b); sfx.click(); }}>
              {b}
            </button>
          ))}
        </div>
        <div className="flex items-baseline gap-5 flex-wrap justify-center">
          <span className="label opacity-50">Light</span>
          {PHOTO_LIGHTS.map((l) => (
            <button key={l}
              className={`lnk ${st.photoLight === l ? "active" : ""}`}
              onClick={() => { st.setPhotoLight(l); sfx.click(); }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <button className="lnk lnk-primary mt-1" onClick={() => st.capture()}>
        Capture the shot
      </button>
      {st.captureError && (
        <div role="alert" className="text-[11px] tracking-[0.12em] text-red-300">
          {st.captureError}
        </div>
      )}
    </motion.div>
  );
}

/* ---------- finale ---------- */
export function Finale() {
  const mode = useAtelier((s) => s.mode);
  const reset = useAtelier((s) => s.reset);
  const config = useAtelier((s) => s.config);
  const story = useMemo(() => buildStory(config), [config]);
  return (
    <AnimatePresence>
      {mode === "finale" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.4 } }}
          transition={{ duration: 3 }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-end pb-[9vh] pointer-events-none"
          style={{ background: "radial-gradient(110% 110% at 50% 38%, rgba(0,0,0,0) 34%, rgba(3,2,1,.9) 100%)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center pointer-events-auto"
          >
            <div className="font-display tracking-luxe text-[26px] uppercase pl-[0.42em]">Atelier</div>
            <div className="w-12 h-px bg-champagne/60 mx-auto my-5" />
            <div className="label mb-2">{story.model} · {story.reference}</div>
            <div className="mt-6 text-[11px] tracking-[0.3em] uppercase text-bone/60">Designed by</div>
            <div className="font-display text-[22px] tracking-[0.2em] mt-2">Faizan Farooq</div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4.2, duration: 1.8 }}
              className="lnk mt-10"
              onClick={() => { reset(); sfx.click(); }}
            >
              Design another
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- one quiet hint that introduces itself, then leaves ---------- */
export function Hints() {
  const mode = useAtelier((s) => s.mode);
  if (mode !== "studio") return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ delay: 3.2, duration: 12, times: [0, 0.12, 0.82, 1] }}
      className="fixed bottom-[5vh] inset-x-0 z-20 text-center select-none pointer-events-none"
    >
      <div className="text-[9.5px] tracking-[0.34em] uppercase text-bone/30">
        drag to turn &nbsp;·&nbsp; scroll to approach &nbsp;·&nbsp; the crown winds, if asked
      </div>
    </motion.div>
  );
}
