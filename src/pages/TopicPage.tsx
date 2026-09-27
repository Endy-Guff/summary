import { useParams, Navigate } from 'react-router-dom'
import { getCategoryById, getTopicById, getNotesByTopic } from '../data/catalog'
import NoteCard from '../components/NoteCard'

export default function TopicPage() {
  const { categoryId, topicId } = useParams<{ categoryId: string; topicId: string }>()
  const category = getCategoryById(categoryId!)
  const topic = getTopicById(categoryId!, topicId!)

  if (!category || !topic) return <Navigate to="/" replace />

  const topicNotes = getNotesByTopic(categoryId!, topicId!)

  return (
    <div className="page">
      <h1 className="page-title">{topic.label}</h1>
      <p className="page-subtitle">{topic.description}</p>

      {topicNotes.length === 0 ? (
        <p className="empty-state">Конспекты ещё не добавлены</p>
      ) : (
        <div className="notes-list">
          {topicNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}