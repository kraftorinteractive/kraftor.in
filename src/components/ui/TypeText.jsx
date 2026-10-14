import { useEffect, useRef, useState } from 'react'
import { enqueue, cancel } from '../../lib/sequence'
import './TypeText.css'

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Types `text` (+ an optional orange-gradient `accent`) one letter at a time.
 * It joins the shared animation queue on page load and waits its turn, so nothing types in parallel.
 * The caret only shows while typing. Screen readers get the full text via aria-label.
 * (`inView` / `delay` are accepted for older markup but no longer used — the queue handles order.)
 */
// eslint-disable-next-line no-unused-vars
export default function TypeText({ text, accent = '', speed = 35, inView, caret = true, as: Tag = 'span', className = '' }) {
  const full = text + accent
  const reduce = reducedMotion()
  const ref = useRef(null)
  const [started, setStarted] = useState(reduce)
  const [count, setCount] = useState(reduce ? full.length : 0)
  const played = useRef(false) // typed once already? then later text changes just swap in

  // Join the queue right away: the page plays top to bottom whether or not the visitor scrolls
  useEffect(() => {
    if (reduce) return
    const el = ref.current
    if (!el) return
    setStarted(false)
    if (played.current) {
      // Text changed after the intro (e.g. switching a filter): show it straight away, no re-typing
      setCount(full.length)
      return
    }
    setCount(0)
    enqueue(el, full.length * speed + 120, () => {
      played.current = true
      setStarted(true)
    })
    return () => cancel(el)
  }, [full, speed, reduce])

  // Type letter by letter once it's our turn
  useEffect(() => {
    if (reduce || !started) return
    let i = 0
    let t
    const tick = () => {
      i += 1
      setCount(i)
      if (i < full.length) t = setTimeout(tick, speed)
    }
    t = setTimeout(tick, speed)
    return () => clearTimeout(t)
  }, [started, full, speed, reduce])

  const done = count >= full.length

  // Split a range of `full` into plain + accent parts so the accent keeps its gradient
  const part = (from, to) => {
    const plain = full.slice(Math.min(from, text.length), Math.min(to, text.length))
    const acc = full.slice(Math.max(from, text.length), Math.max(to, text.length))
    return (
      <>
        {plain}
        {acc && <span className="text-grad">{acc}</span>}
      </>
    )
  }

  const showCaret = caret && started && !reduce
  return (
    <Tag ref={ref} className={`type ${done ? 'type--done' : ''} ${className}`.trim()} aria-label={full}>
      <span aria-hidden="true">{part(0, count)}</span>
      {showCaret && !done && <span className="type__caret" aria-hidden="true" />}
      {/* the not-yet-typed letters keep their space, so nothing jumps while typing */}
      <span className="type__rest" aria-hidden="true">{part(count, full.length)}</span>
      {showCaret && done && <span className="type__caret" aria-hidden="true" />}
    </Tag>
  )
}

/** How long TypeText takes for a given text. */
export const typeDuration = (text, speed = 35, delay = 0) => delay + text.length * speed
