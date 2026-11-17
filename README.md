# 🧠 BrainWeb: an interactive 3D neuroscience learning site

BrainWeb follows the structure of *Discovering Biological Psychology* (Freberg, 2nd ed.). All explanations are written in
original words, in English and Hebrew. [docs/accuracy-report.md](docs/accuracy-report.md) checks the content against the
book.

The site has **two parts**: **🔭 Explore**, a continuous 3D journey from the brain down to single ions or out to the whole
body, and **🧪 Test yourself**.

## 🔭 Explore: one continuous 3D drill-down
Explore opens on a detailed 3D brain. **Glowing dots** on the model are the next steps:
- **Dive in:** click or tap a dot. The camera flies into that part, and the next level grows inside it and fades in
  (brain → cortex → neuron → synapse → receptor → neurotransmitter → ion).
- **Go back:** use the **breadcrumb** at the top (the one way back), **Esc**, the browser's Back button, or scroll/pinch
  out past the farthest zoom.
- **Dots:** at most 3 per place, and each one leads to a closer look at the very thing it sits on (the list is `DOTS`
  in `src/explore/graph.js`). Point at a dot (or tap it once on a phone) to see where it leads; click (or tap again)
  to fly in.
- **Tap a part** for a short card: its name, two sentences and one **Go inside** button. **More about it** holds the
  rest: the full text, **Show it alone**, **Compare with…**, related pathways and book sections. The rest of the scene
  dims so the part stands out.
- **Bottom bar:**
  - **▶ Watch:** guided stories, brain pathways (step by step: each step draws, then waits for **Next step**), effects
    (31 drugs, diseases, body states and stimuli), how scientists see the brain (17 research methods), and
    **🗺️ All places** (every 3D place, grouped by size from the body down to the atom).
  - **ⓘ About this:** the same short card for the place: what it is, where you can go from here (the same places as
    its dots), up to 3 animations (the rest under **More animations**), and **More** (Real model / Interactive, book
    chapters).
  - **🛠 Tools** (on the brain): see-through, split, colours, slicing, auto-rotate, skull / arteries / ventricles, reset,
    full screen.
- **Top bar:** **🔍** searches everything (brain parts, pathways, places, effects, methods, stories, book sections,
  terms) and can ask the AI; **☰** holds the language, light/dark, "How to use" and settings.
- **First visit:** a one-line hint on the brain ("Drag to turn · tap a glowing dot to go inside") instead of a tour.
- **Real model / Interactive:** places that have a sourced 3D model show the realistic model by default. The
  **Real model / Interactive** switch brings back the hand-built interactive scene with its buttons. Pressing an
  animation, an effect or a story step switches automatically.

All 51 places (50 scenes plus the brain), 31 effects, 5 guided stories and 16 research methods are reachable. The map of
places is in `src/explore/graph.js`; `node tools/check-graph.mjs` verifies it.

Old links still work: `#/explore/<level>/<scene>`, `#/explore/organ[/<parts>|/path/<id>]`, `#/effect/<id>`,
`#/story/<id>`, `#/brain…`, `#/learn…`.

**Smoothness:** dives run at 60 fps. The next place is built, its shaders compiled and its model uploaded *before* you
click. During a dive the view renders at a lower resolution, and the screen redraws only when something moves. Phones
get lighter `-lite` models.

## 🧪 Test yourself
| Tab | What it does |
|---|---|
| Tests | Pick a topic (a chapter or the whole book). Options (subsections, question types, number of questions, timer) open only when you tap **Change**. Results show a score ring and a review of each answer. |
| From a lecture | Upload a lecture (PDF / Word / PowerPoint / text) or paste it. With an AI connected, the AI writes a test about it. Without one, you can still get a test from the matching book sections. |
| Flashcards | Spaced-repetition review; **Show answer**, then rate. |
| Progress | Streak, cards due, weakest topics (with **Practise**), and scores per chapter. |

## Connect your AI (⚙ Settings)
Nobody needs to paste a key. There are three ways to connect:

| Button | How it works | One-time setup |
|---|---|---|
| **Claude** | Installs a small **BrainWeb extension for Claude Desktop** (`brainweb-claude.mcpb`, downloaded by the button). You chat in Claude Desktop, and Claude uses BrainWeb's tools: read your lecture, see what you're looking at, write a test into the site, fly the 3D view. Anthropic doesn't allow websites to offer "Sign in with Claude", so this is the official route for using your own Claude account. | Open the downloaded file → **Install** in Claude Desktop → keep BrainWeb open. With `npm run dev` it pairs automatically. On a deployed site, tell Claude the short pairing code the site shows. |
| **ChatGPT** | A real **Sign in with ChatGPT** that uses your ChatGPT plan. | None. It works when the site runs locally (`npm run dev`). OpenAI allows plan sign-in for locally hosted apps; a public hosted site would need OpenAI's approval, so the button is disabled in the static build. |
| **Gemini** | **Google sign-in**; calls go to the Gemini API with your Google account. | Create a Google Cloud project → enable the *Generative Language API* → OAuth consent screen *External / Testing* with yourself as a test user → create a **Web** OAuth client with origin `http://localhost:5173`. Put the client ID and project ID into ⚙ Settings, or into `.env.local` as `VITE_GOOGLE_CLIENT_ID` / `VITE_GOOGLE_PROJECT_ID`. |

**Advanced: Claude API key.** A collapsed section with the original key flow and model picker (Opus 5.5 / Sonnet 5.5 /
Haiku 5.5). If several AIs are connected, a **Use for AI features** picker chooses one.

Where the sign-ins are stored:
- **ChatGPT tokens:** on your computer, outside the project folder (`%APPDATA%\BrainWeb\`). They never reach the page.
- **Gemini token:** only in memory.
- **Claude extension:** accepts only BrainWeb pages that know its pairing secret.

## How to run it on your computer
```bash
npm install
```
```bash
npm run dev
```
Open **http://localhost:5173**. Stop it with `Ctrl + C`.

## How to put it online
1. Run `npm run build`; it creates the `dist` folder, including `brainweb-claude.mcpb`.
2. Drag `dist` onto **https://app.netlify.com/drop**.

> ⚠️ Before sharing:
> - Several sourced models are **non-commercial (NC)** or **share-alike (SA)**; see [docs/data-credits.md](docs/data-credits.md).
> - Never upload the textbook PDF or the anatomy-atlas PDF; both are copyrighted.
> - The ChatGPT button works only locally.

## Where things are
| Folder / file | What it is |
|---|---|
| `src/explore/World.js` | The drill-down engine: two 3D views plus the brain view, seamless dives and fly-outs, preloading, render-on-demand, flight resolution. |
| `src/explore/index.js` | The Explore shell: routes, breadcrumb, bottom bar, ⓘ card, 🛠 tools menu, hint, history, Esc / scroll-out. |
| `src/explore/watch.js`, `src/views/searchDialog.js` | The ▶ Watch picker and the 🔍 search dialog. |
| `src/explore/graph.js` | The map of places and their hotspots ("next steps"); checked by `tools/check-graph.mjs`. |
| `src/explore/hotspots.js` | The in-scene dots: anchored on the visible surface, hidden when occluded, labels kept apart. |
| `src/explore/models.js` | Which sourced model each place uses, and the Real model / Interactive switch. |
| `src/explore/brainTools.js` | The brain's tools in the panel (search, slicing, pathways…). |
| `src/visual/levels/*.js`, `src/visual/methods/methods.js` | The interactive scenes, one file per level: parts, 3D objects, animations. |
| `src/visual/Stage.js`, `src/brain/BrainScene.js` | The 3D views used by the engine. |
| `content/` | Chapters, quiz questions, effects, stories, regions, sequences; `catalog.js` is generated (`npm run catalog`). |
| `src/test/`, `src/practice/` | Test yourself. |
| `src/ai/` | AI connections: `providers.js` (one entry point), `claude.js` (API key), `claudeBridge.js` (Claude Desktop extension), `openai.js`, `gemini.js`, `features.js` (what the AI does). |
| `tools/vite-ai-bridge.mjs` | Dev-server helper for Sign in with ChatGPT and the Claude pairing secret. |
| `mcp/brainweb-claude/` | The Claude Desktop extension (MCP server + manifest); `npm run build:mcpb` packs it. |
| `public/models/` | 3D models; every model has a `-lite` version for phones. Credits are in [docs/data-credits.md](docs/data-credits.md). |
| `tools/build-models.mjs` | Converts a downloaded model (Sketchfab zip or `.glb`) into `public/models/<name>.glb` + `-lite.glb`. Usage is at the top of the file; it has `sloppy` and `renormal` modes for awkward meshes. |
| `tools/build-brain-hq.mjs` | Builds the detailed visible brain (`brain-hq*.glb`) with baked fold shading. |
| `tools/build-brain-model.mjs`, `build-body-model.mjs`, `build-data.mjs` | Rebuild the BodyParts3D brain and body (still used for picking and the body scenes) and the molecule, protein and neuron data. |
| `assets-incoming/` | Original downloads and `SOURCES.md` (not shipped). |
| `prototype/` | `drilldown.html` (the approved prototype) and `models.html` (a viewer that checks every model's triangles, animations and frame time). Dev only, not shipped. |
| `docs/` | Credits, accuracy report, the v6 spec and the v6 decisions log. |

**Dev switches** (dev server only): `?perf` shows frame times for every dive; `?slow=N` slows transitions down; `?nomodels`
turns off the sourced models.

## Credits
- **3D models:** NIH 3D, Sketchfab authors (named per model), BodyParts3D (© The Database Center for Life Science,
  CC BY 4.0). Full list with licences: [docs/data-credits.md](docs/data-credits.md).
- **Scientific data:** molecules from PubChem (public domain); proteins from RCSB PDB (CC0); neurons from NeuroMorpho.Org
  (CC BY 4.0).
- **Images:** the research-method images (`public/methods/`) come from Wikimedia Commons and are credited on each page.
- **Libraries:** three.js, Fuse.js, pdf.js, JSZip, Anthropic SDK, MCP SDK; build tools glTF-Transform, meshoptimizer and
  sharp.
- **Fonts:** Rubik, Caveat, Amatic SC (Google Fonts).
