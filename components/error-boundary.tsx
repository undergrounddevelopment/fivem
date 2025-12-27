"use client"

import { Component, ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo)
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, etc.)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">Something went wrong</h2>
            <p className="text-muted-foreground text-sm">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <Button onClick={() => this.setState({ hasError: false })} className="magnetic glow-sm">
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
