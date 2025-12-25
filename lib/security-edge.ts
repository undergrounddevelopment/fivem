// Edge Runtime compatible security utilities
const rateLimitStore = new Map<string, { count: number; resetAt: number; blocked: boolean }>()

export const security = {
  checkRateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    // Cleanup old entries periodically
    if (rateLimitStore.size > 10000) {
      for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetAt) rateLimitStore.delete(key)
      }
    }

    // If no record or window expired, create new record
    if (!record || now > record.resetAt) {
      rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs, blocked: false })
      return true
    }

    // If already blocked in current window, deny
    if (record.blocked) {
      return false
    }

    // If limit reached, block and deny
    if (record.count >= maxRequests) {
      record.blocked = true
      return false
    }

    // Increment count and allow
    record.count++
    return true
  },

  generateCSRFToken(sessionId: string): string {
    const timestamp = Date.now().toString()
    return btoa(`${sessionId}:${timestamp}:csrf`)
  },

  verifyCSRFToken(token: string, sessionId: string): boolean {
    if (!token || !sessionId) return false
    try {
      const decoded = atob(token)
      const [id, timestamp] = decoded.split(":")
      const tokenAge = Date.now() - Number.parseInt(timestamp)
      return id === sessionId && tokenAge < 3600000
    } catch {
      return false
    }
  },

  logSecurityEvent(event: string, details: any, severity: "low" | "medium" | "high" | "critical" = "medium"): void {
    console.log(`[SECURITY-${severity.toUpperCase()}] ${new Date().toISOString()}: ${event}`, details)
  },
}
