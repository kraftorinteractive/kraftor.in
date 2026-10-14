import { forwardRef, useEffect, useRef } from 'react'
import { enqueue, cancel } from '../../lib/sequence'
import './Reveal.css'

const STAGGER = 90 // keep in step with --stagger in theme.css
const SLOT = 320 // how long the next item waits after this one starts fading in

/**
 * Fades content in, in turn, via the shared animation queue (from page load, in page order),
 * so it never fades at the same time as the heading or block before it.
 * `stagger` fades direct children one after another.
 * (variant is kept for older markup; every variant is the same soft fade.)
 */
const Reveal = forwardRef(function Reveal(
  { as: Tag = 'div', className = '', stagger = false, variant = 'fade', delay, style, children, ...rest },
  forwardedRef
) {
  const ref = useRef(null)

  const setRef = (node) => {
    ref.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) forwardedRef.current = node
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const kids = stagger ? el.children.length : 0
    if (stagger) [...el.children].forEach((c, i) => c.style.setProperty('--ri', Math.min(i, 8)))
    // Next item waits until the last (visible) child has started fading in
    const slot = SLOT + Math.max(0, Math.min(kids, 6) - 1) * STAGGER
    const show = () => el.classList.add('is-in')

    // Joins the queue as soon as the page loads — the whole page plays top to bottom
    // whether or not the visitor scrolls.
    enqueue(el, slot, show, { fast: true })
    return () => cancel(el)
  }, [stagger])

  return (
    <Tag ref={setRef} className={`reveal reveal--${variant}${stagger ? ' reveal--stagger' : ''} ${className}`.trim()} style={style} {...rest}>
      {children}
    </Tag>
  )
})

export default Reveal
