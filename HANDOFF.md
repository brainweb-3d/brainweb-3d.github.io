# BrainWeb handoff (2026-11-25)

## Goal
Bilingual (EN/HE) interactive 3D biological-psychology site, based on Freberg, shared with friends via GitHub Pages.
This stretch is done when the local work below is accurate, the open issues are handled, and the owner says to publish.

## Current state
- Live: https://ortal-libon.github.io/brainweb/ (repo `ortal-libon/brainweb`, public, deploys on push to `main`). Last pushed work: ☰ menu fix, meshopt build fix, Claude extension 1.0.1.
- **Local only:** attention networks + test, 🧪 messenger card, "What you're seeing" notes, cortex redesign. Owner answered "Not yet" to publishing (twice); not asked about the last two.
- 2026-11-25: `npm run build` OK; `check-graph`, `check-stories`, `check-chemistry`, `check-model-notes` all OK.
- Six headless scripts (dev server) ran with exit 0 and no page errors: attention test, chem card, chem roles, real notes, cortex, replay of 6 pathways. They mostly print for reading; few assertions. The new features were not browser-tested in the *built* site.
- Counts: 16 pathways; 31 effects, 27 with messenger lists (none for ttx, ms, sci, fever); 19 messengers; 79 labels; 43 real-model notes.

## Changes this session (* = pushed)
- *`.github/workflows/pages.yml`, `.gitignore`: deploy; keep private/large files out.
- *`tools/vite-meshopt-worker-fix.mjs`, `vite.config.js`: minifier broke the model decoder worker.
- *`mcp/brainweb-claude/src/server.js`, `manifest.json`, `src/views/settings.js`: extension accepts the live origin; address hint hidden there.
- `src/brain/pathways.js`: "attention" pathway (5 steps), surface points, `view`, `spots`.
- `src/brain/PathwayAnimator.js`: spots and HTML labels. `src/brain/BrainScene.js`: `surfacePoint`, `wantView`, `modelDone`.
- `src/views/attentionTask.js`: short Attention Network Test. `src/explore/brainTools.js`: Try-it button, `brainweb:pathStep`.
- `content/chemistry.js`, `src/explore/chemCard.js`: messenger lists and card. `src/visual/levels/molecule.js`: shared names/colours.
- `content/modelNotes.js`: real-model notes and marks. `src/explore/hotspots.js`: label-only `mark` dots.
- `src/explore/index.js`: card, molecule context, notes, marks. `src/explore/graph.js`: `alone` on three dots.
- `src/visual/levels/tissue.js`: `cortexScene` rewritten. `src/visual/Stage.js`: `addHtml`/`htmlEls`.
- `src/explore/models.js`, `World.js`: `realShown`; hide scene HTML in real view. `src/styles.css`: ☰ menu fix*, new UI styles.
- `tools/check-chemistry.mjs`, `tools/check-model-notes.mjs`, `tools/qa/*`: checks and QA scripts. `docs/decisions-log.md`: log.
- `CLAUDE.md`, `HANDOFF.md`: new. `HANDOVER.md` (gitignored) was not updated since 2026-11-17.

## Decisions and rejected approaches
- Public repo + Pages, code + docs only: free Pages needs a public repo; books are copyrighted.
- Attention areas are spots, not new meshes: splitting gyri would change existing lobe highlights.
- Network lights up from the results, not per trial: animation would disturb a timed task.
- No ANT reference times shown: Fan 2002 could not be read.
- Labels are HTML: canvas sprites blurred. Labels only for the current step: clutter.
- Attention clock starts without waiting for a frame: hidden tabs get none.
- Hormones get their own card section; no background blur (slow over 3D).
- Real view hides the ruler from `setMode`: `root.visible`/`pickHidden` are unreliable and updaters pause.
- Dots on fight-or-flight, day and memory stay hidden (owner, 2026-11-15), so `DIVE_CHEM` is wired but unreachable and untested.

## Open issues
1. **Security: fix built 2026-11-25, NOT published** (own address brainweb-3d.github.io; see the end of the log). Problem: all `ortal-libon.github.io/*` pages share one origin, so any of them can read BrainWeb's localStorage: the Claude pairing token (`src/ai/claudeBridge.js:100`) and any saved API key. The earlier claim to the owner that their other Pages sites can't connect without the code is **wrong**. The token is also written unencrypted.
2. **Fixed 2026-11-25 (not committed).** Cortex: thalamic axons stay on after "Input vs output layers" (`tissue.js:257`; confirmed).
3. **Fixed 2026-11-25 (not committed).** Cortex: the column's cells are still faint (`tissue.js:184-188`; confirmed by screenshot).
4. **Fixed 2026-11-25 (not committed).** Language switch does not refresh the cortex ruler (`tissue.js:196`) or playing spot labels (`PathwayAnimator.js:128`); confirmed.
5. Attention test: a set 40/30/80 ms responder scored 36/35/78, then 49/20/89; scores are noisier than reported (8 trials per cue). After a pause the progress bar restarts (`attentionTask.js:104`).
6. **Checked 2026-11-25, partly open (see the log). Earlier status:** Chemistry: only some claims were searched in Freberg; unsupported there, e.g. olfactory glutamate (no hit), attention ACh/dopamine sites, dopamine and habits. Attention papers: read as search summaries, not full text. Model notes: models were seen (fMRI/DTI/PET reuse other pictures), but most "the drawn view shows…" sentences were not checked against scenes. "KCNQ1… measured structure" rests on the credits. Cortex "tens of thousands of neurons/mm³" is unsourced.
7. **Fixed 2026-11-25 (not committed).** `docs/decisions-log.md:528` says "18 pathways" and "26 of the 30 effects": should be 16 and 27 of 31 (owner was told the wrong numbers). Its "book check" wording overstates item 6.
8. Not tested: real Claude Desktop, a real API key, Gemini sign-in; ChatGPT works only locally.
9. A test run of the extension may have created `%APPDATA%\BrainWeb\claude-bridge.json` (its normal token file).

## Next steps
1. Correct the counts and wording in the log (7). Done 2026-11-25.
2. Fix 2, then 4, then 3. Done 2026-11-25.
3. Owner chose an own address; organization `brainweb-3d` exists; code ready. Left, each needing the owner's OK: commit, create repo `brainweb-3d/brainweb-3d.github.io` + Pages, push, then publish tools/old-site (index.html + 404.html) at the old address.
4. Fact check (6): done 2026-11-25 as far as sources allowed; what is still NOT VERIFIED is listed at the end of docs/decisions-log.md.
5. Built site browser-tested 2026-11-25 (see the log). After publishing: test the live site and pairing in the real Claude Desktop.

## Commands
- Run: `npm run dev` → http://localhost:5173. Build: `npm run build`. Built site: `npm run preview -- --port 4173`.
- Checks: `node tools/check-graph.mjs`, `check-stories.mjs`, `check-chemistry.mjs`, `check-model-notes.mjs` (same folder).
- Browser QA (dev server on): copy `tools/qa/<name>.mjs` to a folder with Playwright (this PC: `%TEMP%\bw-perf`) and run `node <name>.mjs <outDir>`; `actions.mjs <outDir> <place…>`.
