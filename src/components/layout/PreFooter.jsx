import { FiMessageSquare, FiDownload } from 'react-icons/fi'
import Button from '../ui/Button'
import Reveal from '../ui/Reveal'
import symbol from '../../assets/logo-symbol.png'
import { site } from '../../data/site'
import './PreFooter.css'

export default function PreFooter() {
  return (
    <section className="prefoot">
      <div className="container">
        <Reveal variant="zoom" className="prefoot__card">
          <img src={symbol} alt="" className="prefoot__mark" aria-hidden="true" />
          <div className="prefoot__text">
            <span className="prefoot__eyebrow">Start a project</span>
            <h2>
              Have an idea?
              <br />
              <span className="text-grad">Let&apos;s make it real.</span>
            </h2>
          </div>
          <div className="prefoot__actions">
            <Button to="/contact" icon={<FiMessageSquare />}>Get Quote</Button>
            <Button href={site.companyProfile} variant="glass" icon={<FiDownload />} download>
              Profile
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
