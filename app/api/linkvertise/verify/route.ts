import { NextRequest, NextResponse } from 'next/server'
import { verifyAntiBypass } from '@/lib/linkvertise-service'

export async function POST(req: NextRequest) {
  try {
    const { hash } = await req.json()

    if (!hash || typeof hash !== 'string' || hash.length !== 64) {
      return NextResponse.json({ verified: false, error: 'Invalid hash' }, { status: 400 })
    }

    const verified = await verifyAntiBypass(hash)

    return NextResponse.json({
      verified,
      message: verified ? 'Hash verified successfully' : 'Hash verification failed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get('hash')
  
  if (!hash || hash.length !== 64) {
    return NextResponse.json({ verified: false, error: 'Invalid hash' }, { status: 400 })
  }
  
  const verified = await verifyAntiBypass(hash)
  
  return NextResponse.json({ verified })
}
