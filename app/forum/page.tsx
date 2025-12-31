import { getForumCategories, getForumThreads } from '@/lib/database-direct'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, Plus, Clock, TrendingUp, Pin } from "lucide-react"
import { ForumRankBadge } from "@/components/forum-rank-badge"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

interface User {
  discord_id: string
  username: string
  avatar?: string
  role?: string
  level?: number
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  thread_count?: number
  post_count?: number
}

interface Thread {
  id: string
  title: string
  content: string
  user_id: string
  category_id: string
  created_at: string
  updated_at: string
  is_pinned?: boolean
  is_locked?: boolean
  view_count?: number
  reply_count?: number
  users?: User
  forum_categories?: Category
}

export default async function ForumPage() {
  const [categories, allThreads] = await Promise.all([
    getForumCategories(),
    getForumThreads()
  ])

  const safeThreads = Array.isArray(allThreads) ? allThreads : []
  const safeCategories = Array.isArray(categories) ? categories : []

  const pinnedThreads = safeThreads.filter((t: Thread) => t.is_pinned)
  const recentThreads = safeThreads.filter((t: Thread) => !t.is_pinned).slice(0, 10)
  const trendingThreads = [...safeThreads]
    .sort((a: Thread, b: Thread) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Community Forum
          </h1>
          <p className="text-muted-foreground mt-1">Connect, discuss, and share with the FiveM community</p>
        </div>
        <Link href="/forum/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Thread
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {safeCategories.length > 0 ? (
                <div className="space-y-4">
                  {safeCategories.map((category: Category) => (
                    <Link key={category.id} href={`/forum/category/${category.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {category.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{category.thread_count || 0} threads</p>
                          <p className="text-xs text-muted-foreground">{category.post_count || 0} posts</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No categories yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pinned Threads */}
          {pinnedThreads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pin className="h-5 w-5" />
                  Pinned Threads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pinnedThreads.map((thread: Thread) => (
                    <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
                      <div className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-secondary shrink-0">
                            {thread.users?.avatar ? (
                              <Image
                                src={thread.users.avatar}
                                alt={thread.users.username || 'User'}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                                {thread.users?.username?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold line-clamp-1">{thread.title}</h4>
                              <Pin className="h-4 w-4 text-primary shrink-0" />
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {thread.content}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {thread.users?.username || 'Anonymous'}
                                </span>
                                {thread.users?.level && <ForumRankBadge level={thread.users.level} />}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {thread.forum_categories?.name || 'General'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {thread.reply_count || 0} replies
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {thread.view_count || 0} views
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Discussions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Discussions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentThreads.length > 0 ? (
                <div className="space-y-3">
                  {recentThreads.map((thread: Thread) => (
                    <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
                      <div className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-secondary shrink-0">
                            {thread.users?.avatar ? (
                              <Image
                                src={thread.users.avatar}
                                alt={thread.users.username || 'User'}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                                {thread.users?.username?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold line-clamp-1">{thread.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {thread.content}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {thread.users?.username || 'Anonymous'}
                                </span>
                                {thread.users?.level && <ForumRankBadge level={thread.users.level} />}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {thread.forum_categories?.name || 'General'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No threads yet. Be the first to start a discussion!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Threads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendingThreads.length > 0 ? (
                <div className="space-y-3">
                  {trendingThreads.map((thread: Thread, index: number) => (
                    <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
                      <div className="p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2">{thread.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {thread.view_count || 0} views
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {thread.reply_count || 0} replies
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No trending threads</p>
              )}
            </CardContent>
          </Card>

          {/* Forum Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Forum Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Threads</span>
                  <span className="font-semibold">{safeThreads.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Categories</span>
                  <span className="font-semibold">{safeCategories.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Views</span>
                  <span className="font-semibold">
                    {safeThreads.reduce((sum: number, t: Thread) => sum + (t.view_count || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Replies</span>
                  <span className="font-semibold">
                    {safeThreads.reduce((sum: number, t: Thread) => sum + (t.reply_count || 0), 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/forum/new">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Plus className="h-4 w-4" />
                    Create Thread
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    My Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}