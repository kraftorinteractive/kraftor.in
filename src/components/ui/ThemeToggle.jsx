import { useEffect, useState } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import './ThemeToggle.css'

const KEY = 'kraftor-theme'

function readTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/** Simple dark / light mode button. The first paint is handled by the small script in index.html. */
export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* storage blocked — the choice just won't be remembered */
    }
  }, [theme])

  // Keep every toggle on the page (menu + footer) showing the same icon
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(readTheme()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])

  const dark = theme === 'dark'
  return (
    <button
      type="button"
      className={`tt ${className}`.trim()}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <FiSun /> : <FiMoon />}
    </button>
  )
}
