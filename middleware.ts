// Note: This middleware will be migrated to proxy convention in Next.js 16+
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  
  // Add custom headers for proxy
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  requestHeaders.set('x-origin', request.nextUrl.origin)
  
  // Handle API routes with proxy
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Handle auth routes
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Default response with proxy headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}