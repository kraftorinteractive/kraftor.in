import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiPhone, FiMail, FiArrowRight, FiArrowUpRight } from 'react-icons/fi'
import { FaWhatsapp, FaInstagram, FaRedditAlien } from 'react-icons/fa'
import ThemeToggle from '../ui/ThemeToggle'
import { navLinks, links, site, socials } from '../../data/site'
import './MobileMenu.css'

const socialIcons = { instagram: FaInstagram, whatsapp: FaWhatsapp, reddit: FaRedditAlien }

/**
 * Full-screen frosted-glass mobile menu, sliding in from the right.
 * Numbered links with a one-line hint → "Start a project" → quick contact → socials + theme.
 */
export default function MobileMenu({ open, onClose }) {
  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div id="mobile-menu" className={`mmenu${open ? ' is-open' : ''}`} aria-hidden={!open} inert={open ? undefined : ''}>
      <span className="mmenu__label mmenu__seq" style={{ '--i': 0 }}>Menu</span>

      <nav className="mmenu__links" aria-label="Mobile">
        {navLinks.map((l, i) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className="mmenu__link mmenu__seq"
            style={{ '--i': i + 1 }}
            onClick={onClose}
          >
            <span className="mmenu__num">0{i + 1}</span>
            <span className="mmenu__text">
              <span className="mmenu__name">{l.label}</span>
              <span className="mmenu__hint">{l.hint}</span>
            </span>
            <FiArrowUpRight className="mmenu__arrow" aria-hidden="true" />
          </NavLink>
        ))}
      </nav>

      <div className="mmenu__bottom mmenu__seq" style={{ '--i': navLinks.length + 1 }}>
        <Link to="/contact" className="mmenu__cta" onClick={onClose}>
          Start a Project <FiArrowRight />
        </Link>

        <div className="mmenu__actions">
          <a href={links.tel} className="mmenu__btn" aria-label={`Call ${site.phoneDisplay}`}>
            <FiPhone /> Call
          </a>
          <a href={links.mail} className="mmenu__btn" aria-label={`Email ${site.email}`}>
            <FiMail /> Email
          </a>
          <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="mmenu__btn" aria-label="WhatsApp">
            <FaWhatsapp /> WhatsApp
          </a>
        </div>

        <div className="mmenu__foot">
          <div className="mmenu__social">
            {socials.map((s) => {
              const Icon = socialIcons[s.key]
              return (
                <a key={s.key} className={`mmenu__soc mmenu__soc--${s.key}`} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
                  <Icon />
                </a>
              )
            })}
          </div>
          <ThemeToggle className="mmenu__theme" />
        </div>
      </div>
    </div>
  )
}
