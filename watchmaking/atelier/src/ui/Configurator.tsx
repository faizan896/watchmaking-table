import { motion, AnimatePresence } from "framer-motion";
import { useAtelier } from "../lib/store";
import {
  OPTIONS, SECTIONS, SectionKey, CASE_MATERIALS, DIAL_SWATCH,
  WatchConfig,
} from "../lib/config";
import { sfx } from "../lib/audio";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

/* a swatch only where color is real information; otherwise a quiet tick */
function swatchFor(key: SectionKey, opt: string): string | null {
  if (key === "caseMat") {
    const c = CASE_MATERIALS[opt as keyof typeof CASE_MATERIALS].color;
    return `linear-gradient(135deg, #fff 0%, ${c} 42%, ${c} 62%, #43403a 130%)`;
  }
  if (key === "dial") {
    const c = DIAL_SWATCH[opt as keyof typeof DIAL_SWATCH];
    return `linear-gradient(140deg, ${c}, ${c} 55%, rgba(0,0,0,.45))`;
  }
  return null;
}

export function Configurator() {
  const mode = useAtelier((s) => s.mode);
  const section = useAtelier((s) => s.section);
  const setSection = useAtelier((s) => s.setSection);
  const config = useAtelier((s) => s.config);
  const set = useAtelier((s) => s.set);

  if (mode !== "studio") return null;
  const opts = OPTIONS[section] as readonly string[];
  const sectionIdx = SECTIONS.findIndex((s) => s.key === section);

  return (
    <>
      {/* chapter nav — bottom left */}
      <motion.nav
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-[4.5vw] bottom-[7vh] z-30 select-none"
      >
        <div className="label mb-4 opacity-60">Composition</div>
        <ul className="space-y-[8px]">
          {SECTIONS.map((s, i) => (
            <li
              key={s.key}
              onClick={() => { setSection(s.key); sfx.click(); }}
              className={`cursor-pointer flex items-baseline gap-3 transition-all duration-700 ${
                section === s.key ? "text-bone" : "text-bone/30 hover:text-bone/65"
              }`}
            >
              <span className={`font-display text-[10.5px] w-6 transition-colors duration-700 ${
                section === s.key ? "text-champagne" : "text-champagne/40"
              }`}>
                {ROMAN[i]}
              </span>
              <span className="text-[12px] tracking-[0.24em] uppercase">{s.label}</span>
              {section === s.key && (
                <motion.span layoutId="navline" className="h-px w-9 bg-champagne/70 self-center" />
              )}
            </li>
          ))}
        </ul>
      </motion.nav>

      {/* options — right, beneath a ghosted editorial numeral */}
      <motion.aside
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-[4.5vw] top-1/2 -translate-y-1/2 z-30 w-[210px] select-none"
      >
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={section + "-num"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="font-display absolute -top-16 -right-2 text-[86px] leading-none text-bone/[0.055] pointer-events-none"
            >
              {ROMAN[sectionIdx]}
            </motion.div>
          </AnimatePresence>
          <div className="label mb-1 opacity-60">
            {SECTIONS[sectionIdx]?.label}
          </div>
          <div className="h-px w-full bg-bone/10 mb-3" />
          <AnimatePresence mode="wait">
            <motion.ul
              key={section}
              initial="out"
              animate="in"
              exit="gone"
              variants={{}}
              className="overflow-y-auto scroll-thin pr-2 max-h-[56vh]"
            >
              {opts.map((opt, i) => {
                const sel = config[section] === opt;
                const sw = swatchFor(section, opt);
                return (
                  <motion.li
                    key={opt}
                    variants={{
                      out: { opacity: 0, y: 10 },
                      in: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.035, ease: [0.22, 1, 0.36, 1] } },
                      gone: { opacity: 0, transition: { duration: 0.18 } },
                    }}
                    className={`opt ${sel ? "sel" : ""}`}
                    onClick={() => {
                      set(section, opt as WatchConfig[typeof section]);
                      sfx.click();
                    }}
                  >
                    {sw ? (
                      <span className="dot" style={{ background: sw }} />
                    ) : (
                      <span className="tick" />
                    )}
                    <span className="nm">{opt}</span>
                  </motion.li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
