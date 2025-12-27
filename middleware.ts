import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const languages = ['en', 'id', 'es', 'pt', 'de', 'fr', 'ru', 'zh', 'ja', 'ko', 'tr', 'ar']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Update Supabase session first
  const { supabaseResponse, user } = await updateSession(request)
  
  // Check if pathname starts with a language code
  const pathnameHasLocale = languages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1]
    supabaseResponse.cookies.set('NEXT_LOCALE', locale)
    
    // Redirect to home with language set
    if (pathname === `/${locale}`) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      const redirectResponse = NextResponse.redirect(url)
      redirectResponse.cookies.set('NEXT_LOCALE', locale)
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

  // CORS for API routes
  if (pathname.startsWith('/api/')) {
    supabaseResponse.headers.set('Access-Control-Allow-Origin', '*')
    supabaseResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    supabaseResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  // Rate limiting headers
  supabaseResponse.headers.set('X-RateLimit-Limit', '100')
  supabaseResponse.headers.set('X-RateLimit-Remaining', '99')
  supabaseResponse.headers.set('X-RateLimit-Reset', new Date(Date.now() + 3600000).toISOString())

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.discord.com",
    "frame-src 'none'",
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
