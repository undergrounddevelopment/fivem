"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getCurrentHoliday } from "@/lib/holiday-theme"

export function HolidayBanner() {
  const [holiday, setHoliday] = useState(getCurrentHoliday())

  useEffect(() => {
    setHoliday(getCurrentHoliday())
  }, [])

  if (!holiday) return null

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`w-full py-3 px-4 text-center bg-gradient-to-r ${holiday.theme.bg} backdrop-blur-xl border-b border-white/10`}
    >
      <p className="text-sm font-medium gradient-text text-glow">
        {holiday.theme.text}
      </p>
    </motion.div>
  )
}
