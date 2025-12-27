// Rate Limiting Middleware
import { NextRequest } from 'next/server'

const rateLimit = new Map<string, { count: number; resetTime: number }>()

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimit.entries()) {
      if (now > value.resetTime) {
        rateLimit.delete(key)
      }
    }
  }, 300000)
}

export function checkRateLimit(
  req: NextRequest,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number } {
  const ip = (req as any).ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const record = rateLimit.get(ip)

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: limit - record.count }
}

export function clearRateLimit(identifier: string): void {
  rateLimit.delete(identifier)
}

export function getRateLimitStats(): { total: number; blocked: number } {
  let blocked = 0
  const now = Date.now()
  
  for (const [, value] of rateLimit.entries()) {
    if (value.count >= 10 && now < value.resetTime) {
      blocked++
    }
  }
  
  return { total: rateLimit.size, blocked }
}
