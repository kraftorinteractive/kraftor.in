import { FiShield, FiAward } from 'react-icons/fi'
import SectionHeader from '../components/ui/SectionHeader'
import HScroller from '../components/ui/HScroller'
import Reveal from '../components/ui/Reveal'
import ServiceCard from '../components/ui/ServiceCard'
import ReelCard from '../components/ui/ReelCard'
import SiteCard from '../components/ui/SiteCard'
import Hero from '../components/home/Hero'
import usePageTitle from '../hooks/usePageTitle'
import { services, homeServiceIds } from '../data/services'
import { reelSections, siteSections } from '../data/portfolio'
import './Home.css'

const homeServices = homeServiceIds.map((id) => services.find((s) => s.id === id))
// First portrait (9:16) video of each section — skips landscape and YouTube
const homeReels = reelSections
  .map((s) => (s.layout === 'reel' ? s.items[0] : s.groups?.find((g) => g.layout === 'reel')?.items[0]))
  .filter(Boolean)
const homeSites = siteSections.map((s) => s.items[0])

export default function Home() {
  usePageTitle()
  return (
    <>
      <Hero />

      {/* ---------- Registered (tablet & desktop) ---------- */}
      <section className="section trust">
        <Reveal stagger className="container trust__row">
          <span className="trust__item"><FiAward /> MSME Registered</span>
          <span className="trust__item"><FiShield /> Startup India Recognised</span>
        </Reveal>
      </section>

      {/* ---------- Services ---------- */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHeader
              eyebrow="Welcome to Kraftor"
              title={<>Everything your brand needs, <span className="text-grad">in one place.</span></>}
              linkTo="/services"
              linkLabel="All services"
            />
          </Reveal>
          <HScroller cols={3} size="small" autoplay={3200}>
            {homeServices.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i + 1} tone={i % 2 ? 'blue' : 'orange'} to="/services" />
            ))}
          </HScroller>
        </div>
      </section>

      {/* ---------- Showcase ---------- */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHeader
              eyebrow="Showcase"
              title={<>Work we&apos;re <span className="text-grad">proud of.</span></>}
              linkTo="/portfolio"
              linkLabel="View all"
            />
          </Reveal>
          <HScroller size="reel" cols={5}>
            {homeReels.map((r) => <ReelCard key={r.id} reel={r} />)}
          </HScroller>
          <div className="home__gap" />
          <HScroller cols={3}>
            {homeSites.map((s) => <SiteCard key={s.id} site={s} />)}
          </HScroller>
        </div>
      </section>
    </>
  )
}
