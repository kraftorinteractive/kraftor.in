import { FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import TypeText from './TypeText'
import Reveal from './Reveal'
import './SectionHeader.css'

const SPEED = 35

/**
 * Section heading, played in turn via the shared animation queue:
 * eyebrow fades in → heading types (with optional orange `accent`) → info line types → link fades in.
 */
export default function SectionHeader({ eyebrow, title, accent = '', text, linkTo, linkLabel = 'View all', as = 'h2' }) {
  return (
    <div className="sec-head">
      <div className="sec-head__main">
        {eyebrow && <Reveal as="span" className="eyebrow">{eyebrow}</Reveal>}
        <TypeText as={as} text={title} accent={accent} speed={SPEED} inView />
        {text && <TypeText as="p" className="muted" text={text} speed={14} inView caret={false} />}
      </div>
      {linkTo && (
        <Reveal className="sec-head__link-wrap">
          <Link to={linkTo} className="sec-head__link">
            {linkLabel} <FiArrowRight />
          </Link>
        </Reveal>
      )}
    </div>
  )
}
