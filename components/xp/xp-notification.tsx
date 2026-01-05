"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BadgeDisplay } from "./badge-display"
import type { XPAwardResult, Badge } from "@/lib/xp/types"
import { Zap, TrendingUp, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface XPNotificationProps {
  result: XPAwardResult | null
  badge?: Badge
  onClose: () => void
}

export function XPNotification({ result, badge, onClose }: XPNotificationProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (result?.success && result.xpAwarded) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 300)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [result, onClose])

  if (!result?.success || !result.xpAwarded) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className={cn(
            "relative rounded-2xl overflow-hidden backdrop-blur-xl",
            "bg-gradient-to-br from-violet-600/95 to-purple-700/95",
            "shadow-xl shadow-purple-500/25 min-w-[280px]"
          )}>
            {/* Main content */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                {/* XP Icon */}
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-300" />
                </div>

                {/* XP Info */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-white">+{result.xpAwarded}</span>
                    <span className="text-sm font-medium text-white/70">XP</span>
                  </div>
                  <p className="text-xs text-white/60">
                    Total: {result.totalXp?.toLocaleString()} XP
                  </p>
                </div>
              </div>

              {/* Level Up */}
              {result.leveledUp && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-yellow-300">Level Up!</p>
                      <p className="text-white font-semibold">
                        Level {result.oldLevel} → {result.newLevel}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Badge Unlocked */}
              {result.badgeUnlocked && badge && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <BadgeDisplay badge={badge} size="md" showTooltip={false} />
                    <div>
                      <p className="text-xs font-medium text-cyan-300">Badge Unlocked!</p>
                      <p className="text-white font-semibold">{badge.name}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-black/20">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="h-full bg-white/40"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
