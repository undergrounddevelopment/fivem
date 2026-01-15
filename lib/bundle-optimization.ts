import React from 'react'

// Bundle optimization utilities

// Optimized imports for commonly used libraries
export const optimizedImports = {
  // Lucide React - Use standard imports to avoid module issues
  icons: {
    // Core icons - Use standard lucide-react imports
    Upload: () => import('lucide-react').then(m => ({ Upload: m.Upload })),
    Download: () => import('lucide-react').then(m => ({ Download: m.Download })),
    Eye: () => import('lucide-react').then(m => ({ Eye: m.Eye })),
    Heart: () => import('lucide-react').then(m => ({ Heart: m.Heart })),
    Star: () => import('lucide-react').then(m => ({ Star: m.Star })),
    User: () => import('lucide-react').then(m => ({ User: m.User })),
    Settings: () => import('lucide-react').then(m => ({ Settings: m.Settings })),
    Search: () => import('lucide-react').then(m => ({ Search: m.Search })),
    Menu: () => import('lucide-react').then(m => ({ Menu: m.Menu })),
    X: () => import('lucide-react').then(m => ({ X: m.X })),
    ChevronDown: () => import('lucide-react').then(m => ({ ChevronDown: m.ChevronDown })),
    ChevronUp: () => import('lucide-react').then(m => ({ ChevronUp: m.ChevronUp })),
    ChevronLeft: () => import('lucide-react').then(m => ({ ChevronLeft: m.ChevronLeft })),
    ChevronRight: () => import('lucide-react').then(m => ({ ChevronRight: m.ChevronRight })),
    Plus: () => import('lucide-react').then(m => ({ Plus: m.Plus })),
    Minus: () => import('lucide-react').then(m => ({ Minus: m.Minus })),
    Check: () => import('lucide-react').then(m => ({ Check: m.Check })),
    AlertCircle: () => import('lucide-react').then(m => ({ AlertCircle: m.AlertCircle })),
    Info: () => import('lucide-react').then(m => ({ Info: m.Info })),
    Loader2: () => import('lucide-react').then(m => ({ Loader2: m.Loader2 })),
  },

  // Date-fns - Import only needed functions
  dateFns: {
    format: () => import('date-fns/format'),
    formatDistanceToNow: () => import('date-fns/formatDistanceToNow'),
    isValid: () => import('date-fns/isValid'),
    parseISO: () => import('date-fns/parseISO'),
  },

  // Framer Motion - Import only needed components
  framerMotion: {
    motion: () => import('framer-motion').then(m => ({ motion: m.motion })),
    AnimatePresence: () => import('framer-motion').then(m => ({ AnimatePresence: m.AnimatePresence })),
    useAnimation: () => import('framer-motion').then(m => ({ useAnimation: m.useAnimation })),
    useInView: () => import('framer-motion').then(m => ({ useInView: m.useInView })),
  }
}



// Bundle analyzer helper
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return null

  const performance = window.performance
  if (!performance) return null

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

  const jsResources = resources.filter(r => r.name.includes('.js'))
  const cssResources = resources.filter(r => r.name.includes('.css'))

  return {
    totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    jsSize: jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
    cssSize: cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
    resourceCount: resources.length,
    cacheHits: resources.filter(r => r.transferSize === 0).length
  }
}

// Code splitting helper
export function createAsyncComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return React.lazy(importFn)
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  const criticalResources = [
    '/fonts/inter-var.woff2',
    '/images/logo.svg',
    '/api/auth/session'
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'

    if (resource.endsWith('.woff2')) {
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
    } else if (resource.endsWith('.svg')) {
      link.as = 'image'
    } else {
      link.as = 'fetch'
      link.crossOrigin = 'anonymous'
    }

    link.href = resource
    document.head.appendChild(link)
  })
}



// Initialize optimizations
export function initializeBundleOptimizations() {
  if (typeof window === 'undefined') return

  // Preload critical resources
  preloadCriticalResources()

  // Setup performance monitoring
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        }
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming
          console.log('FID:', fidEntry.processingStart - fidEntry.startTime)
        }
      })
    })

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] })
  }
}