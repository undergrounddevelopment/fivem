const LINKVERTISE_USER_ID = process.env.LINKVERTISE_USER_ID || '1461354'
const LINKVERTISE_AUTH_TOKEN = process.env.LINKVERTISE_AUTH_TOKEN || '0e4fe4bd2f9dd70412858a5f154e50ada772176b13fb61d5aa0dceb7405c2d29'
const LINKVERTISE_API = 'https://publisher.linkvertise.com/api/v1'

export async function createLinkvertiseLink(targetUrl: string): Promise<string> {
  return `https://link-target.net/${LINKVERTISE_USER_ID}/${encodeURIComponent(targetUrl)}`
}

export async function verifyAntiBypass(hash: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${LINKVERTISE_API}/anti_bypassing?token=${LINKVERTISE_AUTH_TOKEN}&hash=${hash}`,
      { method: 'POST' }
    )
    
    const result = await response.text()
    return result === 'TRUE'
  } catch (error) {
    console.error('Linkvertise verify error:', error)
    return false
  }
}

export function extractHashFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('hash')
  } catch {
    return null
  }
}

export const linkvertiseConfig = {
  userId: LINKVERTISE_USER_ID,
  enabled: process.env.NEXT_PUBLIC_LINKVERTISE_ENABLED === 'true',
  whitelist: [],
  blacklist: []
}
