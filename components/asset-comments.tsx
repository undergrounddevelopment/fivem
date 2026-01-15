"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star,
  ThumbsUp,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { FormattedText } from "@/components/formatted-text"
import { OptimizedImage } from "@/components/optimized-image"

interface Comment {
  id: string
  content: string
  rating?: number
  created_at: string
  user: {
    id: string
    username: string
    avatar?: string
    level?: number
  }
  likes_count?: number
}

interface AssetCommentsProps {
  assetId: string
  isFreeAsset: boolean
  onCommentPosted?: () => void
}

export function AssetComments({ assetId, isFreeAsset, onCommentPosted }: AssetCommentsProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [rating, setRating] = useState(5)
  const [hasUserCommented, setHasUserCommented] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [assetId])

  async function fetchComments() {
    try {
      const response = await fetch(`/api/assets/${assetId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])

        // Check if current user has commented
        if (session?.user?.id) {
          const userComment = data.comments?.find(
            (c: Comment) => c.user?.id === session.user.id
          )
          setHasUserCommented(!!userComment)
        }
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitComment() {
    if (!session?.user) {
      toast.error("Please login to comment")
      return
    }

    if (!newComment.trim()) {
      toast.error("Please write a comment")
      return
    }

    if (newComment.trim().length < 10) {
      toast.error("Comment must be at least 10 characters")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/assets/${assetId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
          rating
        })
      })

      if (response.ok) {
        toast.success("Comment posted successfully!")
        setNewComment("")
        setHasUserCommented(true)
        fetchComments()
        onCommentPosted?.()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to post comment")
      }
    } catch (error) {
      console.error("Error posting comment:", error)
      toast.error("Failed to post comment")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="comments-section" className="space-y-8 mt-12">
      {/* Cinematic Header with GIF */}
      <div className="relative rounded-[2rem] overflow-hidden border border-white/5 bg-black/40 shadow-2xl group min-h-[400px] flex items-end justify-start">
        <img
          src="https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/banner1.png"
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-105"
          alt="Comments Banner"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent opacity-80" />

        <div className="relative z-10 w-full p-8 md:p-12 flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="space-y-4 text-left max-w-2xl">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/20 text-primary text-[10px] font-black tracking-widest uppercase backdrop-blur-md">
              Community Driven
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-lg">
              REVIEWS &<br />FEEDBACK
            </h2>
            <p className="text-muted-foreground text-base max-w-lg font-medium drop-shadow-md">
              Join the conversation and help other developers by sharing your experience with this resource.
            </p>
          </div>

          <div className="flex items-center gap-6 pb-2">
            <div className="text-center backdrop-blur-sm bg-black/20 p-4 rounded-2xl border border-white/5">
              <p className="text-3xl font-black text-white">{comments.length}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Reviews</p>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="text-center backdrop-blur-sm bg-black/20 p-4 rounded-2xl border border-white/5">
              <p className="text-3xl font-black text-primary font-mono">
                {(comments.reduce((acc, c) => acc + (c.rating || 5), 0) / (comments.length || 1)).toFixed(1)}
              </p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Rating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          {/* Comment Form */}
          <Card className="glass relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                LEAVE A REVIEW
                {isFreeAsset && !hasUserCommented && (
                  <Badge className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] font-black uppercase tracking-widest">
                    Required
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {session?.user ? (
                <>
                  {/* Rating Stars */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">Your Rating</label>
                    <div className="flex items-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={cn(
                            "p-1 rounded-lg transition-all duration-200 hover:scale-110",
                            star <= rating
                              ? "text-amber-400"
                              : "text-muted-foreground/30 hover:text-amber-400/50"
                          )}
                        >
                          <Star
                            className={cn(
                              "h-6 w-6 transition-all",
                              star <= rating && "fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">Your Review</label>
                    <Textarea
                      placeholder="Share your thoughts about this asset... (minimum 10 characters)"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[120px] bg-white/[0.02] border-white/5 focus:border-primary/50 resize-none rounded-xl"
                      disabled={submitting}
                    />
                    <div className="flex items-center justify-between px-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        newComment.length < 10 ? "text-amber-400" : "text-green-400"
                      )}>
                        {newComment.length}/10 CHARS
                      </span>
                      <Button
                        onClick={handleSubmitComment}
                        disabled={submitting || newComment.trim().length < 10}
                        className="h-12 px-6 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all"
                      >
                        {submitting ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          "POST REVIEW"
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-4">
                  <Lock className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                  <p className="text-xs text-muted-foreground font-medium">Please login to leave a review.</p>
                  <Button variant="outline" className="w-full rounded-xl border-white/5 bg-white/[0.02]">
                    Log In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Comment Required Banner for Free Assets */}
          {isFreeAsset && !hasUserCommented && session?.user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden"
            >
              <Card className="border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-400 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Download Required Checkpoint
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        This is a <span className="text-green-400 font-semibold uppercase tracking-tight">Free</span> asset!
                        Verification required. Provide feedback to bypass and unlock.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Download Unlocked Banner */}
          {isFreeAsset && hasUserCommented && session?.user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-2 border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <Unlock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Access Granted
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Verification successful. You can now proceed with the download.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Comments List */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                  </div>
                  Reviews
                </span>
                <Badge variant="secondary">{comments.length} reviews</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-secondary/20 border border-white/5"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                            <AvatarImage src={comment.user?.avatar} />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {comment.user?.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">{comment.user?.username || "Anonymous"}</span>
                              {comment.user?.level && (
                                <Badge variant="outline" className="text-xs border-white/10">
                                  Lv.{comment.user.level}
                                </Badge>
                              )}
                              {comment.rating && (
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-3 w-3",
                                        i < comment.rating!
                                          ? "text-amber-400 fill-current"
                                          : "text-muted-foreground/30"
                                      )}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <FormattedText
                              content={comment.content}
                              className="text-sm text-muted-foreground mt-1"
                              enableYouTube={false}
                              enableImages={false}
                              enableLinks={true}
                            />
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                              {comment.likes_count !== undefined && comment.likes_count > 0 && (
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3" />
                                  {comment.likes_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export function CommentRequiredBanner({ hasCommented }: { hasCommented: boolean }) {
  if (hasCommented) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
        <CheckCircle2 className="h-5 w-5 text-green-400" />
        <span className="text-sm text-green-400 font-medium">Download unlocked!</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
      <Lock className="h-5 w-5 text-amber-400" />
      <span className="text-sm text-amber-400 font-medium">Comment required to download</span>
    </div>
  )
}
