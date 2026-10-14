import { useSearchParams } from 'react-router-dom'
import { FiGrid } from 'react-icons/fi'
import ServiceCard from '../components/ui/ServiceCard'
import Select from '../components/ui/Select'
import Reveal from '../components/ui/Reveal'
import PageHeader from '../components/layout/PageHeader'
import usePageTitle from '../hooks/usePageTitle'
import { services, serviceCategories } from '../data/services'
import './pages.css'

const slug = (c) => c.toLowerCase().replace(/[^a-z]+/g, '-')

export default function Services() {
  usePageTitle('Services')
  // The choice is kept in the URL (?service=...) so it can be linked and survives refresh
  const [params, setParams] = useSearchParams()
  const selected = serviceCategories.find((c) => slug(c) === params.get('service')) || ''
  const list = services.filter((s) => s.category === selected)

  const choose = (value) => setParams(value ? { service: slug(value) } : {}, { replace: true })

  return (
    <>
      <PageHeader crumb="Services" title="What we do" text="Creative and tech, under one roof.">
        <div className="svc-select">
          <span className="svc-select__label" id="svc-label">Choose a service</span>
          <Select
            id="svc-select"
            value={selected}
            onChange={choose}
            options={serviceCategories}
            placeholder="Select a service"
            label="Choose a service"
          />
        </div>
      </PageHeader>

      <div className="container page-body">
        {selected ? (
          <Reveal stagger variant="fade" className="svc-grid" key={selected}>
            {list.map((s) => <ServiceCard key={s.id} service={s} showPoints />)}
          </Reveal>
        ) : (
          <Reveal className="svc-empty">
            <span className="svc-empty__icon"><FiGrid /></span>
            <h2>Please select a service</h2>
            <p>Pick a service from the list above to see what we offer.</p>
          </Reveal>
        )}
      </div>
    </>
  )
}
