import { useMemo, useState } from 'react'
import { FiLogIn, FiLogOut, FiMapPin, FiSend, FiUploadCloud, FiExternalLink } from 'react-icons/fi'
import Reveal from '../../components/ui/Reveal'
import TypeText from '../../components/ui/TypeText'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import DataList, { Details, Progress, PrintLink } from '../../components/portal/DataList'
import useLive from '../../components/portal/useLive'
import { fmtDate, fmtTime, inr, toDate } from '../../components/portal/format'
import { clockIn, clockOut, getLocation, submitLeaveRequest, submitEmployeeDocument, toggleTask } from '../../lib/portal'
import { uploadFile, MAX_UPLOAD_MB } from '../../lib/cloudinary'
import { ProjectBody, FileList, projectItem } from './ClientPortal'
import Onboarding from './Onboarding'

export const EMPLOYEE_SECTIONS = [
  { key: 'overview', label: 'Today' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'leave', label: 'Leave' },
  { key: 'payslips', label: 'Payslips' },
  { key: 'documents', label: 'Documents' },
  { key: 'joining', label: 'Joining' },
]

const WORK_MODES = ['In Office', 'Work From Home', 'Field Work']
const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Annual Leave']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const todayStr = () => new Date().toISOString().split('T')[0]

/* ---------- Clock in / out ---------- */

export function ClockCard({ uid, profile, attendance }) {
  const today = (attendance || []).find((a) => a.date === todayStr())
  const [mode, setMode] = useState('In Office')
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')

  const doIn = async () => {
    setMsg('')
    setBusy('Getting location…')
    const loc = await getLocation()
    setBusy('Clocking in…')
    try {
      await clockIn(uid, profile.name, mode, loc)
    } catch (e) {
      setMsg(e?.message || 'Couldn’t clock in. Please try again.')
    } finally {
      setBusy('')
    }
  }
  const doOut = async () => {
    setMsg('')
    setBusy('Clocking out…')
    try {
      await clockOut(uid, today.date)
    } catch {
      setMsg('Couldn’t clock out. Please try again.')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="pclock">
      <div className="pclock__now">
        <small>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</small>
        {today?.clockIn ? (
          <strong>
            In at {fmtTime(today.clockIn)}
            {today.clockOut ? ` · Out at ${fmtTime(today.clockOut)}` : ''}
          </strong>
        ) : (
          <strong>Not clocked in yet</strong>
        )}
        {today?.workMode && (
          <span className="muted">
            {today.workMode}
            {today.location ? (
              <>
                {' '}
                · <FiMapPin aria-hidden="true" /> location saved
              </>
            ) : null}
          </span>
        )}
      </div>
      <div className="pclock__act">
        {!today?.clockIn ? (
          <>
            <Select value={mode} onChange={setMode} options={WORK_MODES} id="work-mode" />
            <Button icon={<FiLogIn />} onClick={doIn} disabled={!!busy}>{busy || 'Clock in'}</Button>
          </>
        ) : !today.clockOut ? (
          <Button variant="dark" icon={<FiLogOut />} onClick={doOut} disabled={!!busy}>{busy || 'Clock out'}</Button>
        ) : (
          <span className="muted">Done for today 👋</span>
        )}
      </div>
      {msg && <p className="form__error" role="alert">{msg}</p>}
    </div>
  )
}

/* ---------- Leave form ---------- */

function LeaveForm({ uid, profile }) {
  const [f, setF] = useState({ type: '', duration: '', reason: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ ok: false, text: '' })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!f.type || !f.duration.trim() || !f.reason.trim()) return setMsg({ ok: false, text: 'Please fill in all three fields.' })
    setBusy(true)
    setMsg({ ok: false, text: '' })
    try {
      await submitLeaveRequest({ uid, employeeName: profile.name, employeeEmail: profile.email, ...f })
      setF({ type: '', duration: '', reason: '' })
      setMsg({ ok: true, text: 'Leave request sent.' })
    } catch {
      setMsg({ ok: false, text: 'Couldn’t send the request. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form pform" onSubmit={onSubmit} noValidate>
      <div className="form__grid">
        <div className="field">
          <label htmlFor="l-type">Type</label>
          <Select variant="line" id="l-type" value={f.type} onChange={(v) => setF({ ...f, type: v })} options={LEAVE_TYPES} placeholder="Choose a type" />
        </div>
        <div className="field">
          <label htmlFor="l-dur">Dates</label>
          <input id="l-dur" type="text" value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} placeholder="e.g. 20–22 Oct (3 days)" />
        </div>
        <div className="field form__full">
          <label htmlFor="l-reason">Reason</label>
          <textarea id="l-reason" rows={3} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} />
        </div>
      </div>
      <Button type="submit" iconRight={<FiSend />} className="form__submit" disabled={busy}>{busy ? 'Sending…' : 'Request leave'}</Button>
      {msg.text && <p className={msg.ok ? 'acct-ok' : 'form__error'} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}
    </form>
  )
}

/* ---------- Document upload ---------- */

function DocUpload({ uid, profile }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ ok: false, text: '' })

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setMsg({ ok: false, text: '' })
    try {
      const up = await uploadFile(file, 'kraftor/employee-docs')
      await submitEmployeeDocument({ uid, employeeName: profile.name, employeeEmail: profile.email, fileName: file.name, fileType: up.format || 'Document', fileUrl: up.url })
      setMsg({ ok: true, text: `${file.name} uploaded.` })
    } catch (err) {
      setMsg({ ok: false, text: err?.message || 'Upload failed. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <label className="cv-drop" htmlFor="emp-doc">
        <FiUploadCloud />
        <span><strong>{busy ? 'Uploading…' : 'Upload a document'}</strong> — ID, certificates, bank details (up to {MAX_UPLOAD_MB} MB)</span>
        <input id="emp-doc" type="file" onChange={onFile} disabled={busy} />
      </label>
      {msg.text && <p className={msg.ok ? 'acct-ok' : 'form__error'} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}
    </>
  )
}

/* ---------- Portal ---------- */

export default function EmployeePortal({ uid, profile, section, setSection }) {
  const attendance = useLive('attendance', { where: ['uid', '==', uid], sortBy: 'date' })
  const leadProjects = useLive('projects', { where: ['assignedToUid', '==', uid] })
  const phaseProjects = useLive('projects', { where: ['phaseAssignees', 'array-contains', uid] })
  const leaves = useLive('leave_requests', { where: ['uid', '==', uid] })
  const slips = useLive('salary_slips', { where: ['employeeUid', '==', uid] })
  const shared = useLive('shared_documents', { where: ['recipientUid', '==', uid], sortBy: 'sharedAt' })
  const myDocs = useLive('employee_documents', { where: ['uid', '==', uid], sortBy: 'submittedAt' })

  // Projects where I'm the lead or own a phase (deduplicated)
  const projects = useMemo(() => {
    if (!leadProjects.list && !phaseProjects.list) return null
    const map = new Map()
    for (const p of [...(leadProjects.list || []), ...(phaseProjects.list || [])]) map.set(p.id, p)
    return [...map.values()]
  }, [leadProjects.list, phaseProjects.list])

  const onToggleTask = async (p, ph, t) => {
    try {
      await toggleTask(p.id, ph.id, t.id, !t.completed, profile.email)
    } catch {
      window.alert('Couldn’t update the task. Please try again.')
    }
  }

  const openTasks = (projects || []).flatMap((p) => (p.phases || []).flatMap((ph) => (ph.tasks || []).filter((t) => !t.completed)))
  const monthKey = new Date().toISOString().slice(0, 7)
  const daysThisMonth = (attendance.list || []).filter((a) => a.date?.startsWith(monthKey) && a.clockIn).length

  if (section === 'overview')
    return (
      <>
        <Reveal>
          <ClockCard uid={uid} profile={profile} attendance={attendance.list} />
        </Reveal>
        <Reveal stagger className="pstats">
          <button type="button" className="pstat" onClick={() => setSection('tasks')}>
            <small>Open tasks</small>
            <strong>{openTasks.length}</strong>
          </button>
          <button type="button" className="pstat" onClick={() => setSection('tasks')}>
            <small>Projects</small>
            <strong>{(projects || []).filter((p) => p.status === 'Active').length}</strong>
            <span>active</span>
          </button>
          <button type="button" className="pstat" onClick={() => setSection('attendance')}>
            <small>Days in</small>
            <strong>{daysThisMonth}</strong>
            <span>this month</span>
          </button>
          <button type="button" className="pstat" onClick={() => setSection('leave')}>
            <small>Leave</small>
            <strong>{(leaves.list || []).filter((l) => l.status === 'Pending Approval').length}</strong>
            <span>pending</span>
          </button>
        </Reveal>
      </>
    )

  if (section === 'tasks')
    return (
      <Reveal>
        <DataList
          list={projects}
          error={leadProjects.error && phaseProjects.error}
          statuses={['Active', 'Completed']}
          empty="No projects assigned to you yet."
          getItem={projectItem}
          renderBody={(p) => <ProjectBody p={p} onToggleTask={onToggleTask} />}
        />
      </Reveal>
    )

  if (section === 'attendance')
    return (
      <>
        <Reveal>
          <ClockCard uid={uid} profile={profile} attendance={attendance.list} />
        </Reveal>
        <Reveal>
          <DataList
            list={attendance.list}
            error={attendance.error}
            searchable={false}
            empty="No attendance yet."
            getItem={(a) => ({
              title: fmtDate(a.date),
              sub: `${a.workMode || '—'} · ${fmtTime(a.clockIn)} – ${a.clockOut ? fmtTime(a.clockOut) : '…'}`,
              status: a.status,
            })}
            renderBody={(a) => <Details rows={[['Location', a.location], ['Hours', hours(a)]]} />}
          />
        </Reveal>
      </>
    )

  if (section === 'leave')
    return (
      <>
        <section className="pblock">
          <TypeText as="h2" className="psub" text="Request leave" speed={35} />
          <Reveal>
            <LeaveForm uid={uid} profile={profile} />
          </Reveal>
        </section>
        <section className="pblock">
          <TypeText as="h2" className="psub" text="Your requests" speed={35} />
          <Reveal>
            <DataList
              list={leaves.list}
              error={leaves.error}
              searchable={false}
              empty="No leave requests yet."
              getItem={(l) => ({ title: l.type, sub: l.duration, status: l.status, date: fmtDate(l.createdAt) })}
              renderBody={(l) => <Details rows={[['Reason', l.reason]]} />}
            />
          </Reveal>
        </section>
      </>
    )

  if (section === 'payslips')
    return (
      <Reveal>
        <DataList
          list={slips.list}
          error={slips.error}
          searchable={false}
          empty="No payslips yet."
          getItem={(s) => ({ title: `${MONTHS[(Number(s.month) || 1) - 1] || s.month} ${s.year}`, sub: `Net ${inr(s.netSalary)}`, status: s.status })}
          renderBody={(s) => (
            <>
            <Details
              rows={[
                ['Slip no.', s.slipNumber],
                ['Designation', s.designation],
                ['Basic', inr(s.basicSalary)],
                ['HRA', inr(s.hra)],
                ['Allowances', inr(s.otherAllowances)],
                ['Gross', inr(s.grossSalary)],
                ['PF', inr(s.pfDeduction)],
                ['Tax', inr(s.taxDeduction)],
                ['Other deductions', inr(s.otherDeductions)],
                ['Net pay', <strong key="n">{inr(s.netSalary)}</strong>],
                ['Notes', s.notes],
              ]}
            />
            <div className="pacts"><PrintLink kind="payslip" id={s.id} /></div>
            </>
          )}
        />
      </Reveal>
    )

  if (section === 'joining') return <Onboarding uid={uid} profile={profile} />

  if (section === 'documents')
    return (
      <>
        <section className="pblock">
          <TypeText as="h2" className="psub" text="From the office" speed={35} />
          <Reveal>
            <FileList list={shared.list} error={shared.error} />
          </Reveal>
        </section>
        <section className="pblock">
          <TypeText as="h2" className="psub" text="Your uploads" speed={35} />
          <Reveal>
            <DocUpload uid={uid} profile={profile} />
          </Reveal>
          <Reveal>
            <DataList
              list={myDocs.list}
              error={myDocs.error}
              searchable={false}
              empty="Nothing uploaded yet."
              getItem={(d) => ({ title: d.fileName, sub: d.fileType, date: fmtDate(d.submittedAt) })}
              renderBody={(d) => (
                <div className="pacts">
                  <a className="pbtn" href={d.fileUrl} target="_blank" rel="noopener noreferrer"><FiExternalLink /> Open</a>
                </div>
              )}
            />
          </Reveal>
        </section>
      </>
    )

  return null
}

function hours(a) {
  const i = toDate(a.clockIn)
  const o = toDate(a.clockOut)
  if (!i || !o) return null
  const h = (o - i) / 36e5
  return h > 0 ? `${h.toFixed(1)} h` : null
}
