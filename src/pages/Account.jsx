import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { FiLogOut, FiClock, FiLock, FiShield } from 'react-icons/fi'
import AuthForm, { Field, markRegistered, wasRegistered } from '../components/auth/AuthForm'
import Button from '../components/ui/Button'
import Reveal from '../components/ui/Reveal'
import TypeText from '../components/ui/TypeText'
import FilterTabs from '../components/ui/FilterTabs'
import PageHeader from '../components/layout/PageHeader'
import usePageTitle from '../hooks/usePageTitle'
import { isFirebaseReady } from '../lib/firebase'
import { watchAuth, watchProfile, signOutUser, submitRegistration } from '../lib/api'
import { site, links } from '../data/site'
import './pages.css'
import './Contact.css'
import './Account.css'
import '../components/portal/portal.css'

const TYPES = [
  { key: 'client', label: 'Client' },
  { key: 'employee', label: 'Employee' },
]
const phoneOk = (v) => /^\+?[0-9\s-]{7,16}$/.test(v.trim())

/* ---------------- Signed in, no profile yet ---------------- */

function Waiting({ user }) {
  const [sentBefore, setSentBefore] = useState(() => wasRegistered(user.uid))
  const [f, setF] = useState({ name: user.displayName || '', orgName: '', phone: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const send = async (e) => {
    e.preventDefault()
    if (!f.name.trim() || !phoneOk(f.phone)) return setError('Please add your name and a valid phone number.')
    setBusy(true)
    setError('')
    try {
      await submitRegistration(user, { ...f, orgType: '', address: '' })
      markRegistered(user.uid)
      setSentBefore(true)
    } catch {
      setError('Couldn’t send your details. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (sentBefore)
    return (
      <Reveal className="pnote">
        <FiClock />
        <div>
          <strong>Waiting for approval</strong>
          <p className="muted">
            Thanks for registering, {user.email}. Our team will approve your account soon — this page opens your portal by itself once
            it&apos;s done. Questions? <a href={links.mail}>{site.email}</a>
          </p>
          <p className="acct-switch">
            <button type="button" className="acct-link" onClick={signOutUser}>Sign out</button>
          </p>
        </div>
      </Reveal>
    )

  return (
    <form className="form acct-form" onSubmit={send} noValidate>
      <TypeText as="h2" className="form__title" text="Finish your registration" speed={35} />
      <Reveal stagger className="form__grid acct-form__grid">
        <Field label="Signed in as" id="me">
          <input id="me" type="email" value={user.email} disabled />
        </Field>
        <Field label="Full name" id="name">
          <input id="name" type="text" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field label="Company / brand" id="orgName" optional>
          <input id="orgName" type="text" value={f.orgName} onChange={(e) => setF({ ...f, orgName: e.target.value })} />
        </Field>
        <Field label="Phone" id="phone">
          <input id="phone" type="tel" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+91 98765 43210" />
        </Field>
      </Reveal>
      <Reveal>
        <Button type="submit" size="lg" className="form__submit" disabled={busy}>{busy ? 'Sending…' : 'Send for approval'}</Button>
        {error && <p className="form__error" role="alert">{error}</p>}
        <p className="acct-switch">
          Not you? <button type="button" className="acct-link" onClick={signOutUser}>Sign out</button>
        </p>
      </Reveal>
    </form>
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

  const role = profile?.role
  const active = profile && profile.status !== 'inactive'

  // Signed-in clients and team members work in their dashboard
  if (active && (role === 'client' || role === 'employee')) return <Navigate to="/dashboard" replace />

  const first = (profile?.name || '').split(' ')[0]
  const title = profile ? `Hi, ${first || 'there'}` : 'Your Kraftor account'
  const text = profile ? 'Signed in.' : 'Clients follow their projects. Team members open their workspace.'

  let body
  if (!isFirebaseReady) body = <p className="muted">Accounts are not available right now. Please <Link to="/contact">contact us</Link>.</p>
  else if (user === undefined || (user && profile === undefined)) body = <p className="muted">Loading…</p>
  else if (!user) body = <AuthForm key={type} type={type} />
  else if (profile === null) body = <Waiting user={user} />
  else
    body = (
      <>
        <Reveal className="acct-me">
          <span className="acct-me__avatar" aria-hidden="true">
            {profile.avatar ? <img src={profile.avatar} alt="" /> : (first[0] || '?').toUpperCase()}
          </span>
          <span className="acct-me__text">
            <strong>{profile.name}</strong>
            <small>{profile.email}</small>
          </span>
          <button type="button" className="acct-out" onClick={signOutUser}>
            <FiLogOut /> <span>Sign out</span>
          </button>
        </Reveal>

        {!active ? (
          <Reveal className="pnote">
            <FiLock />
            <div>
              <strong>This account is turned off</strong>
              <p className="muted">Please contact us at <a href={links.mail}>{site.email}</a>.</p>
            </div>
          </Reveal>
        ) : (
          <Reveal className="pnote">
            <FiShield />
            <div>
              <strong>Admin account</strong>
              <p className="muted">
                Open the <Link to="/admin">admin panel</Link>.
              </p>
            </div>
          </Reveal>
        )}
      </>
    )

  return (
    <>
      <PageHeader crumb="Account" title={title} text={text}>
        {isFirebaseReady && user === null && <FilterTabs tabs={TYPES} active={type} onChange={setType} label="Account type" />}
      </PageHeader>
      <section className="container page-body">
        <div className="acct">{body}</div>
      </section>
    </>
  )
}