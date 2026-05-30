/** Defer work to the next microtask so effects do not call setState synchronously. */
export function deferInEffect(fn: () => void): void {
  queueMicrotask(fn)
}
