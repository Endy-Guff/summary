import type { Heading } from '../lib/markdown'

interface Props {
  headings: Heading[]
  activeId?: string
}

export default function TableOfContents({ headings, activeId }: Props) {
  // Show only h1 and h2 in the TOC
  const visible = headings.filter((h) => h.level <= 2)
  if (visible.length === 0) return null

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="toc" aria-label="Содержание">
      <div className="toc-title">Содержание</div>
      <ul className="toc-list">
        {visible.map((h) => (
          <li key={h.id} className={`toc-item toc-level-${h.level}`}>
            <button
              className={`toc-link ${activeId === h.id ? 'toc-link--active' : ''}`}
              onClick={() => scrollTo(h.id)}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}