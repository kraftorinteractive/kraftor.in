import { useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import './cards.css'

export default function Accordion({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="acc">
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={it.q} className={`acc__item${isOpen ? ' is-open' : ''}`}>
            <button className="acc__q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
              <span>{it.q}</span>
              <FiPlus className="acc__icon" />
            </button>
            <div className="acc__a" role="region">
              <div><p>{it.a}</p></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
