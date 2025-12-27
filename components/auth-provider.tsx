"use client"

import { SessionProvider, useSession, signIn, signOut } from "next-auth/react"
import type { ReactNode } from "react"
import { useEffect, useState, useCallback } from "react"

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={0} // Disable auto refetch - reduces unnecessary API calls
      refetchOnWindowFocus={false} // Disable refetch on window focus - prevents logout issues
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  )
}

export function useAuth() {
  const { data: session, status, update } = useSession()
  const [forceAdminCheck, setForceAdminCheck] = useState(false)

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && session?.user) {
      console.log("🔐 Auth State:", {
        id: session.user.id,
        isAdmin: session.user.isAdmin,
        membership: session.user.membership,
      })
    }
  }, [session])

  const user = session?.user
    ? {
        id: session.user.id || "",
        discordId: session.user.id || "",
        username: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.image || "",
        membership: session.user.membership || "free",
        coins: session.user.coins || 100,
        isAdmin: session.user.isAdmin === true,
        bio: (session.user as any).bio || "",
      }
    : null

  // Force check admin status from API if needed
  const checkAdminStatus = useCallback(async () => {
    if (!user?.id) return false
    try {
      const res = await fetch("/api/force-admin")
      if (!res.ok) throw new Error('Failed to check admin status')
      const data = await res.json()
      if (data.currentUser?.isAdmin && !user.isAdmin) {
        await update() // Refresh session
        return true
      }
      return data.currentUser?.isAdmin || false
    } catch (error) {
      console.error('Admin check error:', error)
      return false
    }
  }, [user?.id, user?.isAdmin, update])

  const refreshUser = useCallback(async () => {
    try {
      await update()
      return true
    } catch {
      return false
    }
  }, [update])

  return {
    user,
    isAdmin: user?.isAdmin === true,
    isLoading: status === "loading",
    login: () => signIn("discord"),
    logout: () => signOut(),
    refreshSession: () => update(),
    refreshUser, // Added refreshUser to return
    checkAdminStatus,
  }
}
