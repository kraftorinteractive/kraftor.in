import { FiMail, FiArrowRight } from 'react-icons/fi'
import Button from '../components/ui/Button'
import Reveal from '../components/ui/Reveal'
import PageHeader from '../components/layout/PageHeader'
import usePageTitle from '../hooks/usePageTitle'
import policies from '../data/policies.json'
import { site } from '../data/site'
import './pages.css'

/** Terms, guidelines (from policies.json) and the careers page. */
export default function InfoPage({ title, slug }) {
  usePageTitle(title)
  const html = slug && policies[slug]

  return (
    <>
      <PageHeader crumb={title} title={title} text={html ? 'How we work together.' : 'Join our creative team.'} />
      <div className="container page-body">
        {html ? (
          // Trusted, first-party policy content
          <Reveal as="article" className="policy" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <Reveal className="careers">
            <h2>Work with us</h2>
            <p className="muted">Send your CV and portfolio link.</p>
            <div className="careers__actions">
              <Button href={`mailto:${site.email}?subject=${encodeURIComponent('Career application — Kraftor')}`} icon={<FiMail />}>
                Email your CV
              </Button>
              <Button to="/about?tab=crew" variant="outline" iconRight={<FiArrowRight />}>Meet the crew</Button>
            </div>
          </Reveal>
        )}
      </div>
    </>
  )
}
