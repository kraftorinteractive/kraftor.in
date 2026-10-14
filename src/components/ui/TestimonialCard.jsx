import { FaQuoteLeft, FaStar } from 'react-icons/fa'
import './cards.css'

export default function TestimonialCard({ t }) {
  return (
    <figure className="card testi">
      <FaQuoteLeft className="testi__quote" />
      <div className="testi__stars" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }, (_, i) => <FaStar key={i} />)}
      </div>
      <blockquote>{t.text}</blockquote>
      <figcaption>
        <strong>{t.name}</strong>
        <span>{t.company}</span>
      </figcaption>
    </figure>
  )
}
