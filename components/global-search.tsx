"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, X, FileCode, MessageSquare, Loader2, Command, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/use-debounce"
import { motion, AnimatePresence } from "framer-motion"

interface SearchResult {
  assets: any[]
  threads: any[]
  users: any[]
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult>({ assets: [], threads: [], users: [] })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({ assets: [], threads: [], users: [] })
      return
    }

    const search = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || { assets: [], threads: [], users: [] })
        }
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    search()
  }, [debouncedQuery])

  const handleSelect = useCallback(
    (type: string, id: string) => {
      setOpen(false)
      setQuery("")
      if (type === "asset") router.push(`/asset/${id}`)
      else if (type === "thread") router.push(`/forum/thread/${id}`)
      else if (type === "user") router.push(`/profile/${id}`)
    },
    [router],
  )

  const hasResults = results.assets.length > 0 || results.threads.length > 0 || results.users.length > 0

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="relative w-full max-w-xl flex items-center gap-2 h-11 px-4 glass border border-border/50 rounded-xl text-[var(--textDim)] hover:border-[var(--primary)]/50 transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left text-sm">Search assets, threads, users...</span>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium glass rounded border border-border">
            <Command className="h-3 w-3 inline" />
          </kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium glass rounded border border-border">K</kbd>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl p-0 gap-0 glass border" style={{ background: 'rgba(0, 0, 0, 0.95)', borderColor: 'var(--primary)' }}>
              <VisuallyHidden>
                <DialogTitle>Search</DialogTitle>
              </VisuallyHidden>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <Search className="h-5 w-5 text-[var(--primary)]" />
                  <Input
                    placeholder="Search assets, threads, users..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-[var(--text)] placeholder:text-[var(--textDim)]"
                    autoFocus
                  />
                  {query && (
                    <motion.button 
                      onClick={() => setQuery("")} 
                      className="text-[var(--textDim)] hover:text-[var(--text)]"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
                  {isLoading ? (
                    <motion.div 
                      className="flex items-center justify-center py-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
                    </motion.div>
                  ) : !hasResults && query.length >= 2 ? (
                    <motion.div 
                      className="text-center py-8 text-[var(--textDim)]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      No results found for "{query}"
                    </motion.div>
                  ) : (
                    <>
                      {results.assets.length > 0 && (
                        <div className="mb-4">
                          <p className="px-3 py-2 text-xs font-semibold text-[var(--primary)] uppercase flex items-center gap-2">
                            <Sparkles className="h-3 w-3" />
                            Assets
                          </p>
                          {results.assets.map((asset, i) => (
                            <motion.button
                              key={asset.id}
                              onClick={() => handleSelect("asset", asset.id)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              whileHover={{ x: 5 }}
                            >
                              <div className="h-10 w-10 rounded-lg glass flex items-center justify-center overflow-hidden">
                                {asset.thumbnail ? (
                                  <img
                                    src={asset.thumbnail}
                                    alt={asset.title || 'Asset thumbnail'}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder.svg'
                                    }}
                                  />
                                ) : (
                                  <FileCode className="h-5 w-5 text-[var(--primary)]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-[var(--text)] truncate">{asset.title}</p>
                                <p className="text-xs text-[var(--textDim)] truncate">{asset.description}</p>
                              </div>
                              <Badge variant="secondary" className="shrink-0 glass">
                                {asset.category}
                              </Badge>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {results.threads.length > 0 && (
                        <div className="mb-4">
                          <p className="px-3 py-2 text-xs font-semibold text-[var(--primary)] uppercase flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            Forum Threads
                          </p>
                          {results.threads.map((thread, i) => (
                            <motion.button
                              key={thread.id}
                              onClick={() => handleSelect("thread", thread.id)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              whileHover={{ x: 5 }}
                            >
                              <div className="h-10 w-10 rounded-lg glass flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-[var(--text)] truncate">{thread.title}</p>
                                <p className="text-xs text-[var(--textDim)]">
                                  {thread.author?.username || "Unknown"} • {thread.replies_count} replies
                                </p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {results.users.length > 0 && (
                        <div>
                          <p className="px-3 py-2 text-xs font-semibold text-[var(--primary)] uppercase">Users</p>
                          {results.users.map((user, i) => (
                            <motion.button
                              key={user.id}
                              onClick={() => handleSelect("user", user.discord_id)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              whileHover={{ x: 5 }}
                            >
                              <img
                                src={user.avatar || "/placeholder.svg?height=40&width=40&query=user"}
                                alt={user.username || 'User avatar'}
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--primary)]/20"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-user.jpg'
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-[var(--text)]">{user.username}</p>
                                <p className="text-xs text-[var(--textDim)] capitalize">{user.membership} Member</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {query.length < 2 && (
                        <motion.div 
                          className="text-center py-8 text-[var(--textDim)] text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          Type at least 2 characters to search
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
