import { useState } from 'react'
import { FiSend, FiCheckCircle, FiUploadCloud, FiFileText, FiX } from 'react-icons/fi'
import Button from '../components/ui/Button'
import Reveal from '../components/ui/Reveal'
import Select from '../components/ui/Select'
import TypeText from '../components/ui/TypeText'
import PageHeader from '../components/layout/PageHeader'
import usePageTitle from '../hooks/usePageTitle'
import { isFirebaseReady } from '../lib/firebase'
import { submitJobApplication } from '../lib/api'
import { uploadFile, MAX_UPLOAD_MB } from '../lib/cloudinary'
import { site } from '../data/site'
import './pages.css'
import './Contact.css'

// Same choices as the old careers form, so admin filters keep working across old and new entries
const applyAs = ['Employee', 'Freelancer', 'Intern']
const departments = ['Graphic Design', 'Web Development', 'Video Editing', '3D & Animation', 'Digital Marketing', 'Sales & Business Development', 'Project Management', 'Other']
const experience = ['Fresher', '1+ Years', '2+ Years', '5+ Years']
const availability = ['Immediately', 'Within 15 Days', 'Within 30 Days']
const sources = ['Instagram', 'LinkedIn', 'Google Search', 'Friend / Colleague', 'Job Portal', 'College / University', 'Other']
const CV_EXT = /\.(pdf|docx?)$/i

const empty = {
  name: '', email: '', phone: '', city: '', applyAs: '', department: '', qualification: '',
  experience: '', availability: '', portfolio: '', coverLetter: '', heardAboutUs: '', reference: '',
}

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const phoneOk = (v) => /^\d{10}$/.test(v.replace(/[\s-]/g, '').replace(/^\+?91/, ''))
const urlOk = (v) => !v.trim() || /^https?:\/\/\S+\.\S+/.test(v.trim())

function validate(f, file) {
  const e = {}
  if (!f.name.trim()) e.name = 'Please enter your name'
  if (!emailOk(f.email)) e.email = 'Enter a valid email address'
  if (!phoneOk(f.phone)) e.phone = 'Enter a 10-digit mobile number'
  if (!f.city.trim()) e.city = 'Enter your city'
  if (!f.applyAs) e.applyAs = 'Choose one'
  if (!f.department) e.department = 'Choose a department'
  if (!f.qualification.trim()) e.qualification = 'Enter your qualification'
  if (!f.experience) e.experience = 'Choose your experience'
  if (!f.availability) e.availability = 'When can you join?'
  if (!urlOk(f.portfolio)) e.portfolio = 'Link should start with https://'
  if (!f.coverLetter.trim()) e.coverLetter = 'Tell us a little about you'
  if (!f.heardAboutUs) e.heardAboutUs = 'Choose one'
  if (isFirebaseReady && !file) e.cv = 'Please add your CV'
  return e
}

function Field({ label, optional, error, id, children, full }) {
  const body = (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>
        {label} {optional && <span className="field__opt">(optional)</span>}
      </label>
      {children}
      {error && <span className="field__err" id={`${id}-err`}>{error}</span>}
    </div>
  )
  return full ? <div className="form__full">{body}</div> : body
}

export default function Careers() {
  usePageTitle('Careers')
  const [form, setForm] = useState(empty)
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState('')
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [honey, setHoney] = useState('')

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
  }
  const pick = (key) => (value) => set(key)({ target: { value } })
  const a = (id) => ({ id, 'aria-invalid': !!errors[id], 'aria-describedby': errors[id] ? `${id}-err` : undefined })
  const sel = (key, options, placeholder) => (
    <Select variant="line" id={key} value={form[key]} onChange={pick(key)} options={options} placeholder={placeholder} invalid={!!errors[key]} describedBy={errors[key] ? `${key}-err` : undefined} />
  )

  const onFile = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!CV_EXT.test(f.name)) return setErrors((er) => ({ ...er, cv: 'Please upload a PDF or Word file' }))
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) return setErrors((er) => ({ ...er, cv: `File must be ${MAX_UPLOAD_MB} MB or smaller` }))
    setFile(f)
    setErrors((er) => ({ ...er, cv: undefined }))
  }

  const mailFallback = () => {
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email} · Phone: ${form.phone} · City: ${form.city}`,
      `Applying as: ${form.applyAs} · ${form.department}`,
      `Qualification: ${form.qualification} · Experience: ${form.experience} · Available: ${form.availability}`,
      form.portfolio && `Portfolio: ${form.portfolio}`,
      `\n${form.coverLetter}`,
      '\n(Please attach your CV to this email.)',
    ]
      .filter(Boolean)
      .join('\n')
    return `mailto:${site.email}?subject=${encodeURIComponent(`Career application — ${form.department}`)}&body=${encodeURIComponent(body)}`
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    const errs = validate(form, file)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) return document.getElementById(first)?.focus()
    if (honey) return setSent(true)

    if (!isFirebaseReady) {
      window.location.href = mailFallback()
      setSent(true)
      return
    }

    try {
      setSending('Uploading your CV…')
      const up = await uploadFile(file, 'kraftor/resumes')
      setSending('Sending…')
      await submitJobApplication({ ...form, resumeUrl: up.url })
      setSent(true)
    } catch (err) {
      setSubmitError(err?.message?.includes('MB') ? err.message : 'Sorry, we couldn’t send your application. Please try again or email us.')
    } finally {
      setSending('')
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
              <p className="muted">We got your application for <strong>{form.department}</strong>. If it&apos;s a match, we&apos;ll contact you.</p>
            </div>
          ) : (
            <form className="form" onSubmit={onSubmit} noValidate>
              <TypeText as="h2" className="form__title" text="Career application" speed={35} />

              <Reveal stagger className="form__grid">
                <Field label="Full name" id="name" error={errors.name}>
                  <input {...a('name')} type="text" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your full name" />
                </Field>
                <Field label="Mobile" id="phone" error={errors.phone}>
                  <input {...a('phone')} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="98765 43210" />
                </Field>
                <Field label="Email" id="email" error={errors.email}>
                  <input {...a('email')} type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                </Field>
                <Field label="City" id="city" error={errors.city}>
                  <input {...a('city')} type="text" autoComplete="address-level2" value={form.city} onChange={set('city')} placeholder="e.g. Nagpur" />
                </Field>
                <Field label="Apply as" id="applyAs" error={errors.applyAs}>{sel('applyAs', applyAs, 'Employee, freelancer or intern')}</Field>
                <Field label="Department" id="department" error={errors.department}>{sel('department', departments, 'Choose a department')}</Field>
                <Field label="Qualification" id="qualification" error={errors.qualification}>
                  <input {...a('qualification')} type="text" value={form.qualification} onChange={set('qualification')} placeholder="e.g. B.Des, BCA, Diploma" />
                </Field>
                <Field label="Experience" id="experience" error={errors.experience}>{sel('experience', experience, 'Choose experience')}</Field>
                <Field label="Can join" id="availability" error={errors.availability}>{sel('availability', availability, 'When can you start?')}</Field>
                <Field label="Portfolio link" optional id="portfolio" error={errors.portfolio}>
                  <input {...a('portfolio')} type="url" inputMode="url" value={form.portfolio} onChange={set('portfolio')} placeholder="https://behance.net/you" />
                </Field>

                {isFirebaseReady ? (
                  <Field label="CV" id="cv" error={errors.cv} full>
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
                        <span><strong>Upload CV</strong> — PDF or Word, up to {MAX_UPLOAD_MB} MB</span>
                        <input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={onFile} />
                      </label>
                    )}
                  </Field>
                ) : (
                  <p className="field__hint form__full">You&apos;ll attach your CV in the email that opens.</p>
                )}

                <Field label="About you" id="coverLetter" error={errors.coverLetter} full>
                  <textarea {...a('coverLetter')} rows={4} value={form.coverLetter} onChange={set('coverLetter')} placeholder="A few lines about your work and what you enjoy…" />
                </Field>
                <Field label="How did you hear about us?" id="heardAboutUs" error={errors.heardAboutUs}>{sel('heardAboutUs', sources, 'Choose one')}</Field>
                <Field label="Referred by" optional id="reference">
                  <input id="reference" type="text" value={form.reference} onChange={set('reference')} placeholder="Name of the person" />
                </Field>
              </Reveal>

              <Reveal>
                <input className="form__honey" type="text" name="website" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} aria-hidden="true" />
                <Button type="submit" size="lg" iconRight={<FiSend />} className="form__submit" disabled={!!sending}>
                  {sending || 'Send application'}
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
