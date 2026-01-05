"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import type { ReactNode } from "react"
import { useEffect, useState, useCallback, createContext, useContext } from "react"
import { CONFIG } from "@/lib/config"

const AuthContext = createContext<{
  user: any
  isAdmin: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
  isAuthConfigured: boolean
  refreshSession: () => Promise<boolean>
  refreshUser: () => Promise<boolean>
  checkAdminStatus: () => Promise<boolean>
}>({
  user: null,
  isAdmin: false,
  isLoading: false,
  login: () => {},
  logout: () => {},
  isAuthConfigured: false,
  refreshSession: async () => false,
  refreshUser: async () => false,
  checkAdminStatus: async () => false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const { data: sessionData, status, update } = useSession({
    required: false,
    onUnauthenticated() {
      // Handle unauthenticated state gracefully
    },
  })

  const checkAdminStatus = useCallback(async () => {
    if (!user?.id) return false
    try {
      const res = await fetch("/api/force-admin")
      if (!res.ok) throw new Error("Failed to check admin status")
      const data = await res.json()
      if (data.currentUser?.isAdmin && !user.isAdmin) {
        setUser({ ...user, isAdmin: true })
        return true
      }
      return data.currentUser?.isAdmin || false
    } catch (error) {
      console.error("Admin check error:", error)
      return false
    }
  }, [user])

  const refreshUser = useCallback(async () => {
    try {
      if (typeof update === "function") {
        await update()
      } else {
        // Fallback for older next-auth versions
        await fetch("/api/auth/session", { cache: "no-store" })
      }
      return true
    } catch {
      return false
    }
  }, [update])

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true)
    } else {
      setIsLoading(false)
      if (sessionData?.user) {
        setUser({
          ...sessionData.user,
          id: sessionData.user.id || "",
          discordId: sessionData.user.id || "",
          username: sessionData.user.name || "",
          email: sessionData.user.email || "",
          avatar: sessionData.user.image || "",
          membership: sessionData.user.membership || "free",
          coins: sessionData.user.coins || 100,
          isAdmin: sessionData.user.isAdmin === true,
          bio: (sessionData.user as any).bio || "",
        })
      }
    }

    if (sessionData?.user) {
      setIsAdmin(sessionData.user.isAdmin === true)
    } else {
      setUser(null)
      setIsAdmin(false)
    }
  }, [sessionData, status])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        login: () => signIn("discord"),
        logout: () => signOut(),
        refreshSession: refreshUser,
        refreshUser,
        checkAdminStatus,
        isAuthConfigured: !!CONFIG.discord.clientId && !!CONFIG.discord.clientSecret,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
