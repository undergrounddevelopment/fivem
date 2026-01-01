import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/sanitize'
import { CONFIG } from '@/lib/config'

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateCheck = checkRateLimit(req, CONFIG.rateLimit.api.limit, CONFIG.rateLimit.api.window)
  
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60'
        }
      }
    )
  }

  try {
    const body = await req.json()
    
    // Sanitize inputs
    const sanitizedData = {
      title: sanitizeInput(body.title || ''),
      content: sanitizeInput(body.content || ''),
    }

    // Validate
    if (!sanitizedData.title || sanitizedData.title.length < 3) {
      return NextResponse.json(
        { error: 'Title must be at least 3 characters' },
        { status: 400 }
      )
    }

    // Process request...
    
    return NextResponse.json(
      { success: true, data: sanitizedData },
      {
        headers: {
          'X-RateLimit-Remaining': rateCheck.remaining.toString()
        }
      }
    )
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
