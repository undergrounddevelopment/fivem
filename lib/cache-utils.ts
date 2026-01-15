// Caching Utilities - FiveM Tools V7
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>()
  
  set<T>(key: string, data: T, ttlSeconds = 300) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    })
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  clear() {
    this.cache.clear()
  }
  
  size() {
    return this.cache.size
  }
}

export const cache = new SimpleCache()

// API response caching
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = cache.get<T>(key)
  
  if (cached) {
    console.log(`📦 Cache hit: ${key}`)
    return Promise.resolve(cached)
  }
  
  console.log(`🌐 Cache miss: ${key}`)
  return fetcher().then(data => {
    cache.set(key, data, ttlSeconds)
    return data
  })
}
