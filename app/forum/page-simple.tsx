"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { useStatsStore } from "@/lib/store"
import { FORUM_CATEGORIES } from "@/lib/constants"
import {
  MessageSquare, Plus, Pin, Eye, Heart, Users, Search, Filter, Clock
} from "lucide-react"
import Link from "next/link"

export default function ForumPage() {
  const { user } = useAuth()
  const { stats } = useStatsStore()
  const [threads, setThreads] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoriesWithCounts, setCategoriesWithCounts] = useState([])

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true)
      try {
        const { getForumThreads } = await import('@/lib/actions/forum')
        const data = await getForumThreads(undefined, 10)
        if (data) {
          setThreads(data.map((t) => ({
            id: t.id,
            title: t.title,
            category: t.category_id,
            author: {
              username: t.username || "Unknown",
              avatar: t.avatar || "/placeholder.svg",
              membership: t.membership || "free"
            },
            replies: t.reply_count || 0,
            likes: 0,
            views: 0,
            isPinned: t.pinned || false,
            status: "approved",
            createdAt: t.created_at
          })))
        }
      } catch (error) {
        console.error("Failed to fetch threads:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchThreads()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { getForumCategories } = await import('@/lib/actions/forum')
        const categories = await getForumCategories()
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

  const pinnedThreads = threads.filter((t) => t.isPinned)
  const regularThreads = threads.filter((t) => !t.isPinned)

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Users className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Community Forum</h1>
            <p className="text-muted-foreground">Join discussions, get help, and connect with the community</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {user && (
            <Link href="/forum/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Thread
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalThreads.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Threads</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Posts</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-warning/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{Math.floor(stats.onlineUsers * 3.5)}</p>
            <p className="text-sm text-muted-foreground">Active Today</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-chart-3/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-chart-3" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.onlineUsers}</p>
            <p className="text-sm text-muted-foreground">Online Now</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Categories
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {categoriesWithCounts.map((category) => (
                <Link
                  key={category.id}
                  href={`/forum/category/${category.id}`}
                  className="group flex items-center gap-4 rounded-xl bg-secondary/30 p-4 transition-all hover:bg-secondary/50"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <MessageSquare className="h-5 w-5" style={{ color: category.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">{category.threadCount || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">threads</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {pinnedThreads.length > 0 && (
            <div className="bg-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Pin className="h-5 w-5 text-primary" />
                Pinned Threads
              </h2>
              <div className="space-y-3">
                {pinnedThreads.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/forum/thread/${thread.id}`}
                    className="flex items-center gap-4 rounded-xl bg-primary/5 border border-primary/20 p-4 transition-all hover:bg-primary/10"
                  >
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-secondary shrink-0">
                      <img src={thread.author.avatar} alt={thread.author.username} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Pin className="h-4 w-4 text-primary shrink-0" />
                        <h3 className="font-semibold truncate">{thread.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="font-medium">{thread.author.username}</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                        <span>{categoriesWithCounts.find((c) => c.id === thread.category)?.name || thread.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">{thread.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">{thread.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Recent Threads
              </h2>
              <Button variant="ghost" size="sm" className="text-primary">View All</Button>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl bg-secondary/20 p-4">
                    <div className="h-11 w-11 rounded-full bg-secondary/50 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 bg-secondary/50 rounded animate-pulse" />
                      <div className="h-3 w-1/3 bg-secondary/50 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : regularThreads.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No approved threads yet</p>
                {user && (
                  <Link href="/forum/new">
                    <Button variant="link" className="text-primary mt-2">Create the first thread</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {regularThreads.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/forum/thread/${thread.id}`}
                    className="flex items-center gap-4 rounded-xl bg-secondary/20 p-4 transition-all hover:bg-secondary/40"
                  >
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-secondary shrink-0">
                      <img src={thread.author.avatar} alt={thread.author.username} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate hover:text-primary transition-colors">{thread.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="font-medium">{thread.author.username}</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                        <span>{categoriesWithCounts.find((c) => c.id === thread.category)?.name || thread.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{thread.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{thread.likes}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Forum Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Members</span>
                <span className="font-semibold">{stats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Threads</span>
                <span className="font-semibold">{stats.totalThreads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Posts</span>
                <span className="font-semibold">{stats.totalPosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Online Now</span>
                <span className="font-semibold">{stats.onlineUsers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}