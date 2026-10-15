import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiUploadCloud } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import Button from '../ui/Button'
import Reveal from '../ui/Reveal'
import TypeText from '../ui/TypeText'
import Select from '../ui/Select'
import PasswordInput from './PasswordInput'
import { uploadFile } from '../../lib/cloudinary'
import { signIn, signInWithGoogle, signOutUser, resetPassword, registerClient, getProfile } from '../../lib/api'
import './auth.css'

const ORG_TYPES = ['Individual', 'Startup', 'Business', 'Institute / College', 'Agency', 'NGO', 'Other']
const REG_KEY = (uid) => `kraftor-reg-${uid}`

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const phoneOk = (v) => /^\+?[0-9\s-]{7,16}$/.test(v.trim())

export const markRegistered = (uid) => {
  try {
    localStorage.setItem(REG_KEY(uid), '1')
  } catch {
    /* storage blocked — the waiting screen just offers the form again */
  }
}
export const wasRegistered = (uid) => {
  try {
    return localStorage.getItem(REG_KEY(uid)) === '1'
  } catch {
    return false
  }
}

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

function googleMessage(err) {
  const code = err?.code || ''
  if (/popup-closed-by-user|cancelled-popup-request/.test(code)) return ''
  if (code.includes('operation-not-allowed')) return 'Google sign-in isn’t switched on yet. Please use your email and password.'
  if (code.includes('unauthorized-domain')) return 'Google sign-in isn’t allowed on this web address yet. Please use your email and password.'
  if (code.includes('account-exists-with-different-credential')) return 'This email already signs in with a password. Please use your email and password.'
  if (code.includes('network')) return 'No connection. Check your internet and try again.'
  return 'Google sign-in didn’t work. Please try again or use your email and password.'
}

export function Field({ label, id, error, children, aside, optional }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>
        {label} {optional && <span className="field__opt">(optional)</span>}
      </label>
      {children}
      {error && <span className="field__err" id={`${id}-err`}>{error}</span>}
      {aside}
    </div>
  )
}

const TITLES = { client: 'Client sign in', employee: 'Employee sign in', admin: 'Admin sign in' }

/**
 * Sign-in form shared by /login (client & employee tabs) and the hidden /admin page.
 *   type: 'client' | 'employee' | 'admin'
 * Clients can also register; everyone can reset their password or continue with Google.
 * For employee and admin, a Google login is only kept if that account really has the role.
 */
export default function AuthForm({ type = 'client' }) {
  const [mode, setMode] = useState('in') // in | up | reset (up = client registration)
  const [f, setF] = useState({ name: '', orgName: '', orgType: '', phone: '', address: '', email: '', password: '' })
  const [logo, setLogo] = useState(null)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState({ ok: false, text: '' })

  const set = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }
  const a = (id) => ({ id, 'aria-invalid': !!errors[id], 'aria-describedby': errors[id] ? `${id}-err` : undefined })
  const go = (m) => {
    setMode(m)
    setErrors({})
    setMsg({ ok: false, text: '' })
  }

  /** Employee / admin logins must match the role on the profile. */
  const checkRole = async (user) => {
    if (type === 'client' || !user) return
    const p = await getProfile(user.uid).catch(() => null)
    const ok = type === 'admin' ? p?.role === 'admin' : p?.role === 'employee'
    if (!ok) {
      await signOutUser()
      throw Object.assign(new Error(type === 'admin' ? 'This account doesn’t have admin access.' : 'No team account uses this login. Use the email the office set up for you, or ask the office.'), { role: true })
    }
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    setMsg({ ok: false, text: '' })
    const e = {}
    if (!emailOk(f.email)) e.email = 'Enter a valid email address'
    if (mode === 'in' && !f.password) e.password = 'Enter your password'
    if (mode === 'up') {
      if (!f.name.trim()) e.name = 'Please enter your name'
      if (!phoneOk(f.phone)) e.phone = 'Enter a valid phone number'
      if (f.password.length < 6) e.password = 'At least 6 characters'
    }
    setErrors(e)
    if (Object.keys(e).length) return document.getElementById(Object.keys(e)[0])?.focus()

    setBusy('form')
    try {
      if (mode === 'in') {
        const cred = await signIn(f.email, f.password)
        await checkRole(cred.user)
      } else if (mode === 'up') {
        // Logo first (Cloudinary), so a failed upload doesn't leave a half-made account
        const logoUrl = logo ? (await uploadFile(logo, 'kraftor/client-logos')).url : ''
        const user = await registerClient({ ...f, logoUrl })
        markRegistered(user.uid)
      } else {
        await resetPassword(f.email)
        setMsg({ ok: true, text: 'If that email has an account, a reset link is on its way.' })
      }
    } catch (err) {
      setMsg({ ok: false, text: mode === 'reset' ? 'Couldn’t send the link. Check the email and try again.' : err?.role || (!err?.code && err?.message) ? err.message : authMessage(err) })
    } finally {
      setBusy('')
    }
  }

  const onGoogle = async () => {
    setMsg({ ok: false, text: '' })
    setBusy('google')
    try {
      const user = await signInWithGoogle()
      await checkRole(user)
    } catch (err) {
      const text = err?.role ? err.message : googleMessage(err)
      if (text) setMsg({ ok: false, text })
    } finally {
      setBusy('')
    }
  }

  const title = mode === 'in' ? TITLES[type] : mode === 'up' ? 'Register as a client' : 'Reset password'

  return (
    <form className="form acct-form" onSubmit={onSubmit} noValidate>
      <TypeText as="h2" className="form__title" text={title} speed={35} />
      <Reveal stagger className="form__grid acct-form__grid">
        {mode === 'up' && (
          <>
            <Field label="Full name" id="name" error={errors.name}>
              <input {...a('name')} type="text" autoComplete="name" value={f.name} onChange={set('name')} placeholder="Your full name" />
            </Field>
            <Field label="Company / brand" id="orgName" optional>
              <input id="orgName" type="text" autoComplete="organization" value={f.orgName} onChange={set('orgName')} placeholder="Company name" />
            </Field>
            <Field label="Type" id="orgType" optional>
              <Select variant="line" id="orgType" value={f.orgType} onChange={(v) => setF((s) => ({ ...s, orgType: v }))} options={ORG_TYPES} placeholder="Business, startup, institute…" />
            </Field>
            <Field label="Phone" id="phone" error={errors.phone}>
              <input {...a('phone')} type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Address" id="address" optional>
              <input id="address" type="text" autoComplete="street-address" value={f.address} onChange={set('address')} placeholder="City, state" />
            </Field>
            <Field label="Logo" id="logo" optional>
              <label className="cv-drop" htmlFor="logo">
                <FiUploadCloud />
                <span><strong>{logo ? logo.name : 'Add your logo'}</strong> — PNG or JPG</span>
                <input id="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => { setLogo(e.target.files?.[0] || null); e.target.value = '' }} />
              </label>
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
            <PasswordInput {...a('password')} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} value={f.password} onChange={set('password')} placeholder={mode === 'up' ? 'At least 6 characters' : '••••••••'} />
          </Field>
        )}
      </Reveal>

      <Reveal>
        <Button type="submit" size="lg" iconRight={<FiArrowRight />} className="form__submit" disabled={!!busy}>
          {busy === 'form' ? 'Please wait…' : mode === 'in' ? 'Sign in' : mode === 'up' ? 'Register' : 'Send reset link'}
        </Button>

        {mode !== 'reset' && (
          <>
            <p className="auth-or">or</p>
            <button type="button" className="gbtn" onClick={onGoogle} disabled={!!busy}>
              <FcGoogle aria-hidden="true" /> {busy === 'google' ? 'Opening Google…' : 'Continue with Google'}
            </button>
          </>
        )}

        {msg.text && <p className={msg.ok ? 'acct-ok' : 'form__error'} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}

        {type === 'client' ? (
          <p className="acct-switch">
            {mode === 'in' ? (
              <>New client? <button type="button" className="acct-link" onClick={() => go('up')}>Register here</button></>
            ) : (
              <>Have an account? <button type="button" className="acct-link" onClick={() => go('in')}>Sign in</button></>
            )}
          </p>
        ) : (
          <p className="acct-switch">
            {mode === 'reset' ? (
              <button type="button" className="acct-link" onClick={() => go('in')}>Back to sign in</button>
            ) : type === 'admin' ? (
              <>Not on the team? <Link className="acct-link" to="/login">Client &amp; employee sign in</Link></>
            ) : (
              <>Team accounts are created by the office. Want to join? <Link className="acct-link" to="/careers">See careers</Link></>
            )}
          </p>
        )}
        {mode === 'up' && <p className="form__note">We check every new client account. You can sign in as soon as it&apos;s approved. You can also register with Google above.</p>}
      </Reveal>
    </form>
  )
}
