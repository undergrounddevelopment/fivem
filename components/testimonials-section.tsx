"use client"

import { useEffect, useState } from "react"
import { Star, CheckCircle, Quote, Crown, Shield, Zap, ArrowUp, Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Testimonial {
  id: string
  username: string
  avatar: string | null
  rating: number
  content: string
  server_name: string | null
  upvotes_received: number | null
  is_verified: boolean
  is_featured: boolean
  badge: string | null
  image_url: string | null
  created_at: string
}

const getBadgeIcon = (badge: string | null) => {
  switch (badge) {
    case "verified":
      return <CheckCircle className="h-4 w-4 text-[var(--primary)]" />
    case "pro":
      return <Crown className="h-4 w-4 text-[var(--primary)]" />
    case "vip":
      return <Shield className="h-4 w-4 text-[var(--primary)]" />
    case "premium":
      return <Zap className="h-4 w-4 text-[var(--primary)]" />
    default:
      return null
  }
}

const getBadgeColor = (badge: string | null) => {
  switch (badge) {
    case "verified":
    case "pro":
    case "vip":
    case "premium":
      return "border-[var(--primary)]/50"
    default:
      return "border-white/10"
  }
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch('/api/testimonials')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setTestimonials(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to fetch testimonials:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonials()
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length <= 3) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-secondary/50 rounded mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-secondary/50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (testimonials.length === 0) return null

  // Calculate stats
  const totalUpvotes = testimonials.reduce((sum, t) => sum + (t.upvotes_received || 0), 0)
  const avgRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
  const verifiedCount = testimonials.filter((t) => t.is_verified).length

  return (
    <div className="glass rounded-2xl p-8 overflow-hidden border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
      {/* Header with Stats */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[var(--text)] mb-2">Customer Reviews</h2>
        <p className="text-[var(--textDim)] mb-6">See what our clients say about FiveM Tools</p>

        {/* Stats Bar */}
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(236, 72, 153, 0.2)' }}>
              <ArrowUp className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-[var(--text)]">{totalUpvotes.toLocaleString()}+</p>
              <p className="text-xs text-[var(--textDim)]">Total Upvotes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(236, 72, 153, 0.2)' }}>
              <Star className="h-5 w-5 text-[var(--primary)] fill-[var(--primary)]" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-[var(--text)]">{avgRating}/5.0</p>
              <p className="text-xs text-[var(--textDim)]">Avg Rating</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(236, 72, 153, 0.2)' }}>
              <Users className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-[var(--text)]">{verifiedCount}</p>
              <p className="text-xs text-[var(--textDim)]">Verified Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative rounded-xl p-6 border-2 hover:border-[var(--primary)]/50 transition-all hover:scale-[1.02] group"
              style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: getBadgeColor(testimonial.badge) === 'border-[var(--primary)]/50' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)' }}
            >
              {/* Badge indicator */}
              {testimonial.badge && (
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-lg">
                  {getBadgeIcon(testimonial.badge)}
                </div>
              )}

              {/* User info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <img
                    src={testimonial.avatar || "/placeholder.svg?height=48&width=48&query=avatar"}
                    alt={testimonial.username}
                    className="w-12 h-12 rounded-full border-2 border-primary/30 object-cover"
                  />
                  {testimonial.is_verified && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-background" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[var(--text)] truncate">{testimonial.username}</h4>
                  </div>
                  {testimonial.server_name && (
                    <p className="text-xs text-[var(--textDim)] truncate">{testimonial.server_name}</p>
                  )}
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < testimonial.rating ? "fill-[var(--primary)] text-[var(--primary)]" : "text-[var(--textDim)]"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Testimonial image if exists */}
              {testimonial.image_url && (
                <div className="mb-4 rounded-lg overflow-hidden border border-border">
                  <img
                    src={testimonial.image_url || "/placeholder.svg"}
                    alt="Testimonial"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="relative mb-4">
                <Quote className="absolute -top-2 -left-2 h-6 w-6 text-[var(--primary)]/20" />
                <p className="text-sm text-[var(--text)] leading-relaxed pl-5 line-clamp-3">{testimonial.content}</p>
              </div>

              {/* Upvotes received */}
              {testimonial.upvotes_received && testimonial.upvotes_received > 0 && (
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--textDim)]">
                      Received{" "}
                      <span className="text-[var(--primary)] font-bold">{testimonial.upvotes_received.toLocaleString()}</span>{" "}
                      upvotes
                    </p>
                    <div className="flex items-center gap-1 text-[var(--primary)]">
                      <ArrowUp className="h-3 w-3" />
                      <span className="text-xs font-medium">Boosted</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View more indicator */}
      {testimonials.length > 6 && (
        <div className="text-center mt-6">
          <p className="text-sm text-[var(--textDim)">And {testimonials.length - 6} more happy customers...</p>
        </div>
      )}
    </div>
  )
}
