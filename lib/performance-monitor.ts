// Performance Monitor - FiveM Tools V7
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }
  
  measurePageLoad(pageName: string) {
    if (typeof window !== 'undefined' && window.performance) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
      console.log(`📊 ${pageName} loaded in ${loadTime}ms`)
      
      // Send to analytics if needed
      if (window.gtag) {
        window.gtag('event', 'page_load_time', {
          event_category: 'Performance',
          event_label: pageName,
          value: loadTime
        })
      }
    }
  }
  
  measureApiCall(endpoint: string, startTime: number) {
    const duration = Date.now() - startTime
    console.log(`🌐 API ${endpoint} took ${duration}ms`)
    
    if (duration > 2000) {
      console.warn(`⚠️ Slow API call: ${endpoint} (${duration}ms)`)
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()
