import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiLogOut, FiArrowRight, FiClock, FiLock, FiInbox, FiFileText, FiMail } from 'react-icons/fi'
import Button from '../components/ui/Button'
import Reveal from '../components/ui/Reveal'
import TypeText from '../components/ui/TypeText'
import FilterTabs from '../components/ui/FilterTabs'
import PageHeader from '../components/layout/PageHeader'
import usePageTitle from '../hooks/usePageTitle'
import { isFirebaseReady } from '../lib/firebase'
import { watchAuth, watchProfile, watchMyEnquiries, userSignIn, userSignUp, userSignOut, resetPassword, createProfile } from '../lib/api'
import { site, links } from '../data/site'
import './pages.css'
import './Contact.css'
import './Account.css'

const TYPES = [
  { key: 'client', label: 'Client' },
  { key: 'employee', label: 'Employee' },
]

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const phoneOk = (v) => /^\+?[0-9\s-]{7,16}$/.test(v.trim())

function authMessage(err) {
  const code = err?.code || ''
  if (/invalid-credential|wrong-password|user-not-found/.test(code)) return 'Wrong email or password.'
  if (code.includes('email-already-in-use')) return 'An account with this email already exists. Please sign in.'
  if (code.includes('weak-password')) return 'Use a password with at least 6 characters.'
  if (code.includes('invalid-email')) return 'Enter a valid email address.'
  if (code.includes('too-many-requests')) return 'Too many attempts. Please wait a minute and try again.'
  if (code.includes('network')) return 'No connection. Check your internet and try again.'
  return 'Something went wrong. Please try again.'
}

const fmtDate = (ts) => ts?.toDate?.().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || '—'

function Field({ label, id, error, children, aside }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="field__err" id={`${id}-err`}>{error}</span>}
      {aside}
    </div>
  )
}

/* ---------------- Signed out: sign in / create account ---------------- */

function AuthForm({ type }) {
  const [mode, setMode] = useState('in') // 'in' | 'up' | 'reset'
  const [f, setF] = useState({ name: '', phone: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const set = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }
  const a = (id) => ({ id, 'aria-invalid': !!errors[id], 'aria-describedby': errors[id] ? `${id}-err` : undefined })
  const go = (m) => {
    setMode(m)
    setErrors({})
    setMsg({ type: '', text: '' })
  }

  const validate = () => {
    const e = {}
    if (!emailOk(f.email)) e.email = 'Enter a valid email address'
    if (mode !== 'reset' && f.password.length < 6) e.password = 'At least 6 characters'
    if (mode === 'up') {
      if (!f.name.trim()) e.name = 'Please enter your name'
      if (!phoneOk(f.phone)) e.phone = 'Enter a valid phone number'
    }
    return e
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    setMsg({ type: '', text: '' })
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return document.getElementById(Object.keys(e)[0])?.focus()
    setBusy(true)
    try {
      if (mode === 'in') await userSignIn(f.email, f.password)
      else if (mode === 'up') await userSignUp({ ...f, type })
      else {
        await resetPassword(f.email)
        setMsg({ type: 'ok', text: 'If that email has an account, a reset link is on its way. Check your inbox.' })
      }
    } catch (err) {
      setMsg({ type: 'err', text: mode === 'reset' ? 'Couldn’t send the link. Check the email and try again.' : authMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  const who = type === 'client' ? 'Client' : 'Employee'
  const title = mode === 'in' ? `${who} sign in` : mode === 'up' ? `Create ${who.toLowerCase()} account` : 'Reset password'

  return (
    <form className="form acct-form" onSubmit={onSubmit} noValidate>
      <TypeText as="h2" className="form__title" text={title} speed={35} />
      <Reveal stagger className="form__grid acct-form__grid">
        {mode === 'up' && (
          <>
            <Field label="Full name" id="name" error={errors.name}>
              <input {...a('name')} type="text" autoComplete="name" value={f.name} onChange={set('name')} placeholder="Your full name" />
            </Field>
            <Field label="Phone" id="phone" error={errors.phone}>
              <input {...a('phone')} type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
            </Field>
          </>
        )}
        <Field label="Email" id="email" error={errors.email}>
          <input {...a('email')} type="email" inputMode="email" autoComplete={mode === 'up' ? 'email' : 'username'} value={f.email} onChange={set('email')} placeholder="you@example.com" />
        </Field>
        {mode !== 'reset' && (
          <Field
            label="Password"
            id="password"
            error={errors.password}
            aside={mode === 'in' && <button type="button" className="acct-link acct-link--right" onClick={() => go('reset')}>Forgot password?</button>}
          >
            <input {...a('password')} type="password" autoComplete={mode === 'up' ? 'new-password' : 'current-password'} value={f.password} onChange={set('password')} placeholder={mode === 'up' ? 'At least 6 characters' : '••••••••'} />
          </Field>
        )}
      </Reveal>

      <Reveal>
        <Button type="submit" size="lg" iconRight={<FiArrowRight />} className="form__submit" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : mode === 'up' ? 'Create account' : 'Send reset link'}
        </Button>
        {msg.text && (
          <p className={msg.type === 'ok' ? 'acct-ok' : 'form__error'} role={msg.type === 'ok' ? 'status' : 'alert'}>{msg.text}</p>
        )}
        <p className="acct-switch">
          {mode === 'in' ? (
            <>New here? <button type="button" className="acct-link" onClick={() => go('up')}>Create an account</button></>
          ) : (
            <>Have an account? <button type="button" className="acct-link" onClick={() => go('in')}>Sign in</button></>
          )}
        </p>
        {type === 'employee' && mode === 'up' && (
          <p className="form__note">Employee accounts are checked by our team before they open.</p>
        )}
      </Reveal>
    </form>
  )
}

/* ---------------- Signed in, but no profile yet ---------------- */

function ProfileSetup({ user, type }) {
  const [name, setName] = useState(user.displayName || '')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !phoneOk(phone)) return setError('Please add your name and a valid phone number.')
    setBusy(true)
    setError('')
    try {
      await createProfile(user, { name, phone, type })
    } catch {
      setError('Couldn’t save your profile. Please try again.')
      setBusy(false)
    }
  }

  return (
    <form className="form acct-form" onSubmit={onSubmit} noValidate>
      <TypeText as="h2" className="form__title" text="Finish your profile" speed={35} />
      <Reveal stagger className="form__grid acct-form__grid">
        <Field label="Signed in as" id="me">
          <input id="me" type="email" value={user.email} disabled />
        </Field>
        <Field label="Full name" id="name">
          <input id="name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Phone" id="phone">
          <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </Field>
      </Reveal>
      <Reveal>
        <Button type="submit" size="lg" className="form__submit" disabled={busy}>{busy ? 'Saving…' : `Continue as ${type}`}</Button>
        {error && <p className="form__error" role="alert">{error}</p>}
        <p className="acct-switch">
          Not you? <button type="button" className="acct-link" onClick={userSignOut}>Sign out</button>
        </p>
      </Reveal>
    </form>
  )
}

/* ---------------- Signed in: dashboards ---------------- */

function MyEnquiries({ uid }) {
  const [list, setList] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let stop = () => {}
    let alive = true
    watchMyEnquiries(uid, (l) => alive && setList(l), () => alive && setError(true)).then((s) => (alive ? (stop = s) : s()))
    return () => {
      alive = false
      stop()
    }
  }, [uid])

  return (
    <section className="acct-block">
      <TypeText as="h2" className="acct-block__title" text="My enquiries" speed={35} />
      {error ? (
        <p className="form__error">Couldn’t load your enquiries. Please refresh.</p>
      ) : list === null ? (
        <p className="muted">Loading…</p>
      ) : list.length === 0 ? (
        <Reveal className="acct-empty">
          <FiInbox />
          <p className="muted">No enquiries yet. Tell us about your project — it will show up here.</p>
          <Button to="/contact" iconRight={<FiArrowRight />}>Start a project</Button>
        </Reveal>
      ) : (
        <Reveal as="ul" stagger className="acct-list">
          {list.map((q) => (
            <li key={q.id}>
              <span className="acct-list__main">
                <strong>{q.projectName}</strong>
                <small>{[q.projectType, q.budget].filter(Boolean).join(' · ')}</small>
              </span>
              <span className={`acct-pill acct-pill--${q.status || 'new'}`}>{q.status === 'contacted' ? 'In talks' : q.status === 'closed' ? 'Closed' : 'Received'}</span>
              <time>{fmtDate(q.createdAt)}</time>
            </li>
          ))}
        </Reveal>
      )}
    </section>
  )
}

function Dashboard({ user, profile }) {
  const first = (profile.name || '').split(' ')[0]
  const isClient = profile.type === 'client'

  return (
    <>
      <Reveal className="acct-me">
        <span className="acct-me__avatar" aria-hidden="true">{(first[0] || '?').toUpperCase()}</span>
        <span className="acct-me__text">
          <strong>{profile.name}</strong>
          <small>{user.email} · {isClient ? 'Client' : 'Employee'}</small>
        </span>
        <button type="button" className="acct-out" onClick={userSignOut}>
          <FiLogOut /> <span>Sign out</span>
        </button>
      </Reveal>

      {profile.status === 'blocked' ? (
        <Reveal className="acct-note">
          <FiLock />
          <div>
            <strong>This account is turned off</strong>
            <p className="muted">Please contact us at <a href={links.mail}>{site.email}</a>.</p>
          </div>
        </Reveal>
      ) : isClient ? (
        <MyEnquiries uid={user.uid} />
      ) : profile.status !== 'active' ? (
        <Reveal className="acct-note">
          <FiClock />
          <div>
            <strong>Waiting for approval</strong>
            <p className="muted">Our team will check your employee account soon. This page updates by itself once it&apos;s approved.</p>
          </div>
        </Reveal>
      ) : (
        <section className="acct-block">
          <TypeText as="h2" className="acct-block__title" text="Team space" speed={35} />
          <Reveal as="ul" stagger className="acct-links">
            <li>
              <Link to="/employee-guidelines"><FiFileText /> <span>Employee guidelines</span> <FiArrowRight /></Link>
            </li>
            <li>
              <a href={links.mail}><FiMail /> <span>Email the office</span> <FiArrowRight /></a>
            </li>
          </Reveal>
        </section>
      )}
    </>
  )
}

/* ---------------- Page ---------------- */

export default function Account() {
  usePageTitle('Account')
  const [type, setType] = useState('client')
  const [user, setUser] = useState(undefined) // undefined = checking, null = signed out
  const [profile, setProfile] = useState(undefined)

  useEffect(() => {
    if (!isFirebaseReady) return
    let stop = () => {}
    let alive = true
    watchAuth((u) => alive && setUser(u)).then((s) => (alive ? (stop = s) : s()))
    return () => {
      alive = false
      stop()
    }
  }, [])

  useEffect(() => {
    setProfile(undefined)
    if (!user) return
    let stop = () => {}
    let alive = true
    watchProfile(user.uid, (p) => alive && setProfile(p), () => alive && setProfile(null)).then((s) => (alive ? (stop = s) : s()))
    return () => {
      alive = false
      stop()
    }
  }, [user])

  const signedIn = !!user && !!profile
  const needsSetup = !!user && profile === null
  const title = signedIn ? `Hi, ${(profile.name || '').split(' ')[0] || 'there'}` : 'Your Kraftor account'
  const text = signedIn
    ? profile.type === 'client' ? 'Track your projects with us.' : 'Your team space at Kraftor.'
    : 'Clients track their projects. Team members open their space.'

  let body
  if (!isFirebaseReady) body = <p className="muted">Accounts are not available right now. Please <Link to="/contact">contact us</Link>.</p>
  else if (user === undefined || (user && profile === undefined)) body = <p className="muted">Loading…</p>
  else if (needsSetup) body = <ProfileSetup user={user} type={type} />
  else if (signedIn) body = <Dashboard user={user} profile={profile} />
  else body = <AuthForm key={type} type={type} />

  return (
    <>
      <PageHeader crumb="Account" title={title} text={text}>
        {(!user || needsSetup) && isFirebaseReady && <FilterTabs tabs={TYPES} active={type} onChange={setType} label="Account type" />}
      </PageHeader>
      <section className="container page-body">
        <div className="acct">{body}</div>
      </section>
    </>
  )
}
