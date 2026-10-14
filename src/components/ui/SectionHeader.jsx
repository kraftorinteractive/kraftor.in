import { FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import './SectionHeader.css'

export default function SectionHeader({ eyebrow, title, text, linkTo, linkLabel = 'View all', as: Tag = 'h2' }) {
  return (
    <div className="sec-head">
      <div className="sec-head__main">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <Tag>{title}</Tag>
        {text && <p className="muted">{text}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="sec-head__link">
          {linkLabel} <FiArrowRight />
        </Link>
      )}
    </div>
  )
}
