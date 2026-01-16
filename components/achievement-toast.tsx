"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Star, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"

interface AchievementToastProps {
  badge: {
    id: string
    name: string
    description: string
    icon: string
  }
  onClose: () => void
}

export function AchievementToast({ badge, onClose }: AchievementToastProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([])

  useEffect(() => {
    // Generate confetti particles
    const colors = ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)]
    }))
    setParticles(newParticles)

    // Auto-close after 5 seconds
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 50 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-visible">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: "50%", 
              y: "50%", 
              scale: 0,
              opacity: 1 
            }}
            animate={{ 
              x: `${particle.x - 50}%`,
              y: `${particle.y - 150}%`,
              scale: [0, 1, 0.5],
              opacity: [1, 1, 0],
              rotate: [0, 360, 720]
            }}
            transition={{ 
              duration: 2,
              ease: "easeOut"
            }}
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </div>

      {/* Toast Card */}
      <motion.div
        className="relative bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl overflow-hidden pointer-events-auto"
        initial={{ boxShadow: "0 0 0 0 rgba(236, 72, 153, 0)" }}
        animate={{ 
          boxShadow: [
            "0 0 0 0 rgba(236, 72, 153, 0.4)",
            "0 0 60px 20px rgba(236, 72, 153, 0.2)",
            "0 0 0 0 rgba(236, 72, 153, 0)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Sparkle Effects */}
        <motion.div
          className="absolute top-2 right-2"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="h-5 w-5 text-yellow-500" />
        </motion.div>
        <motion.div
          className="absolute bottom-2 left-2"
          animate={{ rotate: -360, scale: [1, 1.3, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Star className="h-4 w-4 text-primary" />
        </motion.div>

        <div className="flex items-center gap-4">
          {/* Badge Icon */}
          <motion.div
            className="relative"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 p-0.5 shadow-lg shadow-primary/30">
              <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center overflow-hidden">
                {badge.icon ? (
                  <Image
                    src={badge.icon}
                    alt={badge.name}
                    width={48}
                    height={48}
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <Trophy className="h-8 w-8 text-primary" />
                )}
              </div>
            </div>
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(236, 72, 153, 0.4)",
                  "0 0 30px 10px rgba(236, 72, 153, 0.2)",
                  "0 0 0 0 rgba(236, 72, 153, 0)"
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          {/* Text Content */}
          <div>
            <motion.p
              className="text-xs font-medium text-primary uppercase tracking-widest mb-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Achievement Unlocked!
            </motion.p>
            <motion.h3
              className="text-xl font-bold text-foreground mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {badge.name}
            </motion.h3>
            <motion.p
              className="text-sm text-muted-foreground max-w-[200px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {badge.description}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Hook to trigger achievement toast
import { create } from "zustand"

interface AchievementStore {
  currentBadge: AchievementToastProps["badge"] | null
  showAchievement: (badge: AchievementToastProps["badge"]) => void
  hideAchievement: () => void
}

export const useAchievement = create<AchievementStore>((set) => ({
  currentBadge: null,
  showAchievement: (badge) => set({ currentBadge: badge }),
  hideAchievement: () => set({ currentBadge: null })
}))

// Global Achievement Container - Add this to layout
export function AchievementContainer() {
  const { currentBadge, hideAchievement } = useAchievement()

  return (
    <AnimatePresence>
      {currentBadge && (
        <AchievementToast badge={currentBadge} onClose={hideAchievement} />
      )}
    </AnimatePresence>
  )
}
