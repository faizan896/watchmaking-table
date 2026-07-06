# ATELIER

*Design the watch only you could create.*

A cinematic luxury watch design studio — React + TypeScript + Three.js (React Three Fiber) + Framer Motion + Tailwind. Every texture is procedurally drawn; no assets, no backend, no external APIs.

## The experience

- **Landing** — black screen, a single mechanical tick, a spotlight reveals the watch.
- **Studio** — compose the piece: 9 case metals, 5 finishes, 15 dials (meteorite, guilloché, aventurine, lapis, malachite, skeleton…), 7 hand styles, 6 bezels, 4 crystals, 8 straps. Instant updates.
- **Interactions** — drag to turn with inertia, scroll to approach, click the crown to wind, flip to the exhibition caseback, click the rotor to spin it with momentum.
- **Loupe** — macro inspection: engravings, blued screws, jewels, Geneva stripes, perlage.
- **Photography** — 6 surfaces × 6 lighting rigs; Capture downloads a magazine-grade PNG.
- **The Story** — a generated luxury dossier: model name, collection, inspiration, philosophy, movement, price, collector's notes.
- **Finale** — the watch enters a museum vitrine; the certificate signs off: *Designed by Faizan Farooq.*

## Run locally

```bash
npm install
npm run dev
```

## Deploy on Vercel

Push this folder to a Git repo and import it in Vercel — the Vite preset is detected automatically (build `npm run build`, output `dist`). Or from the terminal:

```bash
npx vercel --prod
```
