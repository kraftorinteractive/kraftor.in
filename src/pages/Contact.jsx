import { useState } from 'react'
import { FiPhone, FiMail, FiMapPin, FiSend, FiCheckCircle, FiArrowUpRight } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import Button from '../components/ui/Button'
import Accordion from '../components/ui/Accordion'
import SectionHeader from '../components/ui/SectionHeader'
import Reveal from '../components/ui/Reveal'
import Select from '../components/ui/Select'
import TypeText from '../components/ui/TypeText'
import { isFirebaseReady } from '../lib/firebase'
import { submitEnquiry } from '../lib/api'
import usePageTitle from '../hooks/usePageTitle'
import { site, links } from '../data/site'
import { projectTypes, budgetsINR, budgetsUSD, countries, faqs } from '../data/contact'
import PageHeader from '../components/layout/PageHeader'
import './pages.css'
import './Contact.css'

const empty = {
  name: '',
  company: '',
  phone: '',
  email: '',
  whatsapp: '',
  sameAsPhone: false,
  country: '',
  projectType: '',
  projectName: '',
  projectInfo: '',
  budget: '',
}

const phoneOk = (v) => /^\+?[0-9\s-]{7,16}$/.test(v.trim())
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

function validate(f) {
  const e = {}
  if (!f.name.trim()) e.name = 'Please enter your name'
  if (!phoneOk(f.phone)) e.phone = 'Enter a valid phone number'
  if (!emailOk(f.email)) e.email = 'Enter a valid email address'
  if (!f.sameAsPhone && !phoneOk(f.whatsapp)) e.whatsapp = 'Enter a valid WhatsApp number'
  if (!f.country) e.country = 'Select your country'
  if (!f.projectType) e.projectType = 'Select a project type'
  if (!f.projectName.trim()) e.projectName = 'Give your project a name'
  if (!f.budget) e.budget = 'Select a budget range'
  return e
}

const info = [
  { icon: FiPhone, label: 'Phone', value: site.phoneDisplay, href: links.tel },
  { icon: FaWhatsapp, label: 'WhatsApp', value: site.phoneDisplay, href: links.whatsapp, external: true },
  { icon: FiMail, label: 'Email', value: site.email, href: links.mail },
  { icon: FiMapPin, label: 'Studio', value: site.address },
]

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

export default function Contact() {
  usePageTitle('Contact')
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [honey, setHoney] = useState('') // hidden field — bots fill it, people don't

  const isIndia = form.country === 'India'
  const budgets = isIndia ? budgetsINR : budgetsUSD

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => {
      const next = { ...f, [key]: value }
      // Currency changes with country → clear an incompatible budget
      if (key === 'country' && (value === 'India') !== (f.country === 'India')) next.budget = ''
      return next
    })
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
  }

  // Same details as a WhatsApp message — used as the fallback when the database isn't available
  const whatsappText = () =>
    [
      `Hi Kraftor, new enquiry:`,
      `Name: ${form.name}${form.company ? ` (${form.company})` : ''}`,
      `Phone: ${form.phone} · Email: ${form.email}`,
      `Country: ${form.country}`,
      `Project: ${form.projectName} — ${form.projectType}`,
      `Budget: ${form.budget}`,
      form.projectInfo && `Info: ${form.projectInfo}`,
    ]
      .filter(Boolean)
      .join('\n')

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = document.getElementById(Object.keys(errs)[0])
      first?.focus()
      return
    }
    if (honey) return setSent(true) // spam bot — pretend it worked

    // Not connected yet: hand the enquiry to WhatsApp so nothing is lost
    if (!isFirebaseReady) {
      window.open(links.whatsappMsg(whatsappText()), '_blank', 'noopener')
      setSent(true)
      return
    }

    setSending(true)
    try {
      await submitEnquiry(form)
      setSent(true)
    } catch {
      setSubmitError('Sorry, we couldn’t send your enquiry. Please try again, or send it on WhatsApp.')
    } finally {
      setSending(false)
    }
  }

  const reset = () => {
    setForm(empty)
    setErrors({})
    setSent(false)
    setSubmitError('')
  }

  // Themed dropdowns hand back the chosen value instead of an event
  const pick = (key) => (value) => set(key)({ target: { type: 'select', value } })

  const a = (id) => ({ id, 'aria-invalid': !!errors[id], 'aria-describedby': errors[id] ? `${id}-err` : undefined })

  return (
    <>
      <PageHeader crumb="Contact" title="Let&apos;s build something great" text="Tell us your idea. We reply within two business days." />

      {/* ---------- Enquiry form ---------- */}
      <section className="container page-body">
        <div className="enquiry">
          {sent ? (
            <div className="enquiry__done" role="status">
              <FiCheckCircle />
              <h2>Thank you, {form.name.split(' ')[0]}!</h2>
              <p className="muted">We got your details for <strong>{form.projectName}</strong>. We&apos;ll be in touch soon.</p>
              <div className="enquiry__done-actions">
                <Button href={links.whatsapp} variant="dark" icon={<FaWhatsapp />}>WhatsApp us</Button>
                <Button variant="outline" onClick={reset}>Send another</Button>
              </div>
            </div>
          ) : (
            <form className="form" onSubmit={onSubmit} noValidate>
              <TypeText as="h2" className="form__title" text="Client enquiry form" speed={35} inView />

              <Reveal stagger className="form__grid">
                <Field label="Name" id="name" error={errors.name}>
                  <input {...a('name')} type="text" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your full name" />
                </Field>
                <Field label="Company name" optional id="company">
                  <input id="company" type="text" autoComplete="organization" value={form.company} onChange={set('company')} placeholder="Company / brand" />
                </Field>

                <Field label="Phone no." id="phone" error={errors.phone}>
                  <input {...a('phone')} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
                </Field>
                <Field label="Email" id="email" error={errors.email}>
                  <input {...a('email')} type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                </Field>

                <Field label="WhatsApp no." id="whatsapp" error={errors.whatsapp}>
                  <input
                    {...a('whatsapp')}
                    type="tel"
                    inputMode="tel"
                    value={form.sameAsPhone ? form.phone : form.whatsapp}
                    onChange={set('whatsapp')}
                    disabled={form.sameAsPhone}
                    placeholder="+91 98765 43210"
                  />
                  <label className="check">
                    <input type="checkbox" checked={form.sameAsPhone} onChange={set('sameAsPhone')} />
                    <span>Same as phone number</span>
                  </label>
                </Field>
                <Field label="Country of origin" id="country" error={errors.country}>
                  <Select variant="line" id="country" value={form.country} onChange={pick('country')} options={countries} placeholder="Select country" invalid={!!errors.country} describedBy={errors.country ? 'country-err' : undefined} />
                </Field>

                <Field label="Project type" id="projectType" error={errors.projectType}>
                  <Select variant="line" id="projectType" value={form.projectType} onChange={pick('projectType')} options={projectTypes} placeholder="Select project type" invalid={!!errors.projectType} describedBy={errors.projectType ? 'projectType-err' : undefined} />
                </Field>
                <Field label="Project name" id="projectName" error={errors.projectName}>
                  <input {...a('projectName')} type="text" value={form.projectName} onChange={set('projectName')} placeholder="e.g. Product launch video" />
                </Field>

                <Field label={`Project budget (${isIndia ? '₹ INR' : '$ USD'})`} id="budget" error={errors.budget}>
                  <Select variant="line" id="budget" value={form.budget} onChange={pick('budget')} options={budgets} placeholder="Select budget" invalid={!!errors.budget} describedBy={errors.budget ? 'budget-err' : undefined} />
                  {!form.country && <span className="field__hint">Pick your country to see budgets in your currency.</span>}
                </Field>

                <div className="form__full">
                  <Field label="Project info" optional id="projectInfo">
                    <textarea id="projectInfo" rows={4} value={form.projectInfo} onChange={set('projectInfo')} placeholder="Tell us about goals, timeline, references…" />
                  </Field>
                </div>
              </Reveal>

              <Reveal>
                {/* Honeypot: hidden from people, tempting to bots */}
                <input
                  className="form__honey"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honey}
                  onChange={(e) => setHoney(e.target.value)}
                  aria-hidden="true"
                />
                <Button type="submit" size="lg" iconRight={<FiSend />} className="form__submit" disabled={sending}>
                  {sending ? 'Sending…' : 'Submit enquiry'}
                </Button>
                {submitError && (
                  <p className="form__error" role="alert">
                    {submitError}{' '}
                    <a href={links.whatsappMsg(whatsappText())} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
                  </p>
                )}
              </Reveal>
            </form>
          )}
        </div>
      </section>

      {/* ---------- Kraftor info + map ---------- */}
      <section className="section">
        <div className="container">
          <SectionHeader eyebrow={`Based in ${site.city}`} title="Reach us directly" />
          <div className="cinfo">
            <Reveal as="ul" stagger className="cinfo__list">
              {info.map(({ icon: Icon, label, value, href, external }) => {
                const body = (
                  <>
                    <Icon className="cinfo__icon" aria-hidden="true" />
                    <span className="cinfo__text">
                      <small>{label}</small>
                      <strong>{value}</strong>
                    </span>
                    {href && <FiArrowUpRight className="cinfo__go" aria-hidden="true" />}
                  </>
                )
                return (
                  <li key={label}>
                    {href ? (
                      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{body}</a>
                    ) : (
                      <div>{body}</div>
                    )}
                  </li>
                )
              })}
            </Reveal>
            <Reveal variant="fade" className="cinfo__map">
              <iframe title="Kraftor Interactive location" src={site.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section">
        <div className="container faq">
          <SectionHeader eyebrow="FAQ" title="Quick answers" />
          <Reveal>
            <Accordion items={faqs} />
          </Reveal>
        </div>
      </section>
    </>
  )
}
