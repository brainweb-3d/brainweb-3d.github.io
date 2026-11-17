// Tiny adapter so Explore works before and after the AI login rewrite:
// uses hasAI/onAiChange from src/ai/providers.js when that file exists, else the older claude.js.
const P = Object.values(import.meta.glob('../ai/providers.js', { eager: true }))[0];
const C = Object.values(import.meta.glob('../ai/claude.js', { eager: true }))[0];

export const hasAI = () => (P?.hasAI ? !!P.hasAI() : C?.hasClaude ? !!C.hasClaude() : false);
export const onAiChange = (fn) => (P?.onAiChange || C?.onAiChange)?.(fn);
export const askBrain = async (q) => (await import('../ai/features.js')).askBrain(q);
