import { Link } from 'react-router-dom'
import './PageHeader.css'

/**
 * Header for every inner page:
 * yellow → orange grid banner (2 : 0.75) → breadcrumb (KRAFTOR / PAGE) → small heading → short info → optional filter (children).
 */
export default function PageHeader({ crumb, title, text, children }) {
  return (
    <header className="ph-head">
      <div className="ph-banner" aria-hidden="true">
        <span className="ph-banner__blob ph-banner__blob--a" />
        <span className="ph-banner__blob ph-banner__blob--b" />
        <span className="ph-banner__blob ph-banner__blob--c" />
        <span className="ph-banner__grid" />
      </div>

      <div className="container ph-head__body">
        <nav className="ph-crumb" aria-label="Breadcrumb">
          <Link to="/">Kraftor</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{crumb}</span>
        </nav>
        <h1 className="ph-head__title">{title}</h1>
        {text && <p className="ph-head__text">{text}</p>}
        {children && <div className="ph-head__filter">{children}</div>}

        {/* Divider: hairline with a short brand accent */}
        <div className="ph-divider" aria-hidden="true" />
      </div>
    </header>
  )
}
