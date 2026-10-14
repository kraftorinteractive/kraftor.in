import { useEffect, useRef, useState } from 'react'
import { FiArrowRight, FiPlay } from 'react-icons/fi'
import Button from '../ui/Button'
import Reveal from '../ui/Reveal'
import TypeText from '../ui/TypeText'
import Marquee from './Marquee'
import symbol from '../../assets/logo-symbol.png'
import { counts } from '../../data/portfolio'
import './Hero.css'

// Each word completes: "We turn ideas into ___ people love."
const words = ['3D films', 'brand videos', 'websites', 'mobile apps', 'smart software']

const stats = [
  { value: `${counts.reels + counts.sites + counts.apps}+`, label: 'Projects' },
  { value: counts.sites, label: 'Websites' },
  { value: counts.apps, label: 'Apps' },
]

/** Rotating headline word. */
function Rotator() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % words.length), 2200)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="rot" aria-live="polite">
      <span key={i} className="rot__word text-grad">{words[i]}</span>
    </span>
  )
}

export default function Hero() {
  const videoRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {})
    // Drive the progress bar straight from the video, no re-renders
    let raf
    const tick = () => {
      if (barRef.current && v.duration) barRef.current.style.transform = `scaleX(${v.currentTime / v.duration})`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section className="hx">
      <div className="hx__bg" aria-hidden="true">
        <span className="hx__grid" />
      </div>

      <div className="container hx__inner">
        {/* Played strictly in order via the animation queue:
            pill → heading types → rotating word → "people love." types → info types → buttons → stats → reels → strips */}
        <div className="hx__text">
          <Reveal as="span" className="hx__pill">
            <span className="hx__pulse" /> Multimedia &amp; IT Solution
          </Reveal>
          <h1 className="hx__title" aria-label="We turn ideas into work people love.">
            <TypeText text="We turn ideas into" speed={35} caret={false} />
            <Reveal as="span" className="rot-wrap"><Rotator /></Reveal>
            <TypeText text="people love." speed={35} />
          </h1>
          <TypeText as="p" className="hx__lead" text="Design, animation and tech — all under one roof." speed={14} caret={false} />
          <Reveal className="hx__actions">
            <Button to="/contact" size="md" iconRight={<FiArrowRight />}>Start a Project</Button>
            <Button to="/portfolio" size="md" variant="outline" className="hx__work" icon={<FiPlay />}>Our Work</Button>
          </Reveal>
          <Reveal as="ul" className="hx__stats">
            {stats.map((s) => (
              <li key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </li>
            ))}
          </Reveal>
        </div>

        <Reveal className="hx__stage" aria-hidden="true">
          <div className="hx__ring" />
          <div className="hx__floor" />
          {/* Side reels are small files (~370 KB each) so they can play too */}
          <div className="hx__card hx__card--l">
            <video src="/videos/3d-atmospheric-world.mp4" poster="/videos/3d-atmospheric-world.jpg" autoPlay muted loop playsInline />
          </div>
          <div className="hx__card hx__card--r">
            <video src="/videos/3d-scifi-mecha.mp4" poster="/videos/3d-scifi-mecha.jpg" autoPlay muted loop playsInline />
          </div>
          <div className="hx__card hx__card--c">
            <video ref={videoRef} src="/videos/motion-brand-feature.mp4" poster="/videos/motion-brand-feature.jpg" autoPlay muted loop playsInline />
            <span className="hx__notch" />
            <div className="hx__now">
              <span className="hx__now-label"><i className="hx__live" /> Now playing</span>
              <span className="hx__bar"><i ref={barRef} /></span>
            </div>
          </div>
          <div className="hx__badge">
            <img src={symbol} alt="" />
          </div>
          <span className="hx__chip hx__chip--a"><i className="dot dot--o" />3D Animation</span>
          <span className="hx__chip hx__chip--b"><i className="dot dot--b" />Web &amp; App</span>
        </Reveal>
      </div>

      {/* Inside the hero so the soft background flows behind the crossed strips */}
      <Reveal className="hx__mq"><Marquee /></Reveal>
    </section>
  )
}
