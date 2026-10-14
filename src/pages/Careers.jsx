import { useState } from 'react'
import { FiSend, FiCheckCircle, FiUploadCloud, FiFileText, FiX } from 'react-icons/fi'
import Button from '../components/ui/Button'
import Reveal from '../components/ui/Reveal'
import Select from '../components/ui/Select'
import TypeText from '../components/ui/TypeText'
import PageHeader from '../components/layout/PageHeader'
import usePageTitle from '../hooks/usePageTitle'
import { isFirebaseReady, hasStorage } from '../lib/firebase'
import { submitApplication, CV_TYPES } from '../lib/api'
import { site } from '../data/site'
import './pages.css'
import './Contact.css'

const roles = [
  '3D Animator',
  'Motion Designer',
  'Video Editor',
  'Graphic Designer',
  'UI / UX Designer',
  'Web Developer',
  'App Developer',
  'Digital Marketer',
  'Internship',
  'Other',
]
const experience = ['Fresher', 'Less than 1 year', '1 – 3 years', '3 – 5 years', '5+ years']

const empty = { name: '', email: '', phone: '', role: '', experience: '', portfolio: '', message: '' }
const MAX_MB = 5

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const phoneOk = (v) => /^\+?[0-9\s-]{7,16}$/.test(v.trim())
const urlOk = (v) => !v.trim() || /^https?:\/\/\S+\.\S+/.test(v.trim())

function validate(f, file) {
  const e = {}
  if (!f.name.trim()) e.name = 'Please enter your name'
  if (!emailOk(f.email)) e.email = 'Enter a valid email address'
  if (!phoneOk(f.phone)) e.phone = 'Enter a valid phone number'
  if (!f.role) e.role = 'Choose a role'
  if (!f.experience) e.experience = 'Choose your experience'
  if (!urlOk(f.portfolio)) e.portfolio = 'Link should start with https://'
  if (hasStorage && !file && !f.portfolio.trim()) e.cv = 'Add your CV or a portfolio link'
  if (isFirebaseReady && !hasStorage && !f.portfolio.trim()) e.portfolio = 'Add a link to your CV or portfolio'
  return e
}

function Field({ label, optional, error, id, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>
        {label} {optional && <span className="field__opt">(optional)</span>}
      </label>
      {children}
      {error && <span className="field__err" id={`${id}-err`}>{error}</span>}
    </div>
  )
}

export default function Careers() {
  usePageTitle('Careers')
  const [form, setForm] = useState(empty)
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [honey, setHoney] = useState('')

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
  }
  const pick = (key) => (value) => set(key)({ target: { value } })
  const a = (id) => ({ id, 'aria-invalid': !!errors[id], 'aria-describedby': errors[id] ? `${id}-err` : undefined })

  const onFile = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!CV_TYPES.includes(f.type)) return setErrors((er) => ({ ...er, cv: 'Please upload a PDF or Word file' }))
    if (f.size > MAX_MB * 1024 * 1024) return setErrors((er) => ({ ...er, cv: `File must be ${MAX_MB} MB or smaller` }))
    setFile(f)
    setErrors((er) => ({ ...er, cv: undefined }))
  }

  const mailFallback = () => {
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email} · Phone: ${form.phone}`,
      `Role: ${form.role} · Experience: ${form.experience}`,
      form.portfolio && `Portfolio: ${form.portfolio}`,
      form.message && `\n${form.message}`,
      '\n(Please attach your CV to this email.)',
    ]
      .filter(Boolean)
      .join('\n')
    return `mailto:${site.email}?subject=${encodeURIComponent(`Career application — ${form.role}`)}&body=${encodeURIComponent(body)}`
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    const errs = validate(form, file)
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0] === 'cv' ? 'cv' : Object.keys(errs)[0])?.focus()
      return
    }
    if (honey) return setSent(true)

    if (!isFirebaseReady) {
      window.location.href = mailFallback()
      setSent(true)
      return
    }

    setSending(true)
    try {
      await submitApplication(form, file)
      setSent(true)
    } catch (err) {
      setSubmitError(err?.message?.includes('CV') ? err.message : 'Sorry, we couldn’t send your application. Please try again or email us.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <PageHeader crumb="Careers" title="Join our team" text="Designers, animators, editors and developers — tell us about you." />

      <section className="container page-body">
        <div className="enquiry">
          {sent ? (
            <div className="enquiry__done" role="status">
              <FiCheckCircle />
              <h2>Thanks, {form.name.split(' ')[0]}!</h2>
              <p className="muted">We got your application for <strong>{form.role}</strong>. If it&apos;s a match, we&apos;ll contact you.</p>
            </div>
          ) : (
            <form className="form" onSubmit={onSubmit} noValidate>
              <TypeText as="h2" className="form__title" text="Career application" speed={35} />

              <Reveal stagger className="form__grid">
                <Field label="Full name" id="name" error={errors.name}>
                  <input {...a('name')} type="text" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your full name" />
                </Field>
                <Field label="Email" id="email" error={errors.email}>
                  <input {...a('email')} type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                </Field>
                <Field label="Phone / WhatsApp" id="phone" error={errors.phone}>
                  <input {...a('phone')} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
                </Field>
                <Field label="Role" id="role" error={errors.role}>
                  <Select variant="line" id="role" value={form.role} onChange={pick('role')} options={roles} placeholder="Choose a role" invalid={!!errors.role} describedBy={errors.role ? 'role-err' : undefined} />
                </Field>
                <Field label="Experience" id="experience" error={errors.experience}>
                  <Select variant="line" id="experience" value={form.experience} onChange={pick('experience')} options={experience} placeholder="Choose experience" invalid={!!errors.experience} describedBy={errors.experience ? 'experience-err' : undefined} />
                </Field>
                <Field label={hasStorage || !isFirebaseReady ? 'Portfolio link' : 'Portfolio / CV link'} optional={hasStorage || !isFirebaseReady} id="portfolio" error={errors.portfolio}>
                  <input {...a('portfolio')} type="url" inputMode="url" value={form.portfolio} onChange={set('portfolio')} placeholder="https://behance.net/you" />
                  {!isFirebaseReady && <span className="field__hint">You&apos;ll attach your CV in the email that opens.</span>}
                </Field>

                {hasStorage && <div className="form__full">
                  <Field label="CV" optional={!!form.portfolio} id="cv" error={errors.cv}>
                    {file ? (
                      <div className="cv-file">
                        <FiFileText />
                        <span className="cv-file__name">{file.name}</span>
                        <span className="cv-file__size">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                        <button type="button" className="cv-file__remove" onClick={() => setFile(null)} aria-label="Remove CV">
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <label className="cv-drop" htmlFor="cv">
                        <FiUploadCloud />
                        <span><strong>Upload CV</strong> — PDF or Word, up to {MAX_MB} MB</span>
                        <input id="cv" type="file" accept=".pdf,.doc,.docx,application/pdf" onChange={onFile} />
                      </label>
                    )}
                  </Field>
                </div>}

                <div className="form__full">
                  <Field label="About you" optional id="message">
                    <textarea id="message" rows={4} value={form.message} onChange={set('message')} placeholder="A few lines about your work and what you enjoy…" />
                  </Field>
                </div>
              </Reveal>

              <Reveal>
                <input className="form__honey" type="text" name="website" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} aria-hidden="true" />
                <Button type="submit" size="lg" iconRight={<FiSend />} className="form__submit" disabled={sending}>
                  {sending ? 'Sending…' : 'Send application'}
                </Button>
                {submitError && (
                  <p className="form__error" role="alert">
                    {submitError} <a href={`mailto:${site.email}`}>{site.email}</a>
                  </p>
                )}
              </Reveal>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
