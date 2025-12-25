"use client"

import { useEffect } from "react"
import { getCurrentHoliday } from "@/lib/holiday-theme"

export function HolidayThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const holiday = getCurrentHoliday()
    
    if (holiday) {
      document.documentElement.style.setProperty('--primary', holiday.theme.primary)
      document.documentElement.style.setProperty('--secondary', holiday.theme.secondary)
      document.documentElement.style.setProperty('--accent', holiday.theme.accent)
    }
  }, [])

  return <>{children}</>
}
