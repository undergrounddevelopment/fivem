"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getCurrentHoliday } from "@/lib/holiday-theme"

export function HolidayEffects() {
  const [holiday, setHoliday] = useState(getCurrentHoliday())

  useEffect(() => {
    setHoliday(getCurrentHoliday())
  }, [])

  if (!holiday) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {holiday.effects.slice(0, 20).map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-60"
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
            y: -50 
          }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 50 : 1000,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            rotate: [0, 360]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  )
}
