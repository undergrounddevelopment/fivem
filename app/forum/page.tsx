import { getForumCategories, getForumThreads } from '@/lib/database-direct'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, Plus, Pin, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function ForumPage() {
  const [categories, recentThreads] = await Promise.all([
    getForumCategories(),
    getForumThreads().then(threads => threads.slice(0, 10))
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Community Forum
          </h1>
          <p className="text-muted-foreground">Connect with the FiveM community</p>
        </div>
        <Link href="/forum/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Thread
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <Link key={category.id} href={`/forum/category/${category.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
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
            </CardContent>
          </Card>
        </div>

        {/* Recent Threads */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Threads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentThreads.map((thread) => (
                  <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
                    <div className="p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-secondary shrink-0">
                          {thread.users?.avatar ? (
                            <Image
                              src={thread.users.avatar}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="h-full w-full bg-primary/20" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">{thread.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{thread.users?.username}</span>
                            <Badge variant="outline" className="text-xs">
                              {thread.forum_categories?.name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Forum Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Forum Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Threads</span>
                  <span className="font-medium">{recentThreads.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Categories</span>
                  <span className="font-medium">{categories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}