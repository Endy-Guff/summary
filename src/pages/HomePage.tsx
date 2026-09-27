import { Link } from 'react-router-dom'
import { categories, notes } from '../data/catalog'

export default function HomePage() {
  return (
    <div className="home">
      <h1 className="page-title">Конспекты</h1>
      <p className="page-subtitle">
        Структурированные заметки по Frontend и Backend разработке
      </p>
      <div className="category-grid">
        {categories.map((cat) => {
          const noteCount = notes.filter((n) => n.categoryId === cat.id).length
          const hasContent = cat.topics.length > 0
          return (
            <Link
              key={cat.id}
              to={hasContent ? `/${cat.id}` : '#'}
              className={`category-card ${!hasContent ? 'category-card--empty' : ''}`}
            >
              <span className="category-icon">{cat.icon}</span>
              <div className="category-body">
                <div className="category-label">{cat.label}</div>
                <div className="category-desc">{cat.description}</div>
                <div className="category-meta">
                  {hasContent
                    ? `${cat.topics.length} ${plural(cat.topics.length, 'раздел', 'раздела', 'разделов')} · ${noteCount} ${plural(noteCount, 'конспект', 'конспекта', 'конспектов')}`
                    : 'Скоро'}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}