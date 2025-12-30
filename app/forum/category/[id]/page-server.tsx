import { getForumThreads } from '@/lib/database-direct'
import { createAdminClient } from '@/lib/supabase/server'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Plus, MessageSquare, Eye, Pin, Crown, Shield, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from 'date-fns'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    id: string
  }
}

export default async function CategoryPage({ params }: PageProps) {
  try {
    const supabase = createAdminClient()
    
    // Get category info
    const { data: category, error: catError } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('id', params.id)
      .single()

    if (catError || !category) {
      notFound()
    }

    // Get threads for this category
    const threads = await getForumThreads(params.id)

    // Get thread count
    const { count: threadCount } = await supabase
      .from('forum_threads')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', params.id)

    const pinnedThreads = threads.filter((t: any) => t.is_pinned)
    const regularThreads = threads.filter((t: any) => !t.is_pinned)

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Forum
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            <p className="text-muted-foreground mb-2">{category.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {threadCount || 0} threads
              </span>
            </div>
          </div>
          <Link href="/forum/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Thread
            </Button>
          </Link>
        </div>

        {/* Pinned Threads */}
        {pinnedThreads.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Pin className="h-5 w-5 text-primary" />
              Pinned Threads
            </h2>
            <div className="space-y-3">
              {pinnedThreads.map((thread: any) => (
                <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-secondary shrink-0">
                          {thread.users?.avatar ? (
                            <Image
                              src={thread.users.avatar}
                              alt={thread.users.username || 'User'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-primary/20 flex items-center justify-center font-semibold">
                              {thread.users?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Pin className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold truncate">{thread.title}</h3>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {thread.users?.role === 'admin' && <Shield className="h-3 w-3 text-destructive" />}
                              {thread.users?.role === 'vip' && <Crown className="h-3 w-3 text-primary" />}
                              {thread.users?.username || 'Anonymous'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {thread.reply_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {thread.view_count || 0}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Threads */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Discussions</h2>
          <div className="space-y-3">
            {regularThreads.length > 0 ? (
              regularThreads.map((thread: any) => (
                <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-secondary shrink-0">
                          {thread.users?.avatar ? (
                            <Image
                              src={thread.users.avatar}
                              alt={thread.users.username || 'User'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-primary/20 flex items-center justify-center font-semibold">
                              {thread.users?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate mb-1">{thread.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {thread.users?.role === 'admin' && <Shield className="h-3 w-3 text-destructive" />}
                              {thread.users?.role === 'vip' && <Crown className="h-3 w-3 text-primary" />}
                              {thread.users?.username || 'Anonymous'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {thread.reply_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {thread.view_count || 0}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No threads yet</h3>
                  <p className="text-muted-foreground mb-6">Be the first to start a discussion!</p>
                  <Link href="/forum/new">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Thread
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Category error:', error)
    notFound()
  }
}
