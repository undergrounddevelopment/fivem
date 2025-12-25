"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  MessageSquare,
  Eye,
  Share2,
  Flag,
  Pin,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Crown,
  Shield,
  Reply,
  MoreHorizontal,
  Bookmark,
  Clock,
  Send,
  ImageIcon,
  Link2,
  AtSign,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

interface Author {
  id: string
  username: string
  avatar: string | null
  membership: string
  reputation?: number
}

interface ReplyData {
  id: string
  content: string
  author: Author | null
  likes: number
  isEdited: boolean
  createdAt: string
}

interface ThreadData {
  id: string
  title: string
  content: string
  category: string
  categoryId: string
  author: Author | null
  replies: ReplyData[]
  repliesCount: number
  likes: number
  views: number
  isPinned: boolean
  isLocked: boolean
  images: string[]
  createdAt: string
}

export default function ThreadPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const [thread, setThread] = useState<ThreadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const res = await fetch(`/api/forum/threads/${params.id}`)
        if (!res.ok) {
          router.push("/forum")
          return
        }
        const data = await res.json()
        setThread(data)
      } catch (error) {
        console.error("Error fetching thread:", error)
        router.push("/forum")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchThread()
    }
  }, [params.id, router])

  const handleSubmitReply = async () => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to post a reply",
        variant: "destructive",
      })
      return
    }

    const trimmedContent = replyContent.trim()
    if (!trimmedContent) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      })
      return
    }

    if (trimmedContent.length > 10000) {
      toast({
        title: "Error",
        description: "Reply is too long (max 10000 characters)",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/forum/threads/${params.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmedContent }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to post reply")
      }

      const newReply = await res.json()

      setThread((prev) =>
        prev
          ? {
              ...prev,
              replies: [...prev.replies, newReply],
              repliesCount: prev.repliesCount + 1,
            }
          : null,
      )

      setReplyContent("")
      toast({
        title: "Success",
        description: "Reply posted successfully!",
      })
    } catch (error) {
      console.error("Reply error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post reply",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    if (thread?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % thread.images.length)
    }
  }

  const prevImage = () => {
    if (thread?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + thread.images.length) % thread.images.length)
    }
  }

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

  if (!thread) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="p-6 max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/forum" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Forum
            </Link>
            <span>/</span>
            <Link href={`/forum/category/${thread.categoryId}`} className="hover:text-foreground transition-colors">
              {thread.category}
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{thread.title}</span>
          </div>

          {/* Thread Header Card */}
          <div className="glass rounded-2xl overflow-hidden mb-6">
            {/* Thread Meta Bar */}
            <div className="bg-secondary/30 px-6 py-3 flex items-center justify-between border-b border-border/50">
              <div className="flex items-center gap-3">
                {thread.isPinned && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                )}
                {thread.isLocked && (
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30 gap-1">
                    <Lock className="h-3 w-3" />
                    Locked
                  </Badge>
                )}
                <Badge variant="outline" className="border-border/50">
                  {thread.category}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                  <Bookmark className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Thread Content */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-foreground mb-6">{thread.title}</h1>

              {/* Author Card */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="relative">
                    <img
                      src={thread.author?.avatar || "/placeholder.svg?height=56&width=56&query=user avatar"}
                      alt={thread.author?.username || "User"}
                      className="h-14 w-14 rounded-xl object-cover ring-2 ring-border"
                    />
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full status-online border-2 border-card" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{thread.author?.username || "Unknown User"}</span>
                    {thread.author?.membership === "vip" && (
                      <Badge className="bg-primary/20 text-primary text-[10px] px-1.5 py-0">
                        <Crown className="h-3 w-3 mr-0.5" />
                        VIP
                      </Badge>
                    )}
                    {thread.author?.membership === "admin" && (
                      <Badge className="bg-destructive/20 text-destructive text-[10px] px-1.5 py-0">
                        <Shield className="h-3 w-3 mr-0.5" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(thread.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {thread.author?.reputation && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                        <span>{thread.author.reputation.toLocaleString()} reputation</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="mt-6 pl-[72px]">
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-[15px]">{thread.content}</p>
                </div>

                {thread.images && thread.images.length > 0 && (
                  <div className="mt-6">
                    <div
                      className={`grid gap-3 ${
                        thread.images.length === 1
                          ? "grid-cols-1"
                          : thread.images.length === 2
                            ? "grid-cols-2"
                            : thread.images.length === 3
                              ? "grid-cols-3"
                              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                      }`}
                    >
                      {thread.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => openLightbox(index)}
                          className="relative aspect-video rounded-xl overflow-hidden bg-secondary/50 group cursor-pointer"
                        >
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors" />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {thread.images.length} image{thread.images.length > 1 ? "s" : ""} - Click to view
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-1.5 rounded-full bg-secondary/50 hover:bg-secondary"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="font-medium">{thread.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-full hover:bg-secondary">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      {thread.repliesCount} replies
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      {thread.views.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Replies */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Replies ({thread.replies.length})
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Oldest
                </Button>
                <Button variant="ghost" size="sm" className="text-primary">
                  Newest
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {thread.replies.length > 0 ? (
                thread.replies.map((reply) => (
                  <div key={reply.id} className="glass rounded-2xl p-5">
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <img
                          src={reply.author?.avatar || "/placeholder.svg?height=44&width=44&query=user avatar"}
                          alt={reply.author?.username || "User"}
                          className="h-11 w-11 rounded-xl object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{reply.author?.username || "Unknown"}</span>
                            {reply.author?.membership === "vip" && (
                              <Badge className="bg-primary/20 text-primary text-[10px] px-1.5 py-0">VIP</Badge>
                            )}
                            {reply.author?.membership === "admin" && (
                              <Badge className="bg-destructive/20 text-destructive text-[10px] px-1.5 py-0">
                                Admin
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                            {reply.isEdited && <span className="text-[10px] text-muted-foreground">(edited)</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-foreground text-[15px] leading-relaxed mb-4">{reply.content}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {reply.likes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 rounded-full text-muted-foreground hover:text-primary"
                          >
                            <Reply className="h-3.5 w-3.5" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass rounded-2xl p-8 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
                </div>
              )}
            </div>
          </div>

          {/* Reply Form */}
          {!thread.isLocked ? (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Write a Reply
              </h3>
              {session ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full h-32 rounded-xl border border-border bg-secondary/30 p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none resize-none transition-all"
                    placeholder="Share your thoughts..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    disabled={submitting}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <Link2 className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <AtSign className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        className="rounded-xl bg-transparent"
                        onClick={() => setReplyContent("")}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-primary hover:bg-primary/90 rounded-xl gap-2 glow-sm"
                        onClick={handleSubmitReply}
                        disabled={submitting || !replyContent.trim()}
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Post Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Please login to post a reply</p>
                  <Link href="/login">
                    <Button className="bg-primary hover:bg-primary/90">Login to Reply</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Thread Locked</h3>
              <p className="text-muted-foreground">This thread has been locked and cannot receive new replies.</p>
            </div>
          )}
        </div>
      </main>

      {lightboxOpen && thread.images && thread.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center" onClick={closeLightbox}>
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Navigation arrows */}
          {thread.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={thread.images[currentImageIndex] || "/placeholder.svg"}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>

          {/* Image counter */}
          {thread.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-secondary/80 px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {thread.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
