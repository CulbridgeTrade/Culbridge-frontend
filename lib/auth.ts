import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// ============================================
// Types
// ============================================
export interface AuthUser {
  userId: string;
  email: string;
  role: "ADMIN" | "EXPORTER" | "COMPLIANCE_OFFICER";
}

// ============================================
// Password utilities
// ============================================
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function hashPasswordSync(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// ============================================
// JWT utilities
// ============================================
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Please set it in your environment variables."
    );
  }
  return secret;
};

export function signToken(payload: any) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): any | null {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

// ============================================
// Cookie utilities
// ============================================
export function setAuthCookie(token: string) {
  return {
    name: "auth-token",
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    },
  };
}

export async function getAuthToken(): Promise<string | undefined> {
  // Server-side only — reads from request headers/cookies when available
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get("auth-token")?.value;
}

/**
 * Extract token from Authorization header or auth-token cookie.
 */
export function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.cookies.get("auth-token")?.value || null;
}

// ============================================
// AUTH MIDDLEWARE — SINGLE SOURCE OF TRUTH
// ============================================

/**
 * requireAuth — validates JWT and returns authenticated user.
 * Use this in EVERY protected route. Never in public routes (/auth/*).
 */
export function requireAuth(req: NextRequest): AuthUser {
  const token = extractToken(req);

  if (!token) {
    throw new AuthError("Unauthorized", 401);
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId || !decoded.role) {
    throw new AuthError("Invalid or expired token", 401);
  }

  // Validate role is known
  const validRoles = ["ADMIN", "EXPORTER", "COMPLIANCE_OFFICER"];
  if (!validRoles.includes(decoded.role)) {
    throw new AuthError("Invalid role in token", 401);
  }

  return {
    userId: String(decoded.userId),
    email: String(decoded.email),
    role: decoded.role as AuthUser["role"],
  };
}

/**
 * requireRole — authorization layer. Call AFTER requireAuth.
 * Returns 403 Forbidden if user role is not in allowed list.
 */
export function requireRole(user: AuthUser, allowedRoles: AuthUser["role"][]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError("Forbidden — insufficient permissions", 403);
  }
}

// ============================================
// Error handling
// ============================================

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

/**
 * Helper to handle auth errors consistently in API routes.
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  console.error("Unexpected auth error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

