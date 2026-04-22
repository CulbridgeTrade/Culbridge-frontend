"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── LOGO ────────────────────────────────────────────────────────────────────

function CulbridgeLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg-signup" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F7911E" />
          <stop offset="100%" stopColor="#9C9DA1" />
        </linearGradient>
      </defs>
      <path d='M6 22 C6 14, 14 10, 22 14 C30 10, 38 14, 38 22'
        stroke="url(#lg-signup)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d='M6 22 C6 30, 14 34, 22 30 C30 34, 38 30, 38 22'
        stroke="url(#lg-signup)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="22" cy="22" r="2.8" fill="#F7911E" />
      <line x1="22" y1="13" x2="22" y2="31" stroke="#F7911E" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// ─── API ─────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://culbridge.cloud";

async function postSignup(payload: {
  email: string;
  password: string;
  companyName?: string;
  tin?: string;
}) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Signup failed");
  return data as { token: string; user: { id: string; status: string } };
}

// ─── FIELD ERRORS ─────────────────────────────────────────────────────────────

function validateForm(email: string, password: string, confirm: string) {
  const errs: Record<string, string> = {};
  if (!email) errs.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/ .test(email)) errs.email = "Enter a valid email";
  if (!password) errs.password = "Password is required";
  else if (password.length < 8) errs.password = "Minimum 8 characters";
  if (password && confirm && password !== confirm) errs.confirm = "Passwords do not match";
  return errs;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tin, setTin] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const errs = validateForm(email, password, confirm);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setApiError(null);
    setLoading(true);

    try {
      const { token } = await postSignup({
        email,
        password,
        ...(companyName ? { companyName } : {}),
        ...(tin ? { tin } : {}),
      });
      document.cookie = `auth-token=${token}; path=/; SameSite=Lax`;
      router.push("/dashboard");
    } catch (err: any) {
      setApiError(err.message ?? "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const strengthColor = ["", "#DC2626", "#D97706", "#2563EB", "#16A34A"][pwStrength];

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
                Start shipping<br />to Europe with<br />confidence.
              </p>
              <p className="auth-panel-sub">
                Create your account and access the EU compliance validation engine built for Nigerian agricultural exporters.
              </p>

              <div className="auth-steps">
                {[
                  { n: "01", t: "Create your account", s: "Email and password. Under 30 seconds." },
                  { n: "02", t: "Access your dashboard", s: "Immediate access — no KYB gate at entry." },
                  { n: "03", t: "Run compliance checks", s: "Validate shipments before they leave Nigeria." },
                ].map(({ n, t, s }) => (
                  <div className="auth-step" key={n}>
                    <span className="auth-step-num">{n}</span>
                    <div>
                      <div className="auth-step-title">{t}</div>
                      <div className="auth-step-sub">{s}</div>
                    </div>
                  </div>
                ))}
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
              <h1 className="auth-form-title">Create account</h1>
              <p className="auth-form-sub">Get started in under a minute.</p>
            </div>

            {apiError && (
              <div className="auth-error" role="alert">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#DC2626" strokeWidth="1.4" />
                  <path d="M7 4v4M7 9.5v.5" stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {apiError}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="su-email">
                  Email address <span className="req">*</span>
                </label>
                <input
                  id="su-email"
                  className={`auth-input ${fieldErrors.email ? "input-error" : ""}`}
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: "" })); }}
                  disabled={loading}
                />
                {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
              </div>

              {/* Password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="su-password">
                  Password <span className="req">*</span>
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="su-password"
                    className={`auth-input ${fieldErrors.password ? "input-error" : ""}`}
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: "" })); }}
                    disabled={loading}
                  />
                  <button type="button" className="auth-pw-toggle"
                    onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
                {password && (
                  <div className="auth-pw-strength">
                    <div className="auth-pw-bars">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="auth-pw-bar"
                          style={{ background: i <= pwStrength ? strengthColor : "#E2E4E9" }} />
                      ))}
                    </div>
                    {strengthLabel && (
                      <span className="auth-pw-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                    )}
                  </div>
                )}
                {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
              </div>

              {/* Confirm password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="su-confirm">
                  Confirm password <span className="req">*</span>
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="su-confirm"
                    className={`auth-input ${fieldErrors.confirm ? "input-error" : ""}`}
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setFieldErrors(p => ({ ...p, confirm: "" })); }}
                    disabled={loading}
                  />
                  <button type="button" className="auth-pw-toggle"
                    onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {fieldErrors.confirm && <span className="auth-field-error">{fieldErrors.confirm}</span>}
              </div>

              {/* Divider */}
              <div className="auth-optional-label">
                <span>Optional — you can add these later</span>
              </div>

              {/* Company name */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="su-company">Company name</label>
                <input
                  id="su-company"
                  className="auth-input"
                  type="text"
                  autoComplete="organization"
                  placeholder="e.g. Arewa Exports Ltd"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* TIN */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="su-tin">
                  TIN (Tax Identification Number)
                </label>
                <input
                  id="su-tin"
                  className="auth-input"
                  type="text"
                  placeholder="e.g. 1234567-0001"
                  value={tin}
                  onChange={e => setTin(e.target.value)}
                  disabled={loading}
                />
                <span className="auth-hint">Captured now, verified later. Does not block account creation.</span>
              </div>

              <button className="auth-btn-primary" type="submit" disabled={loading || !email || !password || !confirm}>
                {loading
                  ? <><span className="auth-spinner" /> Creating account…</>
                  : "Create account →"}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}  
              <Link href="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </main>

      </div>
    </>
  );
}

// ─── EYE ICON ────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.9 5.2 2 6.5 2 8c0 2.5 2.7 5 6 5a7.4 7.4 0 0 0 3.8-1.2M6 3.1A7 7 0 0 1 8 3c3.3 0 6 2.5 6 5a5.5 5.5 0 0 1-1.1 2.9"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 8c0-2.5 2.7-5 6-5s6 2.5 6 5-2.7 5-6 5-6-2.5-6-5z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
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
    --orange: #F7911E;
    --silver: #9C9DA1;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px 0;
  }

  .auth-panel-tagline {
    font-family: var(--font-ui);
    font-size: 1.9rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    letter-spacing: -0.03em;
    margin-bottom: 16px;
  }

  .auth-panel-sub {
    font-size: 0.875rem;
    color: rgba(255,255,255,0.5);
    line-height: 1.65;
    max-width: 290px;
    margin-bottom: 36px;
  }

  /* ── Steps ── */
  .auth-steps {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .auth-step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .auth-step-num {
    font-family: var(--font-ui);
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--orange);
    letter-spacing: 0.06em;
    background: rgba(247,145,30,0.1);
    border: 1px solid rgba(247,145,30,0.2);
    border-radius: 4px;
    padding: 3px 7px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .auth-step-title {
    font-size: 0.82rem;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
    margin-bottom: 2px;
  }

  .auth-step-sub {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.35);
    line-height: 1.5;
  }

  .auth-panel-footer {
    margin-top: auto;
    padding-top: 32px;
    border-top: 1px solid rgba(255,255,255,0.06);
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

  /* ── Right form area ── */
  .auth-form-area {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    overflow-y: auto;
  }

  .auth-form-card {
    width: 100%;
    max-width: 420px;
  }

  .auth-form-header {
    margin-bottom: 28px;
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
  }

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

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .auth-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .auth-label {
    font-size: 0.77rem;
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.02em;
  }

  .req { color: var(--orange); }

  .auth-input-wrap { position: relative; }

  .auth-input {
    width: 100%;
    font-family: var(--font-body);
    font-size: 0.88rem;
    color: var(--text-primary);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    -webkit-appearance: none;
  }

  .auth-input-wrap .auth-input { padding-right: 42px; }
  .auth-input::placeholder { color: var(--text-muted); }
  .auth-input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(17,29,111,0.07); }
  .auth-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .auth-input.input-error { border-color: var(--red); }

  .auth-pw-toggle {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: var(--text-muted); display: flex; align-items: center;
    padding: 2px; transition: color 0.15s;
  }
  .auth-pw-toggle:hover { color: var(--text-secondary); }

  /* ── Password strength ── */
  .auth-pw-strength {
    display: flex; align-items: center; gap: 8px; margin-top: 4px;
  }
  .auth-pw-bars { display: flex; gap: 3px; }
  .auth-pw-bar {
    width: 32px; height: 3px; border-radius: 2px;
    transition: background 0.2s;
  }
  .auth-pw-label {
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em;
    transition: color 0.2s;
  }

  /* ── Optional divider ── */
  .auth-optional-label {
    display: flex; align-items: center; gap: 10px;
    margin: 4px 0 2px;
  }
  .auth-optional-label::before {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .auth-hint {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 2px;
  }
  .auth-field-error {
    font-size: 0.72rem;
    color: var(--red);
    font-weight: 500;
  }

  /* ── Button ── */
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
    transition: background 0.15s;
    margin-top: 4px;
  }
  .auth-btn-primary:hover:not(:disabled) { background: var(--navy-light); }
  .auth-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .auth-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: auth-spin 0.7s linear infinite;
  }
  @keyframes auth-spin { to { transform: rotate(360deg); } }

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
  }
  .auth-link:hover { color: var(--orange); }

  /* Responsive */
  @media (max-width: 860px) {
    .auth-root { grid-template-columns: 1fr; }
    .auth-panel { display: none; }
  }
`;
