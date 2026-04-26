'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShipmentForm } from '@/components/shipment/ShipmentForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://culbridgetrade.onrender.com';

const getToken = () => localStorage.getItem('culbridge_access_token') || '';

interface ComplianceResult {
  id: string;
  status: 'PASS' | 'WARNING' | 'BLOCK';
  score: number;
  confidence: number;
  evaluatedAt: string;
  rulesTriggered: Array<{
    id: string;
    category: string;
    status: 'PASS' | 'WARNING' | 'BLOCK';
    reason: string;
    inputsUsed: string[];
  }>;
  humanSummary: {
    blocking: string[];
    warnings: string[];
    passed: string[];
  };
  nextActions: string[];
}

export default function NewShipmentPage() {
  const router = useRouter();
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    commodity: string;
    destination: string;
    weight: number;
    labTests: Array<{ test: string; value: number; unit: string }>;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...data,
        exporterId: 'LIVE-EXPORTER-ID',
      };

      const res = await fetch(`${API_URL}/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create shipment');
      }

      const compliance: ComplianceResult = await res.json();
      setResult(compliance);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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
          <span className="bc-active">New Shipment</span>
        </div>

        <div className="topbar-right">
          <div className="topbar-avatar">EX</div>
        </div>
      </header>

      <main className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Create New Shipment</h1>
            <p className="page-sub">Enter shipment details. Compliance engine will evaluate instantly.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px' }}>
          {/* Form */}
          <div className="layer" style={{ padding: '24px' }}>
            <ShipmentForm onSubmit={handleSubmit} loading={loading} />
            {error && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'var(--block-bg)', border: '1px solid var(--block-border)', borderRadius: 'var(--radius)', color: 'var(--block)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
          </div>

          {/* Compliance result */}
          <div style={{ position: 'sticky', top: '28px', height: 'fit-content' }}>
            {result ? (
              <div className="layer">
                <div className="layer-header">
                  <div className="layer-title">Compliance Result</div>
                  <span className={`chip ${result.status.toLowerCase()}`}>
                    <span className="chip-dot" />
                    {result.status}
                  </span>
                </div>
                <div className="layer-body">
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--txt-4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Confidence Score
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--txt-1)' }}>{result.score}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--txt-3)' }}>/ 100</span>
                    </div>
                    <div style={{ marginTop: '8px', height: '5px', background: 'var(--bg2)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: getScoreColor(result.score), width: `${result.score}%` }} />
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'center', padding: '12px', background: 'var(--pass-bg)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--pass)' }}>
                        {result.humanSummary.passed.length}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--txt-4)', fontWeight: 700 }}>
                        PASSED
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', background: 'var(--warn-bg)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--warn)' }}>
                        {result.humanSummary.warnings.length}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--txt-4)', fontWeight: 700 }}>
                        WARN
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', background: 'var(--block-bg)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--block)' }}>
                        {result.humanSummary.blocking.length}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--txt-4)', fontWeight: 700 }}>
                        BLOCK
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/shipments/${result.id}`}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px',
                      background: 'var(--navy)',
                      color: '#fff',
                      textAlign: 'center',
                      borderRadius: 'var(--radius)',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    View Full Detail Report
                  </Link>
                </div>
              </div>
            ) : (
              <div className="layer" style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--txt-3)' }}>
                <p style={{ fontSize: '0.85rem' }}>Submit the form to see the compliance evaluation.</p>
              </div>
            )}
          </div>
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
