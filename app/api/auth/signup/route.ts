import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, companyName, tin } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, company_name, tin)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, company_name, tin`,
      [normalizedEmail, passwordHash, "EXPORTER", companyName || null, tin || null]
    );

    const user = result.rows[0];

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookie = setAuthCookie(token);

    const res = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          companyName: user.company_name,
          tin: user.tin,
        },
      },
      { status: 201 }
    );

    res.cookies.set(cookie.name, cookie.value, cookie.options);
    return res;
  } catch (err: any) {
    console.error("Signup error:", err);

    if (err.code === "23505") {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    if (err.code === "42P01") {
      return NextResponse.json(
        { error: "Database not initialized — users table missing" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

