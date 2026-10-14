/**
 * One shared queue for every entrance animation on the site.
 *
 * Animations never start in parallel: each item waits for the one before it,
 * in page order (top to bottom). Everything registers as soon as the page loads,
 * so the whole page plays through whether or not the visitor scrolls.
 *
 *   enqueue(element, slotMs, start)  → start() runs when it's this item's turn,
 *                                      and the next item waits slotMs after that.
 *   cancel(element)                  → drop it (e.g. the component unmounted).
 */

const queue = []
let timer = null
let busy = false

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Earlier in the page comes first
const byPageOrder = (a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)

function next() {
  timer = null
  // Skip anything that left the page (route change, unmount)
  while (queue.length && !queue[0].el.isConnected) queue.shift()
  if (!queue.length) {
    busy = false
    return
  }
  queue.sort(byPageOrder)
  const item = queue.shift()
  busy = true
  item.start()
  // Hidden on this screen size (e.g. display: none on phones)? Don't make the next item wait for it.
  if (!item.el.getClientRects().length) return next()
  // If a lot is waiting (fast scrolling), let fades move along quicker so content never lags behind.
  // Typing is never cut short — the next thing always waits for the heading to finish.
  const wait = item.fast && queue.length > 6 ? Math.min(item.slot, 160) : item.slot
  timer = setTimeout(next, wait)
}

/** `fast`: this item may be hurried when the queue is long (fades yes, typing no). */
export function enqueue(el, slot, start, { fast = false } = {}) {
  if (!el || reduced()) return start()
  queue.push({ el, slot, start, fast })
  // When idle, wait a moment so everything visible on load registers first,
  // then play it all in page order.
  if (!busy && !timer) timer = setTimeout(next, 60)
}

export function cancel(el) {
  const i = queue.findIndex((q) => q.el === el)
  if (i >= 0) queue.splice(i, 1)
}
