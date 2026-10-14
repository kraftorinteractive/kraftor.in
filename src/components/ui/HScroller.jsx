import { useEffect, useRef, useState } from 'react'
import Reveal from './Reveal'
import './HScroller.css'

/**
 * Mobile: horizontal swipe row (right → left) with scroll-snap and a progress bar.
 * Desktop: grid with `cols` columns (or keeps scrolling if `scrollDesktop`).
 * `size` sets the mobile card width: reel | card | wide | small
 * `autoplay` (ms) slides to the next card on its own while the row can scroll;
 * it pauses while the visitor touches it and when the row is off screen.
 */
export default function HScroller({ children, cols = 3, size = 'card', scrollDesktop = false, autoplay = 0, className = '' }) {
  const ref = useRef(null)
  const [bar, setBar] = useState({ w: 100, x: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el || !autoplay) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let visible = false
    let pausedUntil = 0
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.4 })
    io.observe(el)
    const pause = () => (pausedUntil = Date.now() + 5000)
    el.addEventListener('pointerdown', pause, { passive: true })
    el.addEventListener('touchstart', pause, { passive: true })
    el.addEventListener('wheel', pause, { passive: true })

    const t = setInterval(() => {
      const max = el.scrollWidth - el.clientWidth
      if (!visible || max <= 4 || Date.now() < pausedUntil || document.hidden) return
      const items = [...el.children]
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0
      const next = items.find((c) => c.offsetLeft - pad > el.scrollLeft + 4)
      const target = el.scrollLeft >= max - 4 || !next ? 0 : Math.min(next.offsetLeft - pad, max)
      el.scrollTo({ left: target, behavior: 'smooth' })
    }, autoplay)

    return () => {
      clearInterval(t)
      io.disconnect()
      el.removeEventListener('pointerdown', pause)
      el.removeEventListener('touchstart', pause)
      el.removeEventListener('wheel', pause)
    }
  }, [autoplay])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el
      const w = scrollWidth > 0 ? Math.min(100, (clientWidth / scrollWidth) * 100) : 100
      const max = scrollWidth - clientWidth
      setBar({ w, x: max > 0 ? scrollLeft / max : 0 })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className={`hs-wrap${scrollDesktop ? ' hs-wrap--scroll-desktop' : ''}`}>
      <Reveal
        ref={ref}
        stagger
        variant="left"
        className={`hs hs--${size}${scrollDesktop ? ' hs--scroll-desktop' : ''} ${className}`.trim()}
        style={{ '--cols': cols }}
      >
        {children}
      </Reveal>
      {bar.w < 99.5 && (
        <div className="hs-bar" aria-hidden="true">
          <span style={{ width: `${bar.w}%`, left: `${bar.x * (100 - bar.w)}%` }} />
        </div>
      )}
    </div>
  )
}
