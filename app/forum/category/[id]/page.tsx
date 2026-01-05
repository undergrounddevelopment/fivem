"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useRealtimeThreads } from "@/hooks/use-realtime"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  Plus, 
  MessageSquare, 
  Heart, 
  Eye, 
  Pin, 
  Crown, 
  Shield, 
  Loader2,
  Zap,
  Activity,
  RefreshCw,
  Clock,
  Hash,
  Users,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

interface Author {
  id: string
  username: string
  avatar: string | null
  membership: string
}

interface Thread {
  id: string
  title: string
  category_id?: string
  author?: Author | null
  replies?: number
  replies_count?: number
  likes: number
  views: number
  is_pinned?: boolean
  isPinned?: boolean
  created_at?: string
  createdAt?: string
}

interface Category {
  id: string
  name: string
  description: string
  threadCount?: number
  thread_count?: number
  color: string
  icon?: string
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params?.id as string

  // Use realtime threads hook with category filter
  const { threads: realtimeThreads, loading: threadsLoading, refetch: refetchThreads } = useRealtimeThreads(categoryId)

  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch category info
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const catRes = await fetch("/api/forum/categories")
        if (catRes.ok) {
          const catData = await catRes.json()
          const categoriesArray = Array.isArray(catData) ? catData : catData.categories || []
          const foundCategory = categoriesArray.find((c: Category) => c.id === params?.id)
          if (foundCategory) {
            setCategory(foundCategory)
          } else {
            router.push("/forum")
            return
          }
        }
      } catch (error) {
        console.error("Error fetching category:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params?.id) {
      fetchCategory()
    }
  }, [params?.id, router])

  // Realtime subscription for this category's threads
  useEffect(() => {
    if (!categoryId) return

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    
    const channel = supabase
      .channel(`category-threads:${categoryId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "forum_threads",
          filter: `category_id=eq.${categoryId}`,
        },
        () => {
          setLastUpdate(new Date())
          refetchThreads()
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [categoryId, refetchThreads])

  // Threads are already filtered by API - no need to double filter
  const threads = realtimeThreads || []
  
  // Debug logging
  console.log(`[Category Page] categoryId: ${categoryId}, threads received: ${threads.length}`)

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!category) {
    return null
  }

  const pinnedThreads = threads.filter((t: Thread) => t.is_pinned || t.isPinned)
  const regularThreads = threads.filter((t: Thread) => !t.is_pinned && !t.isPinned)

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ background: `linear-gradient(135deg, ${category.color}20 0%, transparent 50%)` }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${category.color}10` }} />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 px-3 py-1.5 rounded-lg hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div 
                  className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-2xl"
                  style={{ backgroundColor: `${category.color}30` }}
                >
                  <Hash className="h-8 w-8" style={{ color: category.color }} />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center bg-green-500">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-foreground">
                    {category.name}
                  </h1>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                  </Badge>
                </div>
                <p className="text-muted-foreground">{category.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {category.threadCount || category.thread_count || threads.length} threads
                  </span>
                </div>
              </div>
            </div>
            
            <Link href="/forum/new">
              <Button className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 gap-2 rounded-xl h-11 shadow-lg shadow-primary/25">
                <Plus className="h-4 w-4" />
                New Thread
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Realtime Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-3 rounded-xl border flex items-center justify-between ${
            isConnected 
              ? "bg-green-500/5 border-green-500/20" 
              : "bg-yellow-500/5 border-yellow-500/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
            <span className="text-sm font-medium">
              {isConnected ? "Real-time updates active" : "Connecting..."}
            </span>
            <span className="text-xs text-muted-foreground">
              Last update: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetchThreads()}
            className="gap-2 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </motion.div>

        {/* Pinned Threads */}
        {pinnedThreads.length > 0 && (
          <Card className="mb-6 overflow-hidden border-primary/20">
            <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-pink-500/5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Pin className="h-5 w-5 text-primary" />
                Pinned Threads
              </h2>
            </div>
            <CardContent className="p-4 space-y-3">
              <AnimatePresence>
                {pinnedThreads.map((thread: Thread, index: number) => (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/forum/thread/${thread.id}`}
                      className="flex items-center gap-4 rounded-xl bg-primary/5 border border-primary/20 p-4 transition-all hover:bg-primary/10 hover:border-primary/40"
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-secondary shrink-0 ring-2 ring-primary/30">
                        {thread.author?.avatar ? (
                          <Image
                            src={thread.author.avatar}
                            alt={thread.author.username || "User"}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-primary/20 flex items-center justify-center font-semibold">
                            {thread.author?.username?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Pin className="h-4 w-4 text-primary shrink-0" />
                          <h3 className="font-semibold text-foreground truncate">{thread.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {thread.author?.membership === "admin" && <Shield className="h-3 w-3 text-destructive" />}
                          {thread.author?.membership === "vip" && <Crown className="h-3 w-3 text-primary" />}
                          <span className="font-medium text-foreground">{thread.author?.username || "Unknown"}</span>
                          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                          <span>{formatDistanceToNow(new Date(thread.created_at || thread.createdAt || new Date()), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium text-foreground">{thread.replies_count || thread.replies || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span className="font-medium text-foreground">{(thread.views || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        {/* Regular Threads */}
        <Card className="overflow-hidden border-border/50">
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                Discussions
              </h2>
              <div className="flex items-center gap-2">
                {threadsLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <Badge variant="outline" className="text-xs gap-1">
                  <Activity className="h-3 w-3" />
                  Real-time
                </Badge>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            {threadsLoading && threads.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl bg-muted/20 p-4 animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-muted/50" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 bg-muted/50 rounded" />
                      <div className="h-3 w-1/3 bg-muted/50 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : regularThreads.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {regularThreads.map((thread: Thread, index: number) => (
                    <motion.div
                      key={thread.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                      layout
                    >
                      <Link
                        href={`/forum/thread/${thread.id}`}
                        className="flex items-center gap-4 rounded-xl bg-muted/20 p-4 transition-all hover:bg-muted/40 border border-transparent hover:border-primary/20"
                      >
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-secondary shrink-0">
                          {thread.author?.avatar ? (
                            <Image
                              src={thread.author.avatar}
                              alt={thread.author.username || "User"}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-primary/20 flex items-center justify-center font-semibold text-sm">
                              {thread.author?.username?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                            {thread.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {thread.author?.membership === "vip" && <Crown className="h-3 w-3 text-primary" />}
                              {thread.author?.membership === "admin" && <Shield className="h-3 w-3 text-destructive" />}
                              <span className="font-medium text-foreground">{thread.author?.username || "Unknown"}</span>
                            </span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                            <span>{formatDistanceToNow(new Date(thread.created_at || thread.createdAt || new Date()), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{thread.replies_count || thread.replies || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{thread.likes || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{(thread.views || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 rounded-xl bg-muted/10"
              >
                <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No threads yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to start a discussion!</p>
                <Link href="/forum/new">
                  <Button className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 gap-2 rounded-xl shadow-lg shadow-primary/25">
                    <Plus className="h-4 w-4" />
                    Create Thread
                  </Button>
                </Link>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
