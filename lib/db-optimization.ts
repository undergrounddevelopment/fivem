// Database optimization utilities

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize = 1000
  
  set<T>(key: string, data: T, ttl = 300000) { // 5 minutes default
    // Clean old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  clear() {
    this.cache.clear()
  }
  
  delete(key: string) {
    this.cache.delete(key)
  }
}

export const queryCache = new QueryCache()

// Query optimization helpers
export function createCacheKey(table: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key]
      return result
    }, {} as Record<string, any>)
  
  return `${table}:${JSON.stringify(sortedParams)}`
}

// Batch query helper
export class BatchQuery {
  private queries: Array<() => Promise<any>> = []
  private batchSize = 10
  
  add(query: () => Promise<any>) {
    this.queries.push(query)
  }
  
  async execute(): Promise<any[]> {
    const results: any[] = []
    
    for (let i = 0; i < this.queries.length; i += this.batchSize) {
      const batch = this.queries.slice(i, i + this.batchSize)
      const batchResults = await Promise.allSettled(
        batch.map(query => query())
      )
      
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : null
      ))
    }
    
    return results
  }
  
  clear() {
    this.queries = []
  }
}

// Connection pooling optimization
export function optimizeConnection(client: any) {
  // Set optimal connection settings
  if (client.query) {
    const originalQuery = client.query.bind(client)
    
    client.query = async (text: string, params?: any[]) => {
      const cacheKey = createCacheKey('query', { text, params })
      
      // Check cache first for SELECT queries
      if (text.trim().toLowerCase().startsWith('select')) {
        const cached = queryCache.get(cacheKey)
        if (cached) return cached
      }
      
      const result = await originalQuery(text, params)
      
      // Cache SELECT results
      if (text.trim().toLowerCase().startsWith('select')) {
        queryCache.set(cacheKey, result, 60000) // 1 minute cache
      }
      
      return result
    }
  }
  
  return client
}

// Query performance monitoring
export class QueryMonitor {
  private static instance: QueryMonitor
  private queries: Array<{ query: string; duration: number; timestamp: number }> = []
  
  static getInstance() {
    if (!QueryMonitor.instance) {
      QueryMonitor.instance = new QueryMonitor()
    }
    return QueryMonitor.instance
  }
  
  logQuery(query: string, duration: number) {
    this.queries.push({
      query,
      duration,
      timestamp: Date.now()
    })
    
    // Keep only last 100 queries
    if (this.queries.length > 100) {
      this.queries.shift()
    }
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query detected (${duration}ms):`, query)
    }
  }
  
  getStats() {
    const totalQueries = this.queries.length
    const avgDuration = this.queries.reduce((sum, q) => sum + q.duration, 0) / totalQueries
    const slowQueries = this.queries.filter(q => q.duration > 1000)
    
    return {
      totalQueries,
      avgDuration,
      slowQueries: slowQueries.length,
      recentQueries: this.queries.slice(-10)
    }
  }
}

export const queryMonitor = QueryMonitor.getInstance()

// Optimized pagination
export function createPaginationQuery(
  baseQuery: string,
  page: number = 1,
  limit: number = 20,
  orderBy: string = 'created_at',
  orderDirection: 'ASC' | 'DESC' = 'DESC'
) {
  const offset = (page - 1) * limit
  
  return {
    query: `${baseQuery} ORDER BY ${orderBy} ${orderDirection} LIMIT ${limit} OFFSET ${offset}`,
    countQuery: `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`,
    params: { page, limit, offset }
  }
}

// Index suggestions
export function suggestIndexes(queries: string[]): string[] {
  const suggestions: string[] = []
  
  queries.forEach(query => {
    const lowerQuery = query.toLowerCase()
    
    // Suggest indexes for WHERE clauses
    const whereMatch = lowerQuery.match(/where\s+(\w+)\s*=/g)
    if (whereMatch) {
      whereMatch.forEach(match => {
        const column = match.replace(/where\s+(\w+)\s*=/, '$1')
        suggestions.push(`CREATE INDEX IF NOT EXISTS idx_${column} ON table_name (${column});`)
      })
    }
    
    // Suggest indexes for JOIN conditions
    const joinMatch = lowerQuery.match(/join\s+\w+\s+on\s+\w+\.(\w+)\s*=\s*\w+\.(\w+)/g)
    if (joinMatch) {
      joinMatch.forEach(match => {
        const columns = match.match(/(\w+)\.(\w+)/g)
        if (columns) {
          columns.forEach(col => {
            const [table, column] = col.split('.')
            suggestions.push(`CREATE INDEX IF NOT EXISTS idx_${table}_${column} ON ${table} (${column});`)
          })
        }
      })
    }
  })
  
  return [...new Set(suggestions)] // Remove duplicates
}