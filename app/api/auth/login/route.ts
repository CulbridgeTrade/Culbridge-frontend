import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Set NEXT_PUBLIC_API_URL in Vercel to production backend URL (e.g., https://api.culbridge.cloud)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    const res = NextResponse.json({ success: response.ok, data });
    
    if (response.ok) {
      // Set auth-token cookie from backend response
      const authToken = data.token;
      res.cookies.set('auth-token', authToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return res;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

