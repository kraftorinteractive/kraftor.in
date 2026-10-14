import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import Services from './pages/Services'
import About from './pages/About'
import Contact from './pages/Contact'
import InfoPage from './pages/InfoPage'
import Careers from './pages/Careers'
import Account from './pages/Account'
import NotFound from './pages/NotFound'

// Admin panel is only for the team — load it separately so visitors never download it
const Admin = lazy(() => import('./pages/Admin'))

export default function App() {
  return (
    <Routes>
      <Route
        path="admin"
        element={
          <Suspense fallback={null}>
            <Admin />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="services" element={<Services />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<InfoPage title="Terms & Conditions" slug="terms" />} />
        <Route path="client-guidelines" element={<InfoPage title="Client Guidelines" slug="client-guidelines" />} />
        <Route path="employee-guidelines" element={<InfoPage title="Employee Guidelines" slug="employee-guidelines" />} />
        <Route path="careers" element={<Careers />} />
        <Route path="login" element={<Account />} />
        <Route path="account" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
