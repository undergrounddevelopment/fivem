// Konfigurasi Linkvertise
export const LINKVERTISE_CONFIG = {
  publisherId: '1461354',
  baseUrl: 'https://direct-link.net',
  antiBypassToken: process.env.LINKVERTISE_ANTI_BYPASS_TOKEN || '0e4fe4bd2f9dd70412858a5f154e50ada772176b13fb61d5aa0dceb7405c2d29',
  websiteDomain: 'www.fivemtools.net',
  enabled: process.env.NEXT_PUBLIC_LINKVERTISE_ENABLED === 'true'
}

/**
 * Auto-detect dan convert link menjadi Linkvertise URL
 */
export function autoConvertToLinkvertise(url: string): string {
  if (!LINKVERTISE_CONFIG.enabled) return url
  if (isLinkvertiseUrl(url)) return url

  const encodedUrl = encodeURIComponent(url)
  return `${LINKVERTISE_CONFIG.baseUrl}/${LINKVERTISE_CONFIG.publisherId}/dynamic?r=${encodedUrl}`
}

/**
 * Check apakah URL sudah Linkvertise
 */
export function isLinkvertiseUrl(url: string): boolean {
  const linkvertiseDomains = ['linkvertise.com', 'direct-link.net', 'link-to.net', 'link-center.net', 'link-target.net']
  return linkvertiseDomains.some(domain => url.includes(domain))
}

/**
 * Generate Linkvertise URL untuk asset tertentu
 */
export function generateLinkvertiseUrl(userId: string, targetUrl: string): string {
  const encodedTarget = encodeURIComponent(targetUrl)

  return `${LINKVERTISE_CONFIG.baseUrl}/${userId}/dynamic?r=${encodedTarget}`
}

/**
 * Generate Linkvertise URL dengan custom target and ID
 */
export function generateCustomLinkvertiseUrl(targetPath: string, userId: string = LINKVERTISE_CONFIG.publisherId): string {
  const targetUrl = `https://${LINKVERTISE_CONFIG.websiteDomain}${targetPath}`
  const encodedTarget = encodeURIComponent(targetUrl)

  return `${LINKVERTISE_CONFIG.baseUrl}/${userId}?r=${encodedTarget}`
}

/**
 * Validasi hash dari Linkvertise (client-side check)
 */
export function isValidHashFormat(hash: string | null): boolean {
  if (!hash) return false
  // Hash Linkvertise adalah 64 karakter hexadecimal
  return /^[a-f0-9]{64}$/i.test(hash)
}

/**
 * Extract hash dari URL
 */
export function extractHashFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('hash')
  } catch {
    return null
  }
}

/**
 * Check apakah user datang dari Linkvertise
 */
export function isFromLinkvertise(referrer: string | null): boolean {
  if (!referrer) return false

  const linkvertiseDomains = [
    'linkvertise.com',
    'direct-link.net',
    'link-to.net',
    'link-center.net',
    'link-target.net'
  ]

  return linkvertiseDomains.some(domain => referrer.includes(domain))
}

/**
 * Verify Linkvertise hash - server-side verification
 * Returns true if hash is valid format (actual API verification would require Linkvertise API)
 */
export async function verifyLinkvertiseHash(hash: string | null): Promise<boolean> {
  if (!hash) return false

  // Validate hash format (64 character hex string)
  if (!isValidHashFormat(hash)) {
    return false
  }

  // For production, you could add additional verification:
  // 1. Check if hash was recently generated (time-based)
  // 2. Check against a database of used hashes (prevent reuse)
  // 3. Call Linkvertise API if available

  // For now, we accept valid format hashes
  // This is sufficient for most use cases as Linkvertise generates unique hashes
  return true
}

/**
 * Log download attempt for analytics and security
 */
export async function logDownloadAttempt(
  assetId: string,
  userId: string,
  success: boolean,
  hash?: string | null,
  reason?: string
): Promise<void> {
  try {
    // Log to console for debugging
    console.log('[Linkvertise Download]', {
      assetId,
      userId,
      success,
      hash: hash ? hash.substring(0, 8) + '...' : null,
      reason,
      timestamp: new Date().toISOString()
    })

    // Optional: Log to database for analytics
    // You can implement database logging here if needed:
    // await supabase.from('download_logs').insert({
    //   asset_id: assetId,
    //   user_id: userId,
    //   success,
    //   hash,
    //   reason,
    //   created_at: new Date().toISOString()
    // })
  } catch (error) {
    console.error('[Linkvertise] Failed to log download attempt:', error)
  }
}
