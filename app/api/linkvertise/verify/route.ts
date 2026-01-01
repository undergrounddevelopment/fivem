import { NextRequest, NextResponse } from 'next/server';
import { verifyLinkvertiseHash } from '@/lib/linkvertise';

export async function POST(req: NextRequest) {
  const { hash } = await req.json();

  if (!hash) {
    return NextResponse.json({ verified: false, error: 'Hash required' }, { status: 400 });
  }

  const result = await verifyLinkvertiseHash(hash);

  return NextResponse.json({
    verified: result.verified,
    message: result.message,
    timestamp: result.timestamp
  });
}
