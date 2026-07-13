# CALAME — Atlas Numérique

Digital atlas for CALAME, Le Locle. Static site — no build step, no dependencies.

- `index.html` — the atlas (eight sheets, elevation scroll)
- `table.html` — **L'Établi**, the watchmaking table: assemble the calibre O-46 at an interactive bench (desktop, with sound)

## Deploy on Vercel

1. Push this folder to GitHub:
   ```
   git init
   git add .
   git commit -m "CALAME digital atlas"
   git branch -M main
   git remote add origin https://github.com/<username>/calame-atlas.git
   git push -u origin main
   ```
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Framework preset: **Other**. Build command: none. Output directory: default.
4. Deploy.

`index.html` is served at the root automatically.
