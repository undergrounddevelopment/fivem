"use client"

import { useEffect } from 'react'

export function AnalyticsWrapper() {
  useEffect(() => {
    // Only load analytics in production
    if (process.env.NODE_ENV !== 'production') return

    // Load Vercel Analytics safely
    const loadAnalytics = async () => {
      try {
        const { Analytics } = await import('@vercel/analytics/react')
        const { SpeedInsights } = await import('@vercel/speed-insights/react')
        
        // Create containers if they don't exist
        if (!document.getElementById('vercel-analytics')) {
          const analyticsDiv = document.createElement('div')
          analyticsDiv.id = 'vercel-analytics'
          document.body.appendChild(analyticsDiv)
        }
        
        if (!document.getElementById('vercel-speed-insights')) {
          const speedDiv = document.createElement('div')
          speedDiv.id = 'vercel-speed-insights'
          document.body.appendChild(speedDiv)
        }
      } catch (error) {
        console.warn('Analytics loading failed:', error)
      }
    }

    loadAnalytics()
  }, [])

  return null
}