"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"

export function OnlineTracker() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) return

    // Send heartbeat immediately on mount
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/users/heartbeat", { method: "POST" })
      } catch (error) {
        // Silently fail
      }
    }

    sendHeartbeat()

    // Send heartbeat every 2 minutes
    const interval = setInterval(sendHeartbeat, 2 * 60 * 1000)

    // Also send heartbeat on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [session?.user?.id])

  return null
}
