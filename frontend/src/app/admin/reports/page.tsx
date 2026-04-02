'use client';

import { useEffect, useState } from 'react';
import { blockApi } from '@/services/api';

type Report = {
  id: string; reason: string; details?: string; status: string; adminNote?: string;
  createdAt: string; updatedAt: string;
  reporter: { id: string; memberId: string; name: string };
  reported: { id: string; memberId: string; name: string };
};

const statusColors: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-600 border border-amber-200',
  REVIEWED:  'bg-emerald-50 text-emerald-600 border border-emerald-200',
  DISMISSED: 'bg-gray-100 text-gray-500 border border-gray-200',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED' | 'DISMISSED'>('ALL');
  const [updating, setUpdating] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await blockApi.getReports();
      setReports(res.data ?? []);
      const map: Record<string, string> = {};
      (res.data ?? []).forEach((r: Report) => { if (r.adminNote) map[r.id] = r.adminNote; });
      setNoteMap(map);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await blockApi.updateReport(id, status, noteMap[id]);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status, adminNote: noteMap[id] } : r));
    } catch { /* silent */ }
    setUpdating(null);
  };

  const displayed = filter === 'ALL' ? reports : reports.filter(r => r.status === filter);
  const pendingCount = reports.filter(r => r.status === 'PENDING').length;

  return (
    <div className="font-poppins space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ⚑ User Reports
            {pendingCount > 0 && <span className="text-sm bg-amber-500 text-white px-2.5 py-0.5 rounded-full">{pendingCount} pending</span>}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Review and action member-submitted reports</p>
        </div>
        <button onClick={load} className="text-sm border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition text-gray-600">
          ↻ Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-100">
        {(['ALL', 'PENDING', 'REVIEWED', 'DISMISSED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize transition border-b-2 ${filter === f ? 'text-[#1C3B35] border-[#1C3B35]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
            {f === 'ALL' ? `All (${reports.length})` : `${f.charAt(0) + f.slice(1).toLowerCase()} (${reports.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 gap-3">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading reports...
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-300">
            <span className="text-4xl mb-2">✅</span>
            <p className="text-sm text-gray-400">{filter === 'PENDING' ? 'No pending reports' : 'No reports found'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {displayed.map(r => (
              <div key={r.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusColors[r.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {r.status}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      <span className="text-[#1C3B35]">{r.reporter.name}</span>
                      <span className="text-gray-400 font-mono text-[10px] ml-1">({r.reporter.memberId})</span>
                      <span className="text-gray-400 mx-2">→ reported →</span>
                      <span className="text-red-600">{r.reported.name}</span>
                      <span className="text-gray-400 font-mono text-[10px] ml-1">({r.reported.memberId})</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-700">Reason:</span> {r.reason}
                    </p>
                    {r.details && <p className="text-xs text-gray-500 italic bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">&quot;{r.details}&quot;</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={`/admin/profiles?search=${r.reported.memberId}`} className="text-xs text-[#1C3B35] border border-[#1C3B35]/30 px-3 py-1.5 rounded-xl hover:bg-[#EAF2EE] transition font-semibold">
                      View Profile
                    </a>
                    {r.status === 'PENDING' && (
                      <>
                        <button
                          disabled={updating === r.id}
                          onClick={() => update(r.id, 'REVIEWED')}
                          className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition font-semibold disabled:opacity-50"
                        >✓ Review</button>
                        <button
                          disabled={updating === r.id}
                          onClick={() => update(r.id, 'DISMISSED')}
                          className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition font-semibold disabled:opacity-50"
                        >Dismiss</button>
                      </>
                    )}
                  </div>
                </div>
                {/* Admin note */}
                <div className="flex gap-2">
                  <input
                    value={noteMap[r.id] ?? ''}
                    onChange={e => setNoteMap(prev => ({ ...prev, [r.id]: e.target.value }))}
                    placeholder="Admin note (optional)..."
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1C3B35]/20"
                  />
                  {r.status !== 'PENDING' && (
                    <button
                      disabled={updating === r.id}
                      onClick={() => update(r.id, r.status)}
                      className="text-xs bg-[#1C3B35] text-white px-3 py-1.5 rounded-lg hover:bg-[#15302a] transition disabled:opacity-50"
                    >Save Note</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
