import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Fuse from 'fuse.js'
import { notes } from '../data/catalog'
import NoteCard from '../components/NoteCard'

const fuse = new Fuse(notes, {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.2 },
    { name: 'tags', weight: 0.15 },
    { name: 'searchText', weight: 0.25 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
})

export default function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''

  const results = useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query).map((r) => r.item)
  }, [query])

  return (
    <div className="page">
      <h1 className="page-title">
        {query ? `Поиск: «${query}»` : 'Поиск'}
      </h1>

      {query && (
        <p className="page-subtitle">
          {results.length > 0
            ? `Найдено: ${results.length}`
            : 'Ничего не найдено'}
        </p>
      )}

      {results.length > 0 && (
        <div className="notes-list">
          {results.map((note) => (
            <NoteCard key={note.id} note={note} highlightText={query} />
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="empty-state">
          <p>Попробуй другой запрос или <Link to="/">вернись на главную</Link></p>
        </div>
      )}
    </div>
  )
}