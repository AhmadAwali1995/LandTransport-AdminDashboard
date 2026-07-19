import { useEffect, useRef, useState } from 'react'

interface SearchableSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  allLabel?: string
  style?: React.CSSProperties
}

export default function SearchableSelect({ options, value, onChange, placeholder = 'Search…', allLabel = 'All', style }: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options

  const select = (v: string) => {
    onChange(v)
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
  }

  const openMenu = () => {
    setOpen(true)
    setQuery('')
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') openMenu()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex === -1) select('')
      else if (filtered[activeIndex] !== undefined) select(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      setActiveIndex(-1)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={rootRef} className={`combobox${open ? ' combobox--open' : ''}`} style={style}>
      <input
        ref={inputRef}
        type="text"
        className="form-control combobox__input"
        placeholder={placeholder}
        value={open ? query : (value || allLabel)}
        onFocus={openMenu}
        onChange={e => { setQuery(e.target.value); setActiveIndex(-1) }}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <div className="combobox__menu" role="listbox">
          <div
            className={`combobox__option${value === '' ? ' combobox__option--active' : ''}${activeIndex === -1 ? ' combobox__option--highlighted' : ''}`}
            onMouseDown={() => select('')}
            onMouseEnter={() => setActiveIndex(-1)}
          >
            {allLabel}
          </div>
          {filtered.length === 0 ? (
            <div className="combobox__empty">No matches</div>
          ) : (
            filtered.map((o, i) => (
              <div
                key={o}
                className={`combobox__option${value === o ? ' combobox__option--active' : ''}${activeIndex === i ? ' combobox__option--highlighted' : ''}`}
                onMouseDown={() => select(o)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {o}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
