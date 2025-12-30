import { getForumThreadById, getForumPosts } from '@/lib/database-direct'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowLeft, MessageSquare, Eye, Pin, Lock, Clock, 
  ThumbsUp, Crown, Shield, Send 
} from "lucide-react"
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

export default async function ThreadDetailPage({ params }: PageProps) {
  try {
    const [thread, posts] = await Promise.all([
      getForumThreadById(params.id),
      getForumPosts(params.id)
    ])

    if (!thread) {
      notFound()
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/forum" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Forum
          </Link>
          <span>/</span>
          <Link 
            href={`/forum/category/${thread.forum_categories?.id}`}
            className="hover:text-primary transition-colors"
          >
            {thread.forum_categories?.name || 'General'}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">
            {thread.title}
          </span>
        </div>

        {/* Thread Header */}
        <Card className="mb-6">
          <CardContent className="p-0">
            {/* Meta Bar */}
            <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b">
              <div className="flex items-center gap-2 flex-wrap">
                {thread.is_pinned && (
                  <Badge className="gap-1.5">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                )}
                {thread.is_locked && (
                  <Badge variant="destructive" className="gap-1.5">
                    <Lock className="h-3 w-3" />
                    Locked
                  </Badge>
                )}
                <Badge variant="outline">
                  {thread.forum_categories?.name || 'General'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {thread.view_count || 0} views
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  {thread.reply_count || 0} replies
                </span>
              </div>
            </div>

            {/* Thread Content */}
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-6">{thread.title}</h1>

              {/* Author Info */}
              <div className="flex gap-4 mb-6">
                <div className="relative h-14 w-14 rounded-full overflow-hidden bg-secondary shrink-0">
                  {thread.users?.avatar ? (
                    <Image
                      src={thread.users.avatar}
                      alt={thread.users.username || 'User'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-primary/20 flex items-center justify-center text-lg font-semibold">
                      {thread.users?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">
                      {thread.users?.username || 'Anonymous'}
                    </span>
                    {thread.users?.role === 'admin' && (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                    {thread.users?.role === 'vip' && (
                      <Badge className="text-xs gap-1">
                        <Crown className="h-3 w-3" />
                        VIP
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-invert max-w-none mb-6">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {thread.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <ThumbsUp className="h-4 w-4" />
                  Like
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replies Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Replies ({posts.length})
          </h2>

          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post: any) => (
                <Card key={post.id}>
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="relative h-11 w-11 rounded-full overflow-hidden bg-secondary shrink-0">
                        {post.users?.avatar ? (
                          <Image
                            src={post.users.avatar}
                            alt={post.users.username || 'User'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                            {post.users?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {post.users?.username || 'Anonymous'}
                            </span>
                            {post.users?.role === 'admin' && (
                              <Badge variant="destructive" className="text-xs">Admin</Badge>
                            )}
                            {post.users?.role === 'vip' && (
                              <Badge className="text-xs">VIP</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className="text-foreground leading-relaxed mb-3">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            Like
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No replies yet. Be the first to reply!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {!thread.is_locked ? (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Write a Reply
              </h3>
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Please login to post a reply
                </p>
                <Link href="/api/auth/signin">
                  <Button>Login to Reply</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Thread Locked</h3>
              <p className="text-muted-foreground">
                This thread has been locked and cannot receive new replies.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  } catch (error) {
    console.error('Thread error:', error)
    notFound()
  }
}
