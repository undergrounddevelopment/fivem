import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const languages = ['en', 'id', 'es', 'pt', 'de', 'fr', 'ru', 'zh', 'ja', 'ko', 'tr', 'ar']

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host')
  if (host === 'fivemtools.net') {
    const url = request.nextUrl.clone()
    url.hostname = 'www.fivemtools.net'
    return NextResponse.redirect(url, 308)
  }

  const pathname = request.nextUrl.pathname

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') && !pathname.includes('/api/')
  ) {
    return NextResponse.next()
  }

  // Update Supabase session first
  const { supabaseResponse, user } = await updateSession(request)
  
  // Check if pathname starts with a language code
  const pathnameHasLocale = languages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1]
    supabaseResponse.cookies.set('NEXT_LOCALE', locale, { 
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 31536000 // 1 year
    })
    
    // Redirect to home with language set
    if (pathname === `/${locale}`) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      const redirectResponse = NextResponse.redirect(url)
      redirectResponse.cookies.set('NEXT_LOCALE', locale, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 31536000
      })
      return redirectResponse
    }
  }

  // Enhanced Security Headers
  supabaseResponse.headers.set('X-DNS-Prefetch-Control', 'on')
  supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // CORS for API routes - Restricted to known domains only
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'https://fivemtools.net',
      'https://www.fivemtools.net',
      ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'https://localhost:3000'] : [])
    ]
    
    if (origin && allowedOrigins.includes(origin)) {
      supabaseResponse.headers.set('Access-Control-Allow-Origin', origin)
      supabaseResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    
    supabaseResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    supabaseResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
    
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: supabaseResponse.headers })
    }
  }

  // Vercel-specific headers
  const geo = (request as any).geo
  if (geo) {
    supabaseResponse.headers.set('X-User-Country', geo.country || 'unknown')
    supabaseResponse.headers.set('X-User-City', geo.city || 'unknown')
  }

  // Rate limiting headers - Dynamic (Vercel IP)
  const ip = (request as any).ip || request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const now = Date.now()
  const resetTime = new Date(Math.ceil(now / 3600000) * 3600000)
  
  supabaseResponse.headers.set('X-RateLimit-Limit', '100')
  supabaseResponse.headers.set('X-RateLimit-Remaining', '100')
  supabaseResponse.headers.set('X-RateLimit-Reset', resetTime.toISOString())
  supabaseResponse.headers.set('X-Client-IP', ip)

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.discord.com https://gateway.discord.gg wss://gateway.discord.gg https://www.google-analytics.com https://*.vercel-insights.com",
    "frame-src 'self' https://www.googletagmanager.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
  
  supabaseResponse.headers.set('Content-Security-Policy', csp)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$|.*\\.svg$|.*\\.ico$).*)',
  ],
}
