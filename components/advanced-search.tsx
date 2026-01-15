"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, X, Calendar, User, Tag, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchFilters {
  query: string
  category?: string
  author?: string
  dateFrom?: Date
  dateTo?: Date
  minRating?: number
  tags?: string[]
  sortBy?: 'newest' | 'oldest' | 'popular' | 'rating'
  type?: 'all' | 'threads' | 'assets'
}

interface SearchResult {
  id: string
  title: string
  type: 'thread' | 'asset'
  author: string
  category: string
  rating?: number
  replies?: number
  downloads?: number
  createdAt: string
  excerpt: string
  tags: string[]
}

export function AdvancedSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'newest',
    type: 'all'
  })
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  const debouncedQuery = useDebounce(filters.query, 300)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch()
    } else {
      setResults([])
    }
  }, [debouncedQuery, filters])

  const performSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          if (Array.isArray(value)) {
            params.set(key, value.join(','))
          } else if (value instanceof Date) {
            params.set(key, value.toISOString())
          } else {
            params.set(key, value.toString())
          }
        }
      })

      const response = await fetch(`/api/search/advanced?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setResults(data.results || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      query: filters.query,
      sortBy: 'newest',
      type: 'all'
    })
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'query' && key !== 'sortBy' && key !== 'type' && 
    value && (Array.isArray(value) ? value.length > 0 : true)
  )

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          placeholder="Search threads, assets, users..."
          value={filters.query}
          onChange={(e) => updateFilter('query', e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-20 h-11 bg-card/50 backdrop-blur-sm border-white/10"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 px-2 ${hasActiveFilters ? 'text-primary' : ''}`}
              >
                <Filter className="h-3 w-3" />
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Advanced Filters</h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Type</label>
                    <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="threads">Threads</SelectItem>
                        <SelectItem value="assets">Assets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Sort By</label>
                    <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="popular">Popular</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">Category</label>
                  <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Any category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scripts">Scripts</SelectItem>
                      <SelectItem value="mlo">MLO</SelectItem>
                      <SelectItem value="vehicles">Vehicles</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="help">Help</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">Author</label>
                  <Input
                    placeholder="Username"
                    value={filters.author || ''}
                    onChange={(e) => updateFilter('author', e.target.value)}
                    className="h-8"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">Min Rating</label>
                  <Select value={filters.minRating?.toString()} onValueChange={(value) => updateFilter('minRating', parseInt(value))}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+ Stars</SelectItem>
                      <SelectItem value="2">2+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && filters.query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 max-h-96 overflow-hidden"
          >
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-b-0"
                    onClick={() => {
                      const url = result.type === 'thread' 
                        ? `/forum/thread/${result.id}` 
                        : `/assets/${result.id}`
                      window.location.href = url
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{result.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {result.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {result.author}
                          </span>
                          <span>{result.category}</span>
                          {result.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current text-yellow-400" />
                              {result.rating}
                            </span>
                          )}
                          {result.replies && (
                            <span>{result.replies} replies</span>
                          )}
                          {result.downloads && (
                            <span>{result.downloads} downloads</span>
                          )}
                        </div>
                        {result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="text-xs text-muted-foreground">Try different keywords or filters</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}