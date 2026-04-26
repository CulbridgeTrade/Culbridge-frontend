import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth';
import { users } from '@/lib/memory-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = users.get(normalizedEmail);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookie = setAuthCookie(token);

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyName: user.company_name,
        tin: user.tin,
      },
    });

    res.cookies.set(cookie.name, cookie.value, cookie.options);
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
