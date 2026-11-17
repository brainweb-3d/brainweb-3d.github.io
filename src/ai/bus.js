// Tiny event bus: every AI module calls emitAiChange() when a connection changes,
// and pages subscribe with onAiChange(fn) (re-exported from providers.js).
const listeners = new Set();

export function onAiChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let queued = false;
/** Notify listeners (batched, so several changes in one tick cause one refresh). */
export function emitAiChange() {
  if (queued) return;
  queued = true;
  setTimeout(() => {
    queued = false;
    listeners.forEach((fn) => {
      try { fn(); } catch (e) { console.error(e); }
    });
  }, 0);
}

/** Parse a model's JSON answer even if it is wrapped in ``` fences or has text around it. */
export function parseJSONLoose(text) {
  const s = String(text ?? '').trim();
  try { return JSON.parse(s); } catch { /* try harder below */ }
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) { try { return JSON.parse(fenced[1]); } catch { /* keep going */ } }
  const start = s.search(/[{[]/);
  const end = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
  if (start >= 0 && end > start) {
    try { return JSON.parse(s.slice(start, end + 1)); } catch { /* fall through */ }
  }
  throw new Error('The AI answer was not valid JSON. Please try again.');
}

/** Instruction appended when a provider can't enforce a JSON schema itself. */
export const jsonInstruction = (schema) =>
  `\n\nReply with ONLY one JSON object (no markdown, no code fences, no text before or after) that matches this JSON Schema exactly:\n${JSON.stringify(schema)}`;
