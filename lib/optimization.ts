// Auto-optimization utilities
export const optimization = {
  // Debounce function for search and inputs
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // Throttle function for scroll and resize events
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  // Lazy load images
  lazyLoadImage: (src: string) => {
    if (typeof window === 'undefined') return src
    const img = new Image()
    img.src = src
    return src
  },

  // Preload critical resources
  preloadResource: (href: string, as: string) => {
    if (typeof window === 'undefined') return
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    document.head.appendChild(link)
  },

  // Compress data before storing
  compressData: (data: any): string => {
    return JSON.stringify(data)
  },

  // Decompress data
  decompressData: (data: string): any => {
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  },

  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  // Get optimal image size based on viewport
  getOptimalImageSize: (): number => {
    if (typeof window === 'undefined') return 1920
    const width = window.innerWidth
    if (width <= 640) return 640
    if (width <= 750) return 750
    if (width <= 828) return 828
    if (width <= 1080) return 1080
    if (width <= 1200) return 1200
    return 1920
  },
}

// Performance monitoring
export const performanceMonitor = {
  // Mark performance
  mark: (name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(name)
    }
  },

  // Measure performance
  measure: (name: string, startMark: string, endMark: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        performance.measure(name, startMark, endMark)
        const measure = performance.getEntriesByName(name)[0]
        return measure.duration
      } catch {
        return 0
      }
    }
    return 0
  },

  // Clear marks
  clearMarks: () => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.clearMarks()
      performance.clearMeasures()
    }
  },
}

// Memory optimization
export const memoryOptimization = {
  // Clear unused cache
  clearCache: () => {
    if (typeof window !== 'undefined') {
      // Clear old localStorage items
      const now = Date.now()
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('cache_')) {
          const item = localStorage.getItem(key)
          if (item) {
            try {
              const { timestamp } = JSON.parse(item)
              if (now - timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(key)
              }
            } catch {}
          }
        }
      }
    }
  },

  // Get cache with expiry
  getCache: (key: string): any => {
    if (typeof window === 'undefined') return null
    const item = localStorage.getItem(`cache_${key}`)
    if (!item) return null
    try {
      const { data, timestamp } = JSON.parse(item)
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`cache_${key}`)
        return null
      }
      return data
    } catch {
      return null
    }
  },

  // Set cache with timestamp
  setCache: (key: string, data: any) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch {}
  },
}
