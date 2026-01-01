"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function LoginButton() {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [isAuthConfigured, setIsAuthConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkAuthConfig() {
      try {
        const res = await fetch("/api/auth/csrf")
        if (res.status === 503) {
          setIsAuthConfigured(false)
        } else {
          setIsAuthConfigured(true)
        }
      } catch {
        setIsAuthConfigured(false)
      }
    }
    checkAuthConfig()
  }, [])

  if (status === "loading" || isAuthConfigured === null) {
    return (
      <Button disabled style={{ background: "var(--primary)", color: "white" }}>
        Loading...
      </Button>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--text)]">Welcome, {session.user?.name}</span>
        <Button onClick={() => signOut()} variant="outline">
          Sign Out
        </Button>
      </div>
    )
  }

  if (!isAuthConfigured) {
    return (
      <div className="flex flex-col gap-2">
        <Button disabled style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
          Discord Login Not Configured
        </Button>
        <p className="text-xs text-[var(--muted-foreground)]">Contact admin to set up Discord OAuth</p>
      </div>
    )
  }

  const handleSignIn = async () => {
    try {
      setError(null)
      await signIn("discord", { redirect: false })
    } catch (err) {
      console.error("[LoginButton] Sign in error:", err)
      setError("Failed to sign in. Please try again.")
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleSignIn} style={{ background: "var(--primary)", color: "white" }}>
        Sign In with Discord
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
