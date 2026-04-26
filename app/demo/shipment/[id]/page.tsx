'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

/* ─── Types ─────────────────────────────────────────────── */

interface Rule {
  ruleId: string;
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
  product: string;
  destination: string;
  status: 'PASS' | 'WARNING' | 'BLOCK';
  score: number;
  confidence: number;
  evaluatedAt: string;
  rulesTriggered: Rule[];
  humanSummary: HumanSummary;
  nextActions: string[];
}

/* ─── Status config ─────────────────────────────────────── */

const STATUS_STYLES = {
  PASS:    { label: 'PASS',    bg: 'bg-emerald-50',   text: 'text-emerald-700',  dot: 'bg-emerald-500',  bar: 'bg-emerald-500' },
  WARNING: { label: 'WARNING', bg: 'bg-amber-50',     text: 'text-amber-700',    dot: 'bg-amber-500',    bar: 'bg-amber-500' },
  BLOCK:   { label: 'BLOCK',   bg: 'bg-red-50',       text: 'text-red-700',      dot: 'bg-red-500',      bar: 'bg-red-500' },
} as const;

/* ─── Components ────────────────────────────────────────── */

function StatusChip({ status, size = 'sm' }: { status: string; size?: 'sm' | 'lg' }) {
  const st = STATUS_STYLES[status as keyof typeof STATUS_STYLES] || STATUS_STYLES.BLOCK;
  const sizeClasses = size === 'lg'
    ? 'text-sm px-3.5 py-2 rounded-lg'
    : 'text-[11px] px-2 py-1 rounded-md';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold tracking-wide uppercase ${sizeClasses} ${st.bg} ${st.text} border border-current/10`}>
      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
      {st.label}
    </span>
  );
}

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const st = value >= 85 ? STATUS_STYLES.PASS : value >= 60 ? STATUS_STYLES.WARNING : STATUS_STYLES.BLOCK;
  return (
    <div className="w-40 h-1.5 bg-slate-200 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────── */

export default function DemoShipmentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/shipments/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setShipment(data);
      } catch (e) {
        console.error('Failed to load shipment detail:', e);
        setError('Failed to load shipment details.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#F7911E] border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading shipment details</p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-600 font-medium">{error || 'Shipment not found'}</p>
        <Link href="/demo" className="text-sm text-[#111D6F] font-semibold hover:underline">
          Back to Demo Dashboard
        </Link>
      </div>
    );
  }

  const s = shipment;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/demo" className="hover:text-[#111D6F] font-medium transition">Demo Dashboard</Link>
        <span>/</span>
        <span className="text-slate-700 font-semibold">Shipment Detail</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-400 mb-1">{s.id}</div>
          <h1 className="text-2xl font-bold text-slate-900">{s.product} {String.fromCharCode(8594)} {s.destination}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Evaluated {new Date(s.evaluatedAt).toLocaleString()}
          </p>
        </div>
        <StatusChip status={s.status} size="lg" />
      </div>

      {/* Layer A — Decision */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Layer A &mdash; Decision</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#111D6F]/10 text-[#111D6F]">FROM BACKEND</span>
        </div>
        <div className="p-6 flex flex-wrap items-center gap-8">
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
            <StatusChip status={s.status} size="lg" />
          </div>
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">{s.score}</span>
              <ScoreBar value={s.score} />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence</div>
            <span className="text-xl font-mono font-semibold text-slate-700">{(s.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="ml-auto text-right space-y-1">
            <div className="text-xs text-slate-500">Product: <strong className="text-slate-700">{s.product}</strong></div>
            <div className="text-xs text-slate-500">Destination: <strong className="text-slate-700">{s.destination}</strong></div>
            <div className="text-xs text-slate-500">Rules triggered: <strong className="text-slate-700">{s.rulesTriggered.length}</strong></div>
          </div>
        </div>
      </section>

      {/* Layer B — Rule Breakdown */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Layer B &mdash; Rule Breakdown</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#111D6F]/10 text-[#111D6F]">RAW ENGINE OUTPUT</span>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rule ID</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reason</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inputs Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {s.rulesTriggered.map((rule) => (
                <tr key={rule.ruleId} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-semibold text-[#111D6F]">{rule.ruleId}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium text-xs">{rule.category}</td>
                  <td className="px-5 py-3.5"><StatusChip status={rule.status} /></td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs leading-relaxed max-w-md">{rule.reason}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {rule.inputsUsed.map((input) => (
                        <span key={input} className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                          {input}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {s.rulesTriggered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm italic">
                    No rules triggered for this shipment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Layer C — Human Summary */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Layer C &mdash; Human Summary</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#111D6F]/10 text-[#111D6F]">BACKEND GROUPED</span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blocking */}
            <div>
              <h3 className="text-[11px] font-bold text-red-600 uppercase tracking-wider pb-2 mb-3 border-b-2 border-red-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Blocking Issues
              </h3>
              {s.humanSummary.blocking.length > 0 ? (
                <ul className="space-y-2">
                  {s.humanSummary.blocking.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">No blocking issues</p>
              )}
            </div>
            {/* Warnings */}
            <div>
              <h3 className="text-[11px] font-bold text-amber-600 uppercase tracking-wider pb-2 mb-3 border-b-2 border-amber-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Warnings
              </h3>
              {s.humanSummary.warnings.length > 0 ? (
                <ul className="space-y-2">
                  {s.humanSummary.warnings.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">No warnings</p>
              )}
            </div>
            {/* Passed */}
            <div>
              <h3 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider pb-2 mb-3 border-b-2 border-emerald-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Passed Checks
              </h3>
              {s.humanSummary.passed.length > 0 ? (
                <ul className="space-y-2">
                  {s.humanSummary.passed.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">No passed checks recorded</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Layer D — Next Actions */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Layer D &mdash; Next Actions</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#111D6F]/10 text-[#111D6F]">REQUIRED ACTIONS</span>
        </div>
        <div className="p-6">
          {s.nextActions.length > 0 ? (
            <div className="space-y-3">
              {s.nextActions.map((action, i) => (
                <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-[#111D6F]/30 transition">
                  <span className="flex-shrink-0 mt-0.5 font-bold text-[11px] text-[#F7911E] bg-[#F7911E]/10 border border-[#F7911E]/20 px-2 py-1 rounded">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-emerald-700 font-medium">No actions required &mdash; shipment is cleared for export.</span>
            </div>
          )}
        </div>
      </section>

      {/* Footer nav */}
      <div className="pt-4 pb-8 flex items-center gap-4">
        <Link href="/demo" className="inline-flex items-center gap-2 text-sm font-semibold text-[#111D6F] hover:text-[#F7911E] transition">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12l-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Demo Dashboard
        </Link>
        <Link href={`/shipment/${s.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#111D6F] transition">
          View Public Detail →
        </Link>
      </div>
    </div>
  );
}

