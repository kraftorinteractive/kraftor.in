import { Link } from 'react-router-dom'
import symbol from '../../assets/logo-symbol.png'
import wordmark from '../../assets/logo-wordmark.png'
import './Logo.css'

/** `onDark` turns the wordmark white for dark backgrounds (e.g. the footer). */
export default function Logo({ onClick, size = 'md', onDark = false }) {
  return (
    <Link to="/" className={`logo logo--${size}${onDark ? ' logo--on-dark' : ''}`} onClick={onClick} aria-label="Kraftor Interactive — Home">
      <img src={symbol} alt="" className="logo__symbol" width="40" height="40" />
      <img src={wordmark} alt="Kraftor" className="logo__wordmark" width="124" height="17" />
    </Link>
  )
}
