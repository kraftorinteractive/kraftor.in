import { Link } from 'react-router-dom'
import symbol from '../../assets/logo-symbol.png'
import wordmark from '../../assets/logo-wordmark.png'
import ThemeToggle from '../ui/ThemeToggle'
import './dash.css'

/** Centered card on the dashboard background — sign-in, "checking access", "no access" screens. */
export default function AuthScreen({ children }) {
  return (
    <div className="dash dauth">
      <div className="dauth__card">
        <div className="dauth__brand">
          <Link to="/" aria-label="Kraftor website">
            <img src={symbol} alt="" />
            <img src={wordmark} alt="Kraftor" />
          </Link>
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  )
}
