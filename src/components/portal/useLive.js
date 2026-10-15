import { useEffect, useState } from 'react'
import { watchCollection } from '../../lib/api'

/**
 * Live Firestore list. `list` is null while loading.
 * Pass `enabled: false` to skip (e.g. until the user's uid is known).
 */
export default function useLive(name, { where, sortBy, enabled = true } = {}) {
  const [list, setList] = useState(null)
  const [error, setError] = useState(false)
  const key = JSON.stringify([name, where, sortBy, enabled])

  useEffect(() => {
    if (!enabled) return
    let stop = () => {}
    let alive = true
    setList(null)
    setError(false)
    watchCollection(
      name,
      { where, sortBy },
      (l) => alive && setList(l),
      () => {
        if (!alive) return
        setError(true)
        setList([])
      }
    ).then((s) => (alive ? (stop = s) : s()))
    return () => {
      alive = false
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { list, error }
}
