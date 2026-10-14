import { Link } from 'react-router-dom'
import {
  FiBox, FiFilm, FiCpu, FiVideo, FiPenTool, FiLayout, FiGlobe, FiSmartphone, FiCode, FiBookOpen, FiCheck,
  FiArrowUpRight, FiLayers, FiShare2, FiTarget, FiSearch, FiPackage, FiZap, FiSmile, FiHome, FiEdit3,
  FiTablet, FiCopy, FiMonitor, FiTool, FiCamera, FiMapPin, FiMail, FiAward, FiImage, FiPrinter, FiYoutube,
  FiBriefcase, FiCalendar, FiDroplet, FiShoppingCart, FiRefreshCw, FiServer,
} from 'react-icons/fi'
import './cards.css'

// icon key (from data/services.js) → Feather icon
const icons = {
  cube: FiBox,
  motion: FiFilm,
  film: FiFilm,
  ai: FiCpu,
  video: FiVideo,
  pen: FiPenTool,
  layout: FiLayout,
  web: FiGlobe,
  mobile: FiSmartphone,
  phone: FiTablet,
  code: FiCode,
  school: FiBookOpen,
  layers: FiLayers,
  social: FiShare2,
  target: FiTarget,
  search: FiSearch,
  package: FiPackage,
  zap: FiZap,
  smile: FiSmile,
  home: FiHome,
  edit: FiEdit3,
  copy: FiCopy,
  monitor: FiMonitor,
  tool: FiTool,
  camera: FiCamera,
  map: FiMapPin,
  mail: FiMail,
  award: FiAward,
  image: FiImage,
  printer: FiPrinter,
  youtube: FiYoutube,
  briefcase: FiBriefcase,
  calendar: FiCalendar,
  droplet: FiDroplet,
  cart: FiShoppingCart,
  refresh: FiRefreshCw,
  server: FiServer,
}

/** `to` makes the whole card a link; `index` shows a 01/02 number; `tone` = orange | blue. */
export default function ServiceCard({ service, showPoints = false, to, index, tone = 'orange' }) {
  const Icon = icons[service.icon] || FiBox
  const Tag = to ? Link : 'article'
  return (
    <Tag className={`card service service--${tone}${to ? ' service--link' : ''}`} {...(to ? { to } : {})}>
      <div className="service__top">
        <div className="service__icon"><Icon /></div>
        {index != null && <span className="service__num">{String(index).padStart(2, '0')}</span>}
      </div>
      <span className="card__type">{service.category}</span>
      <h3 className="card__title">{service.title}</h3>
      <p className="card__info">{service.short}</p>
      {showPoints && (
        <ul className="service__points">
          {service.points.map((p) => (
            <li key={p}><FiCheck /> {p}</li>
          ))}
        </ul>
      )}
      {to && (
        <span className="service__more">
          Explore <FiArrowUpRight />
        </span>
      )}
    </Tag>
  )
}
