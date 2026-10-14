import { Link } from 'react-router-dom'
import TypeText from '../ui/TypeText'
import Reveal from '../ui/Reveal'
import './PageHeader.css'

const TYPE_SPEED = 35 // ms per letter (heading) — same as every other typed heading
const INFO_SPEED = 14 // ms per letter (info line types faster)

/**
 * Header for every inner page. Everything here goes through the shared animation queue,
 * so it plays strictly one after another:
 * breadcrumb fades in → heading types → info line types → filter fades in → divider → then the page content.
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
        <Reveal as="nav" className="ph-crumb" aria-label="Breadcrumb">
          <Link to="/">Kraftor</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{crumb}</span>
        </Reveal>
        {/* No `key`: these stay mounted, so switching a filter swaps the words without replaying the intro */}
        <TypeText as="h1" className="ph-head__title" text={title} speed={TYPE_SPEED} />
        {text && <TypeText as="p" className="ph-head__text" text={text} speed={INFO_SPEED} caret={false} />}
        {children && <Reveal className="ph-head__filter">{children}</Reveal>}

        {/* Divider: hairline with a short brand accent */}
        <Reveal className="ph-divider" aria-hidden="true" />
      </div>
    </header>
  )
}
