"use client"

import type React from "react"
import { useState } from "react"

import { PublicNotifications } from "@/components/public-notifications"
import { OnlineTracker } from "@/components/online-tracker"
import { DailySpinTicket } from "@/components/daily-spin-ticket"

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [dailySpinOpen, setDailySpinOpen] = useState(false)

  return (
    <>
      {children}
      <PublicNotifications />
      <OnlineTracker />
      <DailySpinTicket open={dailySpinOpen} onOpenChange={setDailySpinOpen} />
    </>
  )
}
