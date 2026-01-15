"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, X, CheckCircle, Crown, Shield, Zap, Quote } from "lucide-react"

interface Review {
  id: string
  username: string
  avatar: string | null
  rating: number
  content: string
  server_name: string | null
  is_verified: boolean
  badge: string | null
  upvotes_received: number | null
  created_at: string
}

const getBadgeIcon = (badge: string | null) => {
  switch (badge) {
    case "verified":
      return <CheckCircle className="h-3 w-3 text-blue-400" />
    case "pro":
      return <Crown className="h-3 w-3 text-yellow-400" />
    case "vip":
      return <Shield className="h-3 w-3 text-purple-400" />
    case "premium":
      return <Zap className="h-3 w-3 text-pink-400" />
    default:
      return null
  }
}

export function FloatingReviewNotifications() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentReview, setCurrentReview] = useState<Review | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/testimonials')
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          // Filter only reviews with content
          const validReviews = data.filter((r: Review) => r.content && r.content.trim().length > 0)
          setReviews(validReviews)
          if (validReviews.length > 0) {
            setCurrentReview(validReviews[0])
          }
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      }
    }
    fetchReviews()
  }, [])

  useEffect(() => {
    if (reviews.length === 0) return

    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % reviews.length
          setCurrentReview(reviews[next])
          setIsVisible(true)
          return next
        })
      }, 400)
    }, 10000) // Show each review for 10 seconds

    return () => clearInterval(interval)
  }, [reviews])

  if (!currentReview || reviews.length === 0) return null

  return (
    <AnimatePresence mode="wait">
      {isVisible && currentReview && (
        <motion.div
          key={currentReview.id}
          initial={{ opacity: 0, x: 400, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.8 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1],
            scale: { duration: 0.3 }
          }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full mx-4 sm:mx-0"
        >
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-gray-900/98 via-gray-800/98 to-gray-900/98">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
            
            {/* Content */}
            <div className="relative p-5">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 p-0.5">
                    <img
                      src={currentReview.avatar || "/placeholder.svg?height=48&width=48"}
                      alt={currentReview.username}
                      className="w-full h-full rounded-full object-cover border-2 border-background"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg?height=48&width=48"
                      }}
                    />
                  </div>
                  {currentReview.is_verified && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-gray-900 shadow-lg">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-white truncate">
                      {currentReview.username}
                    </h4>
                    {currentReview.badge && (
                      <div className="flex-shrink-0">
                        {getBadgeIcon(currentReview.badge)}
                      </div>
                    )}
                  </div>

                  {currentReview.server_name && (
                    <p className="text-xs text-gray-400 truncate mb-1.5">
                      {currentReview.server_name}
                    </p>
                  )}

                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < currentReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsVisible(false)}
                  className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Review Content */}
              <div className="relative pl-1">
                <Quote className="absolute -left-1 -top-1 h-4 w-4 text-primary/30" />
                <p className="text-sm text-gray-200 leading-relaxed line-clamp-3 pl-4">
                  {currentReview.content}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400">
                  Just reviewed FiveM Tools
                </p>
                {currentReview.upvotes_received && currentReview.upvotes_received > 0 && (
                  <div className="flex items-center gap-1 text-primary">
                    <span className="text-xs font-semibold">
                      {currentReview.upvotes_received} upvotes
                    </span>
                  </div>
                )}
              </div>

              {/* Progress indicator */}
              <div className="mt-3 flex gap-1">
                {reviews.slice(0, Math.min(reviews.length, 5)).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i === currentIndex % 5
                        ? "bg-primary"
                        : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
