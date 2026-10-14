import { FaQuoteRight, FaStar } from 'react-icons/fa'
import './cards.css'

const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

/** Testimonial card: stars + quote mark, the quote, then the client with an initials avatar. */
export default function TestimonialCard({ t }) {
  return (
    <figure className="card testi">
      <div className="testi__top">
        <div className="testi__stars" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }, (_, i) => <FaStar key={i} />)}
        </div>
        <FaQuoteRight className="testi__quote" aria-hidden="true" />
      </div>
      <blockquote>{t.text}</blockquote>
      <figcaption>
        <span className="testi__avatar" aria-hidden="true">{initials(t.name)}</span>
        <span className="testi__who">
          <strong>{t.name}</strong>
          <span>{t.company}</span>
        </span>
      </figcaption>
    </figure>
  )
}
