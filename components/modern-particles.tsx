"use client"

import { useEffect, useState, useMemo, memo } from "react"
import { motion } from "framer-motion"
import { getCurrentHoliday } from "@/lib/holiday-theme"

const Particle = memo(function Particle({ color, index }: { color: string; index: number }) {
  const initialX = useMemo(() => typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0, [])
  const animateX = useMemo(() => typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0, [])
  const animateY = useMemo(() => typeof window !== 'undefined' ? window.innerHeight + 50 : 800, [])
  const duration = useMemo(() => Math.random() * 10 + 10, [])
  const delay = useMemo(() => Math.random() * 5, [])

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ 
        background: color,
        boxShadow: `0 0 10px ${color}`,
        willChange: 'transform, opacity'
      }}
      initial={{ x: initialX, y: -50, opacity: 0.6 }}
      animate={{ y: animateY, x: animateX, scale: [1, 1.5, 1], opacity: [0.6, 0.8, 0.6] }}
      transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
    />
  )
})

export const ModernParticles = memo(function ModernParticles() {
  const [mounted, setMounted] = useState(false)
  const holiday = useMemo(() => getCurrentHoliday(), [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const particles = useMemo(() => Array.from({ length: 15 }), [])

  if (!mounted || !holiday) return null

  const color = holiday.theme.primary

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((_, i) => (
        <Particle key={i} color={color} index={i} />
      ))}
    </div>
  )
})
