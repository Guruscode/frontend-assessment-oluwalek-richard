// Dev-only measurement instrument for the render-count evidence (constraint 2).
// Active only when the URL has ?debug=1, so the shipped app never pays for it.
// Mutating a module-level Map during render is impure by design — this is a
// counter, not application logic.
const counts = new Map<string, number>();

export const isDebug = new URLSearchParams(window.location.search).has('debug');

export function countRender(id: string): number {
  const next = (counts.get(id) ?? 0) + 1;
  counts.set(id, next);
  return next;
}
