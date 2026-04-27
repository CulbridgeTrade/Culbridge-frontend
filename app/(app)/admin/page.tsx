import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set. Authentication will fail.");
      return null;
    }
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Logged in as: {decoded.email}</p>
      <p>Role: {decoded.role}</p>
    </div>
  );
}
