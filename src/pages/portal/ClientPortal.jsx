import { useState } from 'react'
import { FiExternalLink, FiCheck, FiX, FiCalendar, FiCreditCard } from 'react-icons/fi'
import Reveal from '../../components/ui/Reveal'
import TypeText from '../../components/ui/TypeText'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import DataList, { Details, Pill, Progress, PrintLink } from '../../components/portal/DataList'
import useLive from '../../components/portal/useLive'
import { fmtDate, inr } from '../../components/portal/format'
import { updateItem } from '../../lib/api'
import { bookMeeting } from '../../lib/portal'

export const CLIENT_SECTIONS = [
  { key: 'overview', label: 'Overview' },
  { key: 'projects', label: 'Projects' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'quotations', label: 'Quotations' },
  { key: 'files', label: 'Files' },
  { key: 'meetings', label: 'Meetings' },
]

/* ---------- Shared bits ---------- */

/** Project list row: name, progress bar, status and deadline. */
export const projectItem = (p) => ({
  title: p.projectName,
  sub: <Progress value={p.progress} />,
  status: p.status,
  date: p.deadline && `Due ${fmtDate(p.deadline)}`,
})

export function ProjectBody({ p, onToggleTask, children }) {
  const phases = p.phases || []
  return (
    <>
      <Details
        rows={[
          ['Progress', <Progress key="p" value={p.progress} />],
          ['Status', p.status],
          ['Deadline', p.deadline && fmtDate(p.deadline)],
          ['Client', p.clientName],
          ['Lead', p.assignedToName || p.assignedToEmail],
          ['About', p.description],
        ]}
      />
      {phases.map((ph) => (
        <div key={ph.id} className="pphase">
          <p className="pphase__name">
            {ph.name}
            {ph.dueDate && <small> · due {fmtDate(ph.dueDate)}</small>}
            {ph.assignedToName && <small> · {ph.assignedToName}</small>}
          </p>
          {(ph.tasks || []).length === 0 ? (
            <p className="muted pphase__empty">No tasks yet.</p>
          ) : (
            <ul className="ptasks">
              {ph.tasks.map((t) => (
                <li key={t.id} className={t.completed ? 'is-done' : ''}>
                  {onToggleTask ? (
                    <label>
                      <input type="checkbox" checked={!!t.completed} onChange={() => onToggleTask(p, ph, t)} />
                      <span>{t.name}</span>
                    </label>
                  ) : (
                    <span className="ptasks__static">
                      <span className="ptasks__dot" aria-hidden="true">{t.completed ? <FiCheck /> : null}</span>
                      <span>{t.name}</span>
                    </span>
                  )}
                  {t.dueDate && <small>{fmtDate(t.dueDate)}</small>}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      {children}
    </>
  )
}

export function MoneyBody({ d }) {
  return (
    <>
      <table className="ptable">
        <thead>
          <tr>
            <th>Item</th>
            <th className="num">Qty</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(d.lineItems || []).map((li, i) => (
            <tr key={i}>
              <td>{li.description}</td>
              <td className="num">{li.qty}</td>
              <td className="num">{inr(li.amount ?? (Number(li.qty) || 0) * (Number(li.rate) || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Details
        rows={[
          ['Subtotal', inr(d.subtotal)],
          ['Discount', d.discountAmount ? `− ${inr(d.discountAmount)} (${d.discountPercent}%)` : null],
          ['GST', d.gstAmount ? `${inr(d.gstAmount)} (${d.gstPercent}%)` : null],
          ['Gateway fee', d.gatewayChargeEnabled ? inr(d.gatewayChargeAmount) : null],
          ['Total', <strong key="t">{inr(d.total)}</strong>],
          ['Due', d.dueDate && fmtDate(d.dueDate)],
          ['Valid until', d.validUntil && fmtDate(d.validUntil)],
          ['Paid on', d.paidAt && fmtDate(d.paidAt)],
          ['Notes', d.notes],
        ]}
      />
    </>
  )
}

export function FileList({ list, error }) {
  return (
    <DataList
      list={list}
      error={error}
      empty="No files shared with you yet."
      getItem={(f) => ({ title: f.fileName, sub: f.fileType, date: fmtDate(f.sharedAt || f.submittedAt) })}
      renderBody={(f) => (
        <div className="pacts">
          <a className="pbtn pbtn--primary" href={f.fileUrl} target="_blank" rel="noopener noreferrer">
            <FiExternalLink /> Open
          </a>
        </div>
      )}
    />
  )
}

/* ---------- Meetings ---------- */

const slots = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
const meetingTypes = ['Video Call', 'Phone Call', 'In Person']

function MeetingForm({ profile, uid }) {
  const today = new Date().toISOString().split('T')[0]
  const [f, setF] = useState({ date: '', timeSlot: '', meetingType: 'Video Call', agenda: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ ok: false, text: '' })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!f.date || !f.timeSlot) return setMsg({ ok: false, text: 'Pick a date and a time.' })
    setBusy(true)
    setMsg({ ok: false, text: '' })
    try {
      await bookMeeting({ clientUid: uid, clientName: profile.name, clientEmail: profile.email, ...f })
      setF({ date: '', timeSlot: '', meetingType: 'Video Call', agenda: '' })
      setMsg({ ok: true, text: 'Request sent. We’ll confirm it soon.' })
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
          <label htmlFor="m-date">Date</label>
          <input id="m-date" type="date" min={today} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="m-slot">Time</label>
          <Select variant="line" id="m-slot" value={f.timeSlot} onChange={(v) => setF({ ...f, timeSlot: v })} options={slots} placeholder="Choose a time" />
        </div>
        <div className="field">
          <label htmlFor="m-type">Type</label>
          <Select variant="line" id="m-type" value={f.meetingType} onChange={(v) => setF({ ...f, meetingType: v })} options={meetingTypes} />
        </div>
        <div className="field">
          <label htmlFor="m-agenda">Agenda <span className="field__opt">(optional)</span></label>
          <input id="m-agenda" type="text" value={f.agenda} onChange={(e) => setF({ ...f, agenda: e.target.value })} placeholder="What would you like to discuss?" />
        </div>
      </div>
      <Button type="submit" iconRight={<FiCalendar />} className="form__submit" disabled={busy}>
        {busy ? 'Sending…' : 'Request meeting'}
      </Button>
      {msg.text && <p className={msg.ok ? 'acct-ok' : 'form__error'} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}
    </form>
  )
}

/* ---------- Portal ---------- */

export default function ClientPortal({ uid, profile, section, setSection }) {
  const mine = ['clientUid', '==', uid]
  const projects = useLive('projects', { where: mine })
  const invoices = useLive('invoices', { where: mine })
  const quotations = useLive('quotations', { where: mine })
  const files = useLive('shared_documents', { where: ['recipientUid', '==', uid], sortBy: 'sharedAt' })
  const meetings = useLive('meetings', { where: mine })

  const [busyId, setBusyId] = useState(null)
  const answerQuote = async (q, status) => {
    if (!window.confirm(`${status === 'Accepted' ? 'Accept' : 'Decline'} quotation ${q.quotationNumber || q.id}?`)) return
    setBusyId(q.id)
    try {
      await updateItem('quotations', q.id, { status })
    } finally {
      setBusyId(null)
    }
  }

  if (section === 'overview') {
    const active = (projects.list || []).filter((p) => p.status === 'Active')
    const unpaid = (invoices.list || []).filter((i) => ['Unpaid', 'Overdue'].includes(i.status))
    const due = unpaid.reduce((s, i) => s + (Number(i.total) || 0), 0)
    const upcoming = (meetings.list || []).filter((m) => m.status !== 'Rejected' && m.date >= new Date().toISOString().split('T')[0])
    const stats = [
      { k: 'projects', label: 'Active projects', value: active.length },
      { k: 'invoices', label: 'Amount due', value: inr(due), note: `${unpaid.length} unpaid` },
      { k: 'files', label: 'Files', value: (files.list || []).length },
      { k: 'meetings', label: 'Meetings', value: upcoming.length, note: 'upcoming' },
    ]
    return (
      <>
        <Reveal stagger className="pstats">
          {stats.map((s) => (
            <button key={s.k} type="button" className="pstat" onClick={() => setSection(s.k)}>
              <small>{s.label}</small>
              <strong>{s.value}</strong>
              {s.note && <span>{s.note}</span>}
            </button>
          ))}
        </Reveal>
        <section className="pblock">
          <TypeText as="h2" className="psub" text="Your projects" speed={35} />
          <Reveal>
            <DataList
              list={projects.list}
              error={projects.error}
              searchable={false}
              empty="No projects yet. Once we start your project, you can follow it here."
              getItem={projectItem}
              renderBody={(p) => <ProjectBody p={p} />}
            />
          </Reveal>
        </section>
      </>
    )
  }

  if (section === 'projects')
    return (
      <Reveal>
        <DataList
          list={projects.list}
          error={projects.error}
          statuses={['Active', 'Completed']}
          empty="No projects yet."
          getItem={projectItem}
          renderBody={(p) => <ProjectBody p={p} />}
        />
      </Reveal>
    )

  if (section === 'invoices')
    return (
      <Reveal>
        <DataList
          list={invoices.list}
          error={invoices.error}
          statuses={['Unpaid', 'Overdue', 'Paid', 'Cancelled']}
          empty="No invoices yet."
          getItem={(d) => ({ title: `${d.invoiceNumber || d.id} · ${inr(d.total)}`, sub: [d.projectName, d.paymentLink && ['Unpaid', 'Overdue'].includes(d.status) && 'Pay online'].filter(Boolean).join(' · '), status: d.status, date: fmtDate(d.createdAt) })}
          renderBody={(d) => (
            <>
              <MoneyBody d={d} />
              <div className="pacts"><PrintLink kind="invoice" id={d.id} /></div>
              {['Unpaid', 'Overdue'].includes(d.status) &&
                (d.paymentLink ? (
                  <div className="pacts ppay">
                    <a className="pbtn pbtn--primary" href={d.paymentLink} target="_blank" rel="noopener noreferrer">
                      <FiCreditCard /> Pay {inr(d.total)} now
                    </a>
                    <span className="muted pnote-sm">Secure payment by Razorpay — UPI, cards, net banking. We’ll mark it paid once it comes through.</span>
                  </div>
                ) : (
                  <p className="muted pnote-sm">To pay this invoice, please <a href="/contact">contact us</a> — we’ll send you a payment link.</p>
                ))}
            </>
          )}
        />
      </Reveal>
    )

  if (section === 'quotations')
    return (
      <Reveal>
        <DataList
          list={quotations.list}
          error={quotations.error}
          statuses={['Sent', 'Accepted', 'Declined']}
          empty="No quotations yet."
          getItem={(d) => ({ title: `${d.quotationNumber || d.id} · ${inr(d.total)}`, sub: d.projectName, status: d.status, date: fmtDate(d.createdAt) })}
          renderBody={(d) => (
            <>
              <MoneyBody d={d} />
              <div className="pacts">
                <PrintLink kind="quotation" id={d.id} />
              {d.status === 'Sent' && (
                <>
                  <button type="button" className="pbtn pbtn--primary" disabled={busyId === d.id} onClick={() => answerQuote(d, 'Accepted')}>
                    <FiCheck /> Accept
                  </button>
                  <button type="button" className="pbtn pbtn--danger" disabled={busyId === d.id} onClick={() => answerQuote(d, 'Declined')}>
                    <FiX /> Decline
                  </button>
                </>
              )}
              </div>
            </>
          )}
        />
      </Reveal>
    )

  if (section === 'files')
    return (
      <Reveal>
        <FileList list={files.list} error={files.error} />
      </Reveal>
    )

  if (section === 'meetings')
    return (
      <>
        <section className="pblock">
          <TypeText as="h2" className="psub" text="Book a meeting" speed={35} />
          <Reveal>
            <MeetingForm profile={profile} uid={uid} />
          </Reveal>
        </section>
        <section className="pblock">
          <TypeText as="h2" className="psub" text="Your meetings" speed={35} />
          <Reveal>
            <DataList
              list={meetings.list}
              error={meetings.error}
              searchable={false}
              empty="No meetings yet."
              getItem={(m) => ({ title: `${fmtDate(m.date)} · ${m.timeSlot}`, sub: m.meetingType, status: m.status })}
              renderBody={(m) => (
                <>
                  <Details rows={[['Agenda', m.agenda], ['Note from us', m.adminNote]]} />
                  {m.meetingLink && (
                    <div className="pacts">
                      <a className="pbtn pbtn--primary" href={m.meetingLink} target="_blank" rel="noopener noreferrer">
                        <FiExternalLink /> Join meeting
                      </a>
                    </div>
                  )}
                </>
              )}
            />
          </Reveal>
        </section>
      </>
    )

  return <Pill>{section}</Pill>
}
