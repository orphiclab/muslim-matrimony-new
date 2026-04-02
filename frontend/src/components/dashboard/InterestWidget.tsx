'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { interestApi } from '@/services/api';

type InterestItem = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  message?: string | null;
  createdAt: string;
  sender?: { id: string; memberId: string; name: string; gender: string; city?: string; occupation?: string; photos?: { url: string }[] };
  receiver?: { id: string; memberId: string; name: string; gender: string; city?: string; occupation?: string; photos?: { url: string }[] };
};

const statusBadge: Record<string, string> = {
  PENDING:  'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
};

function Avatar({ profile }: { profile: any }) {
  if (profile?.photos?.[0]?.url) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={profile.photos[0].url} alt={profile.name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full flex-shrink-0 bg-[#1C3B35] flex items-center justify-center text-white font-bold shadow-sm">
      {profile?.name?.[0] ?? '?'}
    </div>
  );
}

export default function InterestWidget({ ownerId }: { ownerId: string }) {
  const [received, setReceived] = useState<InterestItem[]>([]);
  const [sent, setSent] = useState<InterestItem[]>([]);
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [recv, snt] = await Promise.all([
        interestApi.getReceived(ownerId),
        interestApi.getSent(ownerId),
      ]);
      setReceived(recv.data ?? []);
      setSent(snt.data ?? []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { if (ownerId) load(); }, [ownerId]);

  const respond = async (interestId: string, action: 'ACCEPTED' | 'DECLINED') => {
    setActing(interestId);
    try {
      await interestApi.respond(interestId, ownerId, action);
      setReceived(prev => prev.map(i => i.id === interestId ? { ...i, status: action } : i));
    } catch { /* silent */ }
    setActing(null);
  };

  const withdraw = async (receiverProfileId: string) => {
    setActing(receiverProfileId);
    try {
      await interestApi.withdraw(ownerId, receiverProfileId);
      setSent(prev => prev.filter(i => i.receiver?.id !== receiverProfileId));
    } catch { /* silent */ }
    setActing(null);
  };

  const pendingCount = received.filter(i => i.status === 'PENDING').length;
  const items = tab === 'received' ? received : sent;

  if (!ownerId || (!loading && received.length === 0 && sent.length === 0)) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            💌 Interest Requests
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold bg-[#1C3B35] text-white px-2 py-0.5 rounded-full">
                {pendingCount} new
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Connection requests between members</p>
        </div>
        <Link href="/dashboard/interests" className="text-xs text-[#1C3B35] font-semibold hover:underline flex items-center gap-1">
          View all
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(['received', 'sent'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
              tab === t ? 'text-[#1C3B35] border-b-2 border-[#1C3B35] bg-[#EAF2EE]/40' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}>
            {t === 'received' ? `Received (${received.length})` : `Sent (${sent.length})`}
          </button>
        ))}
      </div>

      <div className="p-5">
        {loading ? (
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin text-[#1C3B35]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading...
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No {tab} interests yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.slice(0, 5).map(item => {
              const profile = tab === 'received' ? item.sender : item.receiver;
              return (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <Avatar profile={profile} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{profile?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{profile?.occupation || profile?.city || profile?.memberId}</p>
                    {item.message && <p className="text-[11px] text-gray-500 italic mt-0.5 truncate">&ldquo;{item.message}&rdquo;</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${statusBadge[item.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                    </span>
                    {tab === 'received' && item.status === 'PENDING' && (
                      <>
                        <button disabled={acting === item.id} onClick={() => respond(item.id, 'ACCEPTED')}
                          className="text-[10px] bg-[#1C3B35] text-white px-2 py-1 rounded-lg hover:bg-[#15302a] transition font-semibold disabled:opacity-50">
                          Accept
                        </button>
                        <button disabled={acting === item.id} onClick={() => respond(item.id, 'DECLINED')}
                          className="text-[10px] text-red-500 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition font-semibold disabled:opacity-50">
                          Decline
                        </button>
                      </>
                    )}
                    {tab === 'sent' && item.status === 'PENDING' && (
                      <button disabled={acting === profile?.id} onClick={() => withdraw(profile!.id)}
                        className="text-[10px] text-gray-500 border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-100 transition font-semibold disabled:opacity-50">
                        Withdraw
                      </button>
                    )}
                    <Link href={`/dashboard/members/${profile?.id}`}
                      className="text-[10px] text-[#1C3B35] font-semibold hover:underline">
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
