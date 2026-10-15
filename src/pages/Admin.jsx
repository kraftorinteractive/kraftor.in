import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiMail, FiPhone, FiTrash2, FiExternalLink, FiCheck, FiX, FiLock, FiAlertTriangle, FiUserPlus, FiFileText,
  FiHome, FiInbox, FiUsers, FiFolder, FiCreditCard, FiBriefcase, FiAward, FiCalendar, FiSettings, FiClock,
  FiCoffee, FiUserCheck, FiAlertCircle, FiShare2,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import Button from '../components/ui/Button'
import Reveal from '../components/ui/Reveal'
import TypeText from '../components/ui/TypeText'
import Select from '../components/ui/Select'
import DashShell from '../components/dash/DashShell'
import Layout from '../components/layout/Layout'
import PageHeader from '../components/layout/PageHeader'
import AuthForm from '../components/auth/AuthForm'
import { DashHead, KpiRow, KpiCard, Panel, Timeline, NextSteps, Glance, QuickActions, SectionTiles, SubTabs, weekStats } from '../components/dash/widgets'
import DataList, { Details, Progress } from '../components/portal/DataList'
import useLive from '../components/portal/useLive'
import { fmtDate, fmtDateTime, fmtTime, inr, digits, waLink } from '../components/portal/format'
import usePageTitle from '../hooks/usePageTitle'
import { isFirebaseReady } from '../lib/firebase'
import { watchAuth, watchProfile, signIn, signOutUser, resetPassword, updateItem, removeItem, approveRegistration, adminCreateUser } from '../lib/api'
import { ProjectBody, MoneyBody, projectItem } from './portal/ClientPortal'
import { setOnCrew, publishCrew } from '../lib/public'
import { NewProject, ProjectEditor, MoneyForm, SlipForm, ShareForm, SettingsForm, PrintLink, PaymentLinkEditor } from './admin/Forms'
import './pages.css'
import './Contact.css'
import './Account.css'
import '../components/portal/portal.css'

const SECTIONS = [
  { key: 'overview', label: 'Overview', icon: FiHome, text: 'Here’s what’s happening across leads, projects, money and your team.' },
  { key: 'leads', label: 'Leads', icon: FiInbox, text: 'Messages from the contact form, custom packages and the chatbot.' },
  { key: 'registrations', label: 'Sign-ups', icon: FiUserPlus, text: 'Clients who registered on the website and are waiting for approval.' },
  { key: 'users', label: 'Users', icon: FiUsers, text: 'Clients, team members and admins — roles, access and the crew page.' },
  { key: 'projects', label: 'Projects', icon: FiFolder, text: 'Create projects, split them into phases and assign the work.' },
  { key: 'finance', label: 'Finance', icon: FiCreditCard, text: 'Invoices and quotations — create, print and collect payments.' },
  { key: 'team', label: 'Team', icon: FiBriefcase, text: 'Attendance, leave, payslips, joining forms and documents.' },
  { key: 'careers', label: 'Careers', icon: FiAward, text: 'Applications from the careers page.' },
  { key: 'meetings', label: 'Meetings', icon: FiCalendar, text: 'Meeting requests from clients.' },
  { key: 'files', label: 'Files', icon: FiFileText, text: 'Files and links shared with clients and the team.' },
  { key: 'settings', label: 'Settings', icon: FiSettings, text: 'Company details, GST, invoice numbering and payment terms.' },
]
const SUBS = {
  leads: [
    { key: 'contact_messages', label: 'Contact form' },
    { key: 'custom_package_leads', label: 'Custom packages' },
    { key: 'chatbot_leads', label: 'Chatbot' },
  ],
  finance: [
    { key: 'invoices', label: 'Invoices' },
    { key: 'quotations', label: 'Quotations' },
  ],
  team: [
    { key: 'attendance', label: 'Attendance' },
    { key: 'leave_requests', label: 'Leave' },
    { key: 'salary_slips', label: 'Payslips' },
    { key: 'employee_applications', label: 'Onboarding' },
    { key: 'employee_documents', label: 'Documents' },
  ],
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const todayStr = () => new Date().toISOString().split('T')[0]

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

/* ---------------- Small shared pieces ---------------- */

function useRun() {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const run = async (fn) => {
    setErr('')
    setBusy(true)
    try {
      await fn()
    } catch (e) {
      setErr(e?.message && !e.code ? e.message : 'That didn’t work. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }
  return { busy, err, run }
}

function Contact({ email, phone }) {
  const wa = waLink(phone)
  return (
    <>
      {email && <a className="pbtn" href={`mailto:${email}`}><FiMail /> Email</a>}
      {phone && <a className="pbtn" href={`tel:${digits(phone)}`}><FiPhone /> Call</a>}
      {wa && <a className="pbtn" href={wa} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> WhatsApp</a>}
    </>
  )
}

/** Status select + delete + contact buttons — the usual action row. */
function Actions({ col, item, statuses, statusField = 'status', email, phone, extra, extraFirst, canDelete = true, stamp = true }) {
  const { busy, err, run } = useRun()
  const value = item[statusField] || ''
  return (
    <>
      <div className="pacts">
        {extraFirst}
        {statuses && (
          <label className="plabel">
            <span>Status</span>
            <select className="pselect" value={value} disabled={busy} onChange={(e) => run(() => updateItem(col, item.id, { [statusField]: e.target.value }, { stamp }))}>
              {!statuses.includes(value) && <option value={value}>{value || '—'}</option>}
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        )}
        <Contact email={email} phone={phone} />
        {extra?.(run, busy)}
        {canDelete && (
          <button
            type="button"
            className="pbtn pbtn--danger"
            disabled={busy}
            onClick={() => window.confirm('Delete this record? This can’t be undone.') && run(() => removeItem(col, item.id))}
          >
            <FiTrash2 /> Delete
          </button>
        )}
      </div>
      {err && <p className="form__error" role="alert">{err}</p>}
    </>
  )
}

const LinkOut = ({ href, children }) =>
  /^https?:\/\//.test(href || '') ? (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow">
      {children || href} <FiExternalLink />
    </a>
  ) : null

const initials = (n) => (n || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
const Avatar = ({ src, name }) => <span className="pav" aria-hidden="true">{src ? <img src={src} alt="" /> : initials(name)}</span>

/* ---------------- Sections ---------------- */

function Leads({ sub, data }) {
  const { list, error } = data[sub]
  const statuses = sub === 'chatbot_leads' ? ['new', 'contacted'] : ['unread', 'read']
  return (
    <DataList
      list={list}
      error={error}
      statuses={statuses}
      statusOf={(l) => l.status || statuses[0]}
      empty="No leads here yet."
      getItem={(l) => ({
        title: l.name || l.email || 'No name',
        sub: [l.service || l.projectType || l.interest, l.projectName].filter(Boolean).join(' · ') || l.email,
        status: l.status || statuses[0],
        date: fmtDate(l.createdAt),
      })}
      renderBody={(l) => (
        <>
          <Details
            rows={[
              ['Email', l.email],
              ['Phone', l.phone],
              ['WhatsApp', l.whatsapp && l.whatsapp !== l.phone ? l.whatsapp : null],
              ['Company', l.company],
              ['Country', l.country],
              ['Service', l.service || l.interest],
              ['Project', l.projectName],
              ['Budget', l.budget],
              ['Message', l.message],
              ['Source', l.source],
              ['Received', fmtDateTime(l.createdAt)],
            ]}
          />
          <Actions col={sub} item={l} statuses={statuses} email={l.email} phone={l.whatsapp || l.phone} stamp={sub === 'chatbot_leads'} />
        </>
      )}
    />
  )
}

function Registrations({ data }) {
  const { list, error } = data.pending_registrations
  return (
    <DataList
      list={list}
      error={error}
      empty="No sign-ups waiting."
      getItem={(r) => ({ lead: <Avatar src={r.dpUrl} name={r.name || r.orgName} />, title: r.name || r.orgName, sub: [r.orgName, r.email].filter(Boolean).join(' · '), status: r.uid ? 'pending' : 'old site', date: fmtDate(r.submittedAt) })}
      renderBody={(r) => (
        <>
          <Details rows={[['Email', r.email], ['Phone', r.phone], ['Company', r.orgName], ['Type', r.orgType], ['Address', r.address], ['Logo', <LinkOut key="l" href={r.logoUrl} />]]} />
          {!r.uid && <p className="muted pnote-sm">This request came from the old site and has no login. Ask the client to register again on this site.</p>}
          <Actions
            col="pending_registrations"
            item={r}
            email={r.email}
            phone={r.phone}
            extra={(run, busy) =>
              r.uid && (
                <button type="button" className="pbtn pbtn--primary" disabled={busy} onClick={() => run(() => approveRegistration(r))}>
                  <FiCheck /> Approve as client
                </button>
              )
            }
          />
        </>
      )}
    />
  )
}

function AddUser() {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', email: '', role: 'client', company: '', title: '', phone: '' })
  const { busy, err, run } = useRun()
  const [done, setDone] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    if (!f.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return
    run(async () => {
      await adminCreateUser(f)
      setDone(`${f.email} added. They’ll get an email to set their password.`)
      setF({ name: '', email: '', role: f.role, company: '', title: '', phone: '' })
    })
  }

  if (!open)
    return (
      <div className="pacts padd">
        <button type="button" className="pbtn pbtn--primary" onClick={() => setOpen(true)}><FiUserPlus /> Add user</button>
        {done && <span className="acct-ok">{done}</span>}
      </div>
    )

  return (
    <form className="form pform padd" onSubmit={onSubmit} noValidate>
      <div className="form__grid">
        <div className="field"><label htmlFor="u-name">Name</label><input id="u-name" value={f.name} onChange={set('name')} /></div>
        <div className="field"><label htmlFor="u-email">Email</label><input id="u-email" type="email" value={f.email} onChange={set('email')} /></div>
        <div className="field">
          <label htmlFor="u-role">Role</label>
          <Select variant="line" id="u-role" value={f.role} onChange={(v) => setF({ ...f, role: v })} options={['client', 'employee']} />
        </div>
        <div className="field"><label htmlFor="u-phone">Phone</label><input id="u-phone" type="tel" value={f.phone} onChange={set('phone')} /></div>
        <div className="field">
          <label htmlFor="u-company">{f.role === 'client' ? 'Company' : 'Title'}</label>
          <input id="u-company" value={f.role === 'client' ? f.company : f.title} onChange={set(f.role === 'client' ? 'company' : 'title')} placeholder={f.role === 'client' ? 'Company name' : 'e.g. Video Editor'} />
        </div>
      </div>
      <div className="pacts">
        <Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create & send invite'}</Button>
        <button type="button" className="pbtn" onClick={() => setOpen(false)}>Cancel</button>
      </div>
      {err && <p className="form__error" role="alert">{err}</p>}
    </form>
  )
}

/** Refreshes the public "Meet the crew" list on the About page from the users marked for it. */
function PublishCrew({ users }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const count = users.filter((u) => u.showOnCrew && u.role === 'employee' && u.status !== 'inactive').length
  return (
    <p className="muted pnote-sm padd">
      {count} team member{count === 1 ? '' : 's'} shown on the About page.{' '}
      <button
        type="button"
        className="acct-link"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setMsg('')
          try {
            const n = await publishCrew(users)
            setMsg(`Crew page updated (${n}).`)
          } catch {
            setMsg('Couldn’t update the crew page.')
          } finally {
            setBusy(false)
          }
        }}
      >
        {busy ? 'Updating…' : 'Refresh crew page'}
      </button>{' '}
      {msg}
    </p>
  )
}

function Users({ data, me }) {
  const { list, error } = data.users
  return (
    <>
      <AddUser />
      <PublishCrew users={list || []} />
      <DataList
        list={list}
        error={error}
        statuses={['admin', 'employee', 'client']}
        statusOf={(u) => u.role}
        empty="No users."
        getItem={(u) => ({
          lead: <Avatar src={u.avatar || u.logoUrl} name={u.name} />,
          title: u.name || u.email,
          sub: [u.role === 'client' ? u.company : u.title, u.email].filter(Boolean).join(' · '),
          status: u.status === 'inactive' ? 'inactive' : u.role,
        })}
        renderBody={(u) => (
          <>
            <Details rows={[['Email', u.email], ['Phone', u.phone], ['Company', u.company], ['Title', u.title], ['Address', u.address], ['Status', u.status], ['On crew page', u.role === 'employee' ? (u.showOnCrew ? 'Yes' : 'No') : null], ['Joined', fmtDate(u.createdAt)]]} />
            {u.id === me ? (
              <p className="muted pnote-sm">This is you.</p>
            ) : (
              <Actions
                col="users"
                item={u}
                statuses={['admin', 'employee', 'client']}
                statusField="role"
                email={u.email}
                phone={u.phone}
                canDelete={false}
                extra={(run, busy) => (
                  <>
                    <button type="button" className="pbtn" disabled={busy} onClick={() => run(() => updateItem('users', u.id, { status: u.status === 'inactive' ? 'active' : 'inactive' }))}>
                      {u.status === 'inactive' ? <><FiCheck /> Turn on</> : <><FiX /> Turn off</>}
                    </button>
                    {u.role === 'employee' && (
                      <button type="button" className="pbtn" disabled={busy} onClick={() => run(() => setOnCrew(u, !u.showOnCrew))}>
                        {u.showOnCrew ? 'Hide from crew page' : 'Show on crew page'}
                      </button>
                    )}
                    {u.email && (
                      <button type="button" className="pbtn" disabled={busy} onClick={() => run(async () => { await resetPassword(u.email); window.alert(`Password reset email sent to ${u.email}.`) })}>
                        Send password reset
                      </button>
                    )}
                  </>
                )}
              />
            )}
          </>
        )}
      />
    </>
  )
}

function Projects({ data, me }) {
  const { list, error } = data.projects
  const users = data.users.list || []
  const clients = users.filter((u) => u.role === 'client')
  const employees = users.filter((u) => u.role === 'employee' && u.status !== 'inactive')
  return (
    <>
    <NewProject clients={clients} employees={employees} />
    <DataList
      list={list}
      error={error}
      statuses={['Active', 'Completed', 'Cancelled']}
      empty="No projects."
      getItem={(p) => ({ ...projectItem(p), title: `${p.projectName} · ${p.clientName || ''}` })}
      renderBody={(p) => (
        <ProjectBody p={p}>
          <ProjectEditor p={p} employees={employees} />
          <Actions col="projects" item={p} statuses={['Active', 'Completed', 'Cancelled']} email={p.clientEmail} canDelete={false} />
        </ProjectBody>
      )}
    />
    </>
  )
}

function Finance({ sub, data }) {
  const { list, error } = data[sub]
  const isInv = sub === 'invoices'
  const statuses = isInv ? ['Unpaid', 'Overdue', 'Paid', 'Cancelled'] : ['Sent', 'Accepted', 'Declined']
  const total = (list || []).filter((d) => (isInv ? ['Unpaid', 'Overdue'].includes(d.status) : d.status === 'Sent')).reduce((s, d) => s + (Number(d.total) || 0), 0)
  const clients = (data.users.list || []).filter((u) => u.role === 'client')
  return (
    <>
      <MoneyForm kind={isInv ? 'invoice' : 'quotation'} clients={clients} projects={data.projects.list} />
      <p className="muted pnote-sm psum">{isInv ? 'Outstanding' : 'Awaiting answer'}: <strong>{inr(total)}</strong></p>
      <DataList
        list={list}
        error={error}
        statuses={statuses}
        empty={`No ${sub} yet.`}
        getItem={(d) => ({ title: `${d.invoiceNumber || d.quotationNumber || d.id} · ${inr(d.total)}`, sub: [d.clientName, d.projectName, isInv && d.paymentLink && d.status !== 'Paid' && 'Pay link sent'].filter(Boolean).join(' · '), status: d.status, date: fmtDate(d.createdAt) })}
        renderBody={(d) => (
          <>
            <MoneyBody d={d} />
            {isInv && d.status !== 'Paid' && d.status !== 'Cancelled' && <PaymentLinkEditor inv={d} />}
            <Actions
              col={sub}
              extraFirst={<PrintLink kind={isInv ? 'invoice' : 'quotation'} id={d.id} />}
              item={d}
              statuses={statuses}
              email={d.clientEmail}
              phone={d.clientPhone}
              canDelete={false}
              extra={(run, busy) =>
                isInv && d.status !== 'Paid' ? (
                  <button type="button" className="pbtn pbtn--primary" disabled={busy} onClick={() => run(() => updateItem('invoices', d.id, { status: 'Paid', paidAt: new Date() }))}>
                    <FiCheck /> Mark paid
                  </button>
                ) : null
              }
            />
          </>
        )}
      />
    </>
  )
}

function Team({ sub, data }) {
  const { list, error } = data[sub]

  if (sub === 'attendance')
    return (
      <DataList
        list={list}
        error={error}
        statuses={['Pending', 'Present', 'Work From Home', 'Absent', 'Approved']}
        empty="No attendance yet."
        getItem={(a) => ({ title: a.employeeName, sub: `${fmtDate(a.date)} · ${a.workMode || '—'} · ${fmtTime(a.clockIn)} – ${a.clockOut ? fmtTime(a.clockOut) : '…'}`, status: a.status })}
        renderBody={(a) => (
          <>
            <Details rows={[['Location', a.location && <LinkOut key="m" href={`https://maps.google.com/?q=${encodeURIComponent(a.location)}`}>{a.location}</LinkOut>]]} />
            <Actions col="attendance" item={a} statuses={['Pending', 'Present', 'Work From Home', 'Absent']} canDelete={false} />
          </>
        )}
      />
    )

  if (sub === 'leave_requests')
    return (
      <DataList
        list={list}
        error={error}
        statuses={['Pending Approval', 'Approved', 'Rejected']}
        empty="No leave requests."
        getItem={(l) => ({ title: l.employeeName, sub: `${l.type} · ${l.duration}`, status: l.status, date: fmtDate(l.createdAt) })}
        renderBody={(l) => (
          <>
            <Details rows={[['Reason', l.reason], ['Email', l.employeeEmail]]} />
            <Actions col="leave_requests" item={l} statuses={['Pending Approval', 'Approved', 'Rejected']} email={l.employeeEmail} />
          </>
        )}
      />
    )

  if (sub === 'salary_slips')
    return (
      <>
      <SlipForm employees={(data.users.list || []).filter((u) => u.role === 'employee')} />
      <DataList
        list={list}
        error={error}
        empty="No payslips yet."
        getItem={(s) => ({ title: s.employeeName, sub: `${MONTHS[(Number(s.month) || 1) - 1] || s.month} ${s.year} · Net ${inr(s.netSalary)}`, status: s.status, date: s.slipNumber })}
        renderBody={(s) => (
          <>
            <Details rows={[['Designation', s.designation], ['Gross', inr(s.grossSalary)], ['Deductions', inr(s.totalDeductions)], ['Net', inr(s.netSalary)], ['Notes', s.notes]]} />
            <div className="pacts"><PrintLink kind="payslip" id={s.id} /></div>
          </>
        )}
      />
      </>
    )

  if (sub === 'employee_applications')
    return (
      <DataList
        list={list}
        error={error}
        statuses={['Submitted', 'In Review', 'Awaiting Stamped Copy', 'Onboarded', 'Rejected']}
        empty="No onboarding forms."
        getItem={(a) => ({ lead: <Avatar src={a.passportPhotoUrl} name={a.employeeName} />, title: a.employeeName, sub: [a.appliedRole, a.applicationNumber].filter(Boolean).join(' · '), status: a.status, date: fmtDate(a.submittedAt) })}
        renderBody={(a) => (
          <>
            <Details
              rows={[
                ['Email', a.employeeEmail],
                ['Phone', a.phoneNumber],
                ['WhatsApp', a.whatsappNumber],
                ['Born', a.dateOfBirth],
                ['Gender', a.gender],
                ['Qualification', [a.qualification, a.institute, a.passingYear].filter(Boolean).join(', ')],
                ['Experience', a.experience],
                ['Address', [a.fullAddress, a.cityCountry, a.postcode].filter(Boolean).join(', ')],
                ['Resume', <LinkOut key="r" href={a.resumeUrl}>Open</LinkOut>],
                ['Cover letter', <LinkOut key="c" href={a.coverLetterUrl}>Open</LinkOut>],
                ['Marksheet', <LinkOut key="m" href={a.marksheetUrl}>Open</LinkOut>],
                ['Aadhaar', <LinkOut key="a" href={a.aadhaarDocUrl}>Open</LinkOut>],
                ['Passbook', <LinkOut key="p" href={a.passbookUrl}>Open</LinkOut>],
                ['Attested file', <LinkOut key="t" href={a.attestedFileUrl}>Open</LinkOut>],
              ]}
            />
            <Actions extraFirst={<PrintLink kind="application" id={a.id} />} col="employee_applications" item={a} statuses={['Submitted', 'In Review', 'Awaiting Stamped Copy', 'Onboarded', 'Rejected']} email={a.employeeEmail} phone={a.whatsappNumber || a.phoneNumber} canDelete={false} stamp={false} />
          </>
        )}
      />
    )

  return (
    <DataList
      list={list}
      error={error}
      empty="No documents uploaded."
      getItem={(d) => ({ lead: <span className="pav pav--icon" aria-hidden="true"><FiFileText /></span>, title: d.fileName, sub: d.employeeName, date: fmtDate(d.submittedAt) })}
      renderBody={(d) => (
        <div className="pacts">
          <a className="pbtn pbtn--primary" href={d.fileUrl} target="_blank" rel="noopener noreferrer"><FiExternalLink /> Open</a>
          <Contact email={d.employeeEmail} />
        </div>
      )}
    />
  )
}

function Careers({ data }) {
  const { list, error } = data.job_applications
  const statuses = ['pending', 'shortlisted', 'hired', 'rejected']
  return (
    <DataList
      list={list}
      error={error}
      statuses={statuses}
      statusOf={(a) => a.status || 'pending'}
      empty="No applications."
      getItem={(a) => ({ title: a.applicantName, sub: [a.department, a.applyAs, a.experience].filter(Boolean).join(' · '), status: a.status || 'pending', date: fmtDate(a.createdAt) })}
      renderBody={(a) => (
        <>
          <Details
            rows={[
              ['Email', a.email],
              ['Phone', a.phone],
              ['City', a.city],
              ['Qualification', a.qualification],
              ['Can join', a.availability],
              ['Portfolio', <LinkOut key="p" href={a.portfolio} />],
              ['CV', <LinkOut key="r" href={a.resumeUrl}>Open CV</LinkOut>],
              ['About', a.coverLetter],
              ['Heard via', a.heardAboutUs],
              ['Referred by', a.reference],
            ]}
          />
          <Actions col="job_applications" item={a} statuses={statuses} email={a.email} phone={a.phone} />
        </>
      )}
    />
  )
}

function Meetings({ data }) {
  const { list, error } = data.meetings
  return (
    <DataList
      list={list}
      error={error}
      statuses={['Pending', 'Confirmed', 'Rejected']}
      empty="No meeting requests."
      getItem={(m) => ({ title: m.clientName, sub: `${fmtDate(m.date)} · ${m.timeSlot} · ${m.meetingType}`, status: m.status, date: fmtDate(m.createdAt) })}
      renderBody={(m) => (
        <>
          <Details rows={[['Agenda', m.agenda], ['Note', m.adminNote], ['Link', <LinkOut key="l" href={m.meetingLink} />]]} />
          <Actions
            col="meetings"
            item={m}
            email={m.clientEmail}
            extra={(run, busy) =>
              m.status === 'Pending' && (
                <>
                  <button
                    type="button"
                    className="pbtn pbtn--primary"
                    disabled={busy}
                    onClick={() => {
                      const link = window.prompt('Meeting link (optional):', '') ?? null
                      if (link === null) return
                      run(() => updateItem('meetings', m.id, { status: 'Confirmed', meetingLink: link || null }))
                    }}
                  >
                    <FiCheck /> Confirm
                  </button>
                  <button
                    type="button"
                    className="pbtn pbtn--danger"
                    disabled={busy}
                    onClick={() => {
                      const note = window.prompt('Reason (optional):', '')
                      if (note === null) return
                      run(() => updateItem('meetings', m.id, { status: 'Rejected', adminNote: note || null }))
                    }}
                  >
                    <FiX /> Decline
                  </button>
                </>
              )
            }
          />
        </>
      )}
    />
  )
}

function Files({ data }) {
  const { list, error } = data.shared_documents
  const users = (data.users.list || []).filter((u) => u.role !== 'admin' && u.status !== 'inactive')
  return (
    <>
      <ShareForm users={users} />
      <DataList
        list={list}
        error={error}
        statuses={['client', 'employee']}
        statusOf={(d) => d.recipientRole || 'client'}
        empty="Nothing shared yet."
        getItem={(d) => ({ lead: <span className="pav pav--icon" aria-hidden="true"><FiFileText /></span>, title: d.fileName, sub: `${d.fileType || 'File'} → ${d.recipientName || d.recipientEmail}`, date: fmtDate(d.sharedAt) })}
        renderBody={(d) => (
          <Actions col="shared_documents" item={d} email={d.recipientEmail} extraFirst={<a className="pbtn pbtn--primary" href={d.fileUrl} target="_blank" rel="noopener noreferrer"><FiExternalLink /> Open</a>} />
        )}
      />
    </>
  )
}

/* ---------------- Data ---------------- */

const COLLECTIONS = {
  contact_messages: {},
  custom_package_leads: {},
  chatbot_leads: {},
  pending_registrations: { sortBy: 'submittedAt' },
  users: {},
  projects: {},
  invoices: {},
  quotations: {},
  attendance: { sortBy: 'date' },
  leave_requests: {},
  salary_slips: {},
  employee_applications: { sortBy: 'submittedAt' },
  employee_documents: { sortBy: 'submittedAt' },
  job_applications: {},
  meetings: {},
  shared_documents: { sortBy: 'sharedAt' },
}

function useAllData() {
  const out = {}
  for (const [name, opts] of Object.entries(COLLECTIONS)) {
    // Fixed list of collections, so the hook order never changes
    // eslint-disable-next-line react-hooks/rules-of-hooks
    out[name] = useLive(name, opts)
  }
  return out
}

/** Counts that need attention — used for sidebar badges, the bell and "Next steps". */
function useAttention(data) {
  return useMemo(() => {
    const n = (k, f = () => true) => (data[k].list || []).filter(f).length
    const unreadLeads = {
      contact_messages: n('contact_messages', (l) => (l.status || 'unread') === 'unread'),
      custom_package_leads: n('custom_package_leads', (l) => (l.status || 'unread') === 'unread'),
      chatbot_leads: n('chatbot_leads', (l) => (l.status || 'new') === 'new'),
    }
    const today = todayStr()
    const soon = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    return {
      unreadLeads,
      leads: unreadLeads.contact_messages + unreadLeads.custom_package_leads + unreadLeads.chatbot_leads,
      signups: n('pending_registrations'),
      overdue: (data.invoices.list || []).filter((d) => d.status === 'Overdue' || (d.status === 'Unpaid' && d.dueDate && d.dueDate < today)),
      unpaid: (data.invoices.list || []).filter((d) => ['Unpaid', 'Overdue'].includes(d.status)),
      quotes: n('quotations', (q) => q.status === 'Sent'),
      leave: n('leave_requests', (l) => l.status === 'Pending Approval'),
      attendance: n('attendance', (a) => a.status === 'Pending'),
      onboarding: n('employee_applications', (a) => ['Submitted', 'In Review'].includes(a.status)),
      careers: n('job_applications', (a) => (a.status || 'pending') === 'pending'),
      meetings: n('meetings', (m) => m.status === 'Pending'),
      dueSoon: (data.projects.list || []).filter((p) => p.status === 'Active' && p.deadline && p.deadline >= today && p.deadline <= soon),
      late: (data.projects.list || []).filter((p) => p.status === 'Active' && p.deadline && p.deadline < today),
    }
  }, [data])
}

function nextSteps(att, go) {
  const s = []
  const add = (cond, item) => cond && s.push(item)
  add(att.signups, { id: 'signups', icon: FiUserPlus, tone: 'purple', title: `Approve ${att.signups} sign-up${att.signups > 1 ? 's' : ''}`, sub: 'Clients waiting to get in', priority: 'High', onClick: () => go('registrations') })
  add(att.overdue.length, { id: 'overdue', icon: FiAlertCircle, tone: 'pink', title: `${att.overdue.length} overdue invoice${att.overdue.length > 1 ? 's' : ''}`, sub: inr(att.overdue.reduce((t, d) => t + (Number(d.total) || 0), 0)) + ' to collect', priority: 'High', onClick: () => go('finance', 'invoices') })
  add(att.leads, { id: 'leads', icon: FiInbox, tone: 'green', title: `Reply to ${att.leads} new lead${att.leads > 1 ? 's' : ''}`, sub: 'Contact form, packages & chatbot', priority: 'High', onClick: () => go('leads') })
  add(att.late.length, { id: 'late', icon: FiClock, tone: 'pink', title: `${att.late.length} project${att.late.length > 1 ? 's' : ''} past deadline`, sub: att.late.map((p) => p.projectName).slice(0, 2).join(', '), priority: 'High', onClick: () => go('projects') })
  add(att.meetings, { id: 'meetings', icon: FiCalendar, tone: 'blue', title: `Confirm ${att.meetings} meeting${att.meetings > 1 ? 's' : ''}`, sub: 'Requested by clients', priority: 'Medium', onClick: () => go('meetings') })
  add(att.leave, { id: 'leave', icon: FiCoffee, tone: 'orange', title: `${att.leave} leave request${att.leave > 1 ? 's' : ''}`, sub: 'Waiting for approval', priority: 'Medium', onClick: () => go('team', 'leave_requests') })
  add(att.dueSoon.length, { id: 'due', icon: FiFolder, tone: 'purple', title: `${att.dueSoon.length} project${att.dueSoon.length > 1 ? 's' : ''} due this week`, sub: att.dueSoon.map((p) => p.projectName).slice(0, 2).join(', '), priority: 'Medium', onClick: () => go('projects') })
  add(att.onboarding, { id: 'onb', icon: FiUserCheck, tone: 'blue', title: `Review ${att.onboarding} joining form${att.onboarding > 1 ? 's' : ''}`, sub: 'New team members', priority: 'Low', onClick: () => go('team', 'employee_applications') })
  add(att.careers, { id: 'careers', icon: FiAward, tone: 'green', title: `${att.careers} new job application${att.careers > 1 ? 's' : ''}`, sub: 'From the careers page', priority: 'Low', onClick: () => go('careers') })
  add(att.attendance, { id: 'att', icon: FiClock, tone: 'orange', title: `Mark ${att.attendance} attendance entr${att.attendance > 1 ? 'ies' : 'y'}`, sub: 'Present / WFH / absent', priority: 'Low', onClick: () => go('team', 'attendance') })
  return s
}

/* ---------------- Overview (dashboard home) ---------------- */

const TL_FILTERS = [
  { key: 'active', label: 'Active' },
  { key: 'due', label: 'Due soon' },
  { key: 'all', label: 'All' },
  { key: 'done', label: 'Completed' },
]

function Overview({ data, att, go, nav, name }) {
  const [tl, setTl] = useState('active')
  const loading = data.users.list === null

  const leadsAll = [...(data.contact_messages.list || []), ...(data.custom_package_leads.list || []), ...(data.chatbot_leads.list || [])]
  const leadsW = weekStats(leadsAll, (l) => l.createdAt)
  const projW = weekStats(data.projects.list, (p) => p.createdAt)
  const paidW = weekStats((data.invoices.list || []).filter((d) => d.status === 'Paid'), (d) => d.paidAt, (d) => d.total)
  const attW = weekStats(data.attendance.list, (a) => a.date)
  const inToday = (data.attendance.list || []).filter((a) => a.date === todayStr() && a.clockIn).length
  const activeProjects = (data.projects.list || []).filter((p) => p.status === 'Active')

  const today = todayStr()
  const soon = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const tlRows = (data.projects.list || [])
    .filter((p) => (tl === 'active' ? p.status === 'Active' : tl === 'done' ? p.status === 'Completed' : tl === 'due' ? p.status === 'Active' && p.deadline && p.deadline >= today && p.deadline <= soon : true))
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      icon: FiFolder,
      title: p.projectName,
      sub: p.clientName || p.assignedToName,
      start: p.createdAt,
      end: p.deadline ? `${p.deadline}T23:59:59` : null,
      label: `${p.projectName} · ${p.progress || 0}%`,
      onClick: () => go('projects'),
    }))

  const steps = nextSteps(att, go)
  const users = data.users.list || []
  const shares = weekStats(data.shared_documents.list, (d) => d.sharedAt)

  return (
    <>
      <DashHead
        crumb={['Admin']}
        name={name}
        title={loading ? 'Loading your studio…' : steps.length ? `${steps.length} thing${steps.length > 1 ? 's' : ''} need${steps.length > 1 ? '' : 's'} your attention` : 'Your studio is running smoothly'}
        text="Here’s what’s happening across leads, projects, money and your team."
      />
      <div className="dgrid">
        <SectionTiles nav={nav} onNav={go} />
        <KpiRow>
          <KpiCard icon={FiInbox} tone="green" label="New leads (7 days)" value={leadsW.thisWeek} delta={leadsW.delta} series={leadsW.series} onClick={() => go('leads')} />
          <KpiCard icon={FiFolder} tone="blue" label="Active projects" value={activeProjects.length} note={`${att.dueSoon.length} due this week · ${att.late.length} late`} series={projW.series} onClick={() => go('projects')} />
          <KpiCard icon={FiCreditCard} tone="blue" label="Collected (7 days)" value={inr(paidW.thisWeek)} delta={paidW.delta} series={paidW.series} onClick={() => go('finance', 'invoices')} />
          <KpiCard icon={FiClock} tone="orange" label="In today" value={inToday} delta={attW.delta} series={attW.series} onClick={() => go('team', 'attendance')} />
        </KpiRow>

        <Panel title="Project activity" sub="Your projects across this week — tap one to open it." action="View all" onAction={() => go('projects')}>
          <Timeline rows={tlRows} filters={TL_FILTERS} filter={tl} onFilter={setTl} empty="No projects in this view." />
        </Panel>

        <div className="dgrid dgrid--3">
          <Panel title="Next steps" action={steps.length > 5 ? 'All' : undefined} onAction={() => go('leads')}>
            <NextSteps items={steps.slice(0, 5)} />
          </Panel>
          <Panel title="At a glance">
            <Glance
              items={[
                { icon: FiUsers, tone: 'purple', value: users.filter((u) => u.role === 'client').length, label: 'clients', sub: `${users.filter((u) => u.role === 'employee' && u.status !== 'inactive').length} team members`, onClick: () => go('users') },
                { icon: FiCreditCard, tone: 'pink', value: inr(att.unpaid.reduce((t, d) => t + (Number(d.total) || 0), 0)), label: '', sub: `${att.unpaid.length} unpaid invoice${att.unpaid.length === 1 ? '' : 's'}`, onClick: () => go('finance', 'invoices') },
                { icon: FiFileText, tone: 'blue', value: att.quotes, label: att.quotes === 1 ? 'quote' : 'quotes', sub: 'Waiting for client', onClick: () => go('finance', 'quotations') },
                { icon: FiShare2, tone: 'green', value: shares.thisWeek, label: shares.thisWeek === 1 ? 'file' : 'files', sub: 'Shared this week', onClick: () => go('files') },
              ]}
            />
          </Panel>
          <QuickActions
            name={name}
            actions={[
              { icon: FiFolder, label: 'New project', onClick: () => go('projects') },
              { icon: FiCreditCard, label: 'New invoice', onClick: () => go('finance', 'invoices') },
              { icon: FiUserPlus, label: 'Add user', onClick: () => go('users') },
              { icon: FiShare2, label: 'Share a file', onClick: () => go('files') },
            ]}
            suggestions={[
              { label: 'Who clocked in today?', onClick: () => go('team', 'attendance') },
              { label: 'Which invoices are unpaid?', onClick: () => go('finance', 'invoices') },
              { label: 'Any new job applications?', onClick: () => go('careers') },
            ]}
            onSearch={(q) => {
              const t = q.toLowerCase()
              const hit = SECTIONS.find((s) => s.label.toLowerCase().includes(t) || s.text.toLowerCase().includes(t))
              const sub = Object.entries(SUBS).flatMap(([sec, list]) => list.map((x) => ({ sec, ...x }))).find((x) => x.label.toLowerCase().includes(t))
              if (sub) go(sub.sec, sub.key)
              else if (hit) go(hit.key)
            }}
          />
        </div>
      </div>
    </>
  )
}

/* ---------------- Section pages ---------------- */

function SectionPage({ section, sub, setSub, data, att, me, go }) {
  const meta = SECTIONS.find((s) => s.key === section)
  const tabs = SUBS[section]?.map((t) => ({
    ...t,
    badge: section === 'leads' ? att.unreadLeads[t.key] : t.key === 'leave_requests' ? att.leave : t.key === 'employee_applications' ? att.onboarding : t.key === 'attendance' ? att.attendance : 0,
  }))
  let body
  switch (section) {
    case 'leads': body = <Leads sub={sub} data={data} />; break
    case 'registrations': body = <Registrations data={data} />; break
    case 'users': body = <Users data={data} me={me.uid} />; break
    case 'projects': body = <Projects data={data} />; break
    case 'finance': body = <Finance sub={sub} data={data} />; break
    case 'team': body = <Team sub={sub} data={data} />; break
    case 'careers': body = <Careers data={data} />; break
    case 'meetings': body = <Meetings data={data} />; break
    case 'files': body = <Files data={data} />; break
    case 'settings': body = <SettingsForm />; break
    default: body = null
  }
  return (
    <>
      <DashHead crumb={['Admin', meta.label]} title={meta.label} text={meta.text} />
      <div className="dgrid">
        <Panel>
          {tabs && <SubTabs tabs={tabs} active={sub} onChange={setSub} label={`${meta.label} views`} />}
          {body}
        </Panel>
      </div>
    </>
  )
}

/* ---------------- Signed-in admin ---------------- */

function AdminDashboard({ user, profile }) {
  const data = useAllData()
  const att = useAttention(data)
  const [section, setSection] = useState('overview')
  const [subs, setSubs] = useState({ leads: 'contact_messages', finance: 'invoices', team: 'attendance' })

  const go = (key, sub) => {
    setSection(key)
    if (sub) setSubs((s) => ({ ...s, [key]: sub }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const badges = { leads: att.leads, registrations: att.signups, team: att.leave + att.onboarding, careers: att.careers, meetings: att.meetings, finance: att.overdue.length }
  const nav = SECTIONS.map((s) => ({ ...s, badge: badges[s.key] || 0 }))
  const steps = nextSteps(att, go)
  const searchItems = Object.entries(SUBS).flatMap(([sec, list]) =>
    list.map((t) => ({ id: `${sec}-${t.key}`, label: t.label, hint: SECTIONS.find((s) => s.key === sec).label, icon: SECTIONS.find((s) => s.key === sec).icon, go: () => go(sec, t.key) }))
  )
  const me = { uid: user.uid, name: profile.name, email: user.email, role: 'admin' }

  return (
    <DashShell
      tagline="Studio dashboard"
      nav={nav}
      active={section}
      onNav={(k) => go(k)}
      user={{ name: profile.name, role: profile.title || 'Admin', email: user.email, avatar: profile.avatar }}
      onSignOut={signOutUser}
      notifications={steps.map((s) => ({ id: s.id, label: s.title, sub: s.sub, icon: s.icon, tone: s.tone, go: s.onClick }))}
      searchItems={searchItems}
    >
      {section === 'overview' ? (
        <Overview data={data} att={att} go={go} nav={nav} name={profile.name} />
      ) : (
        <SectionPage key={section} section={section} sub={subs[section]} setSub={(v) => setSubs({ ...subs, [section]: v })} data={data} att={att} me={me} go={go} />
      )}
    </DashShell>
  )
}

/* ---------------- Page ---------------- */

export default function Admin() {
  usePageTitle('Admin')
  useNoIndex()
  const [user, setUser] = useState(undefined)
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

  const isAdmin = profile?.role === 'admin' && profile.status !== 'inactive'

  if (isAdmin) return <AdminDashboard user={user} profile={profile} />

  let body
  if (!isFirebaseReady)
    body = (
      <Reveal className="pnote">
        <FiAlertTriangle />
        <div>
          <strong>Backend not connected</strong>
          <p className="muted">Add the Firebase keys to <code>.env.local</code> and restart the site.</p>
        </div>
      </Reveal>
    )
  else if (user === undefined || (user && profile === undefined)) body = <p className="muted">Checking access…</p>
  else if (!user) body = <AuthForm type="admin" />
  else
    body = (
      <Reveal className="pnote">
        <FiLock />
        <div>
          <strong>No admin access</strong>
          <p className="muted">
            You&apos;re signed in as {user.email}, which isn&apos;t an admin account. <Link to="/login">Go to your account</Link> or{' '}
            <button type="button" className="acct-link" onClick={signOutUser}>sign out</button>.
          </p>
        </div>
      </Reveal>
    )

  // Same look as the client / employee sign-in page (/login)
  return (
    <Layout>
      <PageHeader crumb="Admin" title="Admin panel" text="For the Kraftor team only." />
      <section className="container page-body">
        <div className="acct">{body}</div>
      </section>
    </Layout>
  )
}
