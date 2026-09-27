import { marked, Renderer } from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('json', json)

function slugify(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60)
}

const renderer = new Renderer()

renderer.heading = function ({ text, depth }) {
  const id = slugify(text)
  const cleanText = text.replace(/<[^>]+>/g, '')
  return `<h${depth} id="${id}">${cleanText}</h${depth}>\n`
}

renderer.code = function ({ text, lang }) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted =
    language === 'plaintext'
      ? hljs.highlight(text, { language: 'bash' }).value
      : hljs.highlight(text, { language }).value
  const langLabel = lang ? `<span class="code-lang">${lang}</span>` : ''
  return `<pre>${langLabel}<code class="hljs language-${language}">${highlighted}</code></pre>\n`
}

marked.use({ renderer })

export function parseMarkdown(md: string): string {
  return marked(md) as string
}

export interface Heading {
  id: string
  text: string
  level: number
}

export function extractHeadings(md: string): Heading[] {
  const headings: Heading[] = []
  const lines = md.split('\n')
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = slugify(text)
      if (id) headings.push({ level, text, id })
    }
  }
  return headings
}

export function mdToSearchText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[|#>*_\-[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}