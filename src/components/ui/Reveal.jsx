import { forwardRef, useEffect, useRef } from 'react'
import './Reveal.css'

/**
 * Fades/slides content in when it scrolls into view.
 * `stagger` animates direct children one after another.
 * variant: up | left | zoom
 */
const Reveal = forwardRef(function Reveal(
  { as: Tag = 'div', className = '', stagger = false, variant = 'up', delay = 0, style, children, ...rest },
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
    if (stagger) [...el.children].forEach((c, i) => c.style.setProperty('--ri', Math.min(i, 8)))
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-in')
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [stagger])

  return (
    <Tag
      ref={setRef}
      className={`reveal reveal--${variant}${stagger ? ' reveal--stagger' : ''} ${className}`.trim()}
      style={{ ...style, '--rd': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
})

export default Reveal
