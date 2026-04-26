import { pool } from "@/lib/db";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response("Missing fields", { status: 400 });
    }

    const result = await pool.query(
      "SELECT id, email, password_hash, role, company_name, tin FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return new Response("Invalid credentials", { status: 401 });
    }

    const user = result.rows[0];

    const valid = await comparePassword(password, user.password_hash);

    if (!valid) {
      return new Response("Invalid credentials", { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookie = setAuthCookie(token);

    const res = NextResponse.json({
      token,
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
  } catch (err) {
    console.error("Login error:", err);
    return new Response("Server error", { status: 500 });
  }
}

