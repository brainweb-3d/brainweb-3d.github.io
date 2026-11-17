# Data sources and credits

All files below were downloaded once (with the owner's approval) and converted by the tools in `tools/`.

| Site files | Source | Licence | Credit |
|---|---|---|---|
| `public/models/brain.glb`, `public/models/brain-extras.glb`, `public/models/body.glb`, `public/data/body-landmarks.json` | BodyParts3D, The Database Center for Life Science | CC BY 4.0 | BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution 4.0 International |
| `public/models/brain-hq.glb` (v6 visible brain; built by `tools/build-brain-hq.mjs`: simplified to 257k triangles, fold shading baked into vertex colours) | NIH 3D, entry 3DPX-021161 "Detailed Human Brain Model" — https://3d.nih.gov/entries/3DPX-021161 | CC BY (as stated by the site; owner verifies licences) | Johnson J, NIH 3D (3DPX-021161) |
| `public/data/molecules.json` | PubChem 3D conformers (NCBI) | Public domain (US government work) | Kim S. et al., PubChem 2023 update. *Nucleic Acids Res.* 51:D1373. CIDs are stored in the file. |
| `public/data/proteins/*.json` | RCSB Protein Data Bank | CC0 1.0 | Structures: 2A79 (Long, Campbell & MacKinnon 2005), 3RVY (Payandeh et al. 2012), 2BG9 (Unwin 2005), 3SN6 (Rasmussen et al. 2011), 3B8E (Morth et al. 2007), 4XP1 (Wang, Penmatsa & Gouaux 2015), 1BNA (Drew et al. 1981), 5H53 (Fujii & Namba 2017). Data from rcsb.org. |
| `public/data/neurons/*.json` | NeuroMorpho.Org | CC BY 4.0 | NeuroMorpho.Org (RRID:SCR_002145); Tecuatl C, Ljungquist B, Ascoli GA (2024) *FASEB Bioadv.* 6(7):207-221. Original reconstructions: pyramidal 02a_pyramidal2aFI (Allman archive; Watson et al. 2006, PMID 16797136), Purkinje-slice-ageP43-6 (Dusart archive; PMID 23719821), granule 01042017e6-000 (Nandi archive; PMID 29155277), motoneuron v_e_moto1 (Burke archive; Cullheim et al. 1987, PMID 3819010), basket 5-27-11cell1-nonFS-BC (Santhakumar archive; PMID 23324316), astrocyte RealAstrocyteSkeleton1 (Rusakov archive; PMID 30177844). |
| `public/methods/*` | Wikimedia Commons | per image (see `src/visual/methods/images.js`) | Shown under each image on its page |

The anatomy atlas PDF in the project folder (Rohen, *Color Atlas of Anatomy*) is copyrighted. It was used only as a
reference for positions, proportions and names. No part of it is included in the site. Never upload it.

## v6 sourced 3D models (Sketchfab; downloaded 2026-11-11; the owner verifies licences)
Converted by `tools/build-models.mjs` (simplified, textures as WebP, compressed; `-lite` versions for phones). Original sources and authors are in `assets-incoming/SOURCES.md`.
| Site file | Sketchfab source | Author | Licence (as listed) |
|---|---|---|---|
| `public/models/neuron-firing*.glb` | https://sketchfab.com/3d-models/21a500cd56d74fa2853b3d9e6b4c54b5 "Olfactory Mitral, Tufted, and Granule Cells" | justasb | CC BY |
| `public/models/neuronal-environment*.glb` | https://sketchfab.com/3d-models/11fc6dbcc1594e9a806601bb7480f315 "Neuronal Cell Environment" | ryannsoup | CC BY |
| `public/models/purkinje-cell*.glb` | https://sketchfab.com/3d-models/22f7bcac37bd49929a319c3990fe9853 "Purkinje Cel V01" | forestman | CC BY |
| `public/models/serotonin-receptor*.glb` | https://sketchfab.com/3d-models/355289933b4c484899fbf7b31cb1f901 "Serotonin Receptor" | johnsimms | CC BY |
| `public/models/human-cell*.glb` | https://sketchfab.com/3d-models/60ef7d2515b0403986ff9e8b7f234a66 "Human Cell" | markdragan | CC BY |
| `public/models/limbic-system*.glb` | https://sketchfab.com/3d-models/ded11102e2c244a9b4faaf9e355ee518 "Human Limbic System" | gwene | CC BY |
| `public/models/nervous-system*.glb` | https://sketchfab.com/3d-models/04e4630154774717b2a9787bb37b92a0 "Système nerveux Humain entier" | svtavernier | CC BY-NC-SA (non-commercial, share-alike) |
| `public/models/brain-hq*.glb` | NIH 3D 3DPX-021161 (see above) | Johnson J | CC BY |
| `public/models/ca1-pyramidal*.glb` | https://sketchfab.com/3d-models/f4199d144003415690ad19eea6210e71 "Hippocampus CA1 Pyramidal Cell" | justasb | CC BY |
| `public/models/membrane-vesicle*.glb` | https://sketchfab.com/3d-models/9ff617ab2d8042d7aafddaff3018bc92 "Membrane vesicle" | Lukas82 | CC BY |
| `public/models/plasma-membrane*.glb` | https://sketchfab.com/3d-models/53304c29aa2c41479488f06d3470c796 "Plasma Membrane" | Konstantin_Keller | CC BY |
| `public/models/sensory-cells*.glb` (Sensory neurons: cone + rod, split in code) | https://sketchfab.com/3d-models/7a5a078e505042e4ab59cbc1e66cfb1a "Cell Structure Art" | liyanazainal (P148769) | CC BY |
| `public/models/inner-hair-cell*.glb` (Sensory neurons: hair cell, painted base-to-tip in code) | https://sketchfab.com/3d-models/43ab15f5b2534204b649f7984d145fe4 "Inner Hair cell of cochlea, hearing" | mr.baishu | CC BY |
| `public/models/pacinian-corpuscle*.glb` (Sensory neurons: Pacinian corpuscle) | https://sketchfab.com/3d-models/e568cb3f877a4abebfa183030a000696 "Pacinian Corpuscle" | liyanazainal (P148769) | CC BY |
| `public/models/sensory-neuron*.glb` (Sensory neurons: touch & pain neuron; its text labels are hidden) | https://sketchfab.com/3d-models/72049352d6b642d7b625bceadfc76987 "Sensory-neuron" | Neuron-activated | CC BY |
| `public/models/na-k-atpase*.glb` | https://sketchfab.com/3d-models/82d8aa9416194e39842e0067b94fffda "Sodium-Potassium ATPase" | axonology | CC BY-NC-SA |
| `public/models/serotonin-transporter*.glb` | https://sketchfab.com/3d-models/ea718d97344e461c8b4ba3cc006b34ab "Serotonin transporter protein" | axonology | CC BY |
| `public/models/b-dna*.glb` | https://sketchfab.com/3d-models/84919dbce27b46309e71e75ad9c64c90 "B-DNA ribbon (backbone) + sticks (bases)" | gvsu-chem | CC BY |
| `public/models/sarcomere*.glb` | https://sketchfab.com/3d-models/a0f57ca1a44f4658b515fca5bf2131e5 "Sarcomere Model" | rgmz2015 | CC BY-NC |
| `public/models/nerve-cross-section*.glb` | https://sketchfab.com/3d-models/e57b0119859e4648a8fa8483b99b11a6 "Human Nerve cross section" | arloopa | CC BY |
| `public/models/eye-anatomy*.glb` | https://sketchfab.com/3d-models/f7745aaff145485fb02cf729c96c5f37 "Anatomy of the Eye" | eLearningUMCG | CC BY-NC-SA |
| `public/models/inner-ear*.glb` | https://sketchfab.com/3d-models/f80bda64666c4b8aaac8f63b7b82a0a0 "Anatomy of the Inner Ear" | tilt | CC BY-NC-SA |
| `public/models/neuromuscular-junction*.glb` | https://sketchfab.com/3d-models/046fd53b42be4baebefdb4d18f983db2 "neuromuscular junction" | 26traviss | CC BY |
| `public/models/blood-vessels*.glb` | https://sketchfab.com/3d-models/1f4949f628164e2391d96e102f8b5815 "Blood Vessels Anatomy" | arloopa | CC BY |
| `public/models/mri-machine*.glb` | https://sketchfab.com/3d-models/0c98cbe0e27241288c44d588a68ffe4e "Magnetic Resonance Imaging" | 7634hosi | CC BY |
| `public/models/microscope*.glb` | https://sketchfab.com/3d-models/9562226299a045bab13c3d66f8593208 "Microscope" | eugen_vahrushin | CC BY |
| `public/models/lab-mouse*.glb` | https://sketchfab.com/3d-models/b8817926c0c74e43b6664a3fb0f76960 "Lab Mouse" | Just8 | CC BY |
| `public/models/petri-dishes*.glb` | https://sketchfab.com/3d-models/ece2ce0348bf472d9c8f49c39a720161 "Petri Dish Collection" | 3dlabwaremodels | CC BY |
| `public/models/ion-channel*.glb` | NIH 3D, KCNQ1 channel (molecular surface by chain), from `assets-incoming/nih-kcnq1-channel-closed-open` — see `assets-incoming/SOURCES.md` | NIH 3D | as listed on NIH 3D |
| `public/models/dendrite-spines*.glb` | NIH 3D, dendrite with spines traced from electron microscopy (Kasthuri et al.), from `assets-incoming/nih-dendrite-spines-kasthuri` — see `assets-incoming/SOURCES.md` | NIH 3D | as listed on NIH 3D |
| `public/models/salt-water*.glb` | https://sketchfab.com/3d-models/246f79155c424e4ba22c9ae50532a81d "Salt dissolving in water" | arloopa | CC BY |
| `public/models/trna*.glb` | https://sketchfab.com/3d-models/b2052daba15f49edab6aa3242efbb1cc "Molecular structure of the transfer RNA (tRNA)" | S.Duce (sduce) | CC BY |
| `public/models/heart*.glb` | https://sketchfab.com/3d-models/3f8072336ce94d18b3d0d055a1ece089 "Realistic Human Heart" | neshallads | CC BY |
| `public/models/endocrine-system*.glb` | https://sketchfab.com/3d-models/b10f70cacb6946da851e5696291398a5 "Endocrine System" | brianj.seely | CC BY |
| `public/models/stove*.glb` | https://sketchfab.com/3d-models/ce6f590e7cb848e398c80208ee3b6fdf "Stove with Hood" | HippoStance (hippostance) | CC BY |
| `public/models/bed*.glb` | https://sketchfab.com/3d-models/b8c16d4b69f64335b46379b119b102b4 "Bed" | rickmaolly | CC BY |
| `public/models/olfactory-bulb*.glb` | https://sketchfab.com/3d-models/fffdafc7ef2f4e0ab7d006daf3517da7 "Olfactory Bulb Mitral-Tufted-Granule Network" | JustasB (justasb) | CC BY |
| `public/models/lab-rat*.glb` | https://sketchfab.com/3d-models/9f1e720a87ac40e7bda7096d760cced7 "Lab Rat" | victorberdugo1 | CC BY |
| `public/models/limbic-ap*.glb` | https://sketchfab.com/3d-models/042b7c37263f4309bc8b4e18dc989102 "Limbic System - AP Psychology" | shojig | CC BY |
| `public/models/ct-scanner*.glb` | https://sketchfab.com/3d-models/cb17c5eed1cd43a2aa2787a8ec4bb612 "CT Scanner" | junwei0612 | CC BY |
| `public/models/human-skull*.glb` | https://sketchfab.com/3d-models/7081b32caeda47b5a0ef4d039f244b6e "Human skull FREE" | roxyjungle | CC BY |
| `public/models/mouth*.glb` | https://sketchfab.com/3d-models/522eda0ec0e3413a914b1b298a791320 "Human mouth detailed" | Mince | CC BY |
| `public/models/spinal-cord-model*.glb` | https://sketchfab.com/3d-models/c3946cc014d24b02a3224565108907ba "Spinal Cord Model" | mcguiret | CC BY-NC-SA |
