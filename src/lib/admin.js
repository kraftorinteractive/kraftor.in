/**
 * Admin-only writes: projects, invoices, quotations, payslips, settings.
 * Same document shapes and numbering as the old Kraftor portal / Android app.
 */
import { getDb } from './firebase'

const fs = () => import('firebase/firestore')
const clean = (v, max = 1000) => String(v ?? '').trim().slice(0, max)
export const GATEWAY_RATE = 0.0245 // 2.45% payment-gateway fee, as before
const SETTINGS = ['settings', 'invoiceConfig']

/* ---------------- Settings & numbering ---------------- */

export async function getSettings() {
  const [{ doc, getDoc }, db] = await Promise.all([fs(), getDb()])
  const snap = await getDoc(doc(db, ...SETTINGS))
  return snap.exists() ? snap.data() : {}
}

export async function saveSettings(data) {
  const [{ doc, setDoc }, db] = await Promise.all([fs(), getDb()])
  await setDoc(doc(db, ...SETTINGS), data, { merge: true })
}

/**
 * Next document number: {CompanyCode}{YY}{MM}{Type}{SEQ}, e.g. KFR2610IN001.
 * The counter lives in settings/invoiceConfig (counter_IN_2610 …) and is bumped in a
 * transaction, so two admins can't get the same number. Numbers are never reused.
 */
async function nextNumber(type) {
  const [{ doc, runTransaction }, db] = await Promise.all([fs(), getDb()])
  const ref = doc(db, ...SETTINGS)
  const now = new Date()
  const period = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`
  const key = `counter_${type}_${period}`
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const cfg = snap.exists() ? snap.data() : {}
    const seq = (cfg[key] || 0) + 1
    tx.set(ref, { [key]: seq }, { merge: true })
    return `${cfg.companyCode || 'KFR'}${period}${type}${String(seq).padStart(3, '0')}`
  })
}

/* ---------------- Projects ---------------- */

const person = (u) => (u ? { uid: u.id || u.uid, email: u.email || '', name: u.name || '' } : null)

export async function createProject({ client, lead, projectName, description, deadline, usePhases }) {
  const [{ collection, addDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  const c = person(client)
  const l = person(lead)
  const ref = await addDoc(collection(db, 'projects'), {
    clientUid: c.uid,
    clientName: client.company || c.name,
    clientEmail: c.email,
    projectName: clean(projectName, 160),
    description: clean(description, 2000) || null,
    assignedToUid: l?.uid || null,
    assignedToEmail: l?.email || null,
    assignedToName: l?.name || null,
    deadline: deadline || null,
    usePhases: !!usePhases,
    phases: [{ id: 'ph_1', name: usePhases ? 'Phase 1' : 'Tasks', dueDate: null, tasks: [] }],
    phaseAssignees: [],
    status: 'Active',
    progress: 0,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

/** Read-modify-write of the phases array (same approach as the old portal). */
async function editPhases(projectId, fn, extra = {}) {
  const [{ doc, getDoc, updateDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  const ref = doc(db, 'projects', projectId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Project not found.')
  const phases = fn(snap.data().phases || [])
  const all = phases.flatMap((ph) => ph.tasks || [])
  const progress = all.length ? Math.round((all.filter((t) => t.completed).length / all.length) * 100) : 0
  const phaseAssignees = [...new Set(phases.map((ph) => ph.assignedToUid).filter(Boolean))]
  await updateDoc(ref, { phases, progress, phaseAssignees, ...extra, updatedAt: serverTimestamp() })
}

export const addPhase = (projectId, { name, dueDate }) =>
  editPhases(projectId, (phases) => [...phases, { id: `ph_${Date.now()}`, name: clean(name, 120) || `Phase ${phases.length + 1}`, dueDate: dueDate || null, tasks: [] }])

export const removePhase = (projectId, phaseId) => editPhases(projectId, (phases) => phases.filter((ph) => ph.id !== phaseId))

export const addTask = (projectId, phaseId, { name, dueDate }) =>
  editPhases(projectId, (phases) =>
    phases.map((ph) =>
      ph.id !== phaseId
        ? ph
        : { ...ph, tasks: [...(ph.tasks || []), { id: `t_${Date.now()}`, name: clean(name, 200), priority: null, dueDate: dueDate || null, completed: false, completedBy: null, completedAt: null }] }
    )
  )

export const removeTask = (projectId, phaseId, taskId) =>
  editPhases(projectId, (phases) => phases.map((ph) => (ph.id !== phaseId ? ph : { ...ph, tasks: (ph.tasks || []).filter((t) => t.id !== taskId) })))

export const assignPhase = (projectId, phaseId, emp) =>
  editPhases(projectId, (phases) =>
    phases.map((ph) =>
      ph.id !== phaseId ? ph : { ...ph, assignedToUid: emp?.id || null, assignedToEmail: emp?.email || null, assignedToName: emp?.name || null }
    )
  )

export async function updateProject(projectId, data) {
  const [{ doc, updateDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await updateDoc(doc(db, 'projects', projectId), { ...data, updatedAt: serverTimestamp() })
}

export const reassignProject = (projectId, emp) =>
  updateProject(projectId, { assignedToUid: emp?.id || null, assignedToEmail: emp?.email || null, assignedToName: emp?.name || null })

/* ---------------- Invoices & quotations ---------------- */

/** Razorpay payment link (https only). Returns null when empty; throws on anything that isn't a web link. */
export function cleanLink(v) {
  const s = String(v ?? '').trim()
  if (!s) return null
  if (!/^https:\/\/\S+$/i.test(s)) throw new Error('The payment link must start with https://')
  return s.slice(0, 500)
}
export const isRazorpayLink = (v) => /^https:\/\/([\w-]+\.)?(rzp\.io|razorpay\.com|razorpay\.me)\//i.test(String(v || ''))

/** Add, change or remove the payment link on an existing invoice. */
export async function setPaymentLink(invoiceId, link) {
  const [{ doc, updateDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await updateDoc(doc(db, 'invoices', invoiceId), { paymentLink: cleanLink(link), updatedAt: serverTimestamp() })
}

export function calcTotals(lines, { discountPercent = 0, gstPercent = 0, gateway = false } = {}) {
  const lineItems = lines
    .map((l) => ({ description: clean(l.description, 300), qty: Number(l.qty) || 0, rate: Number(l.rate) || 0 }))
    .map((l) => ({ ...l, amount: l.qty * l.rate }))
  const subtotal = lineItems.reduce((s, l) => s + l.amount, 0)
  const discountAmount = subtotal * ((Number(discountPercent) || 0) / 100)
  const subtotalAfterDiscount = subtotal - discountAmount
  const gstAmount = subtotalAfterDiscount * ((Number(gstPercent) || 0) / 100)
  const afterGst = subtotalAfterDiscount + gstAmount
  const gatewayChargeAmount = gateway ? afterGst * GATEWAY_RATE : 0
  const r = (n) => Math.round(n * 100) / 100
  return {
    lineItems,
    subtotal: r(subtotal),
    discountPercent: Number(discountPercent) || 0,
    discountAmount: r(discountAmount),
    subtotalAfterDiscount: r(subtotalAfterDiscount),
    gstPercent: Number(gstPercent) || 0,
    gstAmount: r(gstAmount),
    gatewayChargeEnabled: !!gateway,
    gatewayChargeAmount: r(gatewayChargeAmount),
    total: r(afterGst + gatewayChargeAmount),
  }
}

/** kind: 'invoice' | 'quotation'. Returns the new document number (also its ID). */
export async function createMoneyDoc(kind, { client, projectName, lines, discountPercent, gstPercent, gateway, notes, date, paymentLink }) {
  const isInv = kind === 'invoice'
  const number = await nextNumber(isInv ? 'IN' : 'QT')
  const [{ doc, setDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  const totals = calcTotals(lines, { discountPercent, gstPercent, gateway })
  await setDoc(doc(db, isInv ? 'invoices' : 'quotations', number), {
    [isInv ? 'invoiceNumber' : 'quotationNumber']: number,
    clientUid: client.id || client.uid,
    clientName: client.company || client.name || 'Client',
    clientEmail: client.email || '',
    clientPhone: client.phone || null,
    clientAddress: client.address || null,
    projectName: clean(projectName, 160) || null,
    ...totals,
    notes: clean(notes, 1000) || null,
    [isInv ? 'dueDate' : 'validUntil']: date || null,
    ...(isInv ? { paymentLink: cleanLink(paymentLink) } : {}),
    status: isInv ? 'Unpaid' : 'Sent',
    createdAt: serverTimestamp(),
  })
  return number
}

/* ---------------- Payslips ---------------- */

export async function createSalarySlip({ employee, designation, month, year, basicSalary, hra, otherAllowances, pfDeduction, taxDeduction, otherDeductions, notes }) {
  const n = (v) => Number(v) || 0
  const grossSalary = n(basicSalary) + n(hra) + n(otherAllowances)
  const totalDeductions = n(pfDeduction) + n(taxDeduction) + n(otherDeductions)
  const slipNumber = await nextNumber('SL')
  const [{ doc, setDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await setDoc(doc(db, 'salary_slips', slipNumber), {
    slipNumber,
    employeeUid: employee.id || employee.uid,
    employeeName: employee.name || 'Employee',
    employeeEmail: employee.email || '',
    designation: clean(designation, 120),
    month: Number(month),
    year: Number(year),
    basicSalary: n(basicSalary),
    hra: n(hra),
    otherAllowances: n(otherAllowances),
    pfDeduction: n(pfDeduction),
    taxDeduction: n(taxDeduction),
    otherDeductions: n(otherDeductions),
    grossSalary,
    totalDeductions,
    netSalary: grossSalary - totalDeductions,
    notes: clean(notes, 1000) || null,
    status: 'Issued',
    createdAt: serverTimestamp(),
  })
  return slipNumber
}

/* ---------------- Files to a client / employee ---------------- */

export async function shareFile({ user, fileName, category, fileUrl, isLink }) {
  const [{ collection, addDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await addDoc(collection(db, 'shared_documents'), {
    recipientUid: user.id || user.uid,
    recipientEmail: user.email || '',
    recipientName: user.name || '',
    recipientRole: user.role || 'client',
    fileName: clean(fileName, 200),
    fileType: category || 'Document',
    fileUrl,
    isLink: !!isLink,
    sharedAt: serverTimestamp(),
  })
}
