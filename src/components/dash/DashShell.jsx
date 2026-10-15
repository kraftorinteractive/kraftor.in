import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiBell, FiMenu, FiX, FiChevronDown, FiLogOut, FiGlobe, FiArrowRight, FiChevronRight } from 'react-icons/fi'
import symbol from '../../assets/logo-symbol.png'
import wordmark from '../../assets/logo-wordmark.png'
import ThemeToggle from '../ui/ThemeToggle'
import '../layout/PageHeader.css'
import './dash.css'

const initials = (n) => (n || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

export function Avatar({ src, name, size = 36 }) {
  return (
    <span className="dav" style={{ width: size, height: size }} aria-hidden="true">
      {src ? <img src={src} alt="" /> : initials(name)}
    </span>
  )
}

/** Jump-to search over sections (and sub-views). ⌘K / Ctrl+K focuses it. */
function Search({ items, onPick, placeholder = 'Search anything…', autoFocusKey = true }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const ref = useRef(null)
  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return items.slice(0, 8)
    return items.filter((i) => `${i.label} ${i.hint || ''} ${i.keywords || ''}`.toLowerCase().includes(t)).slice(0, 8)
  }, [q, items])

  useEffect(() => {
    if (!autoFocusKey) return
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [autoFocusKey])

  const pick = (i) => {
    onPick(i)
    setQ('')
    setOpen(false)
    ref.current?.blur()
  }

  return (
    <div className={`dsearch${open ? ' is-open' : ''}`}>
      <FiSearch className="dsearch__icon" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        value={q}
        placeholder={placeholder}
        aria-label="Search sections"
        onChange={(e) => {
          setQ(e.target.value)
          setHi(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHi((h) => Math.min(h + 1, results.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHi((h) => Math.max(h - 1, 0))
          } else if (e.key === 'Enter' && results[hi]) {
            e.preventDefault()
            pick(results[hi])
          } else if (e.key === 'Escape') {
            setOpen(false)
            e.currentTarget.blur()
          }
        }}
      />
      {autoFocusKey && <kbd className="dsearch__kbd">⌘ K</kbd>}
      {open && results.length > 0 && (
        <ul className="dsearch__list" role="listbox">
          {results.map((r, i) => {
            const Icon = r.icon
            return (
              <li key={r.id} role="option" aria-selected={i === hi}>
                <button type="button" className={i === hi ? 'is-hi' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(r)}>
                  {Icon && <Icon aria-hidden="true" />}
                  <span>{r.label}</span>
                  {r.hint && <small>{r.hint}</small>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Popover({ button, children, label, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])
  return (
    <div className="dpop" ref={ref}>
      {button({ open, toggle: () => setOpen((o) => !o), label })}
      {open && <div className={`dpop__menu dpop__menu--${align}`}>{children(() => setOpen(false))}</div>}
    </div>
  )
}

/**
 * App-style dashboard frame: sidebar (drawer on mobile), top bar with search, notifications,
 * theme and profile. Used by the admin panel and the client / employee areas.
 *
 *   nav: [{ key, label, icon, badge }]          sections in the sidebar
 *   searchItems: [{ id, label, hint, icon, go }] extra things to jump to (sub-views)
 *   notifications: [{ id, label, sub, icon, go }]
 */
export default function DashShell({ brand = 'Kraftor', tagline, nav, active, onNav, user, onSignOut, notifications = [], searchItems = [], children }) {
  const [drawer, setDrawer] = useState(false)
  const [updated, setUpdated] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setUpdated(new Date()), 60000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawer])

  const go = (key) => {
    onNav(key)
    setDrawer(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const allSearch = useMemo(
    () => [...nav.map((n) => ({ id: `nav-${n.key}`, label: n.label, hint: 'Section', icon: n.icon, go: () => go(n.key) })), ...searchItems],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nav, searchItems]
  )

  const sidebar = (
    <>
      <Link to="/" className="dside__brand" aria-label="Kraftor website">
        <img src={symbol} alt="" className="dside__symbol" />
        <span>
          <img src={wordmark} alt={brand} className="dside__word" />
          {tagline && <small>{tagline}</small>}
        </span>
      </Link>

      <nav className="dside__nav" aria-label="Dashboard">
        {nav.map((n) => {
          const Icon = n.icon
          return (
            <button key={n.key} type="button" className={`dside__link${active === n.key ? ' is-active' : ''}`} onClick={() => go(n.key)} aria-current={active === n.key ? 'page' : undefined}>
              {Icon && <Icon aria-hidden="true" />}
              <span>{n.label}</span>
              {n.badge ? <em className="dside__badge">{n.badge > 99 ? '99+' : n.badge}</em> : null}
            </button>
          )
        })}
      </nav>

      <div className="dside__promo">
        <span className="dside__promo-grid" aria-hidden="true" />
        <span className="dside__promo-icon" aria-hidden="true"><FiGlobe /></span>
        <strong>Kraftor website</strong>
        <p>See what your clients see — portfolio, services and contact.</p>
        <Link to="/" className="dside__promo-btn">Open website <FiArrowRight aria-hidden="true" /></Link>
      </div>

      <p className="dside__status">
        <span className="dside__dot" aria-hidden="true" /> Live sync on
        <small>Updated {updated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</small>
      </p>
    </>
  )

  return (
    <div className="dash">
      <aside className="dside" aria-label="Sidebar">{sidebar}</aside>

      {/* Mobile drawer */}
      <div className={`ddrawer${drawer ? ' is-open' : ''}`} aria-hidden={!drawer} inert={drawer ? undefined : ''}>
        <button type="button" className="ddrawer__scrim" aria-label="Close menu" tabIndex={-1} onClick={() => setDrawer(false)} />
        <aside className="dside dside--drawer" aria-label="Menu">
          <button type="button" className="ddrawer__x" onClick={() => setDrawer(false)} aria-label="Close menu"><FiX /></button>
          {sidebar}
        </aside>
      </div>

      <div className="dmain">
        <header className="dtop">
          <button type="button" className="dtop__menu" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer}>
            <FiMenu />
          </button>
          <Link to="/" className="dtop__logo" aria-label="Kraftor website"><img src={symbol} alt="" /></Link>
          <Search items={allSearch} onPick={(i) => i.go()} />
          <div className="dtop__end">
            <Popover
              label="Notifications"
              button={({ open, toggle }) => (
                <button type="button" className={`dtop__icon${open ? ' is-on' : ''}`} onClick={toggle} aria-label={`Notifications (${notifications.length})`} aria-expanded={open}>
                  <FiBell />
                  {notifications.length > 0 && <span className="dtop__dot" aria-hidden="true" />}
                </button>
              )}
            >
              {(close) => (
                <div className="dnotes">
                  <p className="dnotes__head">Needs attention <span>{notifications.length}</span></p>
                  {notifications.length === 0 ? (
                    <p className="dnotes__empty">You’re all caught up ✨</p>
                  ) : (
                    <ul>
                      {notifications.slice(0, 8).map((n) => {
                        const Icon = n.icon
                        return (
                          <li key={n.id}>
                            <button
                              type="button"
                              onClick={() => {
                                close()
                                n.go?.()
                                setDrawer(false)
                              }}
                            >
                              <span className={`dnotes__ico tone-${n.tone || 'orange'}`}>{Icon && <Icon aria-hidden="true" />}</span>
                              <span className="dnotes__txt">
                                <strong>{n.label}</strong>
                                {n.sub && <small>{n.sub}</small>}
                              </span>
                              <FiChevronRight aria-hidden="true" />
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )}
            </Popover>
            <ThemeToggle className="dtop__icon dtop__theme" />
            <Popover
              label="Account"
              button={({ open, toggle }) => (
                <button type="button" className="dtop__me" onClick={toggle} aria-expanded={open} aria-label="Account menu">
                  <Avatar src={user.avatar} name={user.name} />
                  <span className="dtop__me-txt">
                    <strong>{user.name}</strong>
                    <small>{user.role}</small>
                  </span>
                  <FiChevronDown className="dtop__chev" aria-hidden="true" />
                </button>
              )}
            >
              {(close) => (
                <div className="dmenu">
                  <p className="dmenu__who">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </p>
                  <Link to="/" className="dmenu__item" onClick={close}><FiGlobe /> Website</Link>
                  <button
                    type="button"
                    className="dmenu__item dmenu__item--danger"
                    onClick={() => {
                      close()
                      onSignOut()
                    }}
                  >
                    <FiLogOut /> Sign out
                  </button>
                </div>
              )}
            </Popover>
          </div>
        </header>

        <main className="dcontent">{children}</main>
      </div>
    </div>
  )
}
