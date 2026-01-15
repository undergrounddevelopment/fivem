import { cache, withCache } from './cache-utils'
import { performanceMonitor } from './performance-monitor'

interface APIOptions extends Omit<RequestInit, 'cache'> {
  cache?: boolean
  cacheTTL?: number
  timeout?: number
}

export class OptimizedAPI {
  private baseURL: string

  constructor(baseURL = '/api') {
    this.baseURL = baseURL
  }

  async request<T>(
    endpoint: string,
    options: Omit<RequestInit, 'cache'> & APIOptions = {}
  ): Promise<T> {
    const { cache: useCache = true, cacheTTL = 300, timeout = 10000, ...rest } = options
    const fetchOptions = rest as RequestInit
    const url = `${this.baseURL}${endpoint}`
    const cacheKey = `api:${endpoint}:${JSON.stringify(fetchOptions)}`

    // Use cache if enabled
    if (useCache && fetchOptions.method !== 'POST') {
      return withCache(cacheKey, () => this.fetchWithTimeout(url, fetchOptions, timeout), cacheTTL)
    }

    return this.fetchWithTimeout(url, fetchOptions, timeout)
  }

  private async fetchWithTimeout<T>(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<T> {
    const startTime = Date.now()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Measure performance
      performanceMonitor.measureApiCall(url, startTime)

      return data
    } catch (error) {
      performanceMonitor.measureApiCall(`${url} (ERROR)`, startTime)
      throw error
    }
  }

  // Convenience methods
  get<T>(endpoint: string, options?: APIOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(endpoint: string, data?: any, options?: APIOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: data ? JSON.stringify(data) : undefined
    })
  }
}

export const api = new OptimizedAPI()
