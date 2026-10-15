import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  FiHome, FiFolder, FiCreditCard, FiFileText, FiCalendar, FiSun, FiCheckSquare, FiClock, FiCoffee, FiDollarSign,
  FiUserCheck, FiMessageCircle, FiAlertCircle, FiCheckCircle, FiUploadCloud,
} from 'react-icons/fi'
import DashShell from '../components/dash/DashShell'
import AuthScreen from '../components/dash/AuthScreen'
import { DashHead, KpiRow, KpiCard, Panel, Timeline, NextSteps, Glance, QuickActions, SectionTiles, weekStats } from '../components/dash/widgets'
import useLive from '../components/portal/useLive'
import { inr, fmtDate } from '../components/portal/format'
import usePageTitle from '../hooks/usePageTitle'
import { isFirebaseReady } from '../lib/firebase'
import { watchAuth, watchProfile, signOutUser } from '../lib/api'
import { links } from '../data/site'
import ClientPortal, { CLIENT_SECTIONS } from './portal/ClientPortal'
import EmployeePortal, { EMPLOYEE_SECTIONS, ClockCard } from './portal/EmployeePortal'
import './pages.css'
import './Contact.css'
import './Account.css'
import '../components/portal/portal.css'

const ICONS = {
  overview: FiHome,
  projects: FiFolder,
  invoices: FiCreditCard,
  quotations: FiFileText,
  files: FiFileText,
  meetings: FiCalendar,
  tasks: FiCheckSquare,
  attendance: FiClock,
  leave: FiCoffee,
  payslips: FiDollarSign,
  documents: FiUploadCloud,
  joining: FiUserCheck,
}
const TEXT = {
  projects: 'Follow progress, phases and tasks on your projects.',
  invoices: 'Your invoices — view, print and pay online.',
  quotations: 'Quotes we’ve sent you — accept or decline.',
  files: 'Files and links we’ve shared with you.',
  meetings: 'Book a call or meeting with the Kraftor team.',
  tasks: 'Projects you lead or own a phase in — tick tasks as you finish them.',
  attendance: 'Clock in and out, and see your attendance.',
  leave: 'Request leave and see your requests.',
  payslips: 'Your monthly payslips.',
  documents: 'Files from the office and your uploads.',
  joining: 'Your joining form, documents and status.',
}
const today = () => new Date().toISOString().split('T')[0]
const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0]

const projectRows = (list, go) =>
  (list || [])
    .filter((p) => p.status === 'Active')
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      icon: FiFolder,
      title: p.projectName,
      sub: `${p.progress || 0}% done`,
      start: p.createdAt,
      end: p.deadline ? `${p.deadline}T23:59:59` : null,
      label: `${p.projectName} · ${p.progress || 0}%`,
      onClick: () => go('projects'),
    }))

/* ---------------- Client home ---------------- */

function ClientHome({ uid, profile, go, nav }) {
  const mine = ['clientUid', '==', uid]
  const projects = useLive('projects', { where: mine })
  const invoices = useLive('invoices', { where: mine })
  const quotations = useLive('quotations', { where: mine })
  const files = useLive('shared_documents', { where: ['recipientUid', '==', uid], sortBy: 'sharedAt' })
  const meetings = useLive('meetings', { where: mine })

  const active = (projects.list || []).filter((p) => p.status === 'Active')
  const unpaid = (invoices.list || []).filter((i) => ['Unpaid', 'Overdue'].includes(i.status))
  const due = unpaid.reduce((t, i) => t + (Number(i.total) || 0), 0)
  const sent = (quotations.list || []).filter((q) => q.status === 'Sent')
  const upcoming = (meetings.list || []).filter((m) => m.status !== 'Rejected' && m.date >= today())
  const filesW = weekStats(files.list, (f) => f.sharedAt)
  const paidW = weekStats((invoices.list || []).filter((i) => i.status === 'Paid'), (i) => i.paidAt, (i) => i.total)
  const avgProgress = active.length ? Math.round(active.reduce((t, p) => t + (p.progress || 0), 0) / active.length) : 0

  const steps = [
    ...unpaid.map((i) => ({ id: `inv-${i.id}`, icon: FiCreditCard, tone: i.status === 'Overdue' ? 'pink' : 'orange', title: `Pay ${inr(i.total)}`, sub: `${i.invoiceNumber || i.id}${i.paymentLink ? ' · pay online' : ''}`, priority: i.status === 'Overdue' ? 'High' : 'Medium', onClick: () => go('invoices') })),
    ...sent.map((q) => ({ id: `q-${q.id}`, icon: FiFileText, tone: 'blue', title: `Review quote ${inr(q.total)}`, sub: q.projectName || q.quotationNumber, priority: 'Medium', onClick: () => go('quotations') })),
    ...upcoming.filter((m) => m.status === 'Confirmed').map((m) => ({ id: `m-${m.id}`, icon: FiCalendar, tone: 'purple', title: `Meeting ${fmtDate(m.date)}`, sub: `${m.timeSlot} · ${m.meetingType}`, priority: 'Low', onClick: () => go('meetings') })),
  ]

  return (
    <>
      <DashHead crumb={['Dashboard']} name={profile.name} title={active.length ? `${active.length} project${active.length > 1 ? 's' : ''} in progress` : 'Welcome to your Kraftor space'} text="Your projects, files and billing with Kraftor — all in one place." />
      <div className="dgrid">
        <SectionTiles nav={nav} onNav={go} />
        <KpiRow>
          <KpiCard icon={FiFolder} tone="purple" label="Active projects" value={active.length} note={`${avgProgress}% average progress`} onClick={() => go('projects')} />
          <KpiCard icon={FiCreditCard} tone="orange" label="Amount due" value={inr(due)} note={`${unpaid.length} unpaid invoice${unpaid.length === 1 ? '' : 's'}`} onClick={() => go('invoices')} />
          <KpiCard icon={FiFileText} tone="blue" label="Files shared" value={(files.list || []).length} delta={filesW.delta} series={filesW.series} onClick={() => go('files')} />
          <KpiCard icon={FiCheckCircle} tone="green" label="Paid (7 days)" value={inr(paidW.thisWeek)} series={paidW.series} note="Thank you!" onClick={() => go('invoices')} />
        </KpiRow>
        <Panel title="Project activity" sub="Where your projects stand this week." action="View all" onAction={() => go('projects')}>
          <Timeline rows={projectRows(projects.list, go)} empty="No active projects yet — once we start, you’ll see them here." />
        </Panel>
        <div className="dgrid dgrid--3">
          <Panel title="Next steps">
            <NextSteps items={steps.slice(0, 5)} empty="You’re all set — nothing waiting on you ✨" />
          </Panel>
          <Panel title="At a glance">
            <Glance
              items={[
                { icon: FiFolder, tone: 'purple', value: (projects.list || []).length, label: 'projects', sub: `${active.length} active`, onClick: () => go('projects') },
                { icon: FiFileText, tone: 'blue', value: sent.length, label: 'quotes', sub: 'Waiting for you', onClick: () => go('quotations') },
                { icon: FiCalendar, tone: 'green', value: upcoming.length, label: 'meetings', sub: 'Coming up', onClick: () => go('meetings') },
                { icon: FiCreditCard, tone: 'orange', value: unpaid.length, label: 'to pay', sub: inr(due), onClick: () => go('invoices') },
              ]}
            />
          </Panel>
          <QuickActions
            name={profile.name}
            actions={[
              { icon: FiCalendar, label: 'Book a meeting', onClick: () => go('meetings') },
              { icon: FiCreditCard, label: 'Pay an invoice', onClick: () => go('invoices') },
              { icon: FiMessageCircle, label: 'WhatsApp us', onClick: () => window.open(links.whatsapp, '_blank', 'noopener') },
            ]}
            suggestions={[
              { label: 'How far along is my project?', onClick: () => go('projects') },
              { label: 'Where are my files?', onClick: () => go('files') },
            ]}
            onSearch={(q) => {
              const hit = CLIENT_SECTIONS.find((s) => s.label.toLowerCase().includes(q.toLowerCase()))
              if (hit) go(hit.key)
            }}
          />
        </div>
      </div>
    </>
  )
}

/* ---------------- Employee home ---------------- */

function EmployeeHome({ uid, profile, go, nav }) {
  const attendance = useLive('attendance', { where: ['uid', '==', uid], sortBy: 'date' })
  const lead = useLive('projects', { where: ['assignedToUid', '==', uid] })
  const phase = useLive('projects', { where: ['phaseAssignees', 'array-contains', uid] })
  const leaves = useLive('leave_requests', { where: ['uid', '==', uid] })
  const slips = useLive('salary_slips', { where: ['employeeUid', '==', uid] })
  const joining = useLive('employee_applications', { where: ['uid', '==', uid], sortBy: 'submittedAt' })

  const projects = useMemo(() => {
    const m = new Map()
    for (const p of [...(lead.list || []), ...(phase.list || [])]) m.set(p.id, p)
    return [...m.values()]
  }, [lead.list, phase.list])

  const openTasks = projects.flatMap((p) => (p.phases || []).flatMap((ph) => (ph.tasks || []).filter((t) => !t.completed).map((t) => ({ ...t, project: p }))))
  const doneW = weekStats(projects.flatMap((p) => (p.phases || []).flatMap((ph) => (ph.tasks || []).filter((t) => t.completed))), (t) => t.completedAt)
  const attW = weekStats((attendance.list || []).filter((a) => a.clockIn), (a) => a.date)
  const month = today().slice(0, 7)
  const daysIn = (attendance.list || []).filter((a) => a.date?.startsWith(month) && a.clockIn).length
  const pendingLeave = (leaves.list || []).filter((l) => l.status === 'Pending Approval')
  const latestJoin = (joining.list || [])[0]
  const clockedIn = (attendance.list || []).find((a) => a.date === today())

  const soon = inDays(3)
  const steps = [
    !clockedIn && { id: 'clock', icon: FiClock, tone: 'orange', title: 'Clock in for today', sub: 'Start your day', priority: 'High', onClick: () => go('attendance') },
    ...openTasks
      .filter((t) => t.dueDate && t.dueDate <= soon)
      .slice(0, 3)
      .map((t) => ({ id: `t-${t.id}`, icon: FiCheckSquare, tone: t.dueDate < today() ? 'pink' : 'purple', title: t.name, sub: `${t.project.projectName} · due ${fmtDate(t.dueDate)}`, priority: t.dueDate < today() ? 'High' : 'Medium', onClick: () => go('tasks') })),
    (!latestJoin || latestJoin.status === 'Rejected') && { id: 'join', icon: FiUserCheck, tone: 'blue', title: 'Fill in your joining form', sub: 'Needed for onboarding', priority: 'Medium', onClick: () => go('joining') },
    latestJoin?.status === 'Awaiting Stamped Copy' && !latestJoin.attestedFileUrl && { id: 'stamp', icon: FiUploadCloud, tone: 'blue', title: 'Upload your stamped joining form', sub: 'The office has reviewed it', priority: 'High', onClick: () => go('joining') },
    ...pendingLeave.map((l) => ({ id: `l-${l.id}`, icon: FiCoffee, tone: 'green', title: `${l.type} — waiting`, sub: l.duration, priority: 'Low', onClick: () => go('leave') })),
  ].filter(Boolean)

  return (
    <>
      <DashHead crumb={['Dashboard']} name={profile.name} title={openTasks.length ? `${openTasks.length} open task${openTasks.length > 1 ? 's' : ''} on your plate` : 'You’re all caught up'} text="Your day, tasks and HR in one place." />
      <div className="dgrid">
        <SectionTiles nav={nav} onNav={go} />
        <Panel title="Today">
          <ClockCard uid={uid} profile={profile} attendance={attendance.list} />
        </Panel>
        <KpiRow>
          <KpiCard icon={FiCheckSquare} tone="purple" label="Open tasks" value={openTasks.length} note={`${doneW.thisWeek} done this week`} series={doneW.series} onClick={() => go('tasks')} />
          <KpiCard icon={FiFolder} tone="blue" label="Projects" value={projects.filter((p) => p.status === 'Active').length} note="active" onClick={() => go('tasks')} />
          <KpiCard icon={FiClock} tone="orange" label="Days in this month" value={daysIn} series={attW.series} delta={attW.delta} onClick={() => go('attendance')} />
          <KpiCard icon={FiCoffee} tone="green" label="Leave" value={pendingLeave.length} note="waiting for approval" onClick={() => go('leave')} />
        </KpiRow>
        <Panel title="Project activity" sub="Your projects this week." action="All tasks" onAction={() => go('tasks')}>
          <Timeline rows={projectRows(projects, (k) => go(k === 'projects' ? 'tasks' : k))} empty="No projects assigned to you yet." />
        </Panel>
        <div className="dgrid dgrid--3">
          <Panel title="Next steps">
            <NextSteps items={steps.slice(0, 5)} />
          </Panel>
          <Panel title="At a glance">
            <Glance
              items={[
                { icon: FiCheckSquare, tone: 'purple', value: openTasks.length, label: 'tasks', sub: 'Still open', onClick: () => go('tasks') },
                { icon: FiClock, tone: 'orange', value: daysIn, label: 'days', sub: 'In this month', onClick: () => go('attendance') },
                { icon: FiDollarSign, tone: 'green', value: (slips.list || []).length, label: 'payslips', sub: 'Issued to you', onClick: () => go('payslips') },
                { icon: FiAlertCircle, tone: 'blue', value: latestJoin?.status || 'Not sent', label: '', sub: 'Joining form', onClick: () => go('joining') },
              ]}
            />
          </Panel>
          <QuickActions
            name={profile.name}
            actions={[
              { icon: FiCheckSquare, label: 'My tasks', onClick: () => go('tasks') },
              { icon: FiCoffee, label: 'Request leave', onClick: () => go('leave') },
              { icon: FiUploadCloud, label: 'Upload document', onClick: () => go('documents') },
            ]}
            suggestions={[
              { label: 'Where is my latest payslip?', onClick: () => go('payslips') },
              { label: 'What’s my joining status?', onClick: () => go('joining') },
            ]}
            onSearch={(q) => {
              const hit = EMPLOYEE_SECTIONS.find((s) => s.label.toLowerCase().includes(q.toLowerCase()))
              if (hit) go(hit.key)
            }}
          />
        </div>
      </div>
    </>
  )
}

/* ---------------- Page ---------------- */

export default function Portal() {
  usePageTitle('Dashboard')
  const [user, setUser] = useState(undefined)
  const [profile, setProfile] = useState(undefined)
  const [section, setSection] = useState('overview')

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

  if (!isFirebaseReady || user === null) return <Navigate to="/login" replace />
  if (user === undefined || profile === undefined)
    return (
      <AuthScreen>
        <p className="muted">Loading your dashboard…</p>
      </AuthScreen>
    )
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />
  // No profile yet (waiting for approval) or turned off — /login explains what's going on
  if (!profile || profile.status === 'inactive' || !['client', 'employee'].includes(profile.role)) return <Navigate to="/login" replace />

  const isClient = profile.role === 'client'
  const sections = isClient ? CLIENT_SECTIONS : EMPLOYEE_SECTIONS
  const nav = sections.map((s) => ({ ...s, icon: s.key === 'overview' ? (isClient ? FiHome : FiSun) : ICONS[s.key] }))
  const go = (k) => {
    setSection(k)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const current = nav.find((n) => n.key === section) || nav[0]

  return (
    <DashShell
      tagline={isClient ? 'Client space' : 'Team space'}
      nav={nav}
      active={section}
      onNav={go}
      user={{ name: profile.name, role: isClient ? profile.company || 'Client' : profile.title || 'Team member', email: user.email, avatar: profile.avatar || profile.logoUrl }}
      onSignOut={signOutUser}
    >
      {section === 'overview' ? (
        isClient ? (
          <ClientHome uid={user.uid} profile={profile} go={go} nav={nav} />
        ) : (
          <EmployeeHome uid={user.uid} profile={profile} go={go} nav={nav} />
        )
      ) : (
        <div key={section}>
          <DashHead crumb={['Dashboard', current.label]} title={current.label} text={TEXT[section]} />
          <div className="dgrid">
            <Panel>
              {isClient ? (
                <ClientPortal uid={user.uid} profile={profile} section={section} setSection={go} />
              ) : (
                <EmployeePortal uid={user.uid} profile={profile} section={section} setSection={go} />
              )}
            </Panel>
          </div>
        </div>
      )}
    </DashShell>
  )
}
