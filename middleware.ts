import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: string
  email: string
  role: string
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set. Authentication will fail.");
      return null;
    }
    return jwt.verify(token, secret) as TokenPayload
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')

  // ============================================
  // PUBLIC ROUTES — no auth required
  // /login, /signup handled implicitly (not in matcher)
  // ============================================

  // ============================================
  // ADMIN ROUTES — ADMIN role required
  // ============================================
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  }

  // ============================================
  // PROTECTED ROUTES (dashboard, shipment, demo) — any authenticated user
  // ============================================
  if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/shipment') || request.nextUrl.pathname.startsWith('/demo')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/shipment/:path*", "/demo/:path*", "/admin/:path*"]
}
