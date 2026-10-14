import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiLogOut, FiInbox, FiBriefcase, FiSearch, FiChevronDown, FiPhone, FiMail, FiDownload, FiTrash2, FiExternalLink, FiAlertTriangle, FiLock, FiUsers,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'
import ThemeToggle from '../components/ui/ThemeToggle'
import usePageTitle from '../hooks/usePageTitle'
import { isFirebaseReady } from '../lib/firebase'
import { adminSignIn, adminSignOut, watchAuth, isAdmin, claimAdmin,watchList, setStatus, removeItem, cvUrl } from '../lib/api'
import './Contact.css'
import './Admin.css'

const STATUSES = { enquiries: ['new', 'contacted', 'closed'], applications: ['new', 'contacted', 'closed'], users: ['pending', 'active', 'blocked'] }
// The status that needs attention in each tab (shown as the count badge)
const FIRST = { enquiries: 'new', applications: 'new', users: 'pending' }
const TABS = [
  { key: 'enquiries', label: 'Enquiries', icon: FiInbox },
  { key: 'applications', label: 'Applications', icon: FiBriefcase },
  { key: 'users', label: 'Users', icon: FiUsers },
]

const fmtDate = (ts) => {
  const d = ts?.toDate?.()
  if (!d) return '—'
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}
const digits = (v) => String(v ?? '').replace(/[^\d]/g, '')
const waLink = (v) => {
  const n = digits(v)
  return n ? `https://wa.me/${n.length === 10 ? `91${n}` : n}` : null
}

/* Keep the admin page out of search results */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])
}

/* ---------------- Screens around the dashboard ---------------- */

function Shell({ children, user }) {
  return (
    <div className="admin">
      <header className="admin__bar">
        <div className="container admin__bar-in">
          <Logo size="sm" />
          <span className="admin__tag">Admin</span>
          <div className="admin__bar-end">
            <ThemeToggle />
            {user && (
              <button type="button" className="admin__out" onClick={adminSignOut} title={`Sign out ${user.email}`}>
                <FiLogOut /> <span>Sign out</span>
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="container admin__main">{children}</main>
    </div>
  )
}

function Notice({ icon: Icon = FiAlertTriangle, title, children }) {
  return (
    <div className="admin-note">
      <Icon className="admin-note__icon" />
      <h1>{title}</h1>
      <div className="muted">{children}</div>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await adminSignIn(email.trim(), password)
    } catch (err) {
      const code = err?.code || ''
      setError(
        code.includes('too-many-requests')
          ? 'Too many attempts. Please wait a minute and try again.'
          : 'Wrong email or password.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form admin-login" onSubmit={onSubmit}>
      <h1 className="form__title">Sign in</h1>
      <div className="form__grid admin-login__grid">
        <div className="field">
          <label htmlFor="a-email">Email</label>
          <input id="a-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="a-pass">Password</label>
          <input id="a-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
      </div>
      <Button type="submit" size="lg" className="form__submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
      {error && <p className="form__error" role="alert">{error}</p>}
    </form>
  )
}

/* ---------------- Dashboard ---------------- */

function Row({ label, children }) {
  if (!children) return null
  return (
    <div className="arow">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function Item({ kind, item, open, onToggle }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const isApp = kind === 'applications'
  const isUser = kind === 'users'
  const status = item.status || FIRST[kind]
  const title = item.name || 'No name'
  const sub = isUser
    ? [item.type === 'employee' ? 'Employee' : 'Client', item.email].filter(Boolean).join(' · ')
    : isApp ? [item.role, item.experience].filter(Boolean).join(' · ') : [item.projectName, item.projectType].filter(Boolean).join(' · ')
  const noun = isUser ? 'profile' : isApp ? 'application' : 'enquiry'
  const wa = waLink(isApp ? item.phone : item.whatsapp || item.phone)

  const run = async (fn) => {
    setErr('')
    setBusy(true)
    try {
      await fn()
    } catch {
      setErr('That didn’t work. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const onDelete = () => {
    if (window.confirm(`Delete ${noun} of ${title}? This can’t be undone.`)) run(() => removeItem(kind, item.id))
  }
  const onCv = () =>
    run(async () => {
      const url = await cvUrl(item.cvPath)
      window.open(url, '_blank', 'noopener')
    })

  return (
    <li className={`aitem${open ? ' is-open' : ''}`}>
      <button type="button" className="aitem__head" onClick={onToggle} aria-expanded={open}>
        <span className={`apill apill--${status}`}>{status}</span>
        <span className="aitem__main">
          <strong>{title}</strong>
          <small>{sub || '—'}</small>
        </span>
        <time className="aitem__date">{fmtDate(item.createdAt)}</time>
        <FiChevronDown className="aitem__chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="aitem__body">
          <dl className="adl">
            <Row label="Email">{item.email}</Row>
            <Row label="Phone">{item.phone}</Row>
            {isUser ? (
              <>
                <Row label="Account">{item.type === 'employee' ? 'Employee' : 'Client'}</Row>
              </>
            ) : isApp ? (
              <>
                <Row label="Role">{item.role}</Row>
                <Row label="Experience">{item.experience}</Row>
                <Row label="Portfolio">
                  {/^https?:\/\//.test(item.portfolio || '') && (
                    <a href={item.portfolio} target="_blank" rel="noopener noreferrer nofollow">
                      {item.portfolio} <FiExternalLink />
                    </a>
                  )}
                </Row>
                <Row label="CV">{item.cvName}</Row>
                <Row label="About">{item.message}</Row>
              </>
            ) : (
              <>
                <Row label="Company">{item.company}</Row>
                <Row label="WhatsApp">{item.whatsapp}</Row>
                <Row label="Country">{item.country}</Row>
                <Row label="Project">{item.projectName}</Row>
                <Row label="Type">{item.projectType}</Row>
                <Row label="Budget">{item.budget}</Row>
                <Row label="Info">{item.projectInfo}</Row>
              </>
            )}
          </dl>

          <div className="aitem__actions">
            <label className="astatus">
              <span>Status</span>
              <select value={status} disabled={busy} onChange={(e) => run(() => setStatus(kind, item.id, e.target.value))}>
                {STATUSES[kind].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            {item.email && <a className="abtn" href={`mailto:${item.email}`}><FiMail /> Email</a>}
            {item.phone && <a className="abtn" href={`tel:${digits(item.phone)}`}><FiPhone /> Call</a>}
            {wa && !isUser && <a className="abtn" href={wa} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> WhatsApp</a>}
            {isApp && item.cvPath && <button type="button" className="abtn" onClick={onCv} disabled={busy}><FiDownload /> CV</button>}
            <button type="button" className="abtn abtn--danger" onClick={onDelete} disabled={busy}><FiTrash2 /> Delete</button>
          </div>
          {err && <p className="form__error" role="alert">{err}</p>}
        </div>
      )}
    </li>
  )
}

function Dashboard() {
  const [tab, setTab] = useState('enquiries')
  const [data, setData] = useState({ enquiries: null, applications: null, users: null })
  const [error, setError] = useState('')
  const [status, setStatusFilter] = useState('all')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    const stops = []
    let alive = true
    TABS.forEach(({ key }) => {
      watchList(
        key,
        (list) => alive && setData((d) => ({ ...d, [key]: list })),
        () => alive && setError('Couldn’t load data. Check the Firestore rules and your admin access.')
      ).then((stop) => (alive ? stops.push(stop) : stop()))
    })
    return () => {
      alive = false
      stops.forEach((s) => s())
    }
  }, [])

  const list = data[tab]
  const shown = useMemo(() => {
    if (!list) return []
    const term = q.trim().toLowerCase()
    return list.filter((it) => {
      if (status !== 'all' && (it.status || FIRST[tab]) !== status) return false
      if (!term) return true
      return Object.values(it).some((v) => typeof v === 'string' && v.toLowerCase().includes(term))
    })
  }, [list, status, q, tab])

  const newCount = (key) => (data[key] || []).filter((it) => (it.status || FIRST[key]) === FIRST[key]).length

  return (
    <>
      <div className="adash__top">
        <h1>Inbox</h1>
        <div className="atabs" role="tablist">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`atab${tab === key ? ' is-active' : ''}`}
              onClick={() => { setTab(key); setOpenId(null); setStatusFilter('all') }}
            >
              <Icon /> {label}
              {newCount(key) > 0 && <span className="atab__count">{newCount(key)}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="atools">
        <label className="asearch">
          <FiSearch aria-hidden="true" />
          <input type="search" placeholder="Search name, email, project…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        </label>
        <div className="achips" role="group" aria-label="Filter by status">
          {['all', ...STATUSES[tab]].map((s) => (
            <button key={s} type="button" className={`achip${status === s ? ' is-active' : ''}`} onClick={() => setStatusFilter(s)} aria-pressed={status === s}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="form__error" role="alert">{error}</p>}

      {list === null && !error ? (
        <p className="muted aempty">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="muted aempty">{list?.length ? 'Nothing matches this filter.' : `No ${tab} yet.`}</p>
      ) : (
        <ul className="alist">
          {shown.map((it) => (
            <Item key={it.id} kind={tab} item={it} open={openId === it.id} onToggle={() => setOpenId(openId === it.id ? null : it.id)} />
          ))}
        </ul>
      )}
    </>
  )
}

/* ---------------- Page ---------------- */

export default function Admin() {
  usePageTitle('Admin')
  useNoIndex()
  // undefined = still checking, null = signed out
  const [user, setUser] = useState(undefined)
  const [allowed, setAllowed] = useState(undefined)

  useEffect(() => {
    if (!isFirebaseReady) return
    let stop = () => {}
    let alive = true
    watchAuth(async (u) => {
      if (!alive) return
      setAllowed(undefined)
      setUser(u)
      if (u) {
        const ok = (await isAdmin(u.uid)) || (await claimAdmin(u))
        if (alive) setAllowed(ok)
      }
    }).then((s) => (alive ? (stop = s) : s()))
    return () => {
      alive = false
      stop()
    }
  }, [])

  if (!isFirebaseReady) {
    return (
      <Shell>
        <Notice title="Backend not connected">
          <p>Add your Firebase keys to <code>.env.local</code> and restart the site. Steps are in <code>FIREBASE_SETUP.md</code>.</p>
          <p><Link to="/">Back to site</Link></p>
        </Notice>
      </Shell>
    )
  }

  if (user === undefined || (user && allowed === undefined)) {
    return (
      <Shell user={user}>
        <p className="muted aempty">Checking access…</p>
      </Shell>
    )
  }

  if (!user) {
    return (
      <Shell>
        <Login />
      </Shell>
    )
  }

  if (!allowed) {
    return (
      <Shell user={user}>
        <Notice icon={FiLock} title="No admin access">
          <p>You&apos;re signed in as <strong>{user.email}</strong>, but this account isn&apos;t an admin.</p>
          <p>Ask the owner to add a document with your user ID to the <code>admins</code> collection:</p>
          <p><code className="admin-uid">{user.uid}</code></p>
        </Notice>
      </Shell>
    )
  }

  return (
    <Shell user={user}>
      <Dashboard />
    </Shell>
  )
}
