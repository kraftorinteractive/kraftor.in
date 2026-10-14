import { FiBell, FiActivity, FiCheckCircle, FiMessageCircle } from 'react-icons/fi'
import { FaGooglePlay } from 'react-icons/fa'
import Reveal from '../ui/Reveal'
import symbol from '../../assets/logo-symbol.png'
import { links } from '../../data/site'
import './AppLaunch.css'

const features = [
  { icon: FiActivity, label: 'Track progress' },
  { icon: FiCheckCircle, label: 'Approve work' },
  { icon: FiMessageCircle, label: 'Chat with us' },
]

/** "All-new Kraftor App — coming to Google Play" banner, built from the app icon (no artwork image). */
export default function AppLaunch() {
  return (
    <Reveal variant="zoom" className="al">
      <div className="al__text">
        <span className="al__badge"><span className="al__dot" /> Coming soon</span>
        <h2>The all-new Kraftor App</h2>
        <p>Your projects, in your pocket.</p>

        <ul className="al__features">
          {features.map(({ icon: Icon, label }) => (
            <li key={label}><Icon /> {label}</li>
          ))}
        </ul>

        <div className="al__actions">
          <span className="al__play" aria-label="Coming soon on Google Play">
            <FaGooglePlay className="al__play-icon" />
            <span>
              <small>Coming soon on</small>
              <strong>Google Play</strong>
            </span>
          </span>
          <a
            className="al__notify"
            href={links.whatsappMsg('Hi Kraftor, please notify me when the Kraftor App launches.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiBell /> Notify me
          </a>
        </div>
      </div>

      {/* App icon with pulsing rings */}
      <div className="al__art" aria-hidden="true">
        <span className="al__ring al__ring--1" />
        <span className="al__ring al__ring--2" />
        <span className="al__ring al__ring--3" />
        <div className="al__icon">
          <img src={symbol} alt="" />
        </div>
        <span className="al__tag al__tag--a"><FiActivity /> 80% done</span>
        <span className="al__tag al__tag--b"><FiCheckCircle /> Approved</span>
      </div>
    </Reveal>
  )
}
