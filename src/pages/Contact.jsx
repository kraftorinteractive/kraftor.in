import { useState } from 'react'
import { FiPhone, FiMail, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import Button from '../components/ui/Button'
import Accordion from '../components/ui/Accordion'
import SectionHeader from '../components/ui/SectionHeader'
import Reveal from '../components/ui/Reveal'
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

  const onSubmit = (e) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = document.getElementById(Object.keys(errs)[0])
      first?.focus()
      return
    }
    // UI only for now — hook up email / API here later.
    setSent(true)
  }

  const reset = () => {
    setForm(empty)
    setErrors({})
    setSent(false)
  }

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
              <h2 className="form__title">Client enquiry form</h2>

              <div className="form__grid">
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
                  <select {...a('country')} value={form.country} onChange={set('country')}>
                    <option value="">Select country</option>
                    {countries.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Project type" id="projectType" error={errors.projectType}>
                  <select {...a('projectType')} value={form.projectType} onChange={set('projectType')}>
                    <option value="">Select project type</option>
                    {projectTypes.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Project name" id="projectName" error={errors.projectName}>
                  <input {...a('projectName')} type="text" value={form.projectName} onChange={set('projectName')} placeholder="e.g. Product launch video" />
                </Field>

                <Field label={`Project budget (${isIndia ? '₹ INR' : '$ USD'})`} id="budget" error={errors.budget}>
                  <select {...a('budget')} value={form.budget} onChange={set('budget')}>
                    <option value="">Select budget</option>
                    {budgets.map((b) => <option key={b}>{b}</option>)}
                  </select>
                  {!form.country && <span className="field__hint">Pick your country to see budgets in your currency.</span>}
                </Field>

                <div className="form__full">
                  <Field label="Project info" optional id="projectInfo">
                    <textarea id="projectInfo" rows={4} value={form.projectInfo} onChange={set('projectInfo')} placeholder="Tell us about goals, timeline, references…" />
                  </Field>
                </div>
              </div>

              <Button type="submit" size="lg" iconRight={<FiSend />} className="form__submit">Submit enquiry</Button>
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
                    <span className="cinfo__icon"><Icon /></span>
                    <span>
                      <small>{label}</small>
                      <strong>{value}</strong>
                    </span>
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
            <Reveal variant="zoom" className="cinfo__map">
              <iframe title="Kraftor Interactive location" src={site.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section section--tint">
        <div className="container faq">
          <SectionHeader eyebrow="FAQ" title="Quick answers" />
          <Accordion items={faqs} />
        </div>
      </section>
    </>
  )
}
