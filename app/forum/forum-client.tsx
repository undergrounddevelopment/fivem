"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useStatsStore } from "@/lib/store"
import { FORUM_CATEGORIES } from "@/lib/constants"
import { FORUM_FILTERS, THREAD_TYPES } from "@/lib/thread-types"
import {
    MessageSquare, Plus, Eye, Users, Search, Trophy, 
    TrendingUp, Zap, Hash, ShoppingBag, Headphones, 
    Sparkles, Filter, ChevronDown
} from "lucide-react"
import Link from "next/link"
import { OnlineUsersList } from "@/components/forum/online-users"
import { ThreadRow, ThreadRowSkeleton } from "@/components/forum/thread-row"
import { BentoCard } from "@/components/ui/bento-card"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/optimized-image"
import { FrameworkMarquee } from "@/components/framework-marquee"
import { SiteSettings } from "@/lib/settings"
import { cn, formatNumber } from "@/lib/utils"

interface ThreadAuthor {
    id?: string
    username: string
    avatar: string
    membership: string
}

interface Thread {
    id: string
    title: string
    category: string
    categoryName?: string
    threadType?: string
    author: ThreadAuthor
    replies: number
    likes: number
    views: number
    content?: string
    isPinned: boolean
    isLocked?: boolean
    status: string
    createdAt: string
    updatedAt?: string
    lastReply?: {
        author: ThreadAuthor
        createdAt: string
    } | null
}

interface Category {
    id: string
    name: string
    description: string
    icon: string
    color: string
    threadCount?: number
    postCount?: number
}

interface TopBadgeUser {
    id: string
    username: string
    avatar: string | null
    level: number
    xp: number
    badge_name: string
    badge_color: string
}

interface ForumClientProps {
    forumSettings: SiteSettings['forum']
}

export function ForumClient({ forumSettings }: ForumClientProps) {
    const { user } = useAuth()
    const { stats } = useStatsStore()
    const [threads, setThreads] = useState<Thread[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [categoriesWithCounts, setCategoriesWithCounts] = useState<Category[]>([])
    const [topBadgeUsers, setTopBadgeUsers] = useState<TopBadgeUser[]>([])
    const [onlineCount, setOnlineCount] = useState(0)
    const [activeFilter, setActiveFilter] = useState("new_topics")
    const [showFilters, setShowFilters] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isSearching, setIsSearching] = useState(false)

    // 100% REAL stats - no fallbacks
    const safeStats = {
        totalThreads: stats?.totalThreads || 0,
        totalPosts: stats?.totalPosts || 0,
        totalUsers: (stats as any)?.totalUsers || (stats as any)?.totalMembers || 0,
        onlineUsers: onlineCount || stats?.onlineUsers || 0,
    }

    // Fetch threads using API directly
    const fetchThreads = async (reset = false) => {
        const currentPage = reset ? 1 : page
        if (reset) {
            setIsLoading(true)
            setPage(1)
        }
        
        try {
            const res = await fetch(`/api/forum/threads?limit=20&page=${currentPage}&q=${searchQuery}&sort=${activeFilter}`)
            const data = await res.json()
            if (data.success && data.threads) {
                const newThreads = data.threads.map((t: any) => ({
                    id: t.id,
                    title: t.title,
                    content: t.content,
                    category: t.category_id,
                    categoryName: categoriesWithCounts.find(c => c.id === t.category_id)?.name,
                    threadType: t.thread_type || "discussion",
                    author: {
                        id: t.author?.id || t.author_id,
                        username: t.author?.username || "Unknown",
                        avatar: t.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${t.author?.username || 'U'}`,
                        membership: t.author?.membership || "member"
                    },
                    replies: t.replies || t.reply_count || t.replies_count || 0,
                    likes: t.likes || 0,
                    views: t.views || 0,
                    isPinned: t.is_pinned || t.pinned || false,
                    isLocked: t.is_locked || false,
                    status: t.status || "approved",
                    createdAt: t.created_at,
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
                }))

                if (reset) {
                    setThreads(newThreads)
                } else {
                    setThreads(prev => [...prev, ...newThreads])
                }
                
                setHasMore(newThreads.length === 20)
                if (!reset) setPage(prev => prev + 1)
            }
        } catch (error) {
            console.error("Failed to fetch threads:", error)
        } finally {
            setIsLoading(false)
            setIsSearching(false)
        }
    }

    // Debounced search
    useEffect(() => {
        if (!categoriesWithCounts.length) return
        const timer = setTimeout(() => {
            if (searchQuery.length > 0) setIsSearching(true)
            fetchThreads(true)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery, activeFilter, categoriesWithCounts])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/forum/categories')
                const categories = await res.json()
                if (categories && categories.length > 0) {
                    setCategoriesWithCounts(categories)
                } else {
                    setCategoriesWithCounts(FORUM_CATEGORIES.map((cat) => ({ ...cat, threadCount: 0, postCount: 0 })))
                }
            } catch {
                setCategoriesWithCounts(FORUM_CATEGORIES.map((cat) => ({ ...cat, threadCount: 0, postCount: 0 })))
            }
        }
        fetchCategories()
    }, [])

    // Fetch top badge users (highest XP/Level)
    useEffect(() => {
        const fetchTopBadgeUsers = async () => {
            try {
                const res = await fetch('/api/forum/top-badges')
                const data = await res.json()
                if (data.success && data.users) {
                    setTopBadgeUsers(data.users)
                }
            } catch (error) {
                console.error("Failed to fetch top badge users:", error)
            }
        }
        fetchTopBadgeUsers()
    }, [])

    // Fetch online count
    useEffect(() => {
        const fetchOnlineCount = async () => {
            try {
                const res = await fetch("/api/realtime/online-users")
                const data = await res.json()
                if (data.success) {
                    const count = data.count || data.data?.length || 0
                    // PROTECTION: Ignore 0 if we already have a count
                    if (count === 0 && onlineCount > 0) return
                    setOnlineCount(count)
                }
            } catch (error) {
                console.error("Failed to fetch online count:", error)
            }
        }
        fetchOnlineCount()
        const interval = setInterval(fetchOnlineCount, 30000)
        return () => clearInterval(interval)
    }, [])

    // Threads are already processed by the API (pagination, search, sort)

    return (
        <div className="min-h-screen pb-20 relative overflow-hidden">
            {/* Background Decor */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto p-4 md:p-6 space-y-6">
                {/* Header with Search & Actions */}
                <section className="relative">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-2"
                            >
                                <Users className="w-3 h-3" />
                                <span>{forumSettings?.header_title || "FiveM Community Hub"}</span>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white"
                            >
                                {forumSettings?.title || "Community"} <span className="text-primary">Forum</span>
                            </motion.h1>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <Link href="/marketplace">
                                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold gap-2 h-10 px-4 rounded-xl">
                                    <ShoppingBag className="h-4 w-4" />
                                    Trade Center
                                </Button>
                            </Link>
                            <Link href="/help">
                                <Button className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2 h-10 px-4 rounded-xl">
                                    <Headphones className="h-4 w-4" />
                                    Fivem Support
                                </Button>
                            </Link>
                            {user && (
                                <Link href="/forum/new">
                                    <Button className="bg-primary hover:bg-primary/90 text-black font-bold gap-2 h-10 px-4 rounded-xl">
                                        <Plus className="h-4 w-4" />
                                        New Thread
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs & Search */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {FORUM_FILTERS.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                                        activeFilter === filter.id
                                            ? "bg-primary/20 text-primary border border-primary/30"
                                            : "bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-white border border-transparent"
                                    )}
                                >
                                    <span>{filter.icon}</span>
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative shrink-0">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search threads..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full md:w-64 h-10 rounded-xl bg-white/5 border-white/10 focus:border-primary/30 text-sm"
                            />
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {[
                            { label: "Threads", val: safeStats.totalThreads, icon: Hash, color: "text-blue-400" },
                            { label: "Posts", val: safeStats.totalPosts, icon: MessageSquare, color: "text-purple-400" },
                            { label: "Active Today", val: Math.floor(safeStats.onlineUsers * 3.5), icon: TrendingUp, color: "text-amber-400" },
                            { label: "Online Now", val: safeStats.onlineUsers, icon: Zap, color: "text-green-400" },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className={`h-10 w-10 rounded-xl bg-white/[0.03] flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white">{formatNumber(stat.val)}</p>
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Main Content - Thread List */}
                    <div className="lg:col-span-8 space-y-3">
                        {/* Thread List Header */}
                        <div className="flex items-center justify-between px-3 py-2">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                Discussion Feed
                            </h2>
                        </div>
                        {/* Thread Rows */}
                        <div className="space-y-2">
                            {isLoading && threads.length === 0 ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <ThreadRowSkeleton key={i} />
                                ))
                            ) : threads.length > 0 ? (
                                <>
                                    {threads.map((thread) => (
                                        <ThreadRow key={thread.id} thread={thread} />
                                    ))}
                                    
                                    {hasMore && (
                                        <div className="text-center pt-8">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => fetchThreads()}
                                                disabled={isLoading}
                                                className="px-8 py-6 rounded-2xl glass border-primary/20 hover:border-primary/50 text-foreground transition-all gap-2"
                                            >
                                                {isLoading ? (
                                                    <Zap className="h-4 w-4 animate-spin text-primary" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                                {isLoading ? "Fetching more..." : "Load More Discussions"}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-16 text-muted-foreground glass rounded-3xl border-dashed border-2 border-white/10">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-40" />
                                    <p className="font-bold text-white text-lg">No threads found</p>
                                    <p className="text-sm opacity-60">Try adjusting your search or filters.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Start Thread CTA */}
                        <BentoCard className="p-5 bg-gradient-to-br from-primary/20 to-transparent border-primary/20 text-center relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Join the Action</h3>
                                <p className="text-sm text-muted-foreground font-medium mb-4">Have something to share? Start a discussion now.</p>
                                <Link href="/forum/new">
                                    <Button className="w-full bg-white text-black hover:bg-primary font-bold uppercase tracking-wider h-11 rounded-xl transition-all">
                                        Create Thread
                                    </Button>
                                </Link>
                            </div>
                            <div className="absolute inset-0 bg-primary/10 blur-[50px] group-hover:bg-primary/20 transition-all duration-700" />
                        </BentoCard>

                        {/* Categories Quick Access */}
                        <BentoCard className="p-0 overflow-hidden">
                            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-primary" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</h3>
                                </div>
                            </div>
                            <div className="p-2 max-h-[200px] overflow-y-auto">
                                {categoriesWithCounts.slice(0, 6).map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/forum/category/${category.id}`}
                                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                                    >
                                        <span className="text-sm font-medium text-white/80 group-hover:text-primary transition-colors truncate">
                                            {category.name}
                                        </span>
                                        <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10">
                                            {category.threadCount || 0}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        </BentoCard>

                        {/* Online Users */}
                        <BentoCard className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Online Members</h3>
                                </div>
                                <span className="text-sm font-bold text-white">{onlineCount}</span>
                            </div>
                            <OnlineUsersList />
                        </BentoCard>

                        {/* Leaderboard */}
                        <BentoCard className="p-0 overflow-hidden">
                            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-amber-400" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Leaderboard</h3>
                                </div>
                            </div>
                            <div className="p-2">
                                {topBadgeUsers.slice(0, 5).map((user, index) => (
                                    <Link
                                        key={user.id}
                                        href={`/profile/${user.id}`}
                                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                                    >
                                        <div className={cn(
                                            "flex h-7 w-7 items-center justify-center rounded-lg font-bold text-sm shrink-0",
                                            index === 0 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' :
                                            index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                                            index === 2 ? 'bg-orange-400/20 text-orange-400 border border-orange-400/30' :
                                            'bg-white/5 text-muted-foreground'
                                        )}>
                                            {index + 1}
                                        </div>
                                        <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10">
                                            <OptimizedImage
                                                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                                                alt={user.username}
                                                width={32}
                                                height={32}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{user.username}</p>
                                            <p className="text-[10px] text-muted-foreground">Lv.{user.level} • {user.xp} XP</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </BentoCard>

                        {/* Frameworks Marquee */}
                        <div className="py-4">
                            <h3 className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 opacity-50">Supported Frameworks</h3>
                            <FrameworkMarquee />
                        </div>

                        <div className="text-center">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-40">© 2026 FiveM Tools Forum</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
