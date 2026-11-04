import xssCsrfCspMd from '../notes/frontend/security/xss-csrf-csp.md?raw'
import eventLoopMd from '../notes/backend/nodejs/event-loop-thread-pool.md?raw'
import protsentsMd from '../notes/math/percentages/protsenty.md?raw'
import webVitalsMd from '../notes/frontend/performance/web-vitals.md?raw'
import renderingNextjsMd from '../notes/frontend/rendering/rendering-nextjs.md?raw'
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
      {
        id: 'performance',
        label: 'Производительность',
        description: 'Web Vitals, LCP, INP, CLS, оптимизация React и Next.js',
      },
      {
        id: 'rendering',
        label: 'Рендеринг',
        description: 'Стратегии рендеринга: CSR, SSR, SSG, ISR, PPR, Server Components, Next.js Pages и App Router',
      },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    description: 'Серверная разработка: Node.js, базы данных, REST, архитектура',
    icon: '◉',
    topics: [
      {
        id: 'nodejs',
        label: 'Node.js',
        description: 'Event loop, thread pool, асинхронность, worker_threads, производительность',
      },
    ],
  },
  {
    id: 'math',
    label: 'Математика',
    description: 'Проценты, арифметика, алгебра — базовые математические концепции',
    icon: '∑',
    topics: [
      {
        id: 'percentages',
        label: 'Проценты',
        description: 'Формулы, типовые кейсы, ловушки и быстрый устный счёт',
      },
    ],
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
  {
    id: 'web-vitals',
    title: 'Web Vitals',
    description: 'LCP, INP, CLS — Core Web Vitals для senior frontend. Как измерять, что чинить, мониторинг в проде',
    categoryId: 'frontend',
    topicId: 'performance',
    tags: ['web vitals', 'cwv', 'lcp', 'inp', 'cls', 'производительность', 'react', 'next.js', 'lighthouse', 'rum', 'crux'],
    rawMd: webVitalsMd,
    html: parseMarkdown(webVitalsMd),
    searchText: mdToSearchText(webVitalsMd),
    headings: extractHeadings(webVitalsMd),
  },
  {
    id: 'rendering-nextjs',
    title: 'Стратегии рендеринга и Next.js',
    description: 'CSR, SSR, SSG, ISR, PPR, Streaming, Server Components. Pages Router vs App Router. next/dynamic. Ловушки гидратации',
    categoryId: 'frontend',
    topicId: 'rendering',
    tags: ['ssr', 'ssg', 'isr', 'ppr', 'csr', 'streaming', 'server components', 'next.js', 'app router', 'pages router', 'гидратация', 'рендеринг', 'next/dynamic', 'cache components'],
    rawMd: renderingNextjsMd,
    html: parseMarkdown(renderingNextjsMd),
    searchText: mdToSearchText(renderingNextjsMd),
    headings: extractHeadings(renderingNextjsMd),
  },
  {
    id: 'event-loop-thread-pool',
    title: 'Event Loop и Thread Pool в Node.js',
    description: 'Как устроен event loop, фазы libuv, микрозадачи, thread pool, сетевой I/O, блокировки, worker_threads',
    categoryId: 'backend',
    topicId: 'nodejs',
    tags: ['event loop', 'thread pool', 'libuv', 'node.js', 'nodejs', 'микрозадачи', 'nexttick', 'promise', 'setimmediate', 'settimeout', 'worker_threads', 'async', 'асинхронность', 'производительность'],
    rawMd: eventLoopMd,
    html: parseMarkdown(eventLoopMd),
    searchText: mdToSearchText(eventLoopMd),
    headings: extractHeadings(eventLoopMd),
  },
  {
    id: 'protsenty',
    title: 'Проценты',
    description: 'Одна формула на все задачи. 13 типовых кейсов, ловушки с базой, быстрый устный счёт',
    categoryId: 'math',
    topicId: 'percentages',
    tags: ['проценты', 'процент', 'формула', 'нндс', 'налог', 'скидка', 'сложные проценты', 'арифметика', 'математика', 'кейсы'],
    rawMd: protsentsMd,
    html: parseMarkdown(protsentsMd),
    searchText: mdToSearchText(protsentsMd),
    headings: extractHeadings(protsentsMd),
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