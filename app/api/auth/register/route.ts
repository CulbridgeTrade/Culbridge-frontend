import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { users, nextUserId } from '@/lib/memory-store';

// Seed default admin if store is empty
if (users.size === 0) {
  users.set('culbridge01@gmail.com', {
    id: 'admin-1',
    email: 'culbridge01@gmail.com',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G',
    role: 'ADMIN',
    company_name: 'Culbridge Admin',
    tin: null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, companyName, tin } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (users.has(normalizedEmail)) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = {
      id: nextUserId(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role: 'EXPORTER',
      company_name: companyName || null,
      tin: tin || null,
    };

    users.set(normalizedEmail, user);

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
    }, { status: 201 });

    res.cookies.set(cookie.name, cookie.value, cookie.options);
    return res;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
