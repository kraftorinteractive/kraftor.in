import {
  FiTarget, FiEye, FiBox, FiVideo, FiPenTool, FiCode, FiUsers, FiCheck, FiMapPin,
  FiGlobe, FiBookOpen, FiBriefcase, FiFilm, FiCheckCircle, FiArrowUpRight,
} from 'react-icons/fi'
import { useEffect, useState } from 'react'
import FilterTabs from '../components/ui/FilterTabs'
import { getCrew } from '../lib/public'
import Reveal from '../components/ui/Reveal'
import HScroller from '../components/ui/HScroller'
import usePageTitle from '../hooks/usePageTitle'
import useTabParam from '../hooks/useTabParam'
import { company, mission, vision, values, founder, hod, teams, crew, clients, highlights } from '../data/about'
import PageHeader from '../components/layout/PageHeader'
import TypeText from '../components/ui/TypeText'
import './pages.css'
import './About.css'

const tabs = [
  { key: 'company', label: 'Company' },
  { key: 'crew', label: 'Crew' },
  { key: 'client', label: 'Client' },
]

const teamIcons = { cube: FiBox, video: FiVideo, pen: FiPenTool, code: FiCode, target: FiTarget, users: FiUsers }
const workIcons = { web: FiGlobe, school: FiBookOpen, briefcase: FiBriefcase, film: FiFilm }

const initials = (name = '') => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

/** Round photo, or a quiet initials circle until a photo is added. */
function Avatar({ person, size = '' }) {
  return person.photo ? (
    <img src={person.photo} alt={person.name} loading="lazy" className={`ab-avatar ${size}`.trim()} />
  ) : (
    <span className={`ab-avatar ab-avatar--mono ${size}`.trim()} role="img" aria-label={person.name}>
      {initials(person.name)}
    </span>
  )
}

/** Small heading used between About sections. */
const SubHead = ({ text }) => <TypeText as="h2" className="pf-sec__title ab-subhead" text={text} speed={35} />

export default function About() {
  usePageTitle('About')
  const [tab, setTab] = useTabParam(tabs.map((t) => t.key))

  // Founder always; Head of Department once a name is added in data/about.js
  const leads = [{ person: founder, tag: 'Founder' }, ...(hod.name ? [{ person: hod, tag: 'Head of Department' }] : [])]

  // Team members an admin chose to show (Admin → Users → "Show on crew page"); static list as fallback
  const [liveCrew, setLiveCrew] = useState([])
  useEffect(() => {
    let alive = true
    getCrew()
      .then((list) => alive && setLiveCrew(list.map((m) => ({ name: m.name, role: m.title || 'Creative professional', photo: m.avatar }))))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  // Leads already have their own cards above, so don't repeat them in the list
  const leadNames = new Set(leads.map((l) => String(l.person.name).toLowerCase()))
  const members = (liveCrew.length ? liveCrew : crew).filter((m) => !leadNames.has(String(m.name).toLowerCase()))

  return (
    <>
      <PageHeader crumb="About" title="Who we are" text="A creative-tech studio by Anicomic International.">
        <FilterTabs tabs={tabs} active={tab} onChange={setTab} label="About section" />
      </PageHeader>

      <div className="container page-body" key={tab}>
        {/* ---------- Company ---------- */}
        {tab === 'company' && (
          <>
            <Reveal as="ol" stagger className="ab-rows">
              {company.map((c, i) => (
                <li key={c.key} className="ab-row">
                  <span className="ab-row__num">0{i + 1}</span>
                  <div>
                    <h3 className="ab-row__title">{c.title}</h3>
                    <p className="ab-row__text">{c.text}</p>
                  </div>
                </li>
              ))}
            </Reveal>

            <SubHead text="What drives us" />
            <Reveal stagger className="ab-mv">
              <div className="ab-mv__item">
                <span className="ab-label"><FiTarget /> Our mission</span>
                <p className="ab-mv__text">{mission}</p>
              </div>
              <div className="ab-mv__item">
                <span className="ab-label"><FiEye /> Our vision</span>
                <p className="ab-mv__text">{vision}</p>
              </div>
            </Reveal>

            <SubHead text="How we work" />
            <Reveal as="ul" stagger className="ab-values">
              {values.map((v) => (
                <li key={v.title} className="ab-value">
                  <FiCheck className="ab-value__icon" aria-hidden="true" />
                  <div>
                    <h3>{v.title}</h3>
                    <p>{v.text}</p>
                  </div>
                </li>
              ))}
            </Reveal>
          </>
        )}

        {/* ---------- Crew ---------- */}
        {tab === 'crew' && (
          <>
            <Reveal stagger className="ab-leads">
              {leads.map(({ person, tag }) => (
                <article key={tag} className="ab-lead">
                  <Avatar person={person} size="ab-avatar--lg" />
                  <div>
                    <span className="ab-label">{tag}</span>
                    <h3 className="ab-lead__name">{person.name}</h3>
                    <p className="ab-lead__role">{person.role}</p>
                    {person.bio && <p className="ab-lead__bio">{person.bio}</p>}
                  </div>
                </article>
              ))}
            </Reveal>

            <SubHead text="Our teams" />
            <Reveal stagger className="ab-crew">
              {teams.map((t) => {
                const Icon = teamIcons[t.icon] || FiUsers
                return (
                  <div key={t.name} className="ab-member">
                    <span className="ab-avatar ab-avatar--mono ab-avatar--icon"><Icon /></span>
                    <div>
                      <h3>{t.name}</h3>
                      <p>{t.role}</p>
                    </div>
                  </div>
                )
              })}
            </Reveal>

            {members.length > 0 && (
              <>
                <SubHead text="Meet the crew" />
                <Reveal stagger className="ab-crew">
                  {members.map((m, i) => (
                    <div key={i} className="ab-member">
                      <Avatar person={m} />
                      <div>
                        <h3>{m.name}</h3>
                        <p>{m.role}</p>
                      </div>
                    </div>
                  ))}
                </Reveal>
              </>
            )}
          </>
        )}

        {/* ---------- Client ---------- */}
        {tab === 'client' && (
          <>
            <TypeText as="h2" className="pf-sec__title" text="Brands that trust us" speed={35} />
            <Reveal stagger className="ab-clients">
              {clients.map((c, i) => (
                <div key={c.name} className={`ab-client ab-client--${i % 2 ? 'blue' : 'orange'}`}>
                  {c.logo ? (
                    <img src={c.logo} alt={c.name} loading="lazy" />
                  ) : (
                    <>
                      <span className="ab-client__mono" aria-hidden="true">{initials(c.name)}</span>
                      <span className="ab-client__text">
                        <strong>{c.name}</strong>
                        <span>{c.place}</span>
                      </span>
                    </>
                  )}
                </div>
              ))}
            </Reveal>

            <SubHead text="Client highlights" />
            {/* Facts about real projects — swipe on phones, grid on desktop */}
            <HScroller cols={2} size="wide">
              {highlights.map((h, i) => {
                const Icon = workIcons[h.icon] || FiGlobe
                return (
                  <article key={h.client} className={`card hl hl--${i % 2 ? 'blue' : 'orange'}`}>
                    {/* Gradient band with the project type */}
                    <div className="hl__band">
                      <span className="hl__icon"><Icon /></span>
                      <span className="hl__type">{h.type}</span>
                    </div>
                    <div className="hl__body">
                      <h3 className="hl__name">{h.client}</h3>
                      <span className="hl__place"><FiMapPin /> {h.place}</span>
                      <p className="hl__work">{h.work}</p>
                      <div className="hl__tags">
                        {h.tags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
                      </div>
                    </div>
                    <div className="hl__foot">
                      <span className="hl__done"><FiCheckCircle /> Delivered</span>
                      {h.url && (
                        <a className="hl__visit" href={h.url} target="_blank" rel="noopener noreferrer">
                          Visit <FiArrowUpRight />
                        </a>
                      )}
                    </div>
                  </article>
                )
              })}
            </HScroller>
          </>
        )}
      </div>
    </>
  )
}
