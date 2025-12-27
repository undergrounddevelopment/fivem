import { kv } from '@vercel/kv'
import { NextRequest } from 'next/server'

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function checkRateLimitKV(
  req: NextRequest,
  limit: number = 100,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  try {
    const ip = (req as any).ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const key = `ratelimit:${ip}`
    const now = Date.now()
    
    // Get current count
    const current = await kv.get<number>(key)
    
    if (!current) {
      // First request
      await kv.set(key, 1, { px: windowMs })
      return { success: true, remaining: limit - 1, reset: now + windowMs }
    }
    
    if (current >= limit) {
      const ttl = await kv.pttl(key)
      return { success: false, remaining: 0, reset: now + (ttl || windowMs) }
    }
    
    // Increment
    await kv.incr(key)
    const ttl = await kv.pttl(key)
    
    return { success: true, remaining: limit - current - 1, reset: now + (ttl || windowMs) }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fallback to allow on error
    return { success: true, remaining: limit, reset: Date.now() + windowMs }
  }
}

export async function blockIP(ip: string, durationMs: number = 3600000): Promise<void> {
  try {
    await kv.set(`blocked:${ip}`, true, { px: durationMs })
  } catch (error) {
    console.error('Block IP error:', error)
  }
}

export async function isIPBlocked(ip: string): Promise<boolean> {
  try {
    const blocked = await kv.get(`blocked:${ip}`)
    return !!blocked
  } catch (error) {
    console.error('Check blocked IP error:', error)
    return false
  }
}

export async function getRateLimitStats(): Promise<{ total: number; blocked: number }> {
  try {
    const keys = await kv.keys('ratelimit:*')
    const blockedKeys = await kv.keys('blocked:*')
    return { total: keys.length, blocked: blockedKeys.length }
  } catch (error) {
    console.error('Get stats error:', error)
    return { total: 0, blocked: 0 }
  }
}
