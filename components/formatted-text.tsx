"use client"

interface FormattedTextProps {
  content: string
  className?: string
}

export function FormattedText({ content, className = "" }: FormattedTextProps) {
  if (!content) return null

  const formatContent = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-bold mb-3 text-foreground mt-6 border-b border-border pb-2">{line.slice(4)}</h3>
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold mb-4 text-foreground mt-8 border-b-2 border-primary pb-2">{line.slice(3)}</h2>
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold mb-6 text-foreground gradient-text">{line.slice(2)}</h1>
        }
        
        // Lists
        if (line.trim().match(/^[-•✓✅❌⭐🔥💎]/)) {
          return (
            <li key={i} className="text-muted-foreground ml-6 mb-2 flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>{line.trim().replace(/^[-•✓✅❌⭐🔥💎]\s*/, '')}</span>
            </li>
          )
        }
        
        // Code blocks
        if (line.trim().startsWith('```')) {
          return null
        }
        
        // Empty lines
        if (!line.trim()) {
          return <div key={i} className="h-4" />
        }
        
        // Regular paragraphs
        return <p key={i} className="mb-4 text-muted-foreground leading-relaxed">{formatInline(line)}</p>
      })
  }

  const formatInline = (text: string) => {
    const parts = []
    let current = ''
    let i = 0
    
    while (i < text.length) {
      // Bold **text**
      if (text.slice(i, i + 2) === '**') {
        if (current) parts.push(current)
        current = ''
        i += 2
        let bold = ''
        while (i < text.length && text.slice(i, i + 2) !== '**') {
          bold += text[i]
          i++
        }
        parts.push(<strong key={i} className="font-bold text-foreground">{bold}</strong>)
        i += 2
        continue
      }
      
      // Code `text`
      if (text[i] === '`') {
        if (current) parts.push(current)
        current = ''
        i++
        let code = ''
        while (i < text.length && text[i] !== '`') {
          code += text[i]
          i++
        }
        parts.push(
          <code key={i} className="px-2 py-1 rounded-md bg-secondary text-primary font-mono text-sm border border-border">
            {code}
          </code>
        )
        i++
        continue
      }
      
      current += text[i]
      i++
    }
    
    if (current) parts.push(current)
    return parts
  }

  return (
    <div className={`formatted-text prose prose-invert max-w-none ${className}`}>
      {formatContent(content)}
    </div>
  )
}

export function autoFormatText(text: string): string {
  if (!text) return ""
  
  return text
    .split('\n')
    .map(line => {
      const trimmed = line.trim()
      // Auto-format lists
      if (trimmed.match(/^[✓✅❌⭐🔥💎]/) && !trimmed.startsWith('- ')) {
        return `- ${trimmed}`
      }
      // Auto-format headers
      if (trimmed.match(/^[A-Z][A-Z\s]+:$/)) {
        return `## ${trimmed.replace(':', '')}`
      }
      return line
    })
    .join('\n')
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^[-•✓✅❌⭐🔥💎]\s*/gm, '')
    .trim()
}

export function generatePreview(text: string, maxLength: number = 150): string {
  const plain = stripMarkdown(text)
  if (plain.length <= maxLength) return plain
  return plain.substring(0, maxLength).trim() + '...'
}
