import { useSearchParams } from 'react-router-dom'

/** Keeps the active filter tab in the URL (?tab=key) so pages can deep-link. */
export default function useTabParam(keys, fallback = keys[0]) {
  const [params, setParams] = useSearchParams()
  const current = params.get('tab')
  const active = keys.includes(current) ? current : fallback
  const setActive = (key) => setParams(key === fallback ? {} : { tab: key }, { replace: true })
  return [active, setActive]
}
