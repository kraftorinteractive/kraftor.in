import { useEffect } from 'react'

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Kraftor Interactive` : 'Kraftor Interactive — Multimedia and IT Solution'
  }, [title])
}
