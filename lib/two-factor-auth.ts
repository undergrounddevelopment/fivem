import crypto from 'crypto'
import { authenticator } from 'otplib'

export class TwoFactorAuth {
  private static readonly APP_NAME = 'FiveM Tools V7'

  static generateSecret(): string {
    return authenticator.generateSecret()
  }

  static generateQRCode(username: string, secret: string): string {
    return authenticator.keyuri(username, this.APP_NAME, secret)
  }

  static verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret })
    } catch {
      return false
    }
  }

  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`)
    }
    return codes
  }

  static hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex')
  }

  static verifyBackupCode(code: string, hashedCode: string): boolean {
    const hash = this.hashBackupCode(code)
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashedCode))
  }
}

// Database schema for 2FA
export interface User2FA {
  user_id: string
  secret: string
  enabled: boolean
  backup_codes: string[] // Hashed
  created_at: string
  last_used: string | null
}
