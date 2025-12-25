// Client-side CSRF token utility
export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null
  
  // Try to get from window global (set by layout script)
  if (typeof window !== 'undefined' && (window as any).__CSRF_TOKEN__) {
    return (window as any).__CSRF_TOKEN__
  }
  
  // Try to get from cookie
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrf-token') {
      return decodeURIComponent(value)
    }
  }
  
  // Try to get from meta tag (if set by server)
  const metaTag = document.querySelector('meta[name="csrf-token"]')
  if (metaTag) {
    return metaTag.getAttribute('content')
  }
  
  return null
}

export async function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
  const csrfToken = getCSRFToken()
  
  const headers = new Headers(options.headers)
  if (csrfToken) {
    headers.set('x-csrf-token', csrfToken)
  }
  
  return fetch(url, {
    ...options,
    headers,
  })
}
