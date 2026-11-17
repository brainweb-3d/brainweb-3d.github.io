# v6 redesign — shared spec for the build agents (2026-11-11)

Read `HANDOVER.md` and `README.md` first. The user approved:
- **Explore** becomes one continuous 3D drill-down that starts at **the brain**. Clicking a part dives the camera into it and the next level grows inside it, crossfading with **no cut, no black frame and no fade-to-dark**. Breadcrumb at the top; info only on request.
- **Login:** three buttons — Claude (MCP desktop extension, plus an API-key option), ChatGPT (Sign in with ChatGPT), Gemini (Google sign-in).
- Research methods become in-scene hotspots at the brain ("How do we see this?").

Reference prototype (seamless dive, hotspots, breadcrumb, sheet): `prototype/drilldown.html`. The prototype is placeholder-quality; reuse its techniques, not its art.

## File ownership (never edit a file you don't own; ask the main session instead)
| Agent | Owns |
|---|---|
| **Graph** | `src/explore/graph.js` (new) |
| **Explore** | `src/explore/**` except graph.js, `src/visual/Stage.js`, `src/visual/LevelView.js` (may be deleted), `src/visual/ZoomBar.js` (delete), `src/views/explore.js`, `src/views/tour.js`, `src/brain/BrainScene.js`, `src/visual/fullscreen.js`, `src/visual/effects.js`, `src/visual/stories.js`, `src/main.js`, `index.html`, `src/styles.css`, `src/i18n.js` |
| **Login** | `src/ai/**`, `src/views/settings.js`, `src/test/aiTest.js`, `vite.config.js`, `tools/vite-ai-bridge.mjs` (new), `mcp/**` (new), `package.json` + `package-lock.json` (only the Login agent installs packages), `.gitignore` |
| **Test UI** | `src/test/TestView.js`, `src/test/Runner.js`, `src/test/questionBank.js` (UI only), `src/practice/**`, `src/test/test.css` (new) |
| main session | `README.md`, `HANDOVER.md`, `docs/**`, `public/models/**`, `assets-incoming/**`, `prototype/**` |

Level scene files (`src/visual/levels/*.js`, `src/visual/methods/methods.js`, `content/**`) are **read-only** for everyone unless the main session says otherwise. All existing content stays: every scene, effect, story, method, test and flashcard must remain reachable.

## Contract 1 — the place graph (`src/explore/graph.js`, written by Graph, used by Explore)
A **place** is one existing scene. Its key is `"<level>/<scene>"`, e.g. `"cell/neuron"`. The brain is `"organ/brain"`; research methods are `"methods/<id>"`.
```js
export const ROOT = 'organ/brain';
export const PLACES = {            // every existing scene appears exactly once
  'tissue/cortex': {
    level: 'tissue', scene: 'cortex',
    name: { en, he }, icon,        // copy from content/catalog.js
    parent: 'organ/brain',         // breadcrumb parent (null only for ROOT)
    hotspots: [                    // 1–5 per place; the in-scene "next steps"
      { id: 'pyramidal',           // unique within the place
        part: 'pyramidal',         // a stage part id defined in that scene (Stage parts) — for organ/brain a region id from src/brain/brainParts.js, optionally with side: -1|1
        to: 'cell/neuron',         // place key to dive into
        kind: 'in',                // 'in' = deeper level, 'out' = larger scale (e.g. brain → body), 'method' = research method, 'side' = a sibling scene at the same level
        label: { en, he } },
    ],
  },
};
export function pathTo(key)        // [ROOT, …, key] following parents, for the breadcrumb
export function placeFromRoute(level, scene) // key or null (scene optional → the level's first place)
```
Rules:
- Reuse the existing `link` fields on parts (they already say e.g. soma → organelle) as `in` hotspots.
- Each place's `parent` is the place you naturally dive in from. Larger scales (system, organism) hang off the brain via `out` hotspots ("Zoom out: the nervous system in the body"); their parent is `organ/brain`.
- A place with more than ~5 candidates keeps the 3–5 most important as hotspots. The rest go in a `more: [keys]` array, shown as a small "More here" list in the sheet.
- Every `part` must exist: check it against the `P(...)` / `D(...)` / `definePart` ids in the level file, or the region ids in `brainParts.js`. Include a self-check at the bottom of the file, or a node script `tools/check-graph.mjs`, that verifies every scene in `content/catalog.js` is a place and every `to` exists. Run it.

## Contract 2 — AI (`src/ai/providers.js`, written by Login, used by everyone)
- `askJSON({ system, user, schema, maxTokens, effort })` sends the request to whichever provider is connected (Claude key, ChatGPT or Gemini) and returns the parsed JSON. It throws a friendly `Error` with `.code = 'NO_PROVIDER'` when none is connected.
- `features.js` keeps `askBrain(question)` and `generateLectureTest(text, counts)` with the same signatures, now built on `askJSON`.
- `hasAI()` and `onAiChange(fn)`.
- Explore code calls only `askBrain` and `hasAI`, and links to `#/settings` to connect.
- The Claude MCP extension controls the site only through: navigating `location.hash` (e.g. `#/explore/cell/neuron`, `#/test/...`), and the AI-test store functions in `src/test/aiTest.js` (Login owns them).

## Explore UX requirements (Explore agent)
- **Seamless dive (most important).** Use the prototype's technique: log-distance camera interpolation with the aim tied to zoom progress, the child placed inside the clicked part at the part's size, a crossfade at about 25–90 % of the move, then an invisible re-normalisation. Each Stage has its own renderer/canvas. Run two Stage instances ping-pong (plus BrainScene for the brain) with transparent canvases over one CSS backdrop, crossfade the canvases, and drive both cameras with the scale mapping so the child appears exactly inside the parent part. Dive in about 1.1 s, out about 1.0 s, ease-in-out. Honour `prefers-reduced-motion` (about 0.3 s crossfade). Never show a loading gap mid-dive: preload the child's module and data while its hotspot is visible.
- **Hotspots:** a DOM dot (≥44 px touch target) plus a short label. Anchor each on the part's visible surface (raycast from the home camera toward the part's centre). Hide occluded or back-facing ones. Show them only once the camera is at rest. 3–5 per place.
- **Chrome:** breadcrumb (tappable, flies out) plus a single ⓘ chip, nothing else permanently on screen. The ⓘ sheet (bottom sheet on phone, right drawer about 360 px on desktop that the camera framing accounts for) contains: the scene intro, the scene's action buttons (animations), "Apply an effect", the story box when a story is running, "More here", book chapters, and for a tapped part its info with show-alone / compare / "Dive in" if it has a hotspot. Brain tools (search, slice, see-through, pathways, skull/arteries/ventricles) go under a "Tools" section in the sheet at `organ/brain`.
- **Tap or click a part:** highlight it and show its name. Tapping a hotspot dives. Esc, the browser back button (one history entry per place), the breadcrumb, and scrolling or pinching out past max distance all go up one level.
- **Routes keep working:** `#/explore/<level>[/<scene>]`, `#/explore/organ[/<parts>|/path/<id>]`, `#/effect/<id>`, `#/story/<id>`, and search results. A direct deep link shows the place immediately; there is no dive on first load.
- **Look:** ACES tone mapping, RoomEnvironment, warm key plus cool rim light, gradient backdrop (light and dark theme), subtle bloom at most. Hebrew/RTL must work. Remove the zoom bar and the old side panels, tabs and bottom button rows. Delete code that becomes dead.
- **Testing (light):** run the dev server via the existing preview config (`.claude/launch.json`, "brainweb"). Use your **own background browser tab** (create it with `tabs_create`, foreground false, and pass its tabId every time); never drive the fronted tab. Keep each browser check under 45 s. Run `npm run build` at the end.
