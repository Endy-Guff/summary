import { Link } from 'react-router-dom'
import type { Note } from '../data/catalog'

interface Props {
  note: Note
  highlightText?: string
}

export default function NoteCard({ note, highlightText }: Props) {
  const href = `/${note.categoryId}/${note.topicId}/${note.id}`

  const preview = highlightText
    ? getContextSnippet(note.searchText, highlightText)
    : note.description

  return (
    <Link to={href} className="note-card">
      <div className="note-card-title">{note.title}</div>
      <div className="note-card-desc">{preview}</div>
      <div className="note-card-tags">
        {note.tags.slice(0, 5).map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
    </Link>
  )
}

function getContextSnippet(text: string, query: string, maxLen = 140): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text.substring(0, maxLen) + '...'
  const start = Math.max(0, idx - 40)
  const end = Math.min(text.length, idx + query.length + 80)
  const snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '')
  return snippet
}