/** Shows an image if `src` is set, otherwise a branded gradient placeholder. */
export default function Media({ src, alt = '', label, tone = 'orange', className = '' }) {
  if (src) return <img src={src} alt={alt} loading="lazy" className={className} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  return (
    <div className={`ph ph--${tone} ${className}`.trim()} role="img" aria-label={alt || label}>
      {label && <span>{label}</span>}
    </div>
  )
}
