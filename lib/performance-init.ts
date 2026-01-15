// Performance optimization initialization
// This file initializes all performance optimizations when the app starts

import { initializeBundleOptimizations } from './bundle-optimization'

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  if (typeof window === 'undefined') return

  console.log('🚀 Initializing performance optimizations...')

  // Initialize bundle optimizations
  initializeBundleOptimizations()

  // Setup service worker for caching (if available)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker not available, continue without it
    })
  }

  // Optimize images loading
  const images = document.querySelectorAll('img[loading="lazy"]')
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        }
      })
    })

    images.forEach(img => imageObserver.observe(img))
  }

  // Preload critical resources
  const criticalResources = [
    { href: '/api/auth/session', as: 'fetch' },
    { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2' }
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.href
    link.as = resource.as
    if (resource.type) link.type = resource.type
    if (resource.as === 'font') link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })

  // Setup performance monitoring
  if ('PerformanceObserver' in window) {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        }
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming
          console.log('FID:', fidEntry.processingStart - fidEntry.startTime)
        }
        if (entry.entryType === 'layout-shift') {
          console.log('CLS:', (entry as any).value)
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (e) {
      // Some browsers might not support all entry types
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    }
  }

  // Memory cleanup on page unload
  window.addEventListener('beforeunload', () => {
    // Clear any caches or cleanup resources
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('temp') || name.includes('old')) {
            caches.delete(name)
          }
        })
      })
    }
  })

  console.log('✅ Performance optimizations initialized')
}

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePerformanceOptimizations)
  } else {
    initializePerformanceOptimizations()
  }
}