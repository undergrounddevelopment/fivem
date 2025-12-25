"use client"

import { motion } from "framer-motion"

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="glass rounded-2xl p-6 space-y-3"
        >
          <div className="h-4 bg-white/10 rounded-full w-3/4 shimmer" />
          <div className="h-4 bg-white/10 rounded-full w-1/2 shimmer" />
          <div className="h-20 bg-white/10 rounded-xl shimmer" />
        </motion.div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-white/10 rounded-full w-20 shimmer" />
          <div className="h-8 bg-white/10 rounded-full w-24 shimmer" />
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-xl shimmer" />
      </div>
    </div>
  )
}
