'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { profileApi, interestApi } from '@/services/api';

type InterestItem = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  message?: string | null;
  createdAt: string;
  sender?: { id: string; memberId: string; name: string; gender: string; city?: string; occupation?: string; photos?: { url: string }[] };
  receiver?: { id: string; memberId: string; name: string; gender: string; city?: string; occupation?: string; photos?: { url: string }[] };
};

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-1 ${highlight ? 'bg-[#1C3B35] text-white' : 'bg-white text-gray-800 border border-gray-100'}`}>
      <p className={`text-xs font-medium ${highlight ? 'text-white/70' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-3xl font-bold leading-none ${highlight ? 'text-white' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}

function Avatar({ profile }: { profile: any }) {
  if (profile?.photos?.[0]?.url) {
    return (
      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={profile.photos[0].url} alt={profile.name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-full shrink-0 bg-[#1C3B35] flex items-center justify-center text-white font-bold text-lg shadow-sm">
      {profile?.name?.[0] ?? '?'}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING:  'bg-amber-100 text-amber-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    DECLINED: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = { PENDING: 'Pending', ACCEPTED: 'Accepted', DECLINED: 'Declined' };
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {labels[status] ?? status}
    </span>
  );
}

function timeAgo(str: string) {
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function InterestsPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [received, setReceived] = useState<InterestItem[]>([]);
  const [sent, setSent] = useState<InterestItem[]>([]);
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    profileApi.getMyProfiles().then(async (res) => {
      const profs = res.data ?? [];
      setProfiles(profs);
      if (profs.length > 0) {
        const id = profs[0].id;
        const [recv, snt] = await Promise.all([
          interestApi.getReceived(id).catch(() => ({ data: [] })),
          interestApi.getSent(id).catch(() => ({ data: [] })),
        ]);
        setReceived(recv.data ?? []);
        setSent(snt.data ?? []);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const profileId = profiles[0]?.id;

  const respond = async (interestId: string, action: 'ACCEPTED' | 'DECLINED') => {
    setActing(interestId);
    try {
      await interestApi.respond(interestId, profileId, action);
      setReceived(prev => prev.map(i => i.id === interestId ? { ...i, status: action } : i));
    } catch { /* silent */ }
    setActing(null);
  };

  const withdraw = async (receiverProfileId: string, interestId: string) => {
    setActing(interestId);
    try {
      await interestApi.withdraw(profileId, receiverProfileId);
      setSent(prev => prev.filter(i => i.id !== interestId));
    } catch { /* silent */ }
    setActing(null);
  };

  const items = tab === 'received' ? received : sent;
  const pendingCount = received.filter(i => i.status === 'PENDING').length;

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
        <h1 className="text-2xl font-bold text-gray-800">
          Interest Requests
          {pendingCount > 0 && (
            <span className="ml-3 text-sm bg-[#1C3B35] text-white px-3 py-1 rounded-full font-semibold align-middle">
              {pendingCount} new
            </span>
          )}
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your connection requests with other members</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Received" value={received.length} highlight />
        <StatCard label="Pending" value={pendingCount} />
        <StatCard label="Accepted" value={received.filter(i => i.status === 'ACCEPTED').length} />
        <StatCard label="Sent" value={sent.length} />
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">All Requests</h2>
            <p className="text-xs text-gray-400 mt-0.5">View and respond to interest requests</p>
          </div>
          <Link href="/dashboard/members" className="text-xs bg-[#1C3B35] text-white px-4 py-2 rounded-lg hover:bg-[#15302a] transition font-semibold">
            Browse Members
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['received', 'sent'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                tab === t ? 'text-[#1C3B35] border-b-2 border-[#1C3B35] bg-[#EAF2EE]/40' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}>
              {t === 'received' ? `Received (${received.length})` : `Sent (${sent.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-50">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="text-5xl mb-3">💌</span>
              <p className="text-sm font-medium">No {tab} interests yet</p>
              {tab === 'sent' && (
                <Link href="/dashboard/members" className="mt-3 text-xs text-[#1C3B35] font-semibold hover:underline">
                  Browse members to send interest →
                </Link>
              )}
            </div>
          ) : (
            items.map((item) => {
              const profile = tab === 'received' ? item.sender : item.receiver;
              return (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                  <Avatar profile={profile} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800">{profile?.name}</p>
                      <span className="text-[10px] text-gray-400 font-mono">{profile?.memberId}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {profile?.occupation || '—'}{profile?.city ? ` · ${profile.city}` : ''}
                    </p>
                    {item.message && (
                      <p className="text-xs text-gray-500 mt-1 italic">&quot;{item.message}&quot;</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {timeAgo(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    <StatusBadge status={item.status} />
                    {tab === 'received' && item.status === 'PENDING' && (
                      <>
                        <button disabled={acting === item.id} onClick={() => respond(item.id, 'ACCEPTED')}
                          className="text-xs bg-[#1C3B35] text-white px-3 py-1.5 rounded-lg hover:bg-[#15302a] transition font-semibold disabled:opacity-50">
                          Accept
                        </button>
                        <button disabled={acting === item.id} onClick={() => respond(item.id, 'DECLINED')}
                          className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition font-semibold disabled:opacity-50">
                          Decline
                        </button>
                      </>
                    )}
                    {tab === 'sent' && item.status === 'PENDING' && (
                      <button disabled={acting === item.id} onClick={() => withdraw(profile!.id, item.id)}
                        className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition font-semibold disabled:opacity-50">
                        Withdraw
                      </button>
                    )}
                    <Link href={`/dashboard/members/${profile?.id}`}
                      className="text-xs text-[#1C3B35] font-semibold hover:underline flex items-center gap-1">
                      View
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
