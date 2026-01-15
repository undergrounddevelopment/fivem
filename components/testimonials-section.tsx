"use client"

import { useEffect, useState } from "react"
import { Star, CheckCircle, Quote, Crown, Shield, Zap, ArrowUp, Users, Image as ImageIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { OptimizedImage } from "@/components/optimized-image"

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
  const [isPaused, setIsPaused] = useState(false)

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
    if (testimonials.length <= 3 || isPaused) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / 3))
    }, 8000)
    return () => clearInterval(interval)
  }, [testimonials.length, isPaused])

  if (loading) {
    return (
      <div className="glass rounded-[3rem] p-12 border border-white/5">
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-64 bg-white/5 rounded-full mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white/5 rounded-[2.5rem]" />
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
    <div
      className="rounded-[4rem] p-8 sm:p-20 overflow-hidden relative group border border-white/5 bg-black/20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute inset-0 bg-white/[0.01] backdrop-blur-[100px]" />

      {/* Dynamic Background Decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Header with Stats */}
      <div className="relative z-10 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mx-auto mb-6 px-6 py-2 rounded-full border-primary/20 bg-primary/10 text-primary text-[10px] font-black tracking-[0.4em] uppercase backdrop-blur-md">
            Operational Verification
          </Badge>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter italic leading-none">
            COMMANDER <span className="text-primary italic">FEEDBACK</span>
          </h2>
          <p className="text-muted-foreground/80 mb-14 max-w-3xl mx-auto text-base md:text-lg font-medium tracking-wide">
            Strategic endorsement from the world's most elite FiveM server operators and <br className="hidden md:block" />
            community leaders who demand nothing but absolute perfection.
          </p>
        </motion.div>

        {/* Stats Grid - Tighter & More Modern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {[
            { label: 'Total Signal Strength', value: `${totalUpvotes.toLocaleString()}+`, icon: ArrowUp, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
            { label: 'Average Evaluation', value: `${avgRating}/5.0`, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { label: 'Verified Operators', value: verifiedCount, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl flex items-center gap-6 hover:bg-white/[0.05] transition-colors group/stat"
            >
              <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.border} border flex items-center justify-center shadow-lg group-hover/stat:scale-110 transition-transform`}>
                <stat.icon className={`h-7 w-7 ${stat.color} ${stat.icon === Star ? 'fill-amber-400' : ''}`} />
              </div>
              <div className="text-left">
                <p className="text-3xl font-black text-white tracking-tighter leading-none mb-1">{stat.value}</p>
                <p className={`text-[10px] font-black ${stat.color} uppercase tracking-[0.2em] opacity-60`}>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials Slider */}
      <div className="relative z-10 overflow-hidden px-2 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full"
          >
            {[...testimonials, ...testimonials, ...testimonials].slice(activeIndex * 3, activeIndex * 3 + 3).map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
                className="relative rounded-[3.5rem] p-12 bg-white/[0.015] border border-white/5 hover:border-primary/40 transition-all duration-700 hover:bg-white/[0.03] group/card flex flex-col h-[480px] overflow-hidden backdrop-blur-2xl"
              >
                {/* Internal Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />

                {/* Rating Stars - Elite Style */}
                <div className="flex gap-1.5 mb-8">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5 transition-all duration-500",
                        i < testimonial.rating ? "fill-primary text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)] scale-110" : "text-white/5"
                      )}
                    />
                  ))}
                </div>

                {/* Testimony Content - Proper Padding & Spacing */}
                <div className="relative flex-1 mb-10">
                  <Quote className="absolute -top-6 -left-6 h-20 w-20 text-primary/5 -rotate-12 group-hover/card:scale-110 group-hover/card:text-primary/10 transition-all duration-1000" />
                  <p className="text-lg font-medium text-white/70 leading-[1.8] italic relative z-10 line-clamp-6 pl-4 border-l-2 border-primary/20">
                    "{testimonial.content}"
                  </p>
                </div>

                {/* Header / User Info - Lower for 2026 aesthetics */}
                <div className="flex items-center gap-6 mt-auto pt-8 border-t border-white/5">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
                    <OptimizedImage
                      src={testimonial.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.username}`}
                      alt={testimonial.username}
                      width={72}
                      height={72}
                      className="rounded-[1.5rem] border border-white/10 relative z-10 p-1 bg-black/40 group-hover/card:scale-105 transition-transform duration-500"
                    />
                    {testimonial.is_verified && (
                      <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center ring-4 ring-[#0A0A0A] z-20 shadow-xl">
                        <CheckCircle className="h-4.5 w-4.5 text-black" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-white truncate text-xl uppercase tracking-tighter leading-none mb-1.5">{testimonial.username}</h4>
                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] opacity-70 truncate italic">
                      {testimonial.server_name || "Elite Commander"}
                    </p>
                  </div>
                </div>

                {/* Signal Strength Badge */}
                <div className="absolute bottom-6 right-10 opacity-20 group-hover/card:opacity-60 transition-opacity">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Signal Unit</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{testimonial.upvotes_received || 0} EN</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation - Cyber Dots */}
        <div className="flex justify-center gap-4 mt-16">
          {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="relative group/nav"
            >
              <div className={cn(
                "h-1.5 rounded-full transition-all duration-700 ease-out",
                activeIndex === i ? "w-16 bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.8)]" : "w-4 bg-white/10 group-hover/nav:bg-white/20"
              )} />
              {activeIndex === i && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary blur-md opacity-50 h-1.5"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Edge Decorations */}
      <div className="absolute top-10 left-10 w-20 h-px bg-gradient-to-r from-primary/40 to-transparent opacity-20" />
      <div className="absolute top-10 left-10 h-20 w-px bg-gradient-to-b from-primary/40 to-transparent opacity-20" />
      <div className="absolute bottom-10 right-10 w-20 h-px bg-gradient-to-l from-primary/40 to-transparent opacity-20" />
      <div className="absolute bottom-10 right-10 h-20 w-px bg-gradient-to-t from-primary/40 to-transparent opacity-20" />
    </div>
  )
}
