import { useMemo, useState } from 'react'
import { FiChevronDown, FiSearch, FiPrinter } from 'react-icons/fi'
import { tone } from './format'
import './portal.css'

export function Pill({ children }) {
  if (!children) return null
  return <span className={`pill pill--${tone(children)}`}>{children}</span>
}

/** Label / value rows. Empty values are skipped. */
export function Details({ rows }) {
  const shown = rows.filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false)
  if (!shown.length) return null
  return (
    <dl className="pdl">
      {shown.map(([k, v]) => (
        <div className="pdl__row" key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Opens the printable invoice / quotation / payslip in a new tab. */
export function PrintLink({ kind, id }) {
  return (
    <a className="pbtn" href={`/doc/${kind}/${encodeURIComponent(id)}`} target="_blank" rel="noopener noreferrer">
      <FiPrinter /> View / print
    </a>
  )
}

export function Progress({ value = 0 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <span className="pbar" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <span className="pbar__track">
        <span className="pbar__fill" style={{ width: `${v}%` }} />
      </span>
      <span className="pbar__num">{v}%</span>
    </span>
  )
}

/**
 * Searchable, filterable, expandable list — the one pattern every portal section uses.
 *   item: { title, sub, date, status }   via getItem(raw)
 *   renderBody(raw) — shown when a row is opened
 */
export default function DataList({ list, error, getItem, renderBody, statuses, statusOf, empty = 'Nothing here yet.', searchable = true }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [open, setOpen] = useState(null)

  const shown = useMemo(() => {
    if (!list) return []
    const term = q.trim().toLowerCase()
    return list.filter((raw) => {
      if (status !== 'all' && String(statusOf ? statusOf(raw) : raw.status || '') !== status) return false
      if (!term) return true
      return Object.values(raw).some((v) => typeof v === 'string' && v.toLowerCase().includes(term))
    })
  }, [list, q, status, statusOf])

  const counts = useMemo(() => {
    const c = {}
    for (const raw of list || []) {
      const s = String(statusOf ? statusOf(raw) : raw.status || '')
      c[s] = (c[s] || 0) + 1
    }
    return c
  }, [list, statusOf])

  return (
    <div className="dlist">
      {(searchable || statuses) && (
        <div className="ptools">
          {searchable && (
            <label className="psearch">
              <FiSearch aria-hidden="true" />
              <input type="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
            </label>
          )}
          {statuses && (
            <div className="pchips" role="group" aria-label="Filter by status">
              {['all', ...statuses].map((s) => (
                <button key={s} type="button" className={`pchip${status === s ? ' is-active' : ''}`} onClick={() => setStatus(s)} aria-pressed={status === s}>
                  {s}
                  {s !== 'all' && counts[s] ? <span className="pchip__n">{counts[s]}</span> : null}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error ? (
        <p className="form__error">Couldn’t load this list. Check your connection and access, then refresh.</p>
      ) : list === null ? (
        <p className="muted pempty">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="muted pempty">{list.length ? 'Nothing matches this filter.' : empty}</p>
      ) : (
        <ul className="plist">
          {shown.map((raw) => {
            const it = getItem(raw)
            const isOpen = open === raw.id
            return (
              <li key={raw.id} className={`pitem${isOpen ? ' is-open' : ''}`}>
                <button type="button" className="pitem__head" onClick={() => setOpen(isOpen ? null : raw.id)} aria-expanded={isOpen}>
                  {it.lead}
                  <span className="pitem__main">
                    <strong>{it.title || '—'}</strong>
                    {it.sub && <small>{it.sub}</small>}
                  </span>
                  <span className="pitem__end">
                    <Pill>{it.status}</Pill>
                    {it.date && <time>{it.date}</time>}
                  </span>
                  <FiChevronDown className="pitem__chev" aria-hidden="true" />
                </button>
                {isOpen && renderBody && <div className="pitem__body">{renderBody(raw)}</div>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
