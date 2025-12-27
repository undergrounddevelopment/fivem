import { track } from '@vercel/analytics'

export const monitoring = {
  // Track custom events
  trackEvent(name: string, properties?: Record<string, any>) {
    if (process.env.NODE_ENV === 'production') {
      track(name, properties)
    }
  },

  // Track errors
  trackError(error: Error, context?: Record<string, any>) {
    console.error('[Monitoring]', error, context)
    
    if (process.env.NODE_ENV === 'production') {
      track('error', {
        message: error.message,
        stack: error.stack,
        ...context,
      })
    }
  },

  // Track performance
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    if (process.env.NODE_ENV === 'production') {
      track('performance', {
        metric,
        value,
        unit,
      })
    }
  },

  // Track user actions
  trackUserAction(action: string, details?: Record<string, any>) {
    if (process.env.NODE_ENV === 'production') {
      track('user_action', {
        action,
        ...details,
      })
    }
  },

  // Track API calls
  trackAPICall(endpoint: string, method: string, status: number, duration: number) {
    if (process.env.NODE_ENV === 'production') {
      track('api_call', {
        endpoint,
        method,
        status,
        duration,
      })
    }
  },

  // Track security events
  trackSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', details?: Record<string, any>) {
    console.warn('[Security]', event, severity, details)
    
    if (process.env.NODE_ENV === 'production') {
      track('security_event', {
        event,
        severity,
        ...details,
      })
    }
  },
}

// Web Vitals tracking
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    monitoring.trackPerformance(metric.name, metric.value, 'ms')
  }
}
