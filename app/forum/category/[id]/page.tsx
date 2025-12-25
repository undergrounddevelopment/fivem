"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, MessageSquare, Heart, Eye, Pin, Crown, Shield, Loader2 } from "lucide-react"
import Link from "next/link"
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
  author: Author | null
  replies: number
  likes: number
  views: number
  isPinned: boolean
  createdAt: string
}

interface Category {
  id: string
  name: string
  description: string
  threadCount: number
  color: string
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()

  const [category, setCategory] = useState<Category | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch category info
        const catRes = await fetch("/api/forum/categories")
        if (catRes.ok) {
          const catData = await catRes.json()
          const categoriesArray = Array.isArray(catData) ? catData : catData.categories || []
          const foundCategory = categoriesArray.find((c: Category) => c.id === params.id)
          if (foundCategory) {
            setCategory(foundCategory)
          } else {
            router.push("/forum")
            return
          }
        }

        const threadRes = await fetch(`/api/forum/threads?categoryId=${params.id}`)
        if (threadRes.ok) {
          const threadData = await threadRes.json()
          setThreads(threadData.threads || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-72 transition-all duration-300">
          <Header />
          <div className="p-6 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  if (!category) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="p-6">
          {/* Back Button */}
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{category.name}</h1>
              <p className="text-muted-foreground">{category.description}</p>
              <p className="text-sm text-muted-foreground mt-2">{category.threadCount} threads</p>
            </div>
            <Link href="/forum/new">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                New Thread
              </Button>
            </Link>
          </div>

          {/* Threads */}
          <div className="space-y-3">
            {threads.length > 0 ? (
              threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/forum/thread/${thread.id}`}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-primary/50 ${
                    thread.isPinned ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-secondary">
                    <img
                      src={thread.author?.avatar || "/placeholder.svg?height=40&width=40&query=user"}
                      alt={thread.author?.username || "User"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {thread.isPinned && <Pin className="h-4 w-4 text-primary" />}
                      <h3 className="font-semibold text-foreground truncate">{thread.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {thread.author?.membership === "vip" && <Crown className="h-3 w-3 text-primary" />}
                        {thread.author?.membership === "admin" && <Shield className="h-3 w-3 text-destructive" />}
                        {thread.author?.username || "Unknown"}
                      </span>
                      <span>•</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {thread.replies}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {thread.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {thread.views}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-border bg-card">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground">No threads yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to start a discussion!</p>
                <Link href="/forum/new">
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Thread
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
