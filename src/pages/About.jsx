import { FiTarget, FiEye } from 'react-icons/fi'
import FilterTabs from '../components/ui/FilterTabs'
import HScroller from '../components/ui/HScroller'
import Reveal from '../components/ui/Reveal'
import TestimonialCard from '../components/ui/TestimonialCard'
import usePageTitle from '../hooks/usePageTitle'
import useTabParam from '../hooks/useTabParam'
import { company, mission, vision, founder, hod, crew, clients, testimonials } from '../data/about'
import PageHeader from '../components/layout/PageHeader'
import './pages.css'

const tabs = [
  { key: 'company', label: 'Company' },
  { key: 'crew', label: 'Crew' },
  { key: 'client', label: 'Client' },
]

const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('')

function Avatar({ person, tone }) {
  return person.photo ? (
    <img src={person.photo} alt={person.name} loading="lazy" />
  ) : (
    <div className={`ph ph--${tone} avatar-ph`} role="img" aria-label={person.name}>
      <span>{initials(person.name)}</span>
    </div>
  )
}

export default function About() {
  usePageTitle('About')
  const [tab, setTab] = useTabParam(tabs.map((t) => t.key))

  return (
    <>
      <PageHeader crumb="About" title="Who we are" text="A creative-tech studio by Anicomic International.">
        <FilterTabs tabs={tabs} active={tab} onChange={setTab} label="About section" />
      </PageHeader>

      <div className="container page-body" key={tab}>
        {tab === 'company' && (
          <>
            <Reveal stagger className="about-blocks">
              {company.map((c, i) => (
                <article key={c.key} className="about-block">
                  <span className="about-block__num">0{i + 1}</span>
                  <h2>{c.title}</h2>
                  <p>{c.text}</p>
                </article>
              ))}
            </Reveal>
            <Reveal stagger variant="zoom" className="mv">
              <article className="mv__card mv__card--o">
                <FiTarget />
                <h3>Our Mission</h3>
                <p>{mission}</p>
              </article>
              <article className="mv__card mv__card--b">
                <FiEye />
                <h3>Our Vision</h3>
                <p>{vision}</p>
              </article>
            </Reveal>
          </>
        )}

        {tab === 'crew' && (
          <>
            <article className="person person--founder">
              <div className="person__photo"><Avatar person={founder} tone="orange" /></div>
              <div className="person__info">
                <span className="eyebrow">Founder</span>
                <h2>{founder.name}</h2>
                <p className="person__role">{founder.role}</p>
                <p className="muted">{founder.bio}</p>
              </div>
            </article>

            <article className="person person--hod">
              <div className="person__photo"><Avatar person={hod} tone="blue" /></div>
              <div className="person__info">
                <h2>{hod.name}</h2>
                <p className="person__role">{hod.role}</p>
                <p className="muted">{hod.bio}</p>
              </div>
            </article>

            <h2 className="pf-sec__title crew-title">Our crew</h2>
            <Reveal stagger className="crew">
              {crew.map((m, i) => (
                <article key={i} className="crew__card">
                  <div className="crew__photo"><Avatar person={m} tone={['orange', 'blue', 'dark'][i % 3]} /></div>
                  <h3>{m.name}</h3>
                  <p>{m.role}</p>
                </article>
              ))}
            </Reveal>
          </>
        )}

        {tab === 'client' && (
          <>
            <h2 className="pf-sec__title">Brands that trust us</h2>
            <Reveal stagger variant="zoom" className="logos">
              {clients.map((c) => (
                <div key={c.name} className="logos__item">
                  {c.logo ? (
                    <img src={c.logo} alt={c.name} loading="lazy" />
                  ) : (
                    <>
                      <span className="logos__mono">{initials(c.name)}</span>
                      <strong>{c.name}</strong>
                      <small>{c.place}</small>
                    </>
                  )}
                </div>
              ))}
            </Reveal>

            <h2 className="pf-sec__title testi-title">What clients say</h2>
            <HScroller cols={2} size="wide">
              {testimonials.map((t, i) => <TestimonialCard key={i} t={t} />)}
            </HScroller>
          </>
        )}
      </div>
    </>
  )
}
