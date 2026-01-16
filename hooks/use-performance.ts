import { useEffect, useRef, useCallback } from 'react'

export function usePageLoadTime(pageName: string) {
  const startTime = useRef(Date.now())
  
  useEffect(() => {
    const loadTime = Date.now() - startTime.current
    
    if (typeof window !== 'undefined') {
      console.log(`📊 ${pageName} rendered in ${loadTime}ms`)
      
      // Track in analytics
      if (window.gtag) {
        window.gtag('event', 'page_render_time', {
          event_category: 'Performance',
          event_label: pageName,
          value: loadTime
        })
      }
    }
  }, [pageName])
}


export function useApiPerformance() {
  const measureApiCall = useCallback((endpoint: string, promise: Promise<any>) => {
    const startTime = Date.now()
    
    return promise.finally(() => {
      const duration = Date.now() - startTime
      console.log(`🌐 API ${endpoint}: ${duration}ms`)
      
      if (duration > 3000) {
        console.warn(`⚠️ Slow API: ${endpoint} (${duration}ms)`)
      }
    })
  }, [])
  
  return { measureApiCall }
}

export function useImageOptimization() {
  const loadImage = useCallback((src: string, placeholder?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve(src)
        return
      }
      
      const img = new Image()
      img.src = src
      img.onload = () => resolve(src)
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    })
  }, [])

  return { loadImage }
}
