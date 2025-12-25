"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      if (status === "loading") {
        return
      }

      if (!session?.user) {
        setError("You must be logged in to access the admin panel")
        setLoading(false)
        setTimeout(() => router.push("/"), 2000)
        return
      }

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const res = await fetch("/api/auth/check-admin", {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()

        if (data.isAdmin) {
          setIsAdmin(true)
          setError(null)
        } else {
          setError("You do not have admin privileges")
          setTimeout(() => router.push("/"), 2000)
        }
      } catch (error) {
        console.error("[v0] Error checking admin:", error)
        if (error instanceof Error && error.name === "AbortError") {
          setError("Request timeout. Please check your connection.")
        } else {
          setError("Failed to verify admin status. Please try again.")
        }
        setTimeout(() => router.push("/"), 3000)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [session, status, router])

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>{error}</p>
            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              Return to Home
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="flex">
          {/* Admin Sub-Navigation */}
          <aside className="hidden lg:block w-64 border-r border-border p-4 min-h-[calc(100vh-4rem)]">
            <AdminSidebarNav />
          </aside>
          {/* Main Content */}
          <div className="flex-1 p-6">{children}</div>
        </div>
      </main>
    </div>
  )
}
