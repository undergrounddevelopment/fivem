"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useRealtimeThreads } from "@/hooks/use-realtime"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import {
  MessageSquare,
  Plus,
  Pin,
  Eye,
  Heart,
  Megaphone,
  HelpCircle,
  Code,
  Star,
  MessageCircle,
  Users,
  TrendingUp,
  Flame,
  Clock,
  Crown,
  Shield,
  Search,
  Filter,
  ShoppingBag,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Activity,
  RefreshCw,
  Sparkles,
  BookOpen,
  Coffee,
  Hash,
  ArrowUpRight,
  MoreHorizontal,
  Bell,
  Settings,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  megaphone: Megaphone,
  "message-circle": MessageCircle,
  "help-circle": HelpCircle,
  code: Code,
  star: Star,
  "shopping-bag": ShoppingBag,
  Megaphone: Megaphone,
  MessageSquare: MessageSquare,
  HelpCircle: HelpCircle,
  Code: Code,
  Star: Star,
  BookOpen: BookOpen,
  Coffee: Coffee,
}

interface ForumThread {
  id: string
  title: string
  content?: string
  category_id: string
  author_id: string
  author?: {
    id: string
    username: string
    avatar: string | null
    membership: string
  }
  replies_count?: number
  replies?: number
  likes: number
  views: number
  is_pinned: boolean
  is_locked?: boolean
  status: string
  created_at: string
  updated_at?: string
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  thread_count?: number
  post_count?: number
  is_active?: boolean
}

interface OnlineUser {
  id: string
  username: string
  avatar: string | null
  membership: string
}

interface TopContributor {
  id: string
  username: string
  avatar: string | null
  membership: string
  points: number
  threads: number
  replies: number
}

export default function ForumPage() {
  const { user } = useAuth()
  const { threads: realtimeThreads, loading: threadsLoading, refetch: refetchThreads } = useRealtimeThreads()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [topContributors, setTopContributors] = useState<TopContributor[]>([])
  const [stats, setStats] = useState({
    totalThreads: 0,
    totalPosts: 0,
    onlineUsers: 0,
    activeToday: 0,
  })
  const [activeTab, setActiveTab] = useState("all")
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/forum/categories")
        const data = await res.json()
        // API returns array directly, not { categories: [...] }
        if (Array.isArray(data)) {
          setCategories(data)
        } else if (data.categories) {
          setCategories(data.categories)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch online users
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const res = await fetch("/api/forum/online-users")
        const data = await res.json()
        if (Array.isArray(data)) {
          setOnlineUsers(data)
        }
      } catch (error) {
        console.error("Failed to fetch online users:", error)
      }
    }
    fetchOnlineUsers()
    const interval = setInterval(fetchOnlineUsers, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch top contributors
  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const res = await fetch("/api/forum/top-contributors")
        const data = await res.json()
        if (Array.isArray(data)) {
          setTopContributors(data)
        }
      } catch (error) {
        console.error("Failed to fetch top contributors:", error)
      }
    }
    fetchTopContributors()
  }, [])

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats")
        const json = await res.json()
        const data = json.data || json
        setStats({
          totalThreads: data.totalThreads || 0,
          totalPosts: (data.totalThreads || 0) + (data.totalPosts || 0),
          onlineUsers: data.onlineUsers || 0,
          activeToday: data.totalUsers || 0,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // Realtime connection status
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    
    const channel = supabase
      .channel("forum-status")
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_threads" }, () => {
        setLastUpdate(new Date())
        refetchThreads()
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [refetchThreads])

  // Filter threads
  const threads = realtimeThreads || []
  const pinnedThreads = threads.filter((t: ForumThread) => t.is_pinned)
  const regularThreads = threads.filter((t: ForumThread) => !t.is_pinned)
  
  const filteredThreads = searchQuery
    ? regularThreads.filter((t: ForumThread) => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : regularThreads

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId)
    return cat?.name || "General"
  }

  const getCategoryColor = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId)
    return cat?.color || "#3b82f6"
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-pink-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-primary/30">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center bg-green-500">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-purple-400 bg-clip-text text-transparent">
                    Community Forum
                  </h1>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Join discussions, get help, and connect with the FiveM community
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search threads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-background/50 backdrop-blur-sm border-border/50 rounded-xl h-11"
                />
              </div>
              
              {/* New Thread Button */}
              {user && (
                <Link href="/forum/new">
                  <Button className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 gap-2 rounded-xl h-11 shadow-lg shadow-primary/25">
                    <Plus className="h-4 w-4" />
                    New Thread
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Connection Status Bar */}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{stats.totalThreads.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Threads</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{stats.totalPosts.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Posts</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{stats.activeToday}</p>
                    <p className="text-sm text-muted-foreground">Active Today</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-foreground">{stats.onlineUsers}</p>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Online Now</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-cyan-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Moderation Notice */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/5"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">Community Guidelines</p>
                <p className="text-sm text-muted-foreground">
                  All new posts are reviewed by moderators before being published. Please follow our community guidelines.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Categories */}
            <Card className="overflow-hidden border-border/50">
              <div className="p-4 border-b border-border/50 bg-gradient-to-r from-purple-500/10 to-pink-500/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Hash className="h-5 w-5 text-purple-400" />
                    Categories
                  </h2>
                  <Badge variant="outline" className="text-xs">
                    {categories.length} categories
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {categories.map((category, index) => {
                    const Icon = iconMap[category.icon] || MessageSquare
                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={`/forum/category/${category.id}`}
                          className="group flex items-center gap-4 rounded-xl p-4 transition-all hover:bg-muted/50 border border-transparent hover:border-primary/20"
                        >
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <Icon className="h-6 w-6" style={{ color: category.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {category.name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-foreground">{category.thread_count || 0}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">threads</p>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Pinned Threads */}
            {pinnedThreads.length > 0 && (
              <Card className="overflow-hidden border-primary/20">
                <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-pink-500/5">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Pin className="h-5 w-5 text-primary" />
                    Pinned Threads
                  </h2>
                </div>
                <CardContent className="p-4 space-y-3">
                  <AnimatePresence>
                    {pinnedThreads.map((thread: ForumThread, index: number) => (
                      <motion.div
                        key={thread.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
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
                              <span>{getCategoryName(thread.category_id)}</span>
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

            {/* Recent Threads */}
            <Card className="overflow-hidden border-border/50">
              <div className="p-4 border-b border-border/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-cyan-400" />
                    Recent Threads
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
                {threadsLoading ? (
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
                ) : filteredThreads.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No threads yet</h3>
                    <p className="text-muted-foreground mb-6">Be the first to start a discussion!</p>
                    {user && (
                      <Link href="/forum/new">
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create Thread
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {filteredThreads.map((thread: ForumThread, index: number) => (
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
                                <Badge 
                                  variant="outline" 
                                  className="text-[10px] px-1.5 py-0"
                                  style={{ borderColor: getCategoryColor(thread.category_id), color: getCategoryColor(thread.category_id) }}
                                >
                                  {getCategoryName(thread.category_id)}
                                </Badge>
                                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                                <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
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
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Online Users */}
            <Card className="overflow-hidden border-border/50">
              <div className="p-4 border-b border-border/50 bg-gradient-to-r from-green-500/10 to-emerald-500/5">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  Online Users ({onlineUsers.length || stats.onlineUsers})
                </h3>
              </div>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {onlineUsers.length > 0 ? (
                    <>
                      {onlineUsers.slice(0, 8).map((onlineUser) => (
                        <Link
                          key={onlineUser.id}
                          href={`/profile/${onlineUser.id}`}
                          className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                        >
                          <div className="h-6 w-6 rounded-full overflow-hidden bg-gradient-to-br from-primary to-purple-500">
                            {onlineUser.avatar ? (
                              <Image
                                src={onlineUser.avatar}
                                alt={onlineUser.username}
                                width={24}
                                height={24}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-white text-[10px] font-bold">
                                {onlineUser.username[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-medium flex items-center gap-1">
                            {onlineUser.username}
                            {onlineUser.membership === "admin" && <Shield className="h-3 w-3 text-destructive" />}
                            {onlineUser.membership === "vip" && <Crown className="h-3 w-3 text-primary" />}
                          </span>
                        </Link>
                      ))}
                      {onlineUsers.length > 8 && (
                        <div className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
                          +{onlineUsers.length - 8} more
                        </div>
                      )}
                    </>
                  ) : stats.onlineUsers > 0 ? (
                    <p className="text-sm text-muted-foreground">{stats.onlineUsers} user(s) browsing</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No users online</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card className="overflow-hidden border-border/50">
              <div className="p-4 border-b border-border/50 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                  Top Contributors
                </h3>
              </div>
              <CardContent className="p-4 space-y-3">
                {topContributors.length > 0 ? (
                  topContributors.slice(0, 5).map((contributor, i) => (
                    <motion.div
                      key={contributor.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        href={`/profile/${contributor.id}`}
                        className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <span className={`text-lg font-bold w-6 ${
                          i === 0 ? "text-amber-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"
                        }`}>
                          #{i + 1}
                        </span>
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/50 to-purple-500/50">
                          {contributor.avatar ? (
                            <Image
                              src={contributor.avatar}
                              alt={contributor.username}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-white font-bold">
                              {contributor.username[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground text-sm truncate">{contributor.username}</span>
                            {contributor.membership === "admin" && <Shield className="h-3.5 w-3.5 text-destructive" />}
                            {contributor.membership === "vip" && <Crown className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{contributor.points.toLocaleString()} coins</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No contributors yet</p>
                )}
              </CardContent>
            </Card>

            {/* Forum Rules */}
            <Card className="overflow-hidden border-border/50">
              <div className="p-4 border-b border-border/50 bg-gradient-to-r from-blue-500/10 to-cyan-500/5">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  Forum Rules
                </h3>
              </div>
              <CardContent className="p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span>Be respectful to all members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>No spam or self-promotion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>Use appropriate categories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    <span>Search before posting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">5.</span>
                    <span>No pirated content</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
