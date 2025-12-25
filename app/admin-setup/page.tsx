"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react"

export default function AdminSetupPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const makeAdmin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/admin/make-me-admin", {
        method: "POST",
      })

      const data = await res.json()

      if (res.ok) {
        setResult({ success: true, message: data.message })
        // Refresh page after 2 seconds
        setTimeout(() => {
          window.location.href = "/admin"
        }, 2000)
      } else {
        setResult({ success: false, message: data.error || "Failed to grant admin access" })
      }
    } catch (error) {
      setResult({ success: false, message: "Network error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>You must be logged in to set up admin access</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Admin Setup</CardTitle>
          </div>
          <CardDescription>Grant yourself admin privileges to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary/30 rounded-lg space-y-2">
            <p className="text-sm">
              <strong>Current User:</strong>
            </p>
            <p className="text-sm text-muted-foreground">{session.user.name || session.user.email}</p>
            <p className="text-xs text-muted-foreground">ID: {session.user.id}</p>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <Button onClick={makeAdmin} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Make Me Admin
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This will grant you full admin access to the dashboard. Only use this if you are the site owner.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
