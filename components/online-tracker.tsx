"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

const HEARTBEAT_INTERVAL = 30000 // 30 seconds for realtime accuracy

export function OnlineTracker() {
  const { data: session, status } = useSession()
  const lastHeartbeatRef = useRef<number>(0)

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return

    // Send heartbeat via API for reliable tracking
    const sendHeartbeat = async () => {
      const now = Date.now()
      // Prevent duplicate heartbeats within 10 seconds
      if (now - lastHeartbeatRef.current < 10000) return
      lastHeartbeatRef.current = now

      try {
        await fetch("/api/users/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      } catch (error) {
        // Silently fail
      }
    }

    // Send initial heartbeat
    sendHeartbeat()

    // Send heartbeat every 30 seconds for accurate online status
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)

    // Send heartbeat on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat()
      }
    }

    // Send heartbeat on user activity
    const handleActivity = () => {
      const now = Date.now()
      if (now - lastHeartbeatRef.current >= 15000) {
        sendHeartbeat()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("click", handleActivity)
    window.addEventListener("keydown", handleActivity)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("click", handleActivity)
      window.removeEventListener("keydown", handleActivity)
    }
  }, [session?.user?.id, status])

  return null
}
