// The place graph for Explore's continuous drill-down (spec: docs/redesign-spec.md, Contract 1).
// A place is one existing scene, keyed "<level>/<scene>". The brain ("organ/brain") is the root.
// Hotspots are the in-scene "next steps": `part` is a part id defined in that scene's build function
// (for organ/brain, a region id from src/brain/brainParts.js). Verify with: node tools/check-graph.mjs
// Pure data, no browser APIs (node can import it).
import { SCENES } from '../../content/catalog.js';

const B = (en, he) => ({ en, he });
// H(id, part, to, kind, label[, extra]) — `id` is unique within the place.
const H = (id, part, to, kind, label, extra = {}) => ({ id, part, to, kind, label, ...extra });

export const ROOT = 'organ/brain';
/** Label shown above the research-method hotspots at the brain. */
export const METHOD_GROUP = B('How do we see this?', 'איך רואים את זה?');
const M = { group: METHOD_GROUP };

// THE TREE (owner, 2026-11-15): every place has exactly one parent, and its dots lead only to its children, each the
// closest thing one level smaller (or, from the brain, one level larger: the body). So there is one way to reach each
// place by dots. ▶ Watch and 🔍 search still jump anywhere. Places that are not a size step (the autonomic system,
// stress hormones, the organism stories and the research methods) are reached only from ▶ Watch and 🔍.
const GRAPH = {
  // ------------------------------------------------------------------ the brain (root)
  'organ/brain': {
    parent: null,
    hotspots: [
      H('cortex', 'frontal', 'tissue/cortex', 'in', B('Zoom in: the six layers of cortex', 'זום פנימה: שש שכבות הקליפה'), { side: 1 }),
      H('body', 'spinalCord', 'system/nervous', 'out', B('Zoom out: the nervous system in the body', 'זום החוצה: מערכת העצבים בגוף')),
    ],
    // reached from ▶ Watch / 🔍 only (listed so the breadcrumb and checks know where they hang)
    more: [
      'system/ans', 'system/hpa',
      'organism/memory', 'organism/stove', 'organism/day', 'organism/homeostasis',
      'methods/compare', 'methods/histology', 'methods/lesion', 'methods/ct', 'methods/mri', 'methods/fmri', 'methods/dti',
      'methods/pet', 'methods/eeg', 'methods/meg', 'methods/singlecell', 'methods/tms', 'methods/dbs',
      'methods/microdialysis', 'methods/twins', 'methods/knockout', 'methods/stemcells',
    ],
  },

  // ------------------------------------------------------------------ the body: the nervous system and the senses
  'system/nervous': {
    parent: 'organ/brain',
    hotspots: [
      H('cord', 'cord', 'tissue/spinalcord', 'in', B('Zoom in: the spinal cord, cut across', 'זום פנימה: חוט השדרה בחתך רוחב')),
      H('nerve', 'intercostal', 'tissue/nerve', 'in', B('Zoom in: a nerve, cut across', 'זום פנימה: עצב בחתך רוחב')),
      H('sight', 'eye', 'tissue/retina', 'in', B('Sight: the retina', 'ראייה: הרשתית')),
      H('hearing', 'ear', 'tissue/corti', 'in', B('Hearing: the cochlea', 'שמיעה: השבלול')),
      H('smell', 'nose', 'tissue/smell', 'in', B('Smell: the roof of the nose', 'ריח: תקרת האף')),
      H('taste', 'tongue', 'tissue/taste', 'in', B('Taste: a taste bud', 'טעם: פקעית טעם')),
      H('touch', 'skin', 'cell/sensory', 'in', B('Touch & pain: the skin of a fingertip', 'מגע וכאב: עור קצה האצבע')),
      H('nmj', 'lumbar', 'tissue/nmj', 'in', B('Zoom in: where nerve meets muscle', 'זום פנימה: היכן שעצב פוגש שריר')),
    ],
  },
  'tissue/spinalcord': { parent: 'system/nervous', hotspots: [] },
  'tissue/nerve': {
    parent: 'system/nervous',
    hotspots: [H('schwann', 'myelinated', 'cell/schwann', 'in', B('Zoom in: the Schwann cells around an axon', 'זום פנימה: תאי השוואן סביב אקסון'))],
  },
  'cell/schwann': { parent: 'tissue/nerve', hotspots: [] },
  'tissue/retina': {
    parent: 'system/nervous',
    hotspots: [H('photo', 'rods', 'cell/photoreceptors', 'in', B('Zoom in: a rod and a cone', 'זום פנימה: קנה ומדוך'))],
  },
  'cell/photoreceptors': { parent: 'tissue/retina', hotspots: [] },
  'tissue/corti': {
    parent: 'system/nervous',
    hotspots: [H('hair', 'inner', 'cell/haircell', 'in', B('Zoom in: one hair cell', 'זום פנימה: תא שיער אחד'))],
  },
  'cell/haircell': { parent: 'tissue/corti', hotspots: [] },
  'tissue/smell': { parent: 'system/nervous', hotspots: [] },
  'tissue/taste': { parent: 'system/nervous', hotspots: [] },
  'cell/sensory': { parent: 'system/nervous', hotspots: [] },
  'tissue/nmj': {
    parent: 'system/nervous',
    hotspots: [H('muscle', 'fiber', 'macromolecule/muscle', 'in', B('Zoom in: actin & myosin', 'זום פנימה: אקטין ומיוזין'))],
  },
  'macromolecule/muscle': { parent: 'tissue/nmj', hotspots: [] },

  // ------------------------------------------------------------------ inside the brain: cortex → cells
  'tissue/cortex': {
    parent: 'organ/brain',
    hotspots: [
      // Layer V holds the big pyramidal neurons; layer III, many kinds of neuron; layer I, mostly glia and dendrites.
      H('neuron', 'l5', 'cell/neuron', 'in', B('Zoom in: a pyramidal neuron', 'זום פנימה: נוירון פירמידלי')),
      H('types', 'l3', 'cell/types', 'in', B('Zoom in: the types of neurons', 'זום פנימה: סוגי הנוירונים')),
      H('glia', 'l1', 'cell/glia', 'in', B('Zoom in: glia', 'זום פנימה: תאי גליה')),
    ],
  },
  'cell/types': {
    parent: 'tissue/cortex',
    hotspots: [H('real', 'pyramidal', 'cell/real', 'in', B('Real neurons under the microscope', 'נוירונים אמיתיים במיקרוסקופ'))],
  },
  'cell/real': { parent: 'cell/types', hotspots: [] },
  'cell/glia': {
    parent: 'tissue/cortex',
    hotspots: [
      H('astrocyte', 'astrocyte', 'cell/astrocyte', 'in', B('Zoom in: an astrocyte', 'זום פנימה: אסטרוציט')),
      H('oligo', 'oligo', 'cell/oligo', 'in', B('Zoom in: an oligodendrocyte', 'זום פנימה: אוליגודנדרוציט')),
      H('microglia', 'microglia', 'cell/microglia', 'in', B('Zoom in: microglia', 'זום פנימה: מיקרוגליה')),
      H('ependymal', 'ependymal', 'cell/ependymal', 'in', B('Zoom in: ependymal cells', 'זום פנימה: תאי אפנדימה')),
    ],
  },
  'cell/astrocyte': {
    parent: 'cell/glia',
    hotspots: [H('bbb', 'endfeet', 'tissue/bbb', 'in', B('Zoom in: the blood–brain barrier', 'זום פנימה: מחסום הדם-מוח'))],
  },
  'tissue/bbb': { parent: 'cell/astrocyte', hotspots: [] },
  'cell/oligo': { parent: 'cell/glia', hotspots: [] },
  'cell/microglia': { parent: 'cell/glia', hotspots: [] },
  'cell/ependymal': { parent: 'cell/glia', hotspots: [] },

  // ------------------------------------------------------------------ inside a neuron
  'cell/neuron': {
    parent: 'tissue/cortex',
    hotspots: [
      H('soma', 'soma', 'organelle/soma', 'in', B('Zoom in: inside the cell body', 'זום פנימה: בתוך גוף התא')),
      H('channels', 'axon', 'macromolecule/channels', 'in', B('Zoom in: the ion channels of the axon', 'זום פנימה: תעלות היונים של האקסון')),
      H('synapse', 'terminals', 'cell/synapse', 'in', B('Zoom in: a synapse', 'זום פנימה: סינפסה')),
    ],
  },
  'organelle/soma': {
    parent: 'cell/neuron',
    hotspots: [
      H('dna', 'nucleus', 'macromolecule/dna', 'in', B('Inside the nucleus: DNA → protein', 'בתוך הגרעין: DNA ← חלבון')),
      H('pump', 'membrane', 'macromolecule/pump', 'in', B('Zoom in: the Na⁺/K⁺ pump in the membrane', 'זום פנימה: משאבת Na⁺/K⁺ בממברנה')),
    ],
  },
  'macromolecule/dna': {
    parent: 'organelle/soma',
    hotspots: [
      H('nucleotides', 'dna', 'molecule/nucleotides', 'in', B('Zoom in: what DNA is made of', 'זום פנימה: ממה עשוי ה-DNA')),
      H('rna', 'mrna', 'macromolecule/rna', 'in', B('RNA: copying a gene', 'RNA: העתקת גן')),
      H('epigenetics', 'nucleosomes', 'macromolecule/epigenetics', 'in', B('Epigenetics: switching genes on and off', 'אפיגנטיקה: הדלקה וכיבוי של גנים')),
    ],
  },
  'molecule/nucleotides': { parent: 'macromolecule/dna', hotspots: [] },
  'macromolecule/rna': { parent: 'macromolecule/dna', hotspots: [] },
  'macromolecule/epigenetics': { parent: 'macromolecule/dna', hotspots: [] },
  'macromolecule/pump': { parent: 'organelle/soma', hotspots: [] },
  'macromolecule/channels': {
    parent: 'cell/neuron',
    hotspots: [H('membrane', 'kv', 'atom/membrane', 'in', B('Zoom in: the ions that make the signal', 'זום פנימה: היונים שיוצרים את האות'))],
  },
  'atom/membrane': {
    parent: 'macromolecule/channels',
    hotspots: [H('ions', 'na', 'atom/ions', 'in', B('Zoom in: one ion, atom by atom', 'זום פנימה: יון אחד, אטום אחר אטום'))],
  },
  'atom/ions': { parent: 'atom/membrane', hotspots: [] },

  // ------------------------------------------------------------------ inside a synapse
  'cell/synapse': {
    parent: 'cell/neuron',
    hotspots: [
      H('vesicles', 'vesicles', 'organelle/vesicles', 'in', B('Zoom in: vesicle release', 'זום פנימה: שחרור שלפוחיות')),
      H('receptors', 'receptors', 'macromolecule/receptors', 'in', B('Zoom in: receptor proteins', 'זום פנימה: חלבוני קולטן')),
      H('transporter', 'transporter', 'macromolecule/transporter', 'in', B('Zoom in: the reuptake transporter', 'זום פנימה: משאבת הספיגה החוזרת')),
    ],
  },
  'organelle/vesicles': {
    parent: 'cell/synapse',
    hotspots: [H('transmitters', 'vesicles', 'molecule/transmitters', 'in', B('What is inside: the neurotransmitters', 'מה בפנים: המוליכים העצביים'))],
  },
  'molecule/transmitters': { parent: 'organelle/vesicles', hotspots: [] },
  'macromolecule/receptors': {
    parent: 'cell/synapse',
    hotspots: [
      H('binding', 'gpcr', 'molecule/binding', 'in', B('Zoom in: how a key fits its lock', 'זום פנימה: איך מפתח מתאים למנעול')),
      H('nmda', 'iono', 'atom/nmda', 'in', B('Zoom in: the NMDA receptor and its Mg²⁺ block', 'זום פנימה: קולטן NMDA וחסימת ה-Mg²⁺ שלו')),
    ],
  },
  'molecule/binding': { parent: 'macromolecule/receptors', hotspots: [] },
  'atom/nmda': { parent: 'macromolecule/receptors', hotspots: [] },
  'macromolecule/transporter': {
    parent: 'cell/synapse',
    hotspots: [H('drugs', 'blocker', 'molecule/drugs', 'in', B('Zoom in: drugs that act here', 'זום פנימה: סמים שפועלים כאן'))],
  },
  'molecule/drugs': {
    parent: 'macromolecule/transporter',
    hotspots: [H('toxins', 'nicotine', 'molecule/toxins', 'in', B('More drugs & toxins', 'עוד סמים ורעלים'))],
  },
  'molecule/toxins': { parent: 'molecule/drugs', hotspots: [] },

  // ------------------------------------------------------------------ ▶ Watch / 🔍 only (no dots in or out)
  'system/ans': {
    parent: 'organ/brain',
    hotspots: [
      H('hpa', 'adrenal', 'system/hpa', 'side', B('Hormones & stress', 'הורמונים ולחץ')),
      H('ne', 'sympathetic', 'molecule/transmitters', 'in', B('Its messenger: norepinephrine', 'השליח שלה: נוראפינפרין')),
      H('nerve', 'para', 'tissue/nerve', 'in', B('Zoom in: a nerve', 'זום פנימה: עצב')),
      H('balance', 'heart', 'organism/homeostasis', 'out', B('Keeping the body in balance', 'שמירה על איזון בגוף')),
      H('nervous', 'cord', 'system/nervous', 'side', B('The whole nervous system', 'מערכת העצבים כולה')),
    ],
  },
  'system/hpa': {
    parent: 'organ/brain',
    hotspots: [
      H('balance', 'hypothalamus', 'organism/homeostasis', 'out', B('Keeping in balance', 'שמירה על איזון')),
      H('memory', 'hippocampus', 'organism/memory', 'out', B('Stress and memory', 'לחץ וזיכרון')),
      H('day', 'pineal', 'organism/day', 'out', B('Melatonin: a day and a night', 'מלטונין: יום ולילה')),
      H('ans', 'adrenal', 'system/ans', 'side', B('Fight or flight', 'הילחם או ברח')),
    ],
  },
  'organism/day': {
    parent: 'organ/brain',
    hotspots: [
      H('retina', 'eyes', 'tissue/retina', 'in', B('Zoom in: the retina', 'זום פנימה: הרשתית')),
      H('hpa', 'pineal', 'system/hpa', 'in', B('Hormones of the brain', 'ההורמונים של המוח')),
      H('balance', 'scn', 'organism/homeostasis', 'side', B('Keeping in balance', 'שמירה על איזון')),
      H('adenosine', 'brain', 'molecule/transmitters', 'in', B('Adenosine: the sleepy molecule', 'אדנוזין: מולקולת העייפות')),
    ],
  },
  'organism/homeostasis': {
    parent: 'organ/brain',
    hotspots: [
      H('hpa', 'hypothalamus', 'system/hpa', 'in', B('Hormones & stress', 'הורמונים ולחץ')),
      H('ans', 'stomach', 'system/ans', 'in', B('The autonomic nervous system', 'מערכת העצבים האוטונומית')),
      H('day', 'brain', 'organism/day', 'side', B('A day and a night', 'יום ולילה')),
    ],
  },
  'organism/stove': {
    parent: 'organ/brain',
    hotspots: [
      H('channels', 'receptor', 'macromolecule/channels', 'in', B('Zoom in: heat-sensing channels', 'זום פנימה: תעלות שחשות חום')),
      H('types', 'sensory', 'cell/sensory', 'in', B('Zoom in: sensory neurons', 'זום פנימה: נוירונים תחושתיים'), { focus: ['touch', 'free', 'pacinian', 'skin'] }),
      H('nervous', 'cord', 'system/nervous', 'in', B('The spinal cord and its nerves', 'חוט השדרה ועצביו')),
      H('real', 'motor', 'cell/real', 'in', B('A real motor neuron', 'נוירון מוטורי אמיתי')),
      H('nmj', 'muscle', 'tissue/nmj', 'in', B('Zoom in: nerve meets muscle', 'זום פנימה: עצב פוגש שריר')),
    ],
  },
  'organism/memory': {
    parent: 'organ/brain',
    hotspots: [
      H('nmda', 'hippocampus', 'atom/nmda', 'in', B('How learning works: NMDA', 'איך למידה עובדת: NMDA')),
      H('cortex', 'prefrontal', 'tissue/cortex', 'in', B('Zoom in: the cortex', 'זום פנימה: הקליפה')),
      H('real', 'cerebellum', 'cell/real', 'in', B('Purkinje cells of the cerebellum', 'תאי פורקינייה של המוח הקטן')),
      H('hpa', 'amygdala', 'system/hpa', 'in', B('Emotion, stress and memory', 'רגש, לחץ וזיכרון')),
      H('dopamine', 'basal', 'molecule/transmitters', 'in', B('Dopamine and habits', 'דופמין והרגלים')),
    ],
  },
  'methods/histology': {
    parent: 'organ/brain',
    hotspots: [
      H('cortex', 'slice', 'tissue/cortex', 'in', B('The six layers it revealed', 'שש השכבות שהיא חשפה')),
      H('real', 'microscope', 'cell/real', 'in', B('Neurons traced under the microscope', 'נוירונים ששורטטו במיקרוסקופ')),
    ],
  },
  'methods/lesion': {
    parent: 'organ/brain',
    hotspots: [
      H('memory', 'lesionSite', 'organism/memory', 'out', B('What patient H.M. taught us about memory', 'מה המטופל H.M. לימד אותנו על זיכרון')),
      H('mri', 'brain', 'methods/mri', 'side', B('Today: seeing damage with MRI', 'היום: רואים פגיעה ב-MRI'), M),
    ],
  },
  'methods/ct': {
    parent: 'organ/brain',
    hotspots: [
      H('mri', 'gantry', 'methods/mri', 'side', B('Sharper detail: MRI', 'פרטים חדים יותר: MRI'), M),
      H('compare', 'brain', 'methods/compare', 'side', B('Compare the methods', 'השוואת השיטות'), M),
    ],
  },
  'methods/mri': {
    parent: 'organ/brain',
    hotspots: [
      H('fmri', 'magnet', 'methods/fmri', 'side', B('Same scanner, activity: fMRI', 'אותו סורק, פעילות: fMRI'), M),
      H('dti', 'brain', 'methods/dti', 'side', B('The wiring: DTI', 'החיווט: DTI'), M),
    ],
  },
  'methods/dti': {
    parent: 'organ/brain',
    hotspots: [
      H('nerve', 'cc', 'tissue/nerve', 'in', B('Zoom in: bundles of axons', 'זום פנימה: צרורות של אקסונים')),
      H('nervous', 'cst', 'system/nervous', 'out', B('Down to the spinal cord', 'עד חוט השדרה')),
      H('mri', 'slf', 'methods/mri', 'side', B('Back to MRI', 'חזרה ל-MRI'), M),
    ],
  },
  'methods/pet': {
    parent: 'organ/brain',
    hotspots: [
      H('fmri', 'scanner', 'methods/fmri', 'side', B('Faster and without radiation: fMRI', 'מהיר יותר ובלי קרינה: fMRI'), M),
      H('receptors', 'brain', 'macromolecule/receptors', 'in', B('Tracers bind to receptors', 'סמנים נקשרים לקולטנים')),
    ],
  },
  'methods/fmri': {
    parent: 'organ/brain',
    hotspots: [
      H('mri', 'magnet', 'methods/mri', 'side', B('The structure: MRI', 'המבנה: MRI'), M),
      H('pet', 'brain', 'methods/pet', 'side', B('Another way to see activity: PET', 'דרך נוספת לראות פעילות: PET'), M),
    ],
  },
  'methods/eeg': {
    parent: 'organ/brain',
    hotspots: [
      H('meg', 'electrodes', 'methods/meg', 'side', B('The magnetic version: MEG', 'הגרסה המגנטית: MEG'), M),
      // EEG mostly records the summed synaptic currents of cortical pyramidal cells.
      H('cortex', 'brain', 'tissue/cortex', 'in', B('Where the signal comes from: cortex', 'מאיפה האות מגיע: הקליפה')),
    ],
  },
  'methods/meg': {
    parent: 'organ/brain',
    hotspots: [
      H('eeg', 'helmet', 'methods/eeg', 'side', B('The electrical version: EEG', 'הגרסה החשמלית: EEG'), M),
      H('cortex', 'brain', 'tissue/cortex', 'in', B('Zoom in: the cortex', 'זום פנימה: הקליפה')),
    ],
  },
  'methods/singlecell': {
    parent: 'organ/brain',
    hotspots: [
      H('neuron', 'neuron', 'cell/neuron', 'in', B('Zoom in: the neuron', 'זום פנימה: הנוירון')),
      H('membrane', 'electrode', 'atom/membrane', 'in', B('The voltage it measures', 'המתח שהיא מודדת')),
    ],
  },
  'methods/tms': {
    parent: 'organ/brain',
    hotspots: [
      H('membrane', 'coil', 'atom/membrane', 'in', B('Currents that make neurons fire', 'זרמים שגורמים לנוירונים לירות')),
      H('dbs', 'brain', 'methods/dbs', 'side', B('Stimulating deep inside: DBS', 'גירוי בעומק: DBS'), M),
    ],
  },
  'methods/dbs': {
    parent: 'organ/brain',
    hotspots: [
      H('neuron', 'stn', 'cell/neuron', 'in', B('Zoom in: the neurons it stimulates', 'זום פנימה: הנוירונים שהוא מגרה')),
      H('tms', 'lead', 'methods/tms', 'side', B('Stimulating from outside: TMS', 'גירוי מבחוץ: TMS'), M),
    ],
  },
  'methods/microdialysis': {
    parent: 'organ/brain',
    hotspots: [
      H('transmitters', 'probe', 'molecule/transmitters', 'in', B('The molecules it collects', 'המולקולות שהיא אוספת')),
      H('drugs', 'nacc', 'molecule/drugs', 'in', B('Drugs and dopamine', 'סמים ודופמין')),
    ],
  },
  'methods/twins': {
    parent: 'organ/brain',
    hotspots: [
      H('dna', 'mz', 'macromolecule/dna', 'in', B('Zoom in: the genes they share', 'זום פנימה: הגנים המשותפים')),
      H('knockout', 'dz', 'methods/knockout', 'side', B('Testing one gene: knockout mice', 'בדיקת גן אחד: עכברי נוקאאוט'), M),
    ],
  },
  'methods/knockout': {
    parent: 'organ/brain',
    hotspots: [
      H('dna', 'ko', 'macromolecule/dna', 'in', B('Zoom in: DNA → protein', 'זום פנימה: DNA ← חלבון')),
      H('twins', 'wt', 'methods/twins', 'side', B('Genes in people: twin studies', 'גנים בבני אדם: מחקרי תאומים'), M),
    ],
  },
  'methods/stemcells': {
    parent: 'organ/brain',
    hotspots: [
      H('neuron', 'neuronK', 'cell/neuron', 'in', B('Zoom in: a neuron', 'זום פנימה: נוירון')),
      H('glia', 'gliaK', 'cell/glia', 'in', B('Zoom in: glia', 'זום פנימה: תאי גליה')),
      H('dna', 'stem', 'macromolecule/dna', 'in', B('The genes that decide its fate', 'הגנים שקובעים את גורלו')),
    ],
  },
  'methods/compare': {
    parent: 'organ/brain',
    // The compare scene has a single part (the brain), so it gets one hotspot; the rest are in "More here".
    hotspots: [
      H('mri', 'brain', 'methods/mri', 'side', B('Start with MRI', 'מתחילים ב-MRI'), M),
    ],
  },
};

const ORGAN = { level: 'organ', id: 'brain', icon: '🧠', name: B('The brain', 'המוח') };

/** Every place, keyed "<level>/<scene>"; names and icons come from content/catalog.js. */
export const PLACES = {};
for (const s of [ORGAN, ...SCENES]) {
  const key = `${s.level}/${s.id}`;
  const g = GRAPH[key];
  if (!g) continue; // tools/check-graph.mjs reports any catalog scene missing here
  PLACES[key] = { level: s.level, scene: s.id, name: s.name, icon: s.icon, parent: g.parent, hotspots: g.hotspots, ...(g.more ? { more: g.more } : {}) };
}
/**
 * Which hotspots show as dots. Tree places show all of theirs (the tree is the dot list). The ▶ Watch-only places
 * (autonomic system, stress hormones, organism stories, research methods) show none: their hotspots stay in the graph
 * only so the camera knows where to fly, and so no second way into the tree exists (owner, 2026-11-15).
 */
export const WATCH_ONLY = (key) => key === 'system/ans' || key === 'system/hpa' || key.startsWith('organism/') || key.startsWith('methods/');
export const DOTS = {};
for (const k of Object.keys(GRAPH)) if (WATCH_ONLY(k)) DOTS[k] = [];

/** The dots of a place: its listed hotspots (never one back to the parent: the breadcrumb does that). */
export function dotsOf(key) {
  const p = PLACES[key];
  if (!p) return [];
  const keep = DOTS[key];
  return (p.hotspots || []).filter((h) => h.to !== p.parent && (!keep || keep.includes(h.id)));
}

/** Graph entries with no catalog scene (should be none; checked by tools/check-graph.mjs). */
export const UNKNOWN_KEYS = Object.keys(GRAPH).filter((k) => !PLACES[k]);

/** [ROOT, …, key] following parents, for the breadcrumb ([] for an unknown key). */
export function pathTo(key) {
  const path = [];
  const seen = new Set();
  for (let k = key; k && PLACES[k] && !seen.has(k); k = PLACES[k].parent) { seen.add(k); path.unshift(k); }
  return path[0] === ROOT ? path : [];
}

/** Place key for a route, or null. `scene` is optional (→ the level's first place); any organ route → ROOT. */
export function placeFromRoute(level, scene) {
  if (level === 'organ') return ROOT;
  if (scene) return PLACES[`${level}/${scene}`] ? `${level}/${scene}` : null;
  for (const k in PLACES) if (PLACES[k].level === level) return k;
  return null;
}

/** The hotspot in place `key` that leads to `toKey` (to fly back out to the right spot), or null. */
export function hotspotTo(key, toKey) {
  return PLACES[key]?.hotspots.find((h) => h.to === toKey) || null;
}
