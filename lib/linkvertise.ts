import { createClient } from '@/lib/supabase/server';

const LINKVERTISE_API = 'https://publisher.linkvertise.com/api/v1/anti_bypassing';
const AUTH_TOKEN = process.env.LINKVERTISE_AUTH_TOKEN || '0e4fe4bd2f9dd70412858a5f154e50ada772176b13fb61d5aa0dceb7405c2d29';

interface VerifyResult {
  verified: boolean;
  message: string;
  timestamp: number;
}

export async function verifyLinkvertiseHash(hash: string): Promise<VerifyResult> {
  if (!AUTH_TOKEN) {
    return { verified: false, message: 'Auth token not configured', timestamp: Date.now() };
  }

  if (!hash || hash.length !== 64) {
    return { verified: false, message: 'Invalid hash format', timestamp: Date.now() };
  }

  try {
    const response = await fetch(`${LINKVERTISE_API}?token=${AUTH_TOKEN}&hash=${hash}`, {
      method: 'POST',
    });

    const result = await response.text();
    
    if (result === 'TRUE') {
      return { verified: true, message: 'Hash verified successfully', timestamp: Date.now() };
    } else if (result === 'FALSE') {
      return { verified: false, message: 'Hash not found or expired', timestamp: Date.now() };
    } else if (result.includes('Invalid token')) {
      return { verified: false, message: 'Invalid authentication token', timestamp: Date.now() };
    }
    
    return { verified: false, message: result, timestamp: Date.now() };
  } catch (error) {
    return { verified: false, message: 'Verification request failed', timestamp: Date.now() };
  }
}

export function addHashToUrl(url: string, hash: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}hash=${hash}`;
}

export function validateHash(hash: string): boolean {
  return typeof hash === 'string' && hash.length === 64 && /^[a-f0-9]{64}$/i.test(hash);
}

export async function logDownloadAttempt(
  assetId: string,
  userId: string,
  hash: string | null,
  verified: boolean,
  ipAddress: string,
  userAgent: string
) {
  const supabase = await createClient();
  
  await supabase.from('linkvertise_downloads').insert({
    asset_id: assetId,
    user_id: userId,
    hash: hash || '',
    verified,
    ip_address: ipAddress,
    user_agent: userAgent,
    verified_at: verified ? new Date().toISOString() : null,
  });
}

export function generateLinkvertiseUrl(userId: string, targetUrl: string): string {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/linkvertise/callback?redirect=${encodeURIComponent(targetUrl)}`;
  return `https://link-to.net/${userId}/${encodeURIComponent(callbackUrl)}`;
}
