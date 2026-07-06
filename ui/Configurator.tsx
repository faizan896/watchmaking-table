import { motion, AnimatePresence } from "framer-motion";
import { useAtelier } from "../lib/store";
import {
  OPTIONS, SECTIONS, SectionKey, CASE_MATERIALS, DIAL_SWATCH,
  WatchConfig,
} from "../lib/config";
import { sfx } from "../lib/audio";

function swatchFor(key: SectionKey, opt: string): string {
  if (key === "caseMat") {
    const c = CASE_MATERIALS[opt as keyof typeof CASE_MATERIALS].color;
    return `linear-gradient(135deg, #fff 0%, ${c} 42%, ${c} 62%, #43403a 130%)`;
  }
  if (key === "dial") {
    const c = DIAL_SWATCH[opt as keyof typeof DIAL_SWATCH];
    return `linear-gradient(140deg, ${c}, ${c} 55%, rgba(0,0,0,.45))`;
  }
  return "linear-gradient(135deg,#7b756a,#3d3a34)";
}

export function Configurator() {
  const mode = useAtelier((s) => s.mode);
  const section = useAtelier((s) => s.section);
  const setSection = useAtelier((s) => s.setSection);
  const config = useAtelier((s) => s.config);
  const set = useAtelier((s) => s.set);

  if (mode !== "studio") return null;
  const opts = OPTIONS[section] as readonly string[];

  return (
    <>
      {/* chapter nav — bottom left */}
      <motion.nav
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-[4vw] bottom-[6vh] z-30 select-none"
      >
        <div className="label mb-4 opacity-70">Composition</div>
        <ul className="space-y-[9px]">
          {SECTIONS.map((s, i) => (
            <li
              key={s.key}
              onClick={() => { setSection(s.key); sfx.click(); }}
              className={`cursor-pointer flex items-baseline gap-3 transition-all duration-500 ${
                section === s.key ? "text-bone" : "text-bone/35 hover:text-bone/70"
              }`}
            >
              <span className="font-display text-[11px] w-6 text-champagne/70">
                {["I", "II", "III", "IV", "V", "VI", "VII"][i]}
              </span>
              <span className="text-[12.5px] tracking-[0.22em] uppercase">{s.label}</span>
              {section === s.key && (
                <motion.span layoutId="navline" className="h-px w-8 bg-champagne/80 self-center" />
              )}
            </li>
          ))}
        </ul>
      </motion.nav>

      {/* options — right */}
      <motion.aside
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-[4vw] top-1/2 -translate-y-1/2 z-30 w-[212px] max-h-[72vh] select-none"
      >
        <div className="label mb-1 opacity-70">
          {SECTIONS.find((s) => s.key === section)?.label}
        </div>
        <div className="h-px w-full bg-bone/10 mb-3" />
        <AnimatePresence mode="wait">
          <motion.ul
            key={section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="overflow-y-auto scroll-thin pr-2 max-h-[62vh]"
          >
            {opts.map((opt) => {
              const sel = config[section] === opt;
              return (
                <li
                  key={opt}
                  className={`opt ${sel ? "sel" : ""}`}
                  onClick={() => {
                    set(section, opt as WatchConfig[typeof section]);
                    sfx.click();
                  }}
                >
                  <span className="dot" style={{ background: swatchFor(section, opt) }} />
                  <span className="nm">{opt}</span>
                </li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </motion.aside>
    </>
  );
}
