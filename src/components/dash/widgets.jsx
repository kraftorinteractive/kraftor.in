import { useMemo, useState } from 'react'
import { FiArrowUpRight, FiArrowDownRight, FiChevronRight, FiCalendar, FiArrowRight, FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import TypeText from '../ui/TypeText'
import FilterTabs from '../ui/FilterTabs'
import symbol from '../../assets/logo-symbol.png'
import '../layout/PageHeader.css'
import Reveal from '../ui/Reveal'

/* ---------------- helpers ---------------- */

const DAY = 86400000
const toDate = (v) => {
  if (!v) return null
  if (v.toDate) return v.toDate()
  if (v.seconds) return new Date(v.seconds * 1000)
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/**
 * Last 7 days of activity from a list: series (oldest → today) plus this week vs the week before.
 *   value(item) — what to add (1 by default, or an amount)
 */
export function weekStats(list, dateOf, value = () => 1) {
  const today = startOfDay(new Date()).getTime()
  const series = Array(7).fill(0)
  let thisWeek = 0
  let lastWeek = 0
  for (const it of list || []) {
    const d = toDate(dateOf(it))
    if (!d) continue
    const ago = Math.floor((today - startOfDay(d).getTime()) / DAY)
    const v = Number(value(it)) || 0
    if (ago >= 0 && ago < 7) {
      series[6 - ago] += v
      thisWeek += v
    } else if (ago >= 7 && ago < 14) lastWeek += v
  }
  // No activity in either week → no % (the card shows a note instead of a misleading 0%)
  const delta = lastWeek ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek ? 100 : null
  return { series, thisWeek, lastWeek, delta }
}

export function greeting(d = new Date()) {
  const h = d.getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const fmtShort = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

/* ---------------- Header ---------------- */

/**
 * Page head in the site's inner-page style: aurora banner strip, KRAFTOR / … breadcrumb,
 * greeting, typed title, info line, week chip + Live, and the hairline divider.
 */
export function DashHead({ crumb = ['Dashboard'], name, title, text, children }) {
  const now = new Date()
  const start = new Date(now.getTime() - 6 * DAY)
  return (
    <header className="dhead">
      <div className="ph-banner" aria-hidden="true">
        <span className="ph-banner__blob ph-banner__blob--a" />
        <span className="ph-banner__blob ph-banner__blob--b" />
        <span className="ph-banner__blob ph-banner__blob--c" />
        <span className="ph-banner__grid" />
      </div>
      <div className="dhead__body">
        <Reveal as="nav" className="ph-crumb" aria-label="Breadcrumb">
          <Link to="/">Kraftor</Link>
          {crumb.map((c, i) => (
            <span key={c} style={{ display: 'contents' }}>
              <span aria-hidden="true">/</span>
              <span aria-current={i === crumb.length - 1 ? 'page' : undefined}>{c}</span>
            </span>
          ))}
        </Reveal>
        <div className="dhead__row">
          <div className="dhead__txt">
            {name && <p className="dhead__hi">{greeting()}, {name.split(' ')[0]} 👋</p>}
            <TypeText as="h1" className="dhead__title" text={title} speed={30} />
            {text && <p className="dhead__sub">{text}</p>}
          </div>
          <div className="dhead__chips">
            <span className="dchip"><FiCalendar aria-hidden="true" /> {fmtShort(start)} – {fmtShort(now)}, {now.getFullYear()}</span>
            <span className="dchip dchip--live"><span className="dchip__dot" aria-hidden="true" /> Live</span>
            {children}
          </div>
        </div>
        <div className="ph-divider" aria-hidden="true" />
      </div>
    </header>
  )
}
/* ---------------- KPI cards ---------------- */

export function Sparkline({ data = [], tone = 'orange' }) {
  const w = 96
  const h = 34
  const max = Math.max(1, ...data)
  const step = data.length > 1 ? w / (data.length - 1) : w
  const pts = data.map((v, i) => [i * step, h - 3 - (v / max) * (h - 6)])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`
  return (
    <svg className={`dspark tone-${tone}`} viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true" preserveAspectRatio="none">
      <path d={area} className="dspark__area" />
      <path d={line} className="dspark__line" />
    </svg>
  )
}

/** Pastel stat card: icon, label, value, change vs last week and a 7-day sparkline. */
export function KpiCard({ icon: Icon, label, value, delta, series, tone = 'orange', onClick, note }) {
  const up = (delta ?? 0) >= 0
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} className={`dkpi tone-${tone}`} onClick={onClick}>
      <span className="dkpi__icon" aria-hidden="true">{Icon && <Icon />}</span>
      <span className="dkpi__label">{label}</span>
      <span className="dkpi__row">
        <strong className="dkpi__value">{value}</strong>
        {series && <Sparkline data={series} tone={tone} />}
      </span>
      {delta !== undefined && delta !== null ? (
        <span className={`dkpi__delta ${up ? 'is-up' : 'is-down'}`}>
          {up ? <FiArrowUpRight aria-hidden="true" /> : <FiArrowDownRight aria-hidden="true" />} {Math.abs(delta)}%
          <small>vs last week</small>
        </span>
      ) : (
        <span className="dkpi__note">{note || 'No change this week'}</span>
      )}
    </Tag>
  )
}

export function KpiRow({ children }) {
  return (
    <Reveal stagger className="dkpis">
      {children}
    </Reveal>
  )
}

/* ---------------- Panel ---------------- */

export function Panel({ title, sub, action, onAction, children, className = '', tools }) {
  return (
    <section className={`dpanel ${className}`.trim()}>
      {(title || action || tools) && (
        <header className="dpanel__head">
          <div>
            {title && <TypeText as="h2" className="dpanel__title" text={title} speed={30} />}
            {sub && <p className="dpanel__sub">{sub}</p>}
          </div>
          {tools}
          {action && (
            <button type="button" className="dpanel__link" onClick={onAction}>
              {action} <FiArrowRight aria-hidden="true" />
            </button>
          )}
        </header>
      )}
      <Reveal className="dpanel__body">{children}</Reveal>
    </section>
  )
}

/* ---------------- Timeline (project activity) ---------------- */

// Brand colours only: orange (primary gradient) and blue (secondary), alternating like the service cards
const TONES = ['orange', 'blue']

/**
 * Week timeline like a Gantt strip: rows on the left, bars across 7 days (3 back, today, 3 ahead),
 * with a "today" line. rows: [{ id, title, sub, icon, start, end, label, onClick }]
 */
export function Timeline({ rows, filters, filter, onFilter, empty = 'Nothing scheduled this week.' }) {
  const today = startOfDay(new Date())
  const days = Array.from({ length: 7 }, (_, i) => new Date(today.getTime() + (i - 3) * DAY))
  const from = days[0].getTime()
  const to = days[6].getTime() + DAY
  const span = to - from
  const nowPct = ((Date.now() - from) / span) * 100

  const bars = rows.map((r, i) => {
    const s = toDate(r.start)?.getTime() ?? from
    const e = toDate(r.end)?.getTime() ?? to
    const a = Math.max(from, Math.min(s, to))
    const b = Math.max(from, Math.min(Math.max(e, s + DAY / 2), to))
    return { ...r, tone: TONES[i % TONES.length], left: ((a - from) / span) * 100, width: Math.max(((b - a) / span) * 100, 6), cutL: s < from, cutR: e > to }
  })

  return (
    <div className="dtl">
      {filters && <FilterTabs tabs={filters} active={filter} onChange={onFilter} label="Filter projects" />}
      {bars.length === 0 ? (
        <p className="dempty">{empty}</p>
      ) : (
        <div className="dtl__grid">
          <ul className="dtl__rows">
            {bars.map((r) => {
              const Icon = r.icon
              return (
                <li key={r.id}>
                  <button type="button" onClick={r.onClick} className="dtl__row">
                    <span className={`dtl__ico tone-${r.tone}`}>{Icon && <Icon aria-hidden="true" />}</span>
                    <span className="dtl__txt">
                      <strong>{r.title}</strong>
                      {r.sub && <small>{r.sub}</small>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="dtl__chart">
            <div className="dtl__days">
              {days.map((d, i) => (
                <span key={i} className={i === 3 ? 'is-today' : ''}>
                  {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  <small>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</small>
                </span>
              ))}
            </div>
            <div className="dtl__tracks">
              <span className="dtl__now" style={{ left: `${nowPct}%` }} aria-hidden="true" />
              {bars.map((r) => (
                <div key={r.id} className="dtl__track">
                  <button
                    type="button"
                    className={`dtl__bar tone-${r.tone}${r.cutL ? ' cut-l' : ''}${r.cutR ? ' cut-r' : ''}`}
                    style={{ left: `${r.left}%`, width: `${r.width}%` }}
                    onClick={r.onClick}
                    title={r.label || r.title}
                  >
                    <span>{r.label || r.title}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Next steps ---------------- */

/** items: [{ id, icon, title, sub, priority: 'High' | 'Medium' | 'Low', tone, onClick }] */
export function NextSteps({ items, empty = 'Nothing waiting — nice work ✨' }) {
  if (!items.length) return <p className="dempty">{empty}</p>
  return (
    <ul className="dsteps">
      {items.map((s) => {
        const Icon = s.icon
        return (
          <li key={s.id}>
            <button type="button" onClick={s.onClick}>
              <span className={`dsteps__ico tone-${s.tone || 'orange'}`}>{Icon && <Icon aria-hidden="true" />}</span>
              <span className="dsteps__txt">
                <strong>{s.title}</strong>
                {s.sub && <small>{s.sub}</small>}
              </span>
              {s.priority && <span className={`dprio dprio--${s.priority.toLowerCase()}`}>{s.priority}</span>}
              <FiChevronRight className="dsteps__chev" aria-hidden="true" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/* ---------------- At a glance (2×2 mini tiles) ---------------- */

export function Glance({ items }) {
  return (
    <div className="dglance">
      {items.map((g) => {
        const Icon = g.icon
        return (
          <button key={g.label} type="button" className="dglance__tile" onClick={g.onClick}>
            <span className={`dglance__ico tone-${g.tone || 'orange'}`}>{Icon && <Icon aria-hidden="true" />}</span>
            <strong>{g.value} <span>{g.label}</span></strong>
            {g.sub && <small>{g.sub}</small>}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- Quick actions (assistant-style card) ---------------- */

/** "Hello, Name — what would you like to do?" + action chips + suggestions + jump box. */
export function QuickActions({ name, actions, suggestions = [], onSearch }) {
  const [q, setQ] = useState('')
  return (
    <div className="dqa">
      <span className="dqa__orb" aria-hidden="true"><img src={symbol} alt="" /></span>
      <p className="dqa__hi">Hello, {(name || '').split(' ')[0] || 'there'} 👋</p>
      <p className="dqa__q">What would you like to do?</p>
      <div className="dqa__chips">
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <button key={a.label} type="button" className="dqa__chip" onClick={a.onClick}>
              {Icon && <Icon aria-hidden="true" />} {a.label}
            </button>
          )
        })}
      </div>
      {suggestions.length > 0 && (
        <>
          <p className="dqa__label">Suggested</p>
          <ul className="dqa__sugg">
            {suggestions.map((s) => (
              <li key={s.label}>
                <button type="button" onClick={s.onClick}>
                  <span>{s.label}</span>
                  <FiChevronRight aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {onSearch && (
        <form
          className="dqa__ask"
          onSubmit={(e) => {
            e.preventDefault()
            if (q.trim()) onSearch(q.trim())
            setQ('')
          }}
        >
          <FiSearch aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump to… (e.g. invoices)" aria-label="Jump to a section" />
          <button type="submit" aria-label="Go"><FiArrowRight /></button>
        </form>
      )}
    </div>
  )
}

/* ---------------- Mobile: sections as dashboard tiles ---------------- */

/** On phones the section filter becomes this grid of tiles (hidden on wider screens, where the sidebar shows). */
export function SectionTiles({ nav, onNav, skip = 'overview' }) {
  const items = useMemo(() => nav.filter((n) => n.key !== skip), [nav, skip])
  return (
    <Reveal stagger className="dtiles">
      {items.map((n, i) => {
        const Icon = n.icon
        return (
          <button key={n.key} type="button" className={`dtiles__tile tone-${TONES[i % TONES.length]}`} onClick={() => onNav(n.key)}>
            <span className="dtiles__ico" aria-hidden="true">{Icon && <Icon />}</span>
            <span className="dtiles__label">{n.label}</span>
            {n.badge ? <em className="dtiles__badge">{n.badge}</em> : null}
          </button>
        )
      })}
    </Reveal>
  )
}

/** Sub-views of a section (e.g. Invoices / Quotations) — the site's gradient pill filter, with counts. */
export function SubTabs({ tabs, active, onChange, label }) {
  const items = tabs.map((t) => ({ key: t.key, label: t.badge ? <>{t.label} <em className="dsub-badge">{t.badge}</em></> : t.label }))
  return <FilterTabs tabs={items} active={active} onChange={onChange} label={label} />
}