import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiPrinter, FiArrowLeft } from 'react-icons/fi'
import symbol from '../assets/logo-symbol.png'
import wordmark from '../assets/logo-wordmark.png'
import usePageTitle from '../hooks/usePageTitle'
import { getDb, getAuthClient } from '../lib/firebase'
import { GATEWAY_RATE } from '../lib/admin'
import { site } from '../data/site'
import './DocView.css'

const COL = { invoice: 'invoices', quotation: 'quotations', payslip: 'salary_slips', application: 'employee_applications' }
const TITLE = { invoice: 'Invoice', quotation: 'Quotation', payslip: 'Payslip', application: 'Joining form' }
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const date = (v) => {
  const d = v?.toDate ? v.toDate() : v ? new Date(v) : null
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null
}

/** Printable joining form the employee brings to the office for signature and stamp. */
function JoiningForm({ d, cfg, id }) {
  const rows = [
    ['Full name', d.employeeName],
    ['Role', d.appliedRole],
    ['Experience', d.experience],
    ['Date of birth', d.dateOfBirth],
    ['Gender', d.gender],
    ['Nationality', d.nationality],
    ['Religion', d.religion],
    ['Phone', d.phoneNumber],
    ['WhatsApp', d.whatsappNumber],
    ['Email', d.employeeEmail],
    ['Address', d.fullAddress],
    ['City / country', d.cityCountry],
    ['PIN code', d.postcode],
    ['Qualification', d.qualification],
    ['Institute', d.institute],
    ['Passing year', d.passingYear],
    ['Aadhaar no.', d.aadhaarNumber],
  ].filter(([, v]) => v)
  return (
    <div className="docv">
      <div className="docv__bar">
        <Link to="/login" className="docv__btn docv__btn--ghost"><FiArrowLeft /> My account</Link>
        <button type="button" className="docv__btn" onClick={() => window.print()}><FiPrinter /> Print / save PDF</button>
      </div>
      <article className="docv__page">
        <header className="docv__head">
          <div className="docv__brand">
            <div className="docv__logo">
              <img src={symbol} alt="" />
              <img src={wordmark} alt={cfg.companyName || site.name} />
            </div>
            <p>{cfg.companyAddress || 'Nagpur, India'} · MSME Registered</p>
          </div>
          <div className="docv__title">
            <h1>JOINING FORM</h1>
            <p>#{d.applicationNumber || id}</p>
            <p>Submitted {date(d.submittedAt) || '—'}</p>
          </div>
        </header>
        <section className="docv__join">
          {d.passportPhotoUrl && <img className="docv__photo" src={d.passportPhotoUrl} alt="Passport photo" />}
          <dl>
            {rows.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </section>
        <p className="docv__small">
          <strong>Documents attached:</strong> {(d.attachedDocuments || []).join(', ') || '—'}
        </p>
        <p className="docv__small">
          I confirm that the information above is true and complete, and I agree to follow the Kraftor employee guidelines.
        </p>
        <div className="docv__sign">
          <div><span />Employee signature</div>
          <div><span />Authorised signatory &amp; stamp</div>
        </div>
      </article>
    </div>
  )
}

/** Printable invoice / quotation / payslip. Only the owner (client / employee) or an admin can load it — the rules decide. */
export default function DocView() {
  const { kind, id } = useParams()
  const [state, setState] = useState({ loading: true })
  usePageTitle(`${TITLE[kind] || 'Document'} ${id}`)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (!COL[kind]) throw new Error('missing')
        const auth = await getAuthClient()
        await auth.authStateReady()
        if (!auth.currentUser) throw new Error('signin')
        const [{ doc, getDoc }, db] = await Promise.all([import('firebase/firestore'), getDb()])
        const [snap, cfgSnap] = await Promise.all([getDoc(doc(db, COL[kind], id)), getDoc(doc(db, 'settings', 'invoiceConfig')).catch(() => null)])
        if (!snap.exists()) throw new Error('missing')
        if (alive) setState({ d: snap.data(), cfg: cfgSnap?.exists() ? cfgSnap.data() : {} })
      } catch (e) {
        if (alive) setState({ error: e.message === 'signin' ? 'signin' : e.code === 'permission-denied' ? 'denied' : 'missing' })
      }
    })()
    return () => {
      alive = false
    }
  }, [kind, id])

  if (state.loading) return <div className="docv"><p className="docv__msg">Loading…</p></div>
  if (state.error)
    return (
      <div className="docv">
        <p className="docv__msg">
          {state.error === 'signin' ? 'Please sign in to view this document.' : state.error === 'denied' ? 'You don’t have access to this document.' : 'Document not found.'}{' '}
          <Link to="/login">Go to your account</Link>
        </p>
      </div>
    )

  const { d, cfg } = state
  const gstin = cfg.gstin || cfg.gstNumber
  const isPay = kind === 'payslip'
  if (kind === 'application') return <JoiningForm d={d} cfg={cfg} id={id} />
  const number = d.invoiceNumber || d.quotationNumber || d.slipNumber || id
  const dueDays = cfg.dueDays || 15

  return (
    <div className="docv">
      <div className="docv__bar">
        <Link to="/login" className="docv__btn docv__btn--ghost"><FiArrowLeft /> My account</Link>
        <button type="button" className="docv__btn" onClick={() => window.print()}><FiPrinter /> Print / save PDF</button>
      </div>

      <article className="docv__page">
        <header className="docv__head">
          <div className="docv__brand">
            <div className="docv__logo">
              <img src={symbol} alt="" />
              <img src={wordmark} alt={cfg.companyName || site.name} />
            </div>
            <p>{cfg.companyAddress || 'Nagpur, India'} · MSME Registered</p>
            {gstin && <p>GSTIN: {gstin}</p>}
            <p>{site.email} · {site.phoneDisplay}</p>
          </div>
          <div className="docv__title">
            <h1>{TITLE[kind].toUpperCase()}</h1>
            <p>#{number}</p>
            {!isPay && (
              <div className="docv__due">
                <small>{kind === 'invoice' ? 'Amount due' : 'Quoted total'}</small>
                <strong>{money(kind === 'invoice' && d.status === 'Paid' ? 0 : d.total)}</strong>
              </div>
            )}
          </div>
        </header>

        <section className="docv__meta">
          {isPay ? (
            <div>
              <small>Employee</small>
              <strong>{d.employeeName}</strong>
              {d.designation && <p>{d.designation}</p>}
              <p>{d.employeeEmail}</p>
            </div>
          ) : (
            <div>
              <small>{kind === 'invoice' ? 'Bill to' : 'Prepared for'}</small>
              <strong>{d.clientName}</strong>
              {d.clientPhone && <p>{d.clientPhone}</p>}
              {d.clientAddress && <p>{d.clientAddress}</p>}
              <p>{d.clientEmail}</p>
            </div>
          )}
          <dl>
            {isPay ? (
              <>
                <div><dt>Pay period</dt><dd>{MONTHS[(Number(d.month) || 1) - 1]} {d.year}</dd></div>
                <div><dt>Issued</dt><dd>{date(d.createdAt) || '—'}</dd></div>
              </>
            ) : (
              <>
                {d.projectName && <div><dt>Project</dt><dd>{d.projectName}</dd></div>}
                <div><dt>Date</dt><dd>{date(d.createdAt) || '—'}</dd></div>
                {kind === 'invoice' && <div><dt>Due</dt><dd>{date(d.dueDate) || `Net ${dueDays} days`}</dd></div>}
                {kind === 'quotation' && d.validUntil && <div><dt>Valid until</dt><dd>{date(d.validUntil)}</dd></div>}
                {d.paidAt && <div><dt>Paid on</dt><dd>{date(d.paidAt)}</dd></div>}
              </>
            )}
            <div><dt>Status</dt><dd><span className={`docv__status docv__status--${String(d.status).toLowerCase()}`}>{d.status}</span></dd></div>
          </dl>
        </section>

        {isPay ? (
          <section className="docv__slip">
            <table>
              <thead><tr><th>Earnings</th><th className="num">Amount</th></tr></thead>
              <tbody>
                <tr><td>Basic salary</td><td className="num">{money(d.basicSalary)}</td></tr>
                <tr><td>HRA</td><td className="num">{money(d.hra)}</td></tr>
                <tr><td>Other allowances</td><td className="num">{money(d.otherAllowances)}</td></tr>
                <tr className="sum"><td>Gross</td><td className="num">{money(d.grossSalary)}</td></tr>
              </tbody>
            </table>
            <table>
              <thead><tr><th>Deductions</th><th className="num">Amount</th></tr></thead>
              <tbody>
                <tr><td>Provident fund</td><td className="num">{money(d.pfDeduction)}</td></tr>
                <tr><td>Tax</td><td className="num">{money(d.taxDeduction)}</td></tr>
                <tr><td>Other</td><td className="num">{money(d.otherDeductions)}</td></tr>
                <tr className="sum"><td>Total</td><td className="num">{money(d.totalDeductions)}</td></tr>
              </tbody>
            </table>
            <div className="docv__net"><span>Net pay</span><strong>{money(d.netSalary)}</strong></div>
          </section>
        ) : (
          <>
            <table className="docv__items">
              <thead><tr><th>#</th><th>Item &amp; description</th><th className="num">Qty</th><th className="num">Rate</th><th className="num">Amount</th></tr></thead>
              <tbody>
                {(d.lineItems || []).map((li, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{li.description}</td>
                    <td className="num">{Number(li.qty || 0)}</td>
                    <td className="num">{money(li.rate)}</td>
                    <td className="num">{money(li.amount ?? (Number(li.qty) || 0) * (Number(li.rate) || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="docv__totals">
              <div><dt>Sub total</dt><dd>{money(d.subtotal)}</dd></div>
              {d.discountPercent > 0 && <div><dt>Discount ({d.discountPercent}%)</dt><dd>− {money(d.discountAmount)}</dd></div>}
              {d.gstPercent > 0 && <div><dt>GST ({d.gstPercent}%)</dt><dd>{money(d.gstAmount)}</dd></div>}
              {d.gatewayChargeEnabled && d.gatewayChargeAmount > 0 && <div><dt>Payment gateway ({(GATEWAY_RATE * 100).toFixed(2)}%)</dt><dd>{money(d.gatewayChargeAmount)}</dd></div>}
              <div className="docv__grand"><dt>Total</dt><dd>{money(d.total)}</dd></div>
            </dl>
          </>
        )}

        <footer className="docv__foot">
          {d.notes && <p><strong>Notes:</strong> {d.notes}</p>}
          {kind === 'invoice' && d.paymentLink && !['Paid', 'Cancelled'].includes(d.status) && (
            <div className="docv__pay">
              <div>
                <strong>Pay online</strong>
                <span>UPI, cards and net banking via Razorpay</span>
                <span className="docv__paylink">{d.paymentLink}</span>
              </div>
              <a className="docv__btn" href={d.paymentLink} target="_blank" rel="noopener noreferrer">Pay {money(d.total)}</a>
            </div>
          )}
          {kind === 'invoice' && cfg.bankDetails && <p className="docv__pre"><strong>Payment details:</strong> {cfg.bankDetails}</p>}
          {kind === 'invoice' && (
            <p className="docv__small">
              {cfg.defaultTerms || `Net ${dueDays} days.`} After 3 days delay: 10% penalty · After 7 days: 20% penalty · After 15 days the project may be put on hold.
            </p>
          )}
          {isPay && <p className="docv__small">This is a computer-generated payslip and does not need a signature.</p>}
          <p className="docv__thanks">Thank you — {cfg.companyName || site.name}</p>
        </footer>
      </article>
    </div>
  )
}
