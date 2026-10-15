import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUploadCloud, FiCheck, FiSend, FiClock } from 'react-icons/fi'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Reveal from '../../components/ui/Reveal'
import TypeText from '../../components/ui/TypeText'
import { Details, Pill, PrintLink } from '../../components/portal/DataList'
import useLive from '../../components/portal/useLive'
import { fmtDate } from '../../components/portal/format'
import { uploadFile, MAX_UPLOAD_MB } from '../../lib/cloudinary'
import { submitOnboarding, updateOnboarding } from '../../lib/portal'

const EXPERIENCE = ['Fresher', '1 year', '2 year', 'Others']
const GENDERS = ['Male', 'Female', 'Other']
// Same document list and field names as the old portal
export const ONBOARD_DOCS = [
  { key: 'resumeUrl', label: 'Resume' },
  { key: 'coverLetterUrl', label: 'Cover Letter' },
  { key: 'aadhaarDocUrl', label: 'Aadhaar' },
  { key: 'passbookUrl', label: 'Passbook' },
  { key: 'marksheetUrl', label: 'Last Marksheet' },
]

function UploadButton({ label, done, onFile, accept, disabled }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const id = `up-${label.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div className="ob-up">
      <span className="ob-up__label">
        {done ? <FiCheck className="ob-up__ok" /> : null} {label}
      </span>
      {done ? (
        <a className="pbtn" href={done} target="_blank" rel="noopener noreferrer">View</a>
      ) : (
        <label className={`pbtn${disabled || busy ? ' is-disabled' : ''}`} htmlFor={id}>
          <FiUploadCloud /> {busy ? 'Uploading…' : 'Upload'}
          <input
            id={id}
            type="file"
            hidden
            accept={accept}
            disabled={disabled || busy}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              setErr('')
              setBusy(true)
              try {
                await onFile(file)
              } catch (x) {
                setErr(x?.message || 'Upload failed.')
              } finally {
                setBusy(false)
              }
            }}
          />
        </label>
      )}
      {err && <span className="field__err">{err}</span>}
    </div>
  )
}

const blank = (profile) => ({
  employeeName: profile.name || '',
  appliedRole: profile.title || '',
  experience: '',
  experienceOther: '',
  dateOfBirth: '',
  gender: '',
  phoneNumber: profile.phone || '',
  whatsappNumber: profile.phone || '',
  fullAddress: profile.address || '',
  cityCountry: '',
  postcode: '',
  nationality: 'Indian',
  religion: '',
  qualification: '',
  institute: '',
  passingYear: '',
  aadhaarNumber: '',
})

function OnboardForm({ uid, profile }) {
  const [f, setF] = useState(() => blank(profile))
  const [photo, setPhoto] = useState(null)
  const [docs, setDocs] = useState([])
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const pick = (k) => (v) => setF({ ...f, [k]: v })

  const REQUIRED = ['employeeName', 'appliedRole', 'experience', 'dateOfBirth', 'gender', 'phoneNumber', 'fullAddress', 'cityCountry', 'postcode', 'qualification', 'institute', 'passingYear', 'aadhaarNumber']

  const onSubmit = async (e) => {
    e.preventDefault()
    const er = {}
    for (const k of REQUIRED) if (!String(f[k] || '').trim()) er[k] = 'Required'
    if (f.aadhaarNumber && !/^\d{12}$/.test(f.aadhaarNumber.replace(/\s/g, ''))) er.aadhaarNumber = 'Aadhaar is 12 digits'
    if (f.experience === 'Others' && !f.experienceOther.trim()) er.experienceOther = 'Tell us your experience'
    if (!photo) er.photo = 'Add a passport-size photo'
    if (!agree) er.agree = 'Please confirm the declaration'
    setErrors(er)
    const first = Object.keys(er)[0]
    if (first) return document.getElementById(`ob-${first}`)?.focus()

    setErr('')
    try {
      setBusy('Uploading photo…')
      const up = await uploadFile(photo, 'kraftor/employee-applications/photos')
      setBusy('Sending…')
      await submitOnboarding(uid, profile, {
        ...f,
        experience: f.experience === 'Others' ? f.experienceOther.trim() : f.experience,
        aadhaarNumber: f.aadhaarNumber.replace(/\s/g, ''),
        passportPhotoUrl: up.url,
        passportPhotoName: photo.name,
        attachedDocuments: docs,
      })
    } catch (x) {
      setErr(x?.message?.includes('MB') ? x.message : 'Couldn’t send the form. Please try again.')
    } finally {
      setBusy('')
    }
  }

  const field = (k, label, props = {}) => (
    <div className={`field${errors[k] ? ' has-error' : ''}${props.full ? ' form__full' : ''}`}>
      <label htmlFor={`ob-${k}`}>{label}{props.optional && <span className="field__opt"> (optional)</span>}</label>
      {props.children || <input id={`ob-${k}`} type={props.type || 'text'} inputMode={props.inputMode} value={f[k]} onChange={set(k)} placeholder={props.placeholder} />}
      {errors[k] && <span className="field__err">{errors[k]}</span>}
    </div>
  )

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <TypeText as="h2" className="form__title" text="Joining form" speed={35} />
      <Reveal stagger className="form__grid">
        {field('employeeName', 'Full name')}
        {field('appliedRole', 'Role', { placeholder: 'e.g. Video Editor' })}
        {field('experience', 'Experience', { children: <Select variant="line" id="ob-experience" value={f.experience} onChange={pick('experience')} options={EXPERIENCE} placeholder="Choose" /> })}
        {f.experience === 'Others' ? field('experienceOther', 'Your experience') : field('dateOfBirth', 'Date of birth', { type: 'date' })}
        {f.experience === 'Others' && field('dateOfBirth', 'Date of birth', { type: 'date' })}
        {field('gender', 'Gender', { children: <Select variant="line" id="ob-gender" value={f.gender} onChange={pick('gender')} options={GENDERS} placeholder="Choose" /> })}
        {field('phoneNumber', 'Phone', { type: 'tel', inputMode: 'tel' })}
        {field('whatsappNumber', 'WhatsApp', { type: 'tel', inputMode: 'tel', optional: true })}
        {field('fullAddress', 'Full address', { full: true })}
        {field('cityCountry', 'City / country', { placeholder: 'Nagpur, India' })}
        {field('postcode', 'PIN code', { inputMode: 'numeric' })}
        {field('nationality', 'Nationality')}
        {field('religion', 'Religion', { optional: true })}
        {field('qualification', 'Highest qualification', { placeholder: 'e.g. B.Sc Animation' })}
        {field('institute', 'College / institute')}
        {field('passingYear', 'Passing year', { inputMode: 'numeric' })}
        {field('aadhaarNumber', 'Aadhaar number', { inputMode: 'numeric', placeholder: '12 digits' })}

        <div className={`field form__full${errors.photo ? ' has-error' : ''}`}>
          <label htmlFor="ob-photo">Passport-size photo</label>
          <label className="cv-drop" htmlFor="ob-photo">
            <FiUploadCloud />
            <span><strong>{photo ? photo.name : 'Choose a photo'}</strong> — JPG or PNG, up to {MAX_UPLOAD_MB} MB</span>
            <input id="ob-photo" type="file" accept="image/png,image/jpeg" onChange={(e) => { setPhoto(e.target.files?.[0] || null); e.target.value = '' }} />
          </label>
          {errors.photo && <span className="field__err">{errors.photo}</span>}
        </div>

        <fieldset className="form__full ob-docs">
          <legend>I will bring these documents</legend>
          {ONBOARD_DOCS.map((d) => (
            <label key={d.key} className="check">
              <input type="checkbox" checked={docs.includes(d.label)} onChange={(e) => setDocs(e.target.checked ? [...docs, d.label] : docs.filter((x) => x !== d.label))} />
              <span>{d.label}</span>
            </label>
          ))}
        </fieldset>

        <label className={`check form__full${errors.agree ? ' has-error' : ''}`}>
          <input id="ob-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            I confirm the information is true and complete, I will bring the printed form to the office for verification, and I have read the{' '}
            <Link to="/employee-guidelines" target="_blank">employee guidelines</Link>.
          </span>
        </label>
        {errors.agree && <span className="field__err form__full">{errors.agree}</span>}
      </Reveal>
      <Reveal>
        <Button type="submit" size="lg" iconRight={<FiSend />} className="form__submit" disabled={!!busy}>{busy || 'Submit joining form'}</Button>
        {err && <p className="form__error" role="alert">{err}</p>}
      </Reveal>
    </form>
  )
}

/** Employee "Joining" section: the form, then status, document uploads and the stamped copy. */
export default function Onboarding({ uid, profile }) {
  const { list, error } = useLive('employee_applications', { where: ['uid', '==', uid], sortBy: 'submittedAt' })
  const latest = (list || [])[0]

  if (error) return <p className="form__error">Couldn’t load your joining form. Please refresh.</p>
  if (list === null) return <p className="muted">Loading…</p>
  if (!latest || latest.status === 'Rejected')
    return (
      <>
        {latest && (
          <Reveal className="pnote">
            <FiClock />
            <div>
              <strong>Your last form was not accepted</strong>
              <p className="muted">Please check your details and send it again.</p>
            </div>
          </Reveal>
        )}
        <OnboardForm uid={uid} profile={profile} />
      </>
    )

  const save = (patch) => updateOnboarding(latest.id, uid, patch)
  const upload = (key, folder) => async (file) => {
    const up = await uploadFile(file, folder)
    await save({ [key]: up.url, ...(key === 'attestedFileUrl' ? { attestedFileName: file.name } : {}) })
  }
  const locked = latest.status === 'Onboarded'

  return (
    <>
      <Reveal className="ob-status">
        <div>
          <small>Joining form {latest.applicationNumber}</small>
          <strong>{latest.appliedRole}</strong>
          <span className="muted">Sent {fmtDate(latest.submittedAt)}</span>
        </div>
        <Pill>{latest.status}</Pill>
      </Reveal>

      <section className="pblock">
        <TypeText as="h2" className="psub" text="Next steps" speed={35} />
        <Reveal>
          <ol className="ob-steps">
            <li className="is-done">Send the joining form</li>
            <li className={ONBOARD_DOCS.every((d) => latest[d.key]) ? 'is-done' : ''}>Upload your documents</li>
            <li className={['Awaiting Stamped Copy', 'Onboarded'].includes(latest.status) ? 'is-done' : ''}>Office reviews your form</li>
            <li className={latest.attestedFileUrl ? 'is-done' : ''}>Upload the signed &amp; stamped copy</li>
            <li className={latest.status === 'Onboarded' ? 'is-done' : ''}>Welcome to the team 🎉</li>
          </ol>
          <div className="pacts"><PrintLink kind="application" id={latest.id} /></div>
        </Reveal>
      </section>

      <section className="pblock">
        <TypeText as="h2" className="psub" text="Documents" speed={35} />
        <Reveal className="ob-ups">
          {ONBOARD_DOCS.map((d) => (
            <UploadButton key={d.key} label={d.label} done={latest[d.key]} disabled={locked} accept=".pdf,image/*" onFile={upload(d.key, 'kraftor/employee-applications/docs')} />
          ))}
          {(latest.status === 'Awaiting Stamped Copy' || latest.attestedFileUrl) && (
            <UploadButton label="Signed & stamped copy" done={latest.attestedFileUrl} accept=".pdf,image/*" onFile={upload('attestedFileUrl', 'kraftor/employee-applications/attested')} />
          )}
        </Reveal>
      </section>

      <section className="pblock">
        <TypeText as="h2" className="psub" text="Your details" speed={35} />
        <Reveal>
          <Details
            rows={[
              ['Name', latest.employeeName],
              ['Experience', latest.experience],
              ['Born', latest.dateOfBirth],
              ['Phone', latest.phoneNumber],
              ['Address', [latest.fullAddress, latest.cityCountry, latest.postcode].filter(Boolean).join(', ')],
              ['Qualification', [latest.qualification, latest.institute, latest.passingYear].filter(Boolean).join(', ')],
              ['Aadhaar', latest.aadhaarNumber && `•••• •••• ${String(latest.aadhaarNumber).slice(-4)}`],
            ]}
          />
        </Reveal>
      </section>
    </>
  )
}
