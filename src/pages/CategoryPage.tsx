import { Link, useParams, Navigate } from 'react-router-dom'
import { getCategoryById, getNotesByTopic } from '../data/catalog'

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const category = getCategoryById(categoryId!)

  if (!category) return <Navigate to="/" replace />

  return (
    <div className="page">
      <h1 className="page-title">{category.label}</h1>
      <p className="page-subtitle">{category.description}</p>

      {category.topics.length === 0 ? (
        <p className="empty-state">Разделы ещё не добавлены</p>
      ) : (
        <div className="topic-grid">
          {category.topics.map((topic) => {
            const count = getNotesByTopic(category.id, topic.id).length
            return (
              <Link key={topic.id} to={`/${category.id}/${topic.id}`} className="topic-card">
                <div className="topic-label">{topic.label}</div>
                <div className="topic-desc">{topic.description}</div>
                <div className="topic-count">{count} конспект{count !== 1 ? 'а' : ''}</div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}