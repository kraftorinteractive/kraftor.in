import './Marquee.css'

const items = ['3D Product Animation', 'Motion Graphics', 'AI Video', 'Video Editing', 'Graphic Design', 'Websites', 'Mobile Apps', 'Custom Software']

function Row() {
  return items.map((t) => (
    <span key={t} className="mq__item">
      {t}
      <i aria-hidden="true">✳</i>
    </span>
  ))
}

/** Two crossed tickers — blue behind, orange in front — forming an X. */
export default function Marquee() {
  return (
    <div className="mqx" aria-label={items.join(', ')}>
      <div className="mq mq--blue" aria-hidden="true">
        <div className="mq__track mq__track--rev">
          <Row />
          <Row />
        </div>
      </div>
      <div className="mq mq--orange" aria-hidden="true">
        <div className="mq__track">
          <Row />
          <Row />
        </div>
      </div>
    </div>
  )
}
