export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function parseInlineMarkdown(value = '') {
  return escapeHtml(value)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

export function markdownToHtml(markdown = '') {
  const blocks = []
  const codeBlockRegex = /```([\s\S]*?)```/g
  let cursor = 0
  let match

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    blocks.push({ type: 'text', value: markdown.slice(cursor, match.index) })
    blocks.push({ type: 'code', value: match[1].trim() })
    cursor = match.index + match[0].length
  }
  blocks.push({ type: 'text', value: markdown.slice(cursor) })

  return blocks
    .map((block) => {
      if (block.type === 'code') {
        return `<pre><code>${escapeHtml(block.value)}</code></pre>`
      }

      return block.value
        .split(/\n{2,}/)
        .map((chunk) => {
          const trimmed = chunk.trim()
          if (!trimmed) return ''
          if (trimmed.startsWith('### ')) return `<h3>${parseInlineMarkdown(trimmed.slice(4))}</h3>`
          if (trimmed.startsWith('## ')) return `<h2>${parseInlineMarkdown(trimmed.slice(3))}</h2>`
          if (trimmed.startsWith('> ')) return `<blockquote>${parseInlineMarkdown(trimmed.slice(2))}</blockquote>`
          return `<p>${parseInlineMarkdown(trimmed).replace(/\n/g, '<br />')}</p>`
        })
        .join('')
    })
    .join('')
}
