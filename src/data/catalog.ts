import xssCsrfCspMd from '../notes/frontend/security/xss-csrf-csp.md?raw'
import { parseMarkdown, mdToSearchText, extractHeadings, type Heading } from '../lib/markdown'

// ── types ─────────────────────────────────────────────────────────────────────

export interface Topic {
  id: string
  label: string
  description: string
}

export interface Category {
  id: string
  label: string
  description: string
  icon: string
  topics: Topic[]
}

export interface Note {
  id: string
  title: string
  description: string
  categoryId: string
  topicId: string
  tags: string[]
  rawMd: string
  html: string
  searchText: string
  headings: Heading[]
}

// ── catalog ───────────────────────────────────────────────────────────────────

export const categories: Category[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    description: 'Клиентская разработка: React, JavaScript, TypeScript, браузерные API, безопасность',
    icon: '◈',
    topics: [
      {
        id: 'security',
        label: 'Безопасность',
        description: 'XSS, CSRF, CSP, CORS и другие аспекты веб-безопасности',
      },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    description: 'Серверная разработка: Node.js, базы данных, REST, архитектура',
    icon: '◉',
    topics: [],
  },
]

export const notes: Note[] = [
  {
    id: 'xss-csrf-csp',
    title: 'XSS · CSRF · CSP',
    description: 'Три ключевые темы веб-безопасности: как работают атаки, чем опасны и как защищаться',
    categoryId: 'frontend',
    topicId: 'security',
    tags: ['xss', 'csrf', 'csp', 'безопасность', 'атаки', 'браузер', 'cookies', 'dom'],
    rawMd: xssCsrfCspMd,
    html: parseMarkdown(xssCsrfCspMd),
    searchText: mdToSearchText(xssCsrfCspMd),
    headings: extractHeadings(xssCsrfCspMd),
  },
]

// ── lookups ───────────────────────────────────────────────────────────────────

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}

export function getTopicById(categoryId: string, topicId: string): Topic | undefined {
  return getCategoryById(categoryId)?.topics.find((t) => t.id === topicId)
}

export function getNotesByTopic(categoryId: string, topicId: string): Note[] {
  return notes.filter((n) => n.categoryId === categoryId && n.topicId === topicId)
}

export function getNoteById(categoryId: string, topicId: string, noteId: string): Note | undefined {
  return notes.find(
    (n) => n.categoryId === categoryId && n.topicId === topicId && n.id === noteId,
  )
}