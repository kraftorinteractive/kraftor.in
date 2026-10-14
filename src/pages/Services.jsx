import FilterTabs from '../components/ui/FilterTabs'
import ServiceCard from '../components/ui/ServiceCard'
import Reveal from '../components/ui/Reveal'
import usePageTitle from '../hooks/usePageTitle'
import useTabParam from '../hooks/useTabParam'
import { services, serviceCategories } from '../data/services'
import PageHeader from '../components/layout/PageHeader'
import './pages.css'

const tabs = serviceCategories.map((c) => ({ key: c.toLowerCase().replace(/[^a-z]+/g, '-'), label: c }))

export default function Services() {
  usePageTitle('Services')
  const [tab, setTab] = useTabParam(tabs.map((t) => t.key))
  const label = tabs.find((t) => t.key === tab).label
  const list = label === 'All' ? services : services.filter((s) => s.category === label)

  return (
    <>
      <PageHeader crumb="Services" title="What we do" text="Creative and tech, under one roof.">
        <FilterTabs tabs={tabs} active={tab} onChange={setTab} label="Service category" />
      </PageHeader>

      <div className="container page-body">
        <Reveal stagger className="svc-grid" key={tab}>
          {list.map((s) => <ServiceCard key={s.id} service={s} showPoints />)}
        </Reveal>
      </div>
    </>
  )
}
