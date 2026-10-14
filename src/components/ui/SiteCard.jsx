import { useState } from 'react'
import { FiExternalLink, FiInfo, FiLock } from 'react-icons/fi'
import Button from './Button'
import Media from './Media'
import Modal from './Modal'
import './cards.css'

export default function SiteCard({ site }) {
  const [open, setOpen] = useState(false)
  return (
    <article className="card site">
      <div className="ratio-2x1 card__media">
        <Media src={site.image} alt={`${site.name} website`} label={site.type} tone={site.tone} />
      </div>
      <div className="card__body">
        <h3 className="card__title">{site.name}</h3>
        <span className="card__type">{site.type}</span>
        <p className="card__info">{site.info}</p>
        <div className="card__chips">
          {site.keywords.map((k) => (
            <span key={k} className="chip">{k}</span>
          ))}
        </div>
        <div className="card__actions">
          {site.url ? (
            <Button href={site.url} size="sm" icon={<FiExternalLink />}>View</Button>
          ) : (
            <Button size="sm" variant="ghost" icon={<FiLock />} disabled title="Private project">Private</Button>
          )}
          <Button variant="ghost" size="sm" icon={<FiInfo />} onClick={() => setOpen(true)}>Info</Button>
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={site.name}>
        <div className="ratio-2x1 modal__media">
          <Media src={site.image} alt={`${site.name} website`} />
        </div>
        <p className="card__type">{site.type}</p>
        <p>{site.info}</p>
        <div className="card__chips card__chips--show">
          {site.keywords.map((k) => (
            <span key={k} className="chip">{k}</span>
          ))}
        </div>
        {site.url && (
          <Button href={site.url} icon={<FiExternalLink />}>Visit website</Button>
        )}
      </Modal>
    </article>
  )
}
