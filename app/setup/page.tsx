"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DatabaseSetup } from "@/components/database-setup"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"

export default function SetupPage() {
  const { user, isLoading, login, isAdmin } = useAuth()
  const router = useRouter()
  const [setupComplete, setSetupComplete] = useState(false)

  useEffect(() => {
    // Check if setup is already complete
    const checkSetup = async () => {
      try {
        const res = await fetch("/api/stats")
        const data = await res.json()
        if (data.users > 0 && data.assets > 0) {
          setSetupComplete(true)
        }
      } catch {
        // Setup not complete
      }
    }
    checkSetup()
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">FiveM Tools Setup</h1>
          <p className="text-muted-foreground">Get your marketplace up and running in minutes</p>
        </div>

        {!user && !isLoading && (
          <div className="glass rounded-2xl p-6 text-center space-y-4">
            <Shield className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Login Required</h2>
            <p className="text-sm text-muted-foreground">
              Please login with Discord to set up the database. The first user to login will become the admin.
            </p>
            <Button onClick={login} className="bg-[#5865F2] hover:bg-[#4752C4]">
              Login with Discord
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="glass rounded-2xl p-6 text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        )}

        {user && <DatabaseSetup />}

        {setupComplete && (
          <div className="glass rounded-2xl p-6 text-center space-y-4">
            <h2 className="text-xl font-semibold text-green-500">Setup Complete!</h2>
            <p className="text-sm text-muted-foreground">Your FiveM Tools marketplace is ready to use.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/")} className="gap-2">
                Go to Homepage
                <ArrowRight className="h-4 w-4" />
              </Button>
              {isAdmin && (
                <Button onClick={() => router.push("/admin")} variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
