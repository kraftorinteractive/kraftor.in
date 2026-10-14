import { useState } from 'react'
import { FiInfo, FiDownload } from 'react-icons/fi'
import { FaGooglePlay, FaStar, FaAndroid } from 'react-icons/fa'
import Modal from './Modal'
import './AppCard.css'

const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

function AppIcon({ app, size = '' }) {
  return app.icon ? (
    <img src={app.icon} alt="" className={`st__icon ${size}`.trim()} loading="lazy" />
  ) : (
    <span className={`st__icon st__icon--mono ${size}`.trim()}>{initials(app.name)}</span>
  )
}

/**
 * Compact card: icon · name · info · Download + Info buttons.
 * Info opens a Play-Store-style preview: header, stats, install, screenshots, about.
 */
export default function AppCard({ app }) {
  const [open, setOpen] = useState(false)
  const onPlay = app.store === 'play'

  const stats = [
    app.rating
      ? { top: <>{app.rating} <FaStar className="st__star" /></>, bottom: 'Rating' }
      : { top: <FaAndroid className="st__android" />, bottom: 'Android' },
    { top: app.downloads || 'APK', bottom: app.downloads ? 'Downloads' : 'Direct' },
    { top: 'Free', bottom: 'Price' },
  ]

  return (
    <article className="st">
      <div className="st__head">
        <AppIcon app={app} />
        <div className="st__meta">
          <h3 className="st__name">{app.name}</h3>
          <span className="st__cat">{app.category}</span>
        </div>
      </div>

      <p className="st__info">{app.info}</p>

      <div className="st__actions">
        <a className="st__install" href={app.download} target="_blank" rel="noopener noreferrer">
          <FiDownload /> Download
        </a>
        <button className="st__more" onClick={() => setOpen(true)}>
          <FiInfo /> Info
        </button>
      </div>

      {/* ---------- Play-Store-style preview ---------- */}
      <Modal open={open} onClose={() => setOpen(false)} title={app.name}>
        <div className="sp">
          <div className="sp__head">
            <AppIcon app={app} size="st__icon--lg" />
            <div className="st__meta">
              <span className="st__cat">{app.category}</span>
              <span className="st__store">
                {onPlay ? <><FaGooglePlay /> Google Play</> : <><FaAndroid /> Android app</>}
              </span>
            </div>
          </div>

          <ul className="st__stats">
            {stats.map((s, i) => (
              <li key={i}>
                <strong>{s.top}</strong>
                <span>{s.bottom}</span>
              </li>
            ))}
          </ul>

          <a className="st__install st__install--full" href={app.download} target="_blank" rel="noopener noreferrer">
            {onPlay ? 'Install' : <><FiDownload /> Download APK</>}
          </a>

          <div className="st__shots">
            {app.gallery.map((src) => (
              <img key={src} src={src} alt={`${app.name} screen`} loading="lazy" />
            ))}
          </div>

          <div className="sp__about">
            <h4>About this app</h4>
            <p>{app.info}</p>
          </div>
        </div>
      </Modal>
    </article>
  )
}
