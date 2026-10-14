import { useState } from 'react'
import { FiDownload, FiInfo } from 'react-icons/fi'
import Button from './Button'
import Modal from './Modal'
import './cards.css'

export default function AppCard({ app }) {
  const [open, setOpen] = useState(false)
  const shots = app.gallery || [app.image]
  return (
    <article className="card app">
      <div className="app__shots" aria-hidden="true">
        {shots.slice(0, 3).map((src, i) => (
          <img key={src} src={src} alt="" loading="lazy" className={`app__shot app__shot--${i}`} />
        ))}
      </div>
      <div className="card__body">
        <h3 className="card__title">{app.name}</h3>
        <span className="card__type">{app.type}</span>
        <p className="card__info">{app.info}</p>
        <div className="card__actions">
          <Button href={app.download} size="sm" icon={<FiDownload />}>Download</Button>
          <Button variant="ghost" size="sm" icon={<FiInfo />} onClick={() => setOpen(true)}>Info</Button>
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={app.name}>
        <p className="card__type">{app.type}</p>
        <p>{app.info}</p>
        <div className="modal__gallery">
          {shots.map((src) => (
            <img key={src} src={src} alt={`${app.name} screen`} loading="lazy" />
          ))}
        </div>
        <Button href={app.download} icon={<FiDownload />}>Download app</Button>
      </Modal>
    </article>
  )
}
