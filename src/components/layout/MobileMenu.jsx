import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { FiPhone, FiMail } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { navLinks, links, site } from '../../data/site'
import './MobileMenu.css'

/** Simple full-screen mobile menu that slides in from right to left. */
export default function MobileMenu({ open, onClose }) {
  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div id="mobile-menu" className={`mmenu${open ? ' is-open' : ''}`} aria-hidden={!open} inert={open ? undefined : ''}>
      <nav className="mmenu__links" aria-label="Mobile">
        {navLinks.map((l, i) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className="mmenu__link" style={{ '--i': i }} onClick={onClose}>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="mmenu__actions">
        <a href={links.tel} className="mmenu__btn mmenu__btn--primary" aria-label={`Call ${site.phoneDisplay}`}>
          <FiPhone /> Call
        </a>
        <a href={links.mail} className="mmenu__btn" aria-label={`Email ${site.email}`}>
          <FiMail /> Email
        </a>
        <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="mmenu__btn" aria-label="WhatsApp">
          <FaWhatsapp /> WhatsApp
        </a>
      </div>
    </div>
  )
}
