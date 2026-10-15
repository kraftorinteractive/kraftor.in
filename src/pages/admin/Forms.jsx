import { useEffect, useMemo, useState } from 'react'
import { FiPlus, FiTrash2, FiX, FiCheck, FiUploadCloud } from 'react-icons/fi'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import { inr } from '../../components/portal/format'
import { uploadFile, MAX_UPLOAD_MB } from '../../lib/cloudinary'
import {
  createProject, addPhase, removePhase, addTask, removeTask, assignPhase, reassignProject, updateProject,
  calcTotals, createMoneyDoc, createSalarySlip, shareFile, getSettings, saveSettings, GATEWAY_RATE,
  setPaymentLink, isRazorpayLink,
} from '../../lib/admin'
import { removeItem } from '../../lib/api'
import './forms.css'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/* ---------------- helpers ---------------- */

function useRun() {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ ok: false, text: '' })
  const run = async (fn, okText) => {
    setMsg({ ok: false, text: '' })
    setBusy(true)
    try {
      const r = await fn()
      if (okText) setMsg({ ok: true, text: typeof okText === 'function' ? okText(r) : okText })
      return r
    } catch (e) {
      setMsg({ ok: false, text: e?.message && !e.code ? e.message : 'That didn’t work. Check your connection and try again.' })
    } finally {
      setBusy(false)
    }
  }
  return { busy, msg, run, setMsg }
}

function Msg({ msg }) {
  if (!msg.text) return null
  return <p className={msg.ok ? 'acct-ok' : 'form__error'} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>
}

/** "New …" button that opens a form in place. */
export function Opener({ label, children, done }) {
  const [open, setOpen] = useState(false)
  if (!open)
    return (
      <div className="pacts padd">
        <button type="button" className="pbtn pbtn--primary" onClick={() => setOpen(true)}><FiPlus /> {label}</button>
        {done}
      </div>
    )
  return (
    <div className="aform padd">
      <div className="aform__head">
        <strong>{label}</strong>
        <button type="button" className="pbtn" onClick={() => setOpen(false)} aria-label="Close"><FiX /></button>
      </div>
      {children(() => setOpen(false))}
    </div>
  )
}

const userLabel = (u) => `${u.name || u.email}${u.company ? ` — ${u.company}` : ''}`
const userOptions = (list) => list.map((u) => ({ value: u.id, label: userLabel(u) }))

function Field({ label, id, children, full }) {
  return (
    <div className={`field${full ? ' form__full' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  )
}

/* ---------------- Projects ---------------- */

export function NewProject({ clients, employees }) {
  const [f, setF] = useState({ client: '', lead: '', projectName: '', description: '', deadline: '', usePhases: false })
  const { busy, msg, run } = useRun()
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  return (
    <Opener label="New project">
      {(close) => (
        <form
          className="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            const client = clients.find((c) => c.id === f.client)
            if (!client || !f.projectName.trim()) return run(async () => { throw new Error('Choose a client and give the project a name.') })
            run(async () => {
              await createProject({ ...f, client, lead: employees.find((x) => x.id === f.lead) })
              close()
            })
          }}
        >
          <div className="form__grid">
            <Field label="Client" id="np-client">
              <Select variant="line" id="np-client" value={f.client} onChange={(v) => setF({ ...f, client: v })} options={userOptions(clients)} placeholder="Choose a client" />
            </Field>
            <Field label="Lead (employee)" id="np-lead">
              <Select variant="line" id="np-lead" value={f.lead} onChange={(v) => setF({ ...f, lead: v })} options={userOptions(employees)} placeholder="Choose a team member" />
            </Field>
            <Field label="Project name" id="np-name"><input id="np-name" value={f.projectName} onChange={set('projectName')} /></Field>
            <Field label="Deadline" id="np-dl"><input id="np-dl" type="date" value={f.deadline} onChange={set('deadline')} /></Field>
            <Field label="About the project" id="np-desc" full><textarea id="np-desc" rows={3} value={f.description} onChange={set('description')} /></Field>
            <label className="check form__full">
              <input type="checkbox" checked={f.usePhases} onChange={set('usePhases')} />
              <span>Split into phases (each phase can have its own person and due date)</span>
            </label>
          </div>
          <Button type="submit" className="form__submit" disabled={busy}>{busy ? 'Creating…' : 'Create project'}</Button>
          <Msg msg={msg} />
        </form>
      )}
    </Opener>
  )
}

/** Admin controls inside an opened project: lead, deadline, phases, tasks. */
export function ProjectEditor({ p, employees }) {
  const { busy, msg, run } = useRun()
  const [task, setTask] = useState({})
  const [phase, setPhase] = useState({ name: '', dueDate: '' })
  const empOpts = [{ value: '', label: 'Nobody' }, ...userOptions(employees)]
  const emp = (id) => employees.find((e) => e.id === id) || null

  return (
    <div className="aedit">
      <div className="aedit__row">
        <label className="plabel">
          <span>Lead</span>
          <select className="pselect" value={p.assignedToUid || ''} disabled={busy} onChange={(e) => run(() => reassignProject(p.id, emp(e.target.value)))}>
            {empOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="plabel">
          <span>Deadline</span>
          <input className="pselect" type="date" value={p.deadline || ''} disabled={busy} onChange={(e) => run(() => updateProject(p.id, { deadline: e.target.value || null }))} />
        </label>
      </div>

      {(p.phases || []).map((ph) => (
        <div key={ph.id} className="aedit__phase">
          <div className="aedit__phasehead">
            <strong>{ph.name}</strong>
            <label className="plabel">
              <span>Owner</span>
              <select className="pselect" value={ph.assignedToUid || ''} disabled={busy} onChange={(e) => run(() => assignPhase(p.id, ph.id, emp(e.target.value)))}>
                {empOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            {(p.phases || []).length > 1 && (
              <button type="button" className="pbtn pbtn--danger" disabled={busy} onClick={() => window.confirm(`Remove "${ph.name}" and its tasks?`) && run(() => removePhase(p.id, ph.id))} aria-label={`Remove ${ph.name}`}>
                <FiTrash2 />
              </button>
            )}
          </div>
          <ul className="aedit__tasks">
            {(ph.tasks || []).map((t) => (
              <li key={t.id} className={t.completed ? 'is-done' : ''}>
                <span>{t.completed ? <FiCheck aria-label="Done" /> : null} {t.name}</span>
                <button type="button" className="aedit__x" disabled={busy} onClick={() => run(() => removeTask(p.id, ph.id, t.id))} aria-label={`Remove task ${t.name}`}><FiX /></button>
              </li>
            ))}
          </ul>
          <form
            className="aedit__add"
            onSubmit={(e) => {
              e.preventDefault()
              const v = (task[ph.id] || '').trim()
              if (!v) return
              run(async () => {
                await addTask(p.id, ph.id, { name: v })
                setTask({ ...task, [ph.id]: '' })
              })
            }}
          >
            <input value={task[ph.id] || ''} onChange={(e) => setTask({ ...task, [ph.id]: e.target.value })} placeholder="Add a task…" aria-label={`New task in ${ph.name}`} />
            <button type="submit" className="pbtn" disabled={busy}><FiPlus /> Add</button>
          </form>
        </div>
      ))}

      {p.usePhases && (
        <form
          className="aedit__add aedit__add--phase"
          onSubmit={(e) => {
            e.preventDefault()
            run(async () => {
              await addPhase(p.id, phase)
              setPhase({ name: '', dueDate: '' })
            })
          }}
        >
          <input value={phase.name} onChange={(e) => setPhase({ ...phase, name: e.target.value })} placeholder="New phase name" aria-label="New phase name" />
          <input type="date" value={phase.dueDate} onChange={(e) => setPhase({ ...phase, dueDate: e.target.value })} aria-label="Phase due date" />
          <button type="submit" className="pbtn" disabled={busy}><FiPlus /> Phase</button>
        </form>
      )}

      <div className="pacts">
        <button type="button" className="pbtn pbtn--danger" disabled={busy} onClick={() => window.confirm(`Delete project "${p.projectName}"? This can’t be undone.`) && run(() => removeItem('projects', p.id))}>
          <FiTrash2 /> Delete project
        </button>
      </div>
      <Msg msg={msg} />
    </div>
  )
}

/* ---------------- Invoices & quotations ---------------- */

const blankLine = () => ({ description: '', qty: 1, rate: '' })

export function MoneyForm({ kind, clients, projects }) {
  const isInv = kind === 'invoice'
  const [defaults, setDefaults] = useState({ gst: 18, dueDays: 15, terms: '' })
  const [f, setF] = useState({ client: '', projectName: '', discountPercent: 0, gstPercent: 18, gateway: false, notes: '', date: '', paymentLink: '' })
  const [lines, setLines] = useState([blankLine()])
  const { busy, msg, run } = useRun()

  useEffect(() => {
    getSettings()
      .then((s) => {
        const gst = s.defaultGstPercent ?? s.defaultGst ?? 18
        setDefaults({ gst, dueDays: s.dueDays || 15, terms: s.defaultTerms || '' })
        setF((x) => ({ ...x, gstPercent: gst }))
      })
      .catch(() => {})
  }, [])

  const totals = useMemo(() => calcTotals(lines, f), [lines, f])
  const clientProjects = (projects || []).filter((p) => p.clientUid === f.client)
  const setLine = (i, k, v) => setLines(lines.map((l, j) => (j === i ? { ...l, [k]: v } : l)))

  const submit = (close) => (e) => {
    e.preventDefault()
    const client = clients.find((c) => c.id === f.client)
    const valid = lines.filter((l) => l.description.trim() && Number(l.qty) > 0 && Number(l.rate) >= 0 && l.rate !== '')
    if (!client) return run(async () => { throw new Error('Choose a client.') })
    if (!valid.length || valid.length !== lines.length) return run(async () => { throw new Error('Fill in every line: description, quantity and rate.') })
    run(
      async () => {
        const n = await createMoneyDoc(kind, { ...f, client, lines: valid })
        setLines([blankLine()])
        setF({ ...f, projectName: '', notes: '', date: '', discountPercent: 0, paymentLink: '' })
        close()
        return n
      },
      (n) => `${isInv ? 'Invoice' : 'Quotation'} ${n} created.`
    )
  }

  return (
    <Opener label={isInv ? 'New invoice' : 'New quotation'} done={<Msg msg={msg} />}>
      {(close) => (
        <form className="form" noValidate onSubmit={submit(close)}>
          <div className="form__grid">
            <Field label="Client" id={`${kind}-client`}>
              <Select variant="line" id={`${kind}-client`} value={f.client} onChange={(v) => setF({ ...f, client: v })} options={userOptions(clients)} placeholder="Choose a client" />
            </Field>
            <Field label="Project" id={`${kind}-proj`}>
              <input id={`${kind}-proj`} list={`${kind}-projlist`} value={f.projectName} onChange={(e) => setF({ ...f, projectName: e.target.value })} placeholder="Project name" />
              <datalist id={`${kind}-projlist`}>{clientProjects.map((p) => <option key={p.id} value={p.projectName} />)}</datalist>
            </Field>
          </div>

          <div className="alines" role="group" aria-label="Line items">
            <div className="alines__head" aria-hidden="true"><span>Item</span><span>Qty</span><span>Rate (₹)</span><span>Amount</span><span /></div>
            {lines.map((l, i) => (
              <div className="alines__row" key={i}>
                <input value={l.description} onChange={(e) => setLine(i, 'description', e.target.value)} placeholder="Service description" aria-label={`Line ${i + 1} description`} />
                <input type="number" min="0" step="0.01" inputMode="decimal" value={l.qty} onChange={(e) => setLine(i, 'qty', e.target.value)} aria-label={`Line ${i + 1} quantity`} />
                <input type="number" min="0" step="0.01" inputMode="decimal" value={l.rate} onChange={(e) => setLine(i, 'rate', e.target.value)} placeholder="0" aria-label={`Line ${i + 1} rate`} />
                <span className="alines__amt">{inr((Number(l.qty) || 0) * (Number(l.rate) || 0))}</span>
                <button type="button" className="aedit__x" onClick={() => setLines(lines.length > 1 ? lines.filter((_, j) => j !== i) : [blankLine()])} aria-label={`Remove line ${i + 1}`}><FiX /></button>
              </div>
            ))}
            <button type="button" className="pbtn" onClick={() => setLines([...lines, blankLine()])}><FiPlus /> Add line</button>
          </div>

          <div className="form__grid">
            <Field label="Discount %" id={`${kind}-disc`}><input id={`${kind}-disc`} type="number" min="0" max="100" value={f.discountPercent} onChange={(e) => setF({ ...f, discountPercent: e.target.value })} /></Field>
            <Field label="GST %" id={`${kind}-gst`}><input id={`${kind}-gst`} type="number" min="0" max="28" value={f.gstPercent} onChange={(e) => setF({ ...f, gstPercent: e.target.value })} /></Field>
            <Field label={isInv ? 'Due date' : 'Valid until'} id={`${kind}-date`}>
              <input id={`${kind}-date`} type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
              {isInv && !f.date && <span className="field__hint">Empty = Net {defaults.dueDays} days</span>}
            </Field>
            <label className="check">
              <input type="checkbox" checked={f.gateway} onChange={(e) => setF({ ...f, gateway: e.target.checked })} />
              <span>Add payment-gateway fee ({(GATEWAY_RATE * 100).toFixed(2)}%)</span>
            </label>
            {isInv && (
              <Field label="Razorpay payment link (optional)" id="invoice-paylink" full>
                <input id="invoice-paylink" type="url" inputMode="url" value={f.paymentLink} onChange={(e) => setF({ ...f, paymentLink: e.target.value })} placeholder="https://rzp.io/rzp/…" />
                <span className="field__hint">You can also add it later from the invoice, once you know the final total.</span>
              </Field>
            )}
            <Field label="Notes" id={`${kind}-notes`} full><textarea id={`${kind}-notes`} rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder={defaults.terms || 'Thank you for your business.'} /></Field>
          </div>

          <dl className="atotals">
            <div><dt>Subtotal</dt><dd>{inr(totals.subtotal)}</dd></div>
            {totals.discountAmount > 0 && <div><dt>Discount ({totals.discountPercent}%)</dt><dd>− {inr(totals.discountAmount)}</dd></div>}
            {totals.gstAmount > 0 && <div><dt>GST ({totals.gstPercent}%)</dt><dd>{inr(totals.gstAmount)}</dd></div>}
            {totals.gatewayChargeEnabled && <div><dt>Gateway fee</dt><dd>{inr(totals.gatewayChargeAmount)}</dd></div>}
            <div className="atotals__total"><dt>Total</dt><dd>{inr(totals.total)}</dd></div>
          </dl>

          <Button type="submit" className="form__submit" disabled={busy}>{busy ? 'Creating…' : isInv ? 'Create invoice' : 'Create quotation'}</Button>
          <Msg msg={msg} />
        </form>
      )}
    </Opener>
  )
}

/**
 * Razorpay payment link on an existing invoice. Shows the exact amount and reference to use when creating
 * the link in the Razorpay dashboard, then saves the link so the client gets a "Pay now" button.
 */
export function PaymentLinkEditor({ inv }) {
  const [link, setLink] = useState(inv.paymentLink || '')
  const [copied, setCopied] = useState('')
  const { busy, msg, run } = useRun()
  const amount = Number(inv.total || 0).toFixed(2)
  const ref = inv.invoiceNumber || inv.id
  const copy = (k, v) =>
    navigator.clipboard?.writeText(v).then(
      () => {
        setCopied(k)
        setTimeout(() => setCopied(''), 1500)
      },
      () => {}
    )
  const changed = link.trim() !== (inv.paymentLink || '')

  return (
    <div className="apay">
      <p className="apay__title">Online payment (Razorpay)</p>
      {!inv.paymentLink && (
        <ol className="apay__steps">
          <li>
            Open <a href="https://dashboard.razorpay.com/app/paymentlinks" target="_blank" rel="noopener noreferrer">Razorpay → Payment Links</a> and create a link.
          </li>
          <li>
            Amount <button type="button" className="apay__copy" onClick={() => copy('amt', amount)}>₹{Number(amount).toLocaleString('en-IN')} {copied === 'amt' ? '✓' : 'copy'}</button> · Reference{' '}
            <button type="button" className="apay__copy" onClick={() => copy('ref', ref)}>{ref} {copied === 'ref' ? '✓' : 'copy'}</button>
            {inv.clientEmail ? ` · Customer ${inv.clientEmail}` : ''}
          </li>
          <li>Paste the link here. The client sees a Pay now button right away.</li>
        </ol>
      )}
      <form
        className="aedit__add"
        onSubmit={(e) => {
          e.preventDefault()
          run(() => setPaymentLink(inv.id, link), link.trim() ? 'Payment link saved.' : 'Payment link removed.')
        }}
      >
        <input type="url" inputMode="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://rzp.io/rzp/…" aria-label="Razorpay payment link" />
        <button type="submit" className="pbtn" disabled={busy || !changed}>{busy ? 'Saving…' : link.trim() ? 'Save link' : 'Remove'}</button>
      </form>
      {link.trim() && !isRazorpayLink(link) && <span className="field__hint">This doesn’t look like a Razorpay link — double-check it.</span>}
      <Msg msg={msg} />
    </div>
  )
}

/* ---------------- Payslips ---------------- */

export function SlipForm({ employees }) {
  const now = new Date()
  const blank = { employee: '', designation: '', month: String(now.getMonth() + 1), year: String(now.getFullYear()), basicSalary: '', hra: '', otherAllowances: '', pfDeduction: '', taxDeduction: '', otherDeductions: '', notes: '' }
  const [f, setF] = useState(blank)
  const { busy, msg, run } = useRun()
  const n = (k) => Number(f[k]) || 0
  const gross = n('basicSalary') + n('hra') + n('otherAllowances')
  const ded = n('pfDeduction') + n('taxDeduction') + n('otherDeductions')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const num = (k, label) => (
    <Field label={label} id={`s-${k}`}><input id={`s-${k}`} type="number" min="0" inputMode="decimal" value={f[k]} onChange={set(k)} placeholder="0" /></Field>
  )

  return (
    <Opener label="New payslip" done={<Msg msg={msg} />}>
      {(close) => (
        <form
          className="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            const employee = employees.find((x) => x.id === f.employee)
            if (!employee || n('basicSalary') <= 0) return run(async () => { throw new Error('Choose a team member and enter the basic salary.') })
            run(
              async () => {
                const no = await createSalarySlip({ ...f, employee })
                setF(blank)
                close()
                return no
              },
              (no) => `Payslip ${no} issued.`
            )
          }}
        >
          <div className="form__grid">
            <Field label="Team member" id="s-emp">
              <Select
                variant="line"
                id="s-emp"
                value={f.employee}
                onChange={(v) => setF({ ...f, employee: v, designation: f.designation || employees.find((x) => x.id === v)?.title || '' })}
                options={userOptions(employees)}
                placeholder="Choose a person"
              />
            </Field>
            <Field label="Designation" id="s-desig"><input id="s-desig" value={f.designation} onChange={set('designation')} /></Field>
            <Field label="Month" id="s-month">
              <Select variant="line" id="s-month" value={f.month} onChange={(v) => setF({ ...f, month: v })} options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))} />
            </Field>
            <Field label="Year" id="s-year"><input id="s-year" type="number" value={f.year} onChange={set('year')} /></Field>
            {num('basicSalary', 'Basic')}
            {num('hra', 'HRA')}
            {num('otherAllowances', 'Other allowances')}
            {num('pfDeduction', 'PF')}
            {num('taxDeduction', 'Tax')}
            {num('otherDeductions', 'Other deductions')}
            <Field label="Notes" id="s-notes" full><input id="s-notes" value={f.notes} onChange={set('notes')} /></Field>
          </div>
          <dl className="atotals">
            <div><dt>Gross</dt><dd>{inr(gross)}</dd></div>
            <div><dt>Deductions</dt><dd>− {inr(ded)}</dd></div>
            <div className="atotals__total"><dt>Net pay</dt><dd>{inr(gross - ded)}</dd></div>
          </dl>
          <Button type="submit" className="form__submit" disabled={busy}>{busy ? 'Issuing…' : 'Issue payslip'}</Button>
          <Msg msg={msg} />
        </form>
      )}
    </Opener>
  )
}

/* ---------------- Share a file (client vault / employee docs) ---------------- */

const CATEGORIES = ['Document', 'Contract', 'Deliverable', 'Invoice', 'Design', 'Video', 'Other']

export function ShareForm({ users }) {
  const [f, setF] = useState({ user: '', fileName: '', category: 'Deliverable', link: '' })
  const [file, setFile] = useState(null)
  const { busy, msg, run } = useRun()

  return (
    <Opener label="Share a file" done={<Msg msg={msg} />}>
      {(close) => (
        <form
          className="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            const user = users.find((u) => u.id === f.user)
            if (!user || (!file && !/^https?:\/\//.test(f.link))) return run(async () => { throw new Error('Choose a person and add a file or a link.') })
            run(
              async () => {
                let url = f.link
                let name = f.fileName
                if (file) {
                  const up = await uploadFile(file, 'kraftor/shared')
                  url = up.url
                  name = name || file.name
                }
                await shareFile({ user, fileName: name || 'Shared link', category: f.category, fileUrl: url, isLink: !file })
                setF({ user: '', fileName: '', category: 'Deliverable', link: '' })
                setFile(null)
                close()
              },
              'File shared.'
            )
          }}
        >
          <div className="form__grid">
            <Field label="Share with" id="sh-user">
              <Select variant="line" id="sh-user" value={f.user} onChange={(v) => setF({ ...f, user: v })} options={users.map((u) => ({ value: u.id, label: `${userLabel(u)} (${u.role})` }))} placeholder="Choose a person" />
            </Field>
            <Field label="Category" id="sh-cat">
              <Select variant="line" id="sh-cat" value={f.category} onChange={(v) => setF({ ...f, category: v })} options={CATEGORIES} />
            </Field>
            <Field label="Title" id="sh-name"><input id="sh-name" value={f.fileName} onChange={(e) => setF({ ...f, fileName: e.target.value })} placeholder="e.g. Final logo pack" /></Field>
            <Field label="Or paste a link" id="sh-link"><input id="sh-link" type="url" value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="https://drive.google.com/…" disabled={!!file} /></Field>
            <div className="form__full">
              {file ? (
                <div className="cv-file">
                  <span className="cv-file__name">{file.name}</span>
                  <button type="button" className="cv-file__remove" onClick={() => setFile(null)} aria-label="Remove file"><FiX /></button>
                </div>
              ) : (
                <label className="cv-drop" htmlFor="sh-file">
                  <FiUploadCloud />
                  <span><strong>Upload a file</strong> — up to {MAX_UPLOAD_MB} MB</span>
                  <input id="sh-file" type="file" onChange={(e) => { setFile(e.target.files?.[0] || null); e.target.value = '' }} />
                </label>
              )}
            </div>
          </div>
          <Button type="submit" className="form__submit" disabled={busy}>{busy ? 'Sharing…' : 'Share'}</Button>
          <Msg msg={msg} />
        </form>
      )}
    </Opener>
  )
}

/* ---------------- Settings ---------------- */

export function SettingsForm() {
  const [f, setF] = useState(null)
  const { busy, msg, run } = useRun()

  useEffect(() => {
    getSettings()
      .then((s) =>
        setF({
          companyName: s.companyName || 'Kraftor Interactive',
          companyCode: s.companyCode || 'KFR',
          gstin: s.gstin || s.gstNumber || '',
          companyAddress: s.companyAddress || '',
          defaultGstPercent: s.defaultGstPercent ?? s.defaultGst ?? 18,
          dueDays: s.dueDays || 15,
          defaultTerms: s.defaultTerms || '',
          bankDetails: s.bankDetails || '',
        })
      )
      .catch(() => setF(false))
  }, [])

  if (f === null) return <p className="muted">Loading…</p>
  if (f === false) return <p className="form__error">Couldn’t load settings.</p>
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  return (
    <form
      className="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        run(
          () =>
            saveSettings({
              ...f,
              companyCode: f.companyCode.trim().toUpperCase() || 'KFR',
              gstNumber: f.gstin,
              defaultGstPercent: Number(f.defaultGstPercent) || 0,
              defaultGst: Number(f.defaultGstPercent) || 0,
              dueDays: Number(f.dueDays) || 15,
              companyAddress: f.companyAddress || null,
              bankDetails: f.bankDetails || null,
            }),
          'Settings saved.'
        )
      }}
    >
      <div className="form__grid">
        <Field label="Company name" id="st-name"><input id="st-name" value={f.companyName} onChange={set('companyName')} /></Field>
        <Field label="Number prefix" id="st-code"><input id="st-code" value={f.companyCode} onChange={set('companyCode')} maxLength={6} /></Field>
        <Field label="GSTIN" id="st-gst"><input id="st-gst" value={f.gstin} onChange={set('gstin')} /></Field>
        <Field label="Default GST %" id="st-gstp"><input id="st-gstp" type="number" value={f.defaultGstPercent} onChange={set('defaultGstPercent')} /></Field>
        <Field label="Payment due (days)" id="st-due"><input id="st-due" type="number" value={f.dueDays} onChange={set('dueDays')} /></Field>
        <Field label="Address" id="st-addr"><input id="st-addr" value={f.companyAddress} onChange={set('companyAddress')} /></Field>
        <Field label="Bank / UPI details (shown on invoices)" id="st-bank" full><textarea id="st-bank" rows={3} value={f.bankDetails} onChange={set('bankDetails')} /></Field>
        <Field label="Default terms" id="st-terms" full><textarea id="st-terms" rows={3} value={f.defaultTerms} onChange={set('defaultTerms')} /></Field>
      </div>
      <Button type="submit" className="form__submit" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</Button>
      <Msg msg={msg} />
    </form>
  )
}

export { PrintLink } from '../../components/portal/DataList'
