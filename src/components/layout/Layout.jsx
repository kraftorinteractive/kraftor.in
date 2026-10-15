import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import PreFooter from './PreFooter'
import Footer from './Footer'

/** Site frame (navbar, page, pre-footer, footer). Used by the router, or directly with children (e.g. the admin sign-in). */
export default function Layout({ children }) {
  const { pathname } = useLocation()

  // Scroll to top on page change (not on ?tab= changes)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <>
      <Navbar />
      <main>
        {children ?? <Outlet />}
      </main>
      {/* No "Have an idea?" banner on the contact form or the signed-in areas */}
      {!['/contact', '/login', '/admin'].includes(pathname) && <PreFooter />}
      <Footer />
    </>
  )
}
