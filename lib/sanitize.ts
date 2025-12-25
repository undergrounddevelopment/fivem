// Input Sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

export function sanitizeHtml(html: string): string {
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'code', 'pre']
  const allowedAttrs = ['href', 'target', 'rel']
  
  let sanitized = html
  const tagRegex = /<(\/?)([\w]+)([^>]*)>/gi
  
  sanitized = sanitized.replace(tagRegex, (match, slash, tag, attrs) => {
    if (!allowedTags.includes(tag.toLowerCase())) return ''
    
    if (attrs) {
      attrs = attrs.replace(/(\w+)=["']([^"']*)["']/g, (m: string, attr: string, value: string) => {
        if (!allowedAttrs.includes(attr.toLowerCase())) return ''
        if (attr === 'href' && value.startsWith('javascript:')) return ''
        return `${attr}="${sanitizeInput(value)}"`
      })
    }
    
    return `<${slash}${tag}${attrs}>`
  })
  
  return sanitized
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
