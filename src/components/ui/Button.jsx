import { Link } from 'react-router-dom'
import './Button.css'

/**
 * Button that renders as a router Link (`to`), an external link (`href`) or a <button>.
 * variant: primary | outline | dark | light | blue | ghost   size: sm | md | lg
 */
export default function Button({ to, href, variant = 'primary', size = 'md', icon, iconRight, block, className = '', children, ...rest }) {
  const cls = `btn btn--${variant} btn--${size}${block ? ' btn--block' : ''} ${className}`.trim()
  const content = (
    <>
      {icon && <span className="btn__icon">{icon}</span>}
      {children && <span>{children}</span>}
      {iconRight && <span className="btn__icon">{iconRight}</span>}
    </>
  )

  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>
  if (href) {
    const external = /^https?:/.test(href)
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {content}
      </a>
    )
  }
  return <button type="button" className={cls} {...rest}>{content}</button>
}
