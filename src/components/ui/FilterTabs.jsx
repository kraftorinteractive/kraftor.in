import './FilterTabs.css'

/** Pill filter. `tabs` = [{ key, label }] or strings. */
export default function FilterTabs({ tabs, active, onChange, label = 'Filter' }) {
  const items = tabs.map((t) => (typeof t === 'string' ? { key: t, label: t } : t))
  return (
    <div className="filter" role="tablist" aria-label={label}>
      {items.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          className={`filter__tab${active === t.key ? ' is-active' : ''}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
