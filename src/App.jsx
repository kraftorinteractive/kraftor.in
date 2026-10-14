import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import Services from './pages/Services'
import About from './pages/About'
import Contact from './pages/Contact'
import InfoPage from './pages/InfoPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="services" element={<Services />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<InfoPage title="Terms & Conditions" slug="terms" />} />
        <Route path="client-guidelines" element={<InfoPage title="Client Guidelines" slug="client-guidelines" />} />
        <Route path="employee-guidelines" element={<InfoPage title="Employee Guidelines" slug="employee-guidelines" />} />
        <Route path="careers" element={<InfoPage title="Career Form" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
