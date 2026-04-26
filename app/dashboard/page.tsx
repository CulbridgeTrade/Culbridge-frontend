'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Shipment {
  shipmentId: string;
  commodity: string;
  destination: string;
  complianceStatus: 'OK' | 'WARNING' | 'BLOCKED' | 'PENDING';
  createdAt: string;
  confidenceScore: number;
  weight: number;
  exporter_name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      const res = await fetch(`/api/shipments?${params.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch shipments');
      const data = await res.json();
      setShipments(data.shipments || data);
    } catch (e) {
      console.error('Fetch shipments failed', e);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const filtered = shipments.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.shipmentId?.toLowerCase().includes(q) ||
      s.commodity?.toLowerCase().includes(q) ||
      s.destination?.toLowerCase().includes(q) ||
      s.exporter_name?.toLowerCase().includes(q)
    );
  });

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  const statusCounts = {
    OK: shipments.filter(s => s.complianceStatus === 'OK').length,
    WARNING: shipments.filter(s => s.complianceStatus === 'WARNING').length,
    BLOCKED: shipments.filter(s => s.complianceStatus === 'BLOCKED').length,
    PENDING: shipments.filter(s => s.complianceStatus === 'PENDING').length,
  };

  const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    OK: { label: 'Passed', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    WARNING: { label: 'Warning', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    BLOCKED: { label: 'Blocked', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    PENDING: { label: 'Pending', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Exporter Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Compliance overview for your shipments to EU markets</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'OK', label: 'Passed', desc: 'Ready for export' },
          { key: 'WARNING', label: 'Warnings', desc: 'Review required' },
          { key: 'BLOCKED', label: 'Blocked', desc: 'Action needed' },
          { key: 'PENDING', label: 'Pending', desc: 'Awaiting check' },
        ].map(({ key, label, desc }) => {
          const cfg = statusConfig[key];
          return (
            <div key={key} className={`rounded-xl border border-slate-200 ${cfg.bg} p-5`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.text}`}>{label}</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{statusCounts[key as keyof typeof statusCounts]}</div>
              <div className="text-xs text-slate-500 mt-1">{desc}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'OK', 'WARNING', 'BLOCKED', 'PENDING'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f === 'ALL' ? '' : f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                (f === 'ALL' && !statusFilter) || statusFilter === f
                  ? 'bg-[#111D6F] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full sm:w-72 pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#111D6F]/20 focus:border-[#111D6F]"
            placeholder="Search shipments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Shipment</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Commodity</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Destination</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Weight</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Score</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Loading shipments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const cfg = statusConfig[s.complianceStatus] || statusConfig.PENDING;
                  return (
                    <tr key={s.shipmentId} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{s.shipmentId}</div>
                        <div className="text-xs text-slate-500">{s.exporter_name}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 capitalize">{s.commodity}</td>
                      <td className="px-4 py-3 text-slate-700">{s.destination}</td>
                      <td className="px-4 py-3 text-slate-700">{s.weight?.toLocaleString()} kg</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#F7911E]"
                              style={{ width: `${(s.confidenceScore || 0) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600">
                            {((s.confidenceScore || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {filtered.length} of {shipments.length} shipments
        </p>
        <Link
          href="/shipment/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111D6F] text-white text-sm font-semibold rounded-lg hover:bg-[#1A2A8F] transition shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New Shipment
        </Link>
      </div>
    </div>
  );
}

