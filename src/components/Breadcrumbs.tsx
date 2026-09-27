import { Link, useParams, useLocation } from 'react-router-dom'
import { getCategoryById, getTopicById, getNoteById } from '../data/catalog'

export default function Breadcrumbs() {
  const { categoryId, topicId, noteId } = useParams()
  const location = useLocation()
  const isSearch = location.pathname === '/search'

  const crumbs: { label: string; to?: string }[] = [{ label: 'Главная', to: '/' }]

  if (isSearch) {
    crumbs.push({ label: 'Поиск' })
  } else {
    if (categoryId) {
      const cat = getCategoryById(categoryId)
      if (cat) crumbs.push({ label: cat.label, to: topicId ? `/${categoryId}` : undefined })
    }
    if (categoryId && topicId) {
      const topic = getTopicById(categoryId, topicId)
      if (topic) crumbs.push({ label: topic.label, to: noteId ? `/${categoryId}/${topicId}` : undefined })
    }
    if (categoryId && topicId && noteId) {
      const note = getNoteById(categoryId, topicId, noteId)
      if (note) crumbs.push({ label: note.title })
    }
  }

  return (
    <nav className="breadcrumbs" aria-label="Навигация">
      {crumbs.map((crumb, i) => (
        <span key={i} className="breadcrumb-item">
          {i > 0 && <span className="breadcrumb-sep">/</span>}
          {crumb.to ? (
            <Link to={crumb.to} className="breadcrumb-link">{crumb.label}</Link>
          ) : (
            <span className="breadcrumb-current">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}