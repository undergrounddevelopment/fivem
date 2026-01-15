"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import { RealtimeSessionSync } from "@/components/realtime-session-sync"

export function ClientSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider basePath="/api/auth" refetchInterval={0} refetchOnWindowFocus={false}>
      <RealtimeSessionSync />
      {children}
    </SessionProvider>
  )
}