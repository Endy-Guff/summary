import { useEffect, useRef, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { getNoteById } from '../data/catalog'
import TableOfContents from '../components/TableOfContents'

export default function NotePage() {
  const { categoryId, topicId, noteId } = useParams<{
    categoryId: string
    topicId: string
    noteId: string
  }>()

  const note = getNoteById(categoryId!, topicId!, noteId!)
  if (!note) return <Navigate to="/" replace />

  return (
    <div className="note-page">
      <TableOfContents headings={note.headings} />
      <NoteBody html={note.html} />
    </div>
  )
}

function NoteBody({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Scroll to anchor if URL contains one (e.g. loaded from TOC click)
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    // The hash router already uses #, so nested anchors are handled by TOC buttons
    // just ensure top on navigation
    window.scrollTo({ top: 0 })
    void hash
  }, [html])

  return (
    <article
      ref={contentRef}
      className="note-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}