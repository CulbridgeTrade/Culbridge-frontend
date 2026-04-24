"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── LOGO ────────────────────────────────────────────────────────────────────

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

// ─── API ─────────────────────────────────────────────────────────────────────

async function postLogin(email: string, password: string) {
  const res = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Login failed");
  return data as { token: string; user: { id: string; status: string } };
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
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
      const { token } = await postLogin(email, password);
      document.cookie = `auth-token=${token}; path=/; SameSite=Lax`;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-root">

        {/* ── Left panel ── */}
        <aside className="auth-panel">
          <div className="auth-panel-inner">
            <div className="auth-panel-logo">
              <CulbridgeLogo size={36} />
              <span className="auth-panel-brand">
                <span className="brand-cul">Cul</span><span className="brand-bridge">bridge</span>
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
                <div className="auth-flag-chip">🇳🇬 Nigeria</div>
                <span className="auth-arrow">→</span>
                <div className="auth-flag-chip">🇳🇱 NL &amp; 🇩🇪 DE</div>
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

        {/* ── Right: form ── */}
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
                    placeholder="••••••••"
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
                {loading ? <><span className="auth-spinner" /> Signing in…</> : "Sign in →"}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{" "}  
              <Link href="/signup" className="auth-link">Create one</Link>
            </p>
          </div>
        </main>

      </div>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #111D6F;
    --navy-dark: #0B1455;
    --navy-light: #1A2A8F;
    --navy-subtle: #EEF0FA;
    --orange: #F7911E;
    --orange-dark: #D97A10;
    --silver: #9C9DA1;
    --white: #FFFFFF;
    --bg: #F4F5F7;
    --surface: #FFFFFF;
    --border: #E2E4E9;
    --border-focus: #111D6F;
    --text-primary: #0D0F1A;
    --text-secondary: #5C6070;
    --text-muted: #9CA3AF;
    --red: #DC2626;
    --red-subtle: #FEF2F2;
    --font-ui: 'Inter Tight', system-ui, sans-serif;
    --font-body: 'Inter', system-ui, sans-serif;
  }

  html, body { height: 100%; }

  .auth-root {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 420px 1fr;
    font-family: var(--font-body);
    background: var(--bg);
  }

  /* ── Left panel ── */
  .auth-panel {
    background: var(--navy-dark);
    position: relative;
    overflow: hidden;
  }

  .auth-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(247,145,30,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(247,145,30,0.05) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 100% 100% at 0% 50%, black 20%, transparent 80%);
  }

  .auth-panel::after {
    content: '';
    position: absolute;
    bottom: -100px;
    right: -100px;
    width: 340px;
    height: 340px;
    background: radial-gradient(ellipse at center, rgba(247,145,30,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .auth-panel-inner {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 48px 44px;
  }

  .auth-panel-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: auto;
  }

  .auth-panel-brand {
    font-family: var(--font-ui);
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .brand-cul { color: #fff; }
  .brand-bridge { color: var(--orange); }

  .auth-panel-body {
    margin: auto 0;
    padding: 40px 0;
  }

  .auth-panel-tagline {
    font-family: var(--font-ui);
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    letter-spacing: -0.03em;
    margin-bottom: 16px;
  }

  .auth-panel-sub {
    font-size: 0.88rem;
    color: rgba(255,255,255,0.5);
    line-height: 1.65;
    max-width: 280px;
    margin-bottom: 32px;
  }

  .auth-corridor {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .auth-flag-chip {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    padding: 7px 13px;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.7);
    font-weight: 500;
  }

  .auth-arrow {
    color: var(--orange);
    font-size: 1rem;
    font-weight: 700;
  }

  .auth-panel-footer {
    margin-top: auto;
  }

  .auth-compliance-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .auth-tag {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px;
    padding: 4px 9px;
  }

  /* ── Right: form area ── */
  .auth-form-area {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
  }

  .auth-form-card {
    width: 100%;
    max-width: 400px;
  }

  .auth-form-header {
    margin-bottom: 32px;
  }

  .auth-form-title {
    font-family: var(--font-ui);
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.03em;
    margin-bottom: 6px;
  }

  .auth-form-sub {
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  /* ── Error ── */
  .auth-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--red-subtle);
    border: 1px solid #FECACA;
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 0.82rem;
    color: var(--red);
    font-weight: 500;
    margin-bottom: 20px;
  }

  /* ── Form ── */
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .auth-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .auth-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .auth-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.02em;
  }

  .auth-input-wrap {
    position: relative;
  }

  .auth-input {
    width: 100%;
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--text-primary);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 11px 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    -webkit-appearance: none;
  }

  .auth-input-wrap .auth-input {
    padding-right: 42px;
  }

  .auth-input::placeholder { color: var(--text-muted); }

  .auth-input:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(17,29,111,0.07);
  }

  .auth-input:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .auth-pw-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    padding: 2px;
    transition: color 0.15s;
  }
  .auth-pw-toggle:hover { color: var(--text-secondary); }

  /* ── Primary button ── */
  .auth-btn-primary {
    width: 100%;
    background: var(--navy);
    color: #fff;
    font-family: var(--font-ui);
    font-size: 0.9rem;
    font-weight: 700;
    padding: 12px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.15s, opacity 0.15s;
    margin-top: 4px;
    letter-spacing: 0.01em;
  }

  .auth-btn-primary:hover:not(:disabled) { background: var(--navy-light); }
  .auth-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Spinner ── */
  .auth-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: auth-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes auth-spin { to { transform: rotate(360deg); } }

  /* ── Switch link ── */
  .auth-switch {
    margin-top: 24px;
    text-align: center;
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .auth-link {
    color: var(--navy);
    font-weight: 600;
    text-decoration: none;
    transition: color 0.15s;
  }
  .auth-link:hover { color: var(--orange); }

  /* ── Responsive ── */
  @media (max-width: 860px) {
    .auth-root { grid-template-columns: 1fr; }
    .auth-panel { display: none; }
  }
`;
