"use client"

import { motion } from "framer-motion"
import { Sparkles, Zap, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ModernHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 holographic neon-border">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-bg opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
            <span className="text-sm font-medium gradient-text">FiveM Tools V7 - 2025 Edition</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="gradient-text text-glow">Premium FiveM</span>
            <br />
            <span className="text-foreground">Resources Hub</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl">
            Download free scripts, MLO, vehicles, EUP. Decrypt CFX V7, boost server upvotes, 
            and join the #1 FiveM community.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-4"
        >
          <Link href="/scripts">
            <Button size="lg" className="magnetic glow-sm shimmer group">
              <Zap className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
              Browse Scripts
            </Button>
          </Link>
          
          <Link href="/forum">
            <Button size="lg" variant="outline" className="magnetic glass-hover">
              <TrendingUp className="h-5 w-5 mr-2" />
              Join Forum
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-4 pt-6"
        >
          {[
            { label: "Scripts", value: "5000+" },
            { label: "Users", value: "50K+" },
            { label: "Downloads", value: "1M+" },
          ].map((stat, i) => (
            <div key={i} className="text-center glass rounded-xl p-4 card-hover">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
    </div>
  )
}
