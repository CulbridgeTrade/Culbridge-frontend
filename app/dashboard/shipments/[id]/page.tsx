'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://culbridgetrade.onrender.com';

const getToken = () => localStorage.getItem('culbridge_access_token') || '';

interface Rule {
  id: string;
  category: string;
  status: 'PASS' | 'WARNING' | 'BLOCK';
  reason: string;
  inputsUsed: string[];
}

interface HumanSummary {
  blocking: string[];
  warnings: string[];
  passed: string[];
}

interface ShipmentDetail {
  id: string;
  commodity: string;
  destination: string;
  status: 'PASS' | 'WARNING' | 'BLOCK';
  score?: number;
  confidence?: number;
  evaluatedAt: string;
  rulesTriggered: Rule[];
  humanSummary: HumanSummary;
  nextActions: string[];
}

export default function ShipmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${API_URL}/shipments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load shipment');
        return res.json();
      })
      .then((json: ShipmentDetail) => setData(json))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="shell">
        <header className="topbar">
          <Link href="/" className="topbar-logo">
            <svg className="logo-mark" width="28" height="28" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="10" stroke="#F7911E" strokeWidth="3" />
              <path d="M22 8v28M8 22h28" stroke="#111D6F" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="logo-wordmark">
              <span className="logo-cul">Cul</span>
              <span className="logo-bridge">bridge</span>
            </span>
          </Link>
          <div className="topbar-divider" />
          <div className="topbar-breadcrumb">
            <Link href="/dashboard" style={{ cursor: 'pointer', color: 'var(--txt-3)' }}>Exporter</Link>
            <span className="bc-sep">/</span>
            <span className="bc-active">Loading...</span>
          </div>
        </header>
        <main className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading shipment details...</p>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="shell">
        <header className="topbar">
          <Link href="/" className="topbar-logo">
            <svg className="logo-mark" width="28" height="28" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="10" stroke="#F7911E" strokeWidth="3" />
              <path d="M22 8v28M8 22h28" stroke="#111D6F" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="logo-wordmark">
              <span className="logo-cul">Cul</span>
              <span className="logo-bridge">bridge</span>
            </span>
          </Link>
        </header>
        <main className="main">
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--block)' }}>
            <p>{error || 'Shipment not found'}</p>
            <Link href="/dashboard" style={{ color: 'var(--navy)', marginTop: '10px', display: 'inline-block' }}>
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/" className="topbar-logo">
          <svg className="logo-mark" width="28" height="28" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="10" stroke="#F7911E" strokeWidth="3" />
            <path d="M22 8v28M8 22h28" stroke="#111D6F" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="logo-wordmark">
            <span className="logo-cul">Cul</span>
            <span className="logo-bridge">bridge</span>
          </span>
        </Link>

        <div className="topbar-divider" />
        <div className="topbar-breadcrumb">
          <Link href="/dashboard" style={{ cursor: 'pointer', color: 'var(--txt-3)' }}>Exporter</Link>
          <span className="bc-sep">/</span>
          <span className="bc-active">{id}</span>
        </div>

        <div className="topbar-right">
          <Link href="/shipment/new">
            <button className="topbar-new-btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              New Shipment
            </button>
          </Link>
          <div className="topbar-avatar">EX</div>
        </div>
      </header>

      <main className="main">
        {/* Back */}
        <button className="detail-back" onClick={() => router.push('/dashboard')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10 3L4 7l6 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="detail-header">
          <div>
            <div className="detail-id">Shipment ID: {data.id}</div>
            <h1 className="page-title" style={{ marginTop: '5px' }}>
              {data.commodity} → {data.destination}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span className={`chip ${data.status.toLowerCase()} lg`}>
              <span className={`chip-dot lg`} />
              {data.status}
            </span>
            {data.score !== undefined && (
              <div className="decision-score-block">
                <div className="decision-score-label">Confidence</div>
                <div className="score-large">{data.score}</div>
                <div className="decision-score-bar">
                  <div className="score-fill" style={{ width: `${data.score}%`, background: getScoreColor(data.score) }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Layer B — Rule Breakdown */}
        <div className="layer" style={{ marginTop: '24px' }}>
          <div className="layer-header">
            <div className="layer-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M6 6h4v4H6z" fill="currentColor" />
              </svg>
              Rule Breakdown
            </div>
          </div>
          <div className="layer-body" style={{ overflowX: 'auto' }}>
            <table className="rule-table">
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Inputs Used</th>
                </tr>
              </thead>
              <tbody>
                {data.rulesTriggered.map((rule) => (
                  <tr key={rule.id}>
                    <td className="rule-id">{rule.id}</td>
                    <td className="rule-category">{rule.category}</td>
                    <td>
                      <span className={`chip ${rule.status.toLowerCase()}`}>
                        <span className="chip-dot" />
                        {rule.status}
                      </span>
                    </td>
                    <td className="rule-reason">{rule.reason}</td>
                    <td>
                      <div className="rule-inputs">
                        {rule.inputsUsed.map((inp) => (
                          <span key={inp} className="input-tag">
                            {inp}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Layer C — Human Summary */}
        <div className="layer" style={{ marginTop: '24px' }}>
          <div className="layer-header">
            <div className="layer-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2a6 6 0 0 1 6 6v2.5a1.5 1.5 0 0 1-3 0V8a4 4 0 1 0-8 0v.5a1.5 1.5 0 0 1-3 0V8A6 6 0 0 1 8 2z" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              Human Summary
            </div>
          </div>
          <div className="layer-body">
            <div className="summary-groups">
              <div className="summary-group">
                <div className={`summary-group-title blocking`}>
                  <span className="summary-bullet blocking" />
                  Blocking ({data.humanSummary.blocking.length})
                </div>
                <div className="summary-list">
                  {data.humanSummary.blocking.length === 0 ? (
                    <span className="summary-empty">None</span>
                  ) : (
                    data.humanSummary.blocking.map((item, i) => (
                      <div key={i} className="summary-item">
                        <span className="summary-bullet blocking" />
                        {item}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="summary-group">
                <div className={`summary-group-title warnings`}>
                  <span className="summary-bullet warnings" />
                  Warnings ({data.humanSummary.warnings.length})
                </div>
                <div className="summary-list">
                  {data.humanSummary.warnings.length === 0 ? (
                    <span className="summary-empty">None</span>
                  ) : (
                    data.humanSummary.warnings.map((item, i) => (
                      <div key={i} className="summary-item">
                        <span className="summary-bullet warnings" />
                        {item}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="summary-group">
                <div className={`summary-group-title passed`}>
                  <span className="summary-bullet passed" />
                  Passed ({data.humanSummary.passed.length})
                </div>
                <div className="summary-list">
                  {data.humanSummary.passed.length === 0 ? (
                    <span className="summary-empty">None</span>
                  ) : (
                    data.humanSummary.passed.map((item, i) => (
                      <div key={i} className="summary-item">
                        <span className="summary-bullet passed" />
                        {item}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layer D — Next Actions */}
        <div className="layer" style={{ marginTop: '24px' }}>
          <div className="layer-header">
            <div className="layer-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Next Actions
            </div>
          </div>
          <div className="layer-body">
            {data.nextActions.length === 0 ? (
              <div className="actions-empty">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                No actions required — shipment compliant.
              </div>
            ) : (
              <div className="actions-list">
                {data.nextActions.map((action, i) => (
                  <div key={i} className="action-item">
                    <div className="action-num">{i + 1}</div>
                    <div className="action-text">{action}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Evaluated time */}
        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--txt-4)' }}>
          Evaluated: {new Date(data.evaluatedAt).toLocaleString()}
        </div>
      </main>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--pass)';
  if (score >= 50) return 'var(--warn)';
  return 'var(--block)';
}
