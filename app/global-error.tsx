"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', error)
    }
  }, [error])

  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0d1117',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#161b22',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '400px',
            textAlign: 'center',
            border: '1px solid #30363d'
          }}>
            <h1 style={{ color: '#f0f6fc', marginBottom: '0.5rem' }}>Critical Error</h1>
            <p style={{ color: '#8b949e', marginBottom: '1.5rem' }}>
              A critical error occurred. Please refresh the page.
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: '#238636',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
