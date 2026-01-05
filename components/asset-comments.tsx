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
  Unlock
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

  const canDownload = !isFreeAsset || hasUserCommented

  return (
    <div className="space-y-6">
      {/* Comment Required Banner for Free Assets */}
      {isFreeAsset && !hasUserCommented && session?.user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
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
                    Comment Required to Download
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    This is a <span className="text-green-400 font-semibold">FREE</span> asset! 
                    Leave a comment below to unlock the download. Your feedback helps creators improve!
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-400">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Min. 10 characters
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">
                      <Star className="h-3 w-3 mr-1" />
                      Rate the asset
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500/20 via-transparent to-orange-500/20 animate-pulse pointer-events-none" />
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
                    Download Unlocked!
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Thank you for your feedback! You can now download this asset.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Comment Form */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            Leave a Review
            {isFreeAsset && !hasUserCommented && (
              <Badge className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
                Required for Download
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {session?.user ? (
            <>
              {/* Rating Stars */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Your Rating</label>
                <div className="flex items-center gap-1">
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
                  <span className="ml-2 text-sm text-muted-foreground">
                    {rating === 5 ? "Excellent!" : rating === 4 ? "Great!" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                  </span>
                </div>
              </div>

              {/* Comment Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Your Comment</label>
                <Textarea
                  placeholder="Share your thoughts about this asset... (minimum 10 characters)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] bg-secondary/30 border-white/10 focus:border-primary/50 resize-none"
                  disabled={submitting}
                />
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-xs",
                    newComment.length < 10 ? "text-amber-400" : "text-green-400"
                  )}>
                    {newComment.length}/10 minimum characters
                  </span>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={submitting || newComment.trim().length < 10}
                    className="gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Post Review
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Please login to leave a review</p>
              <Button className="mt-3" asChild>
                <a href="/auth/signin">Login to Comment</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {comment.content}
                        </p>
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
