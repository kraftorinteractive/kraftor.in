import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPhone, FiMail, FiArrowRight } from 'react-icons/fi'
import { FaInstagram, FaWhatsapp, FaRedditAlien } from 'react-icons/fa'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import ThemeToggle from '../ui/ThemeToggle'
import { site, links, socials, infoLinks } from '../../data/site'
import './Footer.css'

const socialIcons = { instagram: FaInstagram, whatsapp: FaWhatsapp, reddit: FaRedditAlien }

export default function Footer() {
  const navigate = useNavigate()
  const taps = useRef({ count: 0, timer: 0 })
  useEffect(() => () => clearTimeout(taps.current.timer), [])

  // Hidden way into the admin panel: tap the footer logo three times quickly.
  // A single tap still goes Home — it just waits a moment to see if more taps follow,
  // so the page doesn't scroll away from the footer between taps.
  const onLogoTap = (e) => {
    e.preventDefault()
    const t = taps.current
    clearTimeout(t.timer)
    t.count += 1
    if (t.count >= 3) {
      t.count = 0
      navigate('/admin')
      return
    }
    t.timer = setTimeout(() => {
      t.count = 0
      navigate('/')
    }, 450)
  }

  return (
    <footer className="foot">
      <div className="container">
        <div className="foot__grid">
          {/* Brand — the only column shown on mobile */}
          <div className="foot__brand">
            <div className="foot__logo-row">
              <Logo onDark onClick={onLogoTap} />
              <ThemeToggle />
            </div>
            <p className="foot__desc">{site.description}</p>
            <ul className="foot__contact">
              <li><a href={links.tel}><FiPhone /> {site.phoneDisplay}</a></li>
              <li><a href={links.mail}><FiMail /> {site.email}</a></li>
            </ul>
            <div className="foot__social">
              {socials.map((s) => {
                const Icon = socialIcons[s.key]
                return (
                  <a key={s.key} className={`foot__soc foot__soc--${s.key}`} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
                    <Icon />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="foot__links">
            <div className="foot__col">
              <h4>More Info</h4>
              <ul>
                {infoLinks.map((l) => (
                  <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="foot__col foot__desktop">
            <h4>Work with us</h4>
            <p className="foot__desc">Have a project? Let&apos;s talk.</p>
            <div className="foot__cta">
              <Button to="/contact" iconRight={<FiArrowRight />}>Start a Project</Button>
              <Button to="/contact" variant="glass">Get Quote</Button>
            </div>
          </div>
        </div>

        <div className="foot__bottom">
          <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
