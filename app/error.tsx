"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong!</h1>
        <p className="text-muted-foreground mb-6">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        
        {process.env.NODE_ENV === 'development' && error?.message && (
          <div className="mb-6 p-4 bg-destructive/10 rounded-xl text-left">
            <p className="text-xs font-mono text-destructive break-all">{error.message}</p>
          </div>
        )}
        
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline" className="gap-2 rounded-xl">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button className="gap-2 rounded-xl">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
