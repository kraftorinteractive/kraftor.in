import { useEffect, useRef, useState } from 'react'
import { FiVolume2, FiVolumeX } from 'react-icons/fi'
import './cards.css'

const UNMUTE_EVENT = 'kraftor:reel-unmute'

/** Auto-playing reel (9:16, or 16:9 with `wide`). Mute button sits inside the frame. Only one reel plays sound at a time. */
export default function ReelCard({ reel, wide = false }) {
  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)

  // Play only while on screen
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.4 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  // Mute this reel when another one is unmuted
  useEffect(() => {
    const onOther = (e) => {
      if (e.detail !== reel.id) setMuted(true)
    }
    window.addEventListener(UNMUTE_EVENT, onOther)
    return () => window.removeEventListener(UNMUTE_EVENT, onOther)
  }, [reel.id])

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  const toggle = () => {
    const next = !muted
    setMuted(next)
    if (!next) window.dispatchEvent(new CustomEvent(UNMUTE_EVENT, { detail: reel.id }))
  }

  return (
    <article className={`reel${wide ? ' reel--wide' : ''}`}>
      <div className="reel__frame">
        {reel.video ? (
          // preload="none": nothing downloads until the reel scrolls into view and starts playing
          <video ref={videoRef} src={reel.video} poster={reel.poster || undefined} autoPlay muted loop playsInline preload="none" />
        ) : (
          <div className={`ph ph--${reel.tone || 'orange'} ph--anim`} aria-hidden="true" />
        )}
        {reel.video && (
          <button
            className="reel__sound"
            onClick={toggle}
            aria-pressed={!muted}
            aria-label={muted ? `Unmute ${reel.title}` : `Mute ${reel.title}`}
          >
            {muted ? <FiVolumeX /> : <FiVolume2 />}
          </button>
        )}
      </div>
      <h4 className="reel__title">{reel.title}</h4>
      <p className="reel__type">{reel.type}</p>
    </article>
  )
}
