import { useEffect, useId, useRef, useState } from 'react'
import { FiChevronDown, FiCheck } from 'react-icons/fi'
import './Select.css'

/**
 * Themed dropdown (replaces the browser's native <select>, whose option list can't be styled).
 * - options: strings or { value, label }
 * - onChange(value)
 * - variant: 'box' (bordered field) | 'line' (underline, for forms)
 * Keyboard: ↑ ↓ Home End to move, Enter/Space to pick, Esc to close, type a letter to jump.
 */
export default function Select({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select',
  variant = 'box',
  invalid = false,
  describedBy,
  label,
}) {
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const btnRef = useRef(null)
  const listId = useId()
  const current = items.find((o) => o.value === value)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // Keep the highlighted option in view
  useEffect(() => {
    if (open && active >= 0) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const openList = () => {
    setActive(Math.max(0, items.findIndex((o) => o.value === value)))
    setOpen(true)
  }
  const pick = (i) => {
    onChange(items[i].value)
    setOpen(false)
    btnRef.current?.focus()
  }

  const onKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(items.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0) }
    else if (e.key === 'End') { e.preventDefault(); setActive(items.length - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (active >= 0) pick(active) }
    else if (e.key === 'Escape' || e.key === 'Tab') setOpen(false)
    else if (e.key.length === 1) {
      const i = items.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()))
      if (i >= 0) setActive(i)
    }
  }

  return (
    <div ref={rootRef} className={`sel sel--${variant}${open ? ' is-open' : ''}${invalid ? ' is-invalid' : ''}`}>
      <button
        ref={btnRef}
        id={id}
        type="button"
        className="sel__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className={current ? 'sel__value' : 'sel__placeholder'}>{current ? current.label : placeholder}</span>
        <FiChevronDown className="sel__chev" aria-hidden="true" />
      </button>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        className="sel__list"
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        hidden={!open}
      >
        {items.map((o, i) => (
          <li
            key={o.value}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={o.value === value}
            className={`sel__opt${i === active ? ' is-active' : ''}${o.value === value ? ' is-selected' : ''}`}
            onPointerEnter={() => setActive(i)}
            onClick={() => pick(i)}
          >
            {o.label}
            {o.value === value && <FiCheck className="sel__tick" aria-hidden="true" />}
          </li>
        ))}
      </ul>
    </div>
  )
}
