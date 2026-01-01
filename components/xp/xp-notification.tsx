"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BadgeDisplay } from "./badge-display"
import type { XPAwardResult } from "@/lib/xp/types"
import type { Badge } from "@/lib/xp/types"

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
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚡</div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">+{result.xpAwarded} XP Earned!</div>
                <div className="text-xs text-gray-400">Total: {result.totalXp?.toLocaleString()} XP</div>
              </div>
            </div>

            {result.leveledUp && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-yellow-400 font-bold text-sm">🎉 Level Up!</div>
                  <div className="text-white text-lg font-bold">
                    Level {result.oldLevel} → {result.newLevel}
                  </div>
                </div>
              </motion.div>
            )}

            {result.badgeUnlocked && badge && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center gap-3">
                  <BadgeDisplay badge={badge} size="md" showTooltip={false} />
                  <div>
                    <div className="text-xs text-purple-400 font-bold">New Badge Unlocked!</div>
                    <div className="text-sm font-bold text-white">{badge.name}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
