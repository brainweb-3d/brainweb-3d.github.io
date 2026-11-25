# BrainWeb

Vite + three.js, vanilla JS. Bilingual (EN + HE, RTL). Read `HANDOFF.md` first, then `README.md`; `HANDOVER.md` (local, gitignored) is the history.

## Commands
- Dev: `npm run dev` (http://localhost:5173). Build: `npm run build` (also rebuilds the catalog and the Claude `.mcpb`).
- No unit tests. After changes run `npm run build` and every `node tools/check-*.mjs`.
- Browser QA: `tools/qa/*.mjs`. Playwright is not a project dependency; run from a folder that has it, with Chromium flags `--use-angle=d3d11 --ignore-gpu-blocklist --enable-gpu`. Keep it light and headless.

## Rules
- Pushing `main` deploys the public site (GitHub Pages). Never push, and don't commit, unless asked.
- The repo is public: never commit the book PDFs, `assets-incoming/`, `backups/`, `HANDOVER.md`, screenshots, keys or tokens.
- Facts: the textbook (Freberg, local PDF) first; add a "Today:" note where newer research differs. Log decisions and sources in `docs/decisions-log.md`.
- Credit every asset in `docs/data-credits.md` and `assets-incoming/SOURCES.md`.
- All user-visible text needs English and Hebrew.

## Conventions
- A pathway's or effect's transmitters: `content/chemistry.js`; every item needs a role note (EN + HE) for that place.
- A place with a downloaded model needs a note in `content/modelNotes.js`.
- Button labels (`actions[].label.en`) are matched by substring from stories and effects (`acts`): don't rename them.
- Stage scenes: HTML overlays go through `stage.addHtml()`. Scene text is fixed at build time.

## Gotchas
- Code that relies on `fn.toString()` (three's meshopt worker) breaks when minified: test the built site, not only dev.
- Per-frame scene updaters pause while a real model hides the scene; hidden tabs get no animation frames.
- `import('/src/…')` from a test page can create a second module instance: set state via localStorage (`brainweb.*`) and reload.
- Edit JS containing backticks, quotes or Hebrew with the Edit/Write tools, not shell one-liners.
