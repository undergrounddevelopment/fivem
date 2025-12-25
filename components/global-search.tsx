"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, X, FileCode, MessageSquare, Loader2, Command } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/use-debounce"

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

  // Keyboard shortcut
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

  // Search
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
      <button
        onClick={() => setOpen(true)}
        className="relative w-full max-w-xl flex items-center gap-2 h-11 px-4 bg-secondary/50 border border-border/50 rounded-xl text-muted-foreground hover:border-primary/50 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left text-sm">Search assets, threads, users...</span>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-background/80 rounded border border-border">
            <Command className="h-3 w-3 inline" />
          </kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-background/80 rounded border border-border">K</kbd>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 glass">
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search assets, threads, users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !hasResults && query.length >= 2 ? (
              <div className="text-center py-8 text-muted-foreground">No results found for "{query}"</div>
            ) : (
              <>
                {/* Assets */}
                {results.assets.length > 0 && (
                  <div className="mb-4">
                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Assets</p>
                    {results.assets.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => handleSelect("asset", asset.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                      >
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                          {asset.thumbnail ? (
                            <img
                              src={asset.thumbnail || "/placeholder.svg"}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FileCode className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{asset.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{asset.description}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {asset.category}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}

                {/* Threads */}
                {results.threads.length > 0 && (
                  <div className="mb-4">
                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Forum Threads</p>
                    {results.threads.map((thread) => (
                      <button
                        key={thread.id}
                        onClick={() => handleSelect("thread", thread.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                      >
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{thread.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {thread.author?.username || "Unknown"} • {thread.replies_count} replies
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Users */}
                {results.users.length > 0 && (
                  <div>
                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Users</p>
                    {results.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelect("user", user.discord_id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                      >
                        <img
                          src={user.avatar || "/placeholder.svg?height=40&width=40&query=user"}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{user.username}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user.membership} Member</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {query.length < 2 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Type at least 2 characters to search
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
