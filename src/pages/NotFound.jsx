import Button from '../components/ui/Button'
import PageHeader from '../components/layout/PageHeader'
import usePageTitle from '../hooks/usePageTitle'
import './pages.css'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <>
      <PageHeader crumb="404" title="Page not found" text="This page doesn't exist or has moved." />
      <div className="container page-body">
        <Button to="/">Back to home</Button>
      </div>
    </>
  )
}
