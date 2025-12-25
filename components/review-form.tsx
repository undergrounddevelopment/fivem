"use client"

import { useState } from "react"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  assetId: string
  onReviewSubmitted?: () => void
}

export function ReviewForm({ assetId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to submit a review")
      return
    }

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (content.trim().length < 10) {
      toast.error("Review must be at least 10 characters")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/assets/${assetId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content: content.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review")
      }

      toast.success("Review submitted successfully!")
      setRating(0)
      setContent("")
      onReviewSubmitted?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <p className="text-muted-foreground">Please login to leave a review</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <h3 className="font-semibold text-foreground">Write a Review</h3>

      {/* Star Rating */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Your Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  (hoveredRating || rating) >= star ? "text-amber-400 fill-amber-400" : "text-muted-foreground",
                )}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </span>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Your Review</p>
        <Textarea
          placeholder="Share your experience with this asset..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] bg-secondary/50 border-border"
        />
        <p className="text-xs text-muted-foreground text-right">{content.length}/500 characters</p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0 || content.trim().length < 10}
        className="w-full"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Submit Review
      </Button>
    </div>
  )
}
