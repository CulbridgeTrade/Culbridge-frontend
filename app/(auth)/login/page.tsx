"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import "./../auth.css";

function CulbridgeLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg-login" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F7911E" />
          <stop offset="100%" stopColor="#9C9DA1" />
        </linearGradient>
      </defs>
      <path d='M6 22 C6 14, 14 10, 22 14 C30 10, 38 14, 38 22'
        stroke="url(#lg-login)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d='M6 22 C6 30, 14 34, 22 30 C30 34, 38 30, 38 22'
        stroke="url(#lg-login)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="22" cy="22" r="2.8" fill="#F7911E" />
      <line x1="22" y1="13" x2="22" y2="31" stroke="#F7911E" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <aside className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-panel-logo">
            <CulbridgeLogo size={36} />
            <span className="auth-panel-brand">
              <span className="brand-cul">Cul</span>
              <span className="brand-bridge">bridge</span>
            </span>
          </div>
          <div className="auth-panel-body">
            <p className="auth-panel-tagline">
              Prevent export<br />shipment losses<br />to Europe.
            </p>
            <p className="auth-panel-sub">
              EU compliance validation for Nigerian agricultural exporters shipping to the Netherlands and Germany.
            </p>
            <div className="auth-corridor">
              <div className="auth-flag-chip">NG Nigeria</div>
              <span className="auth-arrow">{'->'}</span>
              <div className="auth-flag-chip">NL &amp; DE</div>
            </div>
          </div>
          <div className="auth-panel-footer">
            <div className="auth-compliance-tags">
              <span className="auth-tag">NVWA</span>
              <span className="auth-tag">BVL</span>
              <span className="auth-tag">RASFF</span>
              <span className="auth-tag">NAQS</span>
              <span className="auth-tag">NEPC</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="auth-form-area">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Sign in</h1>
            <p className="auth-form-sub">Enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#DC2626" strokeWidth="1.4" />
                <path d="M7 4v4M7 9.5v.5" stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                className="auth-input"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="login-password">Password</label>
              </div>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  className="auth-input"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="********"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.9 5.2 2 6.5 2 8c0 2.5 2.7 5 6 5a7.4 7.4 0 0 0 3.8-1.2M6 3.1A7 7 0 0 1 8 3c3.3 0 6 2.5 6 5a5.5 5.5 0 0 1-1.1 2.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8c0-2.5 2.7-5 6-5s6 2.5 6 5-2.7 5-6 5-6-2.5-6-5z" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button className="auth-btn-primary" type="submit" disabled={loading || !email || !password}>
              {loading ? <><span className="auth-spinner" /> Signing in...</> : "Sign in ->"}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="auth-link">Create one</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

