"use client"

import type React from "react"

import { PublicNotifications } from "@/components/public-notifications"
import { OnlineTracker } from "@/components/online-tracker"
// import { DailySpinTicket } from "@/components/daily-spin-ticket" // Event sudah berakhir

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PublicNotifications />
      <OnlineTracker />
      {/* DailySpinTicket dinonaktifkan - event sudah berakhir */}
    </>
  )
}
