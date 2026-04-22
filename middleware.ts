import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Optional: Verify token with backend
    // try {
    //   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
    //     headers: { Authorization: `Bearer ${token}` }
    //   })
    //   if (!res.ok) throw new Error()
    // } catch {
    //   return NextResponse.redirect(new URL('/login', request.url))
    // }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/shipments/:path*", "/admin/:path*"]
}

