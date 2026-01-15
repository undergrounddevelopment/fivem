"use client"

import { useEffect } from 'react'
import { usePageLoadTime } from '@/hooks/use-performance'
import { performanceMonitor } from '@/lib/performance-monitor'

interface OptimizedLayoutProps {
  children: React.ReactNode
  pageName: string
}

export function OptimizedLayout({ children, pageName }: OptimizedLayoutProps) {
  usePageLoadTime(pageName)
  
  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.measurePageLoad(pageName)
    
    // Preload critical resources
    const preloadLinks = [
      'https://cdn.discordapp.com',
      'https://r2.fivemanage.com'
    ]
    
    preloadLinks.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'dns-prefetch'
      link.href = href
      document.head.appendChild(link)
    })
  }, [pageName])
  
  return <>{children}</>
}
