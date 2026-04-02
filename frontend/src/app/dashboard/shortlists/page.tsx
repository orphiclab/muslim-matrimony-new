'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { profileApi } from '@/services/api';

type ShortlistItem = {
  id: string;
  createdAt: string;
  targetProfile: {
    id: string; memberId: string; name: string; gender: string;
    city?: string; occupation?: string; education?: string;
    photos?: { url: string }[];
  };
};

export default function ShortlistsPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [shortlists, setShortlists] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    profileApi.getMyProfiles().then(async (res) => {
      const profs = res.data ?? [];
      setProfiles(profs);
      if (profs.length > 0) {
        const sl = await profileApi.getShortlists(profs[0].id).catch(() => ({ data: [] }));
        setShortlists(sl.data ?? []);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const profileId = profiles[0]?.id;

  const remove = async (targetId: string) => {
    setRemoving(targetId);
    setShortlists(prev => prev.filter(s => s.targetProfile.id !== targetId));
    try {
      await profileApi.toggleShortlist(profileId, targetId);
    } catch {
      const sl = await profileApi.getShortlists(profileId).catch(() => ({ data: [] }));
      setShortlists(sl.data ?? []);
    }
    setRemoving(null);
  };

  const filtered = shortlists.filter(s =>
    s.targetProfile.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.targetProfile.memberId ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (s.targetProfile.city ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Loading...
    </div>
  );

  return (
    <div className="font-poppins space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Saved Matches</h1>
        <p className="text-gray-400 text-sm mt-0.5">Profiles you have shortlisted for later</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold text-gray-800">Shortlisted Profiles</h2>
            <p className="text-xs text-gray-400 mt-0.5">{shortlists.length} profile{shortlists.length !== 1 ? 's' : ''} saved</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            {shortlists.length > 3 && (
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1C3B35]/20 w-40" />
              </div>
            )}
            <Link href="/dashboard/members"
              className="text-xs bg-[#1C3B35] text-white px-4 py-2 rounded-lg hover:bg-[#15302a] transition font-semibold flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Browse Members
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="text-5xl mb-3">⭐</span>
              <p className="text-sm font-medium">{search ? 'No matches found' : 'No saved matches yet'}</p>
              {!search && (
                <Link href="/dashboard/members" className="mt-2 text-xs text-[#1C3B35] font-semibold hover:underline">
                  Browse members to shortlist →
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Member', 'Member ID', 'Gender', 'Location', 'Occupation', 'Saved On', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item, i) => {
                  const p = item.targetProfile;
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 transition ${i % 2 === 1 ? 'bg-[#FAFAFA]' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.photos?.[0]?.url ? (
                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.photos[0].url} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#1C3B35] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {p.name?.[0] ?? '?'}
                            </div>
                          )}
                          <span className="font-medium text-gray-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">{p.memberId ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{p.gender?.toLowerCase() ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{p.city ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{p.occupation ?? '—'}</td>
                      <td className="px-6 py-4 text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/members/${p.id}`}
                            className="text-xs text-[#1C3B35] font-semibold hover:underline flex items-center gap-1">
                            View
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </Link>
                          <button disabled={removing === p.id} onClick={() => remove(p.id)}
                            className="text-xs text-red-500 font-semibold hover:underline disabled:opacity-40">
                            {removing === p.id ? '…' : 'Remove'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
