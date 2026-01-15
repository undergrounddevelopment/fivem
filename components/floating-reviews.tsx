'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'

interface Review {
  id: string
  user: {
    name: string
    avatar: string | null
  }
  asset: {
    title: string
    thumbnail: string | null
  }
  rating: number
  comment: string
  created_at: string
}

export function FloatingReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentReview, setCurrentReview] = useState<Review | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    if (reviews.length === 0) return

    const showReview = () => {
      const randomReview = reviews[Math.floor(Math.random() * reviews.length)]
      setCurrentReview(randomReview)
      setIsVisible(true)

      setTimeout(() => {
        setIsVisible(false)
      }, 8000)
    }

    const interval = setInterval(showReview, 15000)
    showReview()

    return () => clearInterval(interval)
  }, [reviews])

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews/recent')
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && currentReview && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-background to-muted/50 p-4 shadow-2xl backdrop-blur-sm">
            <button
              onClick={handleClose}
              className="absolute right-2 top-2 rounded-full p-1 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={currentReview.user.avatar || undefined} />
                <AvatarFallback>{currentReview.user.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm font-semibold">{currentReview.user.name}</p>
                  <p className="text-xs text-muted-foreground">reviewed</p>
                </div>

                <div className="flex items-center gap-2">
                  {currentReview.asset.thumbnail && (
                    <img
                      src={currentReview.asset.thumbnail}
                      alt={currentReview.asset.title}
                      className="h-8 w-8 rounded object-cover"
                    />
                  )}
                  <p className="text-sm font-medium line-clamp-1">
                    {currentReview.asset.title}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < currentReview.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>

                {currentReview.comment && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    "{currentReview.comment}"
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  {new Date(currentReview.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
