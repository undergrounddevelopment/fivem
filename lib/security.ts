import crypto from "crypto"
import { z } from "zod"

// Enhanced rate limiting with persistence
const rateLimitStore = new Map<string, { count: number; resetAt: number; blocked: boolean }>()

export const security = {
  checkRateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    // Clean expired entries
    if (rateLimitStore.size > 10000) {
      for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetAt) rateLimitStore.delete(key)
      }
    }

    if (!record || now > record.resetAt) {
      rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs, blocked: false })
      return true
    }

    if (record.blocked || record.count >= maxRequests) {
      record.blocked = true
      return false
    }

    record.count++
    return true
  },

  blockIdentifier(identifier: string, durationMs = 3600000): void {
    rateLimitStore.set(identifier, {
      count: 999,
      resetAt: Date.now() + durationMs,
      blocked: true,
    })
  },

  verifyHash(data: string, hash: string): boolean {
    try {
      const computed = crypto.createHash("sha256").update(data).digest("hex")
      return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"))
    } catch {
      return false
    }
  },

  generateToken(): string {
    return crypto.randomBytes(32).toString("hex")
  },

  generateCSRFToken(sessionId: string): string {
    const timestamp = Date.now().toString()
    const data = `${sessionId}:${timestamp}:csrf`
    return crypto
      .createHmac("sha256", process.env.SESSION_SECRET || "fallback")
      .update(data)
      .digest("base64url")
  },

  verifyCSRFToken(token: string, sessionId: string): boolean {
    if (!token || !sessionId) return false
    try {
      const expected = this.generateCSRFToken(sessionId)
      return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
    } catch {
      return false
    }
  },

  sanitizeInput(input: string): string {
    if (typeof input !== "string") return ""
    return (
      input
        // Only remove dangerous patterns, not normal characters
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .replace(/vbscript:/gi, "")
        .replace(/\\x[0-9a-f]{2}/gi, "")
        // Remove null bytes and control characters except newlines/tabs
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1f\x7f]/g, "")
        .trim()
        .slice(0, 10000)
    ) // Allow longer content
  },

  validateInput: {
    // Allow more characters in title including unicode
    title: z.string().min(1).max(200),
    description: z.string().min(10).max(50000),
    category: z.enum(["scripts", "mlo", "vehicles", "clothing"]),
    framework: z.enum(["esx", "qbcore", "qbox", "standalone"]),
    coinPrice: z.number().int().min(0).max(10000),
    tags: z.array(z.string().min(1).max(50)).max(20),
    discordId: z.string().regex(/^\d{17,19}$/),
    email: z.string().email().optional(),
    username: z.string().min(2).max(32),
  },

  validateSession(sessionToken: string): boolean {
    return typeof sessionToken === "string" && sessionToken.length >= 32 && /^[a-zA-Z0-9+/=]+$/.test(sessionToken)
  },

  isValidDiscordId(id: string): boolean {
    return /^\d{17,19}$/.test(id)
  },

  isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return ["http:", "https:"].includes(parsed.protocol)
    } catch {
      return false
    }
  },

  encrypt(data: string, key?: string): string {
    try {
      const secretKey = crypto
        .createHash("sha256")
        .update(key || process.env.SESSION_SECRET || "fallback-key")
        .digest()
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv)
      let encrypted = cipher.update(data, "utf8", "hex")
      encrypted += cipher.final("hex")
      return iv.toString("hex") + ":" + encrypted
    } catch {
      return ""
    }
  },

  decrypt(encrypted: string, key?: string): string {
    try {
      const secretKey = crypto
        .createHash("sha256")
        .update(key || process.env.SESSION_SECRET || "fallback-key")
        .digest()
      const [ivHex, encryptedData] = encrypted.split(":")
      if (!ivHex || !encryptedData) return ""

      const iv = Buffer.from(ivHex, "hex")
      const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv)
      let decrypted = decipher.update(encryptedData, "hex", "utf8")
      decrypted += decipher.final("utf8")
      return decrypted
    } catch {
      return ""
    }
  },

  logSecurityEvent(event: string, details: any, severity: "low" | "medium" | "high" | "critical" = "medium"): void {
    const timestamp = new Date().toISOString()
    console.log(`[SECURITY-${severity.toUpperCase()}] ${timestamp}: ${event}`, details)
  },
}

export function validateAdminRole(session: any): boolean {
  if (!session?.user?.isAdmin) {
    security.logSecurityEvent("Unauthorized admin access attempt", { userId: session?.user?.id }, "high")
    return false
  }
  return true
}

export function rateLimitAdmin(userId: string): boolean {
  const allowed = security.checkRateLimit(`admin_${userId}`, 200, 60000)
  if (!allowed) {
    security.logSecurityEvent("Admin rate limit exceeded", { userId }, "medium")
  }
  return allowed
}

export function validateFileUpload(file: { name: string; size: number; type: string }): {
  valid: boolean
  error?: string
} {
  const allowedTypes = [
    "application/zip",
    "application/x-zip-compressed",
    "application/rar",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type" }
  }

  const maxSize = file.type.startsWith("image/") ? 10 * 1024 * 1024 : 500 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: "File too large" }
  }

  const suspiciousPatterns = [".exe", ".bat", ".cmd", ".scr", ".vbs"]
  if (suspiciousPatterns.some((pattern) => file.name.toLowerCase().endsWith(pattern))) {
    return { valid: false, error: "Suspicious file detected" }
  }

  return { valid: true }
}
