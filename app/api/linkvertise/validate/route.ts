import { NextRequest, NextResponse } from 'next/server'

// Token Anti-Bypass dari Linkvertise
const ANTI_BYPASS_TOKEN = process.env.LINKVERTISE_ANTI_BYPASS_TOKEN || '0e4fe4bd2f9dd70412858a5f154e50ada772176b13fb61d5aa0dceb7405c2d29'

export async function POST(request: NextRequest) {
  try {
    const { hash, targetUrl } = await request.json()

    if (!hash) {
      return NextResponse.json(
        { valid: false, error: 'Hash tidak ditemukan' },
        { status: 400 }
      )
    }

    // Validasi hash dengan Linkvertise API
    const validationResponse = await fetch('https://publisher.linkvertise.com/api/v1/redirect/link/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: ANTI_BYPASS_TOKEN,
        hash: hash,
        target_url: targetUrl
      })
    })

    if (!validationResponse.ok) {
      // Jika API tidak merespons dengan baik, coba metode alternatif
      // Validasi sederhana berdasarkan format hash
      const isValidFormat = /^[a-f0-9]{64}$/i.test(hash)
      
      if (isValidFormat) {
        return NextResponse.json({ 
          valid: true, 
          message: 'Hash format valid',
          method: 'format-check'
        })
      }
      
      return NextResponse.json(
        { valid: false, error: 'Validasi gagal' },
        { status: 400 }
      )
    }

    const data = await validationResponse.json()
    
    return NextResponse.json({
      valid: data.valid || data.success || false,
      message: data.message || 'Validasi berhasil'
    })

  } catch (error) {
    console.error('Linkvertise validation error:', error)
    
    // Fallback: jika ada error, cek format hash saja
    return NextResponse.json(
      { valid: false, error: 'Terjadi kesalahan validasi' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const hash = searchParams.get('hash')
  
  if (!hash) {
    return NextResponse.json(
      { valid: false, error: 'Hash parameter required' },
      { status: 400 }
    )
  }

  // Validasi format hash (64 karakter hex)
  const isValidFormat = /^[a-f0-9]{64}$/i.test(hash)
  
  return NextResponse.json({
    valid: isValidFormat,
    message: isValidFormat ? 'Hash format valid' : 'Invalid hash format'
  })
}
