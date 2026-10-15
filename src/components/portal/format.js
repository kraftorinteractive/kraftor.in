/** Small formatters shared by the admin panel and the client / employee portals. */

export const toDate = (v) => {
  if (!v) return null
  if (v.toDate) return v.toDate()
  if (v.seconds) return new Date(v.seconds * 1000)
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

export const fmtDate = (v) => toDate(v)?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || '—'

export const fmtDateTime = (v) =>
  toDate(v)?.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) || '—'

export const fmtTime = (v) => toDate(v)?.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) || '—'

export const inr = (n) =>
  typeof n === 'number' ? n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '—'

export const digits = (v) => String(v ?? '').replace(/[^\d]/g, '')

export const waLink = (v) => {
  const n = digits(v)
  return n ? `https://wa.me/${n.length === 10 ? `91${n}` : n}` : null
}

/** Status → colour family for pills. Unknown values fall back to neutral. */
const TONES = {
  good: ['active', 'paid', 'approved', 'present', 'hired', 'onboarded', 'accepted', 'confirmed', 'completed', 'read', 'contacted', 'issued', 'live'],
  warn: ['new', 'unread', 'pending', 'pending approval', 'submitted', 'in review', 'shortlisted', 'sent', 'unpaid', 'work from home', 'on hold'],
  bad: ['inactive', 'overdue', 'rejected', 'declined', 'absent', 'cancelled', 'blocked', 'expired'],
  info: ['admin', 'employee', 'client'],
  neutral: ['hidden'],
}
export function tone(status) {
  const s = String(status || '').toLowerCase()
  for (const [t, list] of Object.entries(TONES)) if (list.includes(s)) return t
  return 'neutral'
}
