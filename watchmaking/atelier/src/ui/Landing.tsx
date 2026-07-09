import { motion, AnimatePresence } from "framer-motion";
import { useAtelier } from "../lib/store";
import { initAudio, sfx } from "../lib/audio";

export function Landing() {
  const mode = useAtelier((s) => s.mode);
  const enter = useAtelier((s) => s.enter);
  return (
    <AnimatePresence>
      {mode === "landing" && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center cursor-pointer select-none"
          style={{ background: "radial-gradient(120% 120% at 50% 42%, rgba(11,10,9,.42) 30%, rgba(4,3,2,.96) 100%)" }}
          exit={{ opacity: 0, transition: { duration: 2.6, ease: "easeInOut" } }}
          onClick={() => {
            initAudio();
            sfx.bigTick();
            setTimeout(enter, 420);
          }}
        >
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.9em" }}
            animate={{ opacity: 1, letterSpacing: "0.52em" }}
            transition={{ duration: 3.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
            className="font-display text-[clamp(34px,7vw,74px)] text-bone uppercase pl-[0.52em]"
          >
            Atelier
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.4, delay: 2.0 }}
            className="mt-5 italic text-[clamp(13px,1.6vw,17px)] tracking-[0.14em] text-champagne/90"
          >
            Design the watch only you could create.
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 3.4 }}
            className="absolute bottom-[9vh] label breathe pl-[0.34em]"
          >
            Enter the studio
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
