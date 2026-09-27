import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'

interface Props {
  onSearch: (query: string) => void
}

export default function SearchBar({ onSearch }: Props) {
  const [params] = useSearchParams()
  const [value, setValue] = useState(params.get('q') ?? '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        className="search-input"
        type="search"
        placeholder="Поиск по конспектам..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Поиск"
      />
      <button className="search-btn" type="submit" aria-label="Найти">
        <SearchIcon />
      </button>
    </form>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}