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
import { ThreadRow, ThreadRowSkeleton } from "@/components/forum/thread-row"

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

  // Get threads from realtime hook
  const threads = realtimeThreads || []

  // Map threads to match ThreadRow interface
  const formattedThreads = category ? threads.map((t: any) => ({
    id: t.id,
    title: t.title,
    content: t.content,
    category: t.category_id || categoryId,
    categoryName: category?.name || 'Category',
    threadType: t.thread_type || "discussion",
    author: {
      id: t.author?.id || t.author_id,
      username: t.author?.username || "Unknown",
      avatar: t.author?.avatar,
      membership: t.author?.membership || "member"
    },
    replies: t.replies || t.replies_count || 0,
    likes: t.likes || 0,
    views: t.views || 0,
    isPinned: t.is_pinned || t.isPinned || false,
    isLocked: t.is_locked || false,
    createdAt: t.created_at || t.createdAt,
    updatedAt: t.updated_at,
    lastReply: t.last_reply ? {
      author: {
        id: t.last_reply.author_id,
        username: t.last_reply.author?.username || "Unknown",
        avatar: t.last_reply.author?.avatar,
        membership: t.last_reply.author?.membership || "member"
      },
      createdAt: t.last_reply.created_at
    } : null
  })) : []

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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/forum">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">{category.name}</h1>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isConnected && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              Live
            </Badge>
          )}
          <Link href="/forum/new">
            <Button className="bg-primary text-black hover:bg-primary/90 font-bold">
              <Plus className="h-4 w-4 mr-2" />
              New Thread
            </Button>
          </Link>
        </div>
      </div>

        {/* Pinned Threads Section */}
        {formattedThreads.filter(t => t.isPinned).length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Pin className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Pinned Announcements</h2>
            </div>
            <div className="space-y-3">
              {formattedThreads.filter(t => t.isPinned).map((thread) => (
                <ThreadRow key={thread.id} thread={thread} />
              ))}
            </div>
          </div>
        )}

        {/* Discussions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">General Discussions</h2>
            </div>
            {threadsLoading && <Loader2 className="h-4 w-4 animate-spin text-primary/40" />}
          </div>

          <div className="space-y-3">
            {threadsLoading && threads.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <ThreadRowSkeleton key={i} />
              ))
            ) : formattedThreads.filter(t => !t.isPinned).length > 0 ? (
              formattedThreads.filter(t => !t.isPinned).map((thread) => (
                <ThreadRow key={thread.id} thread={thread} />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 glass rounded-3xl border-dashed border-2 border-white/5"
              >
                <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No discussions yet</h3>
                <p className="text-muted-foreground mb-8 text-center max-w-xs">Be the first to start a conversation in {category.name}!</p>
                <Link href="/forum/new">
                  <Button className="bg-primary text-black hover:bg-primary/90 font-black h-12 px-8 rounded-2xl transition-all">
                    <Plus className="h-5 w-5 mr-2" />
                    START DISCUSSION
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
    </div>
  )
}
