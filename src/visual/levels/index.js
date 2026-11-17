// The 9 zoom levels (smallest → largest) plus the research-methods section.
// Each level module is loaded only when opened (keeps the site fast).
export const LEVELS = [
  { id: 'atom', icon: '⚛️', size: '0.1 nm', name: { en: 'Atom & ion', he: 'אטום ויון' }, load: () => import('./atom.js') },
  { id: 'molecule', icon: '🧪', size: '1 nm', name: { en: 'Molecule', he: 'מולקולה' }, load: () => import('./molecule.js') },
  { id: 'macromolecule', icon: '🧬', size: '10 nm', name: { en: 'Macromolecule', he: 'מקרומולקולה' }, load: () => import('./macromolecule.js') },
  { id: 'organelle', icon: '🫧', size: '1 µm', name: { en: 'Organelle', he: 'אברון' }, load: () => import('./organelle.js') },
  { id: 'cell', icon: '🌿', size: '100 µm', name: { en: 'Cell', he: 'תא' }, load: () => import('./cell.js') },
  { id: 'tissue', icon: '🧵', size: '1 mm', name: { en: 'Tissue', he: 'רקמה' }, load: () => import('./tissue.js') },
  { id: 'organ', icon: '🧠', size: '15 cm', name: { en: 'Organ: the brain', he: 'איבר: המוח' } },
  { id: 'system', icon: '🕸️', size: '1 m', name: { en: 'Organ system', he: 'מערכת איברים' }, load: () => import('./system.js') },
  { id: 'organism', icon: '🧍', size: '1.7 m', name: { en: 'Organism', he: 'אורגניזם' }, load: () => import('./organism.js') },
];
export const METHODS_LEVEL = { id: 'methods', icon: '🔬', name: { en: 'Research methods', he: 'שיטות מחקר' }, load: () => import('../methods/methods.js') };
export const levelById = Object.fromEntries([...LEVELS, METHODS_LEVEL].map((l) => [l.id, l]));
