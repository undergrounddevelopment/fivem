import jwt from 'jsonwebtoken'

// 100% REAL - No fallback secrets
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('[Token] JWT_SECRET environment variable is required!')
}

interface DownloadTokenPayload {
  userId: string
  assetId: string
  type: 'download_grant'
  exp?: number
}

/**
 * Generate a signed token that grants permission to download an asset.
 * Valid for 5 minutes.
 * Prevents Linkvertise bypass by proving the user hit the verification endpoint.
 */
export function generateDownloadToken(userId: string, assetId: string): string {
  const payload: DownloadTokenPayload = {
    userId,
    assetId,
    type: 'download_grant',
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '5m' })
}

/**
 * Verify a download token.
 * Returns the payload if valid, null otherwise.
 */
export function verifyDownloadToken(token: string): DownloadTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as DownloadTokenPayload
    
    if (payload.type !== 'download_grant') {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}
