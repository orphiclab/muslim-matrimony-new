'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { profileViewApi } from '@/services/api';

type ViewItem = {
  id: string;
  viewedAt: string;
  viewer?: { id: string; memberId: string; name: string; gender: string; city?: string; occupation?: string; photos?: { url: string }[] };
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ProfileViewsWidget({ ownerId }: { ownerId: string }) {
  const [views, setViews] = useState<ViewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerId) return;
    profileViewApi.getViewers(ownerId)
      .then((res: any) => setViews(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ownerId]);

  if (!ownerId || (!loading && views.length === 0)) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">👁️ Who Viewed My Profile</h2>
          <p className="text-xs text-gray-400 mt-0.5">{views.length} member{views.length !== 1 ? 's' : ''} visited your profile</p>
        </div>
        <span className="text-xs font-semibold text-[#1C3B35] bg-[#EAF2EE] px-3 py-1 rounded-full">
          {views.length} views
        </span>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin text-[#1C3B35]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading viewers...
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {views.slice(0, 10).map((v) => {
              const p = v.viewer;
              return (
                <div key={v.id} className="min-w-[160px] border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition bg-gray-50/50 flex-shrink-0 group">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full overflow-hidden mb-3 shadow-sm flex-shrink-0">
                    {p?.photos?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photos[0].url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#1C3B35] flex items-center justify-center text-white font-bold text-xl">
                        {p?.name?.[0] ?? '?'}
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-sm text-gray-800 truncate w-full">{p?.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono mb-1">{p?.memberId}</p>
                  <p className="text-xs text-gray-400 truncate w-full mb-1">{p?.occupation || p?.city || '—'}</p>
                  <p className="text-[10px] text-gray-400 mb-3 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    {timeAgo(v.viewedAt)}
                  </p>
                  <Link href={`/dashboard/members/${p?.id}`}
                    className="w-full bg-white border border-gray-200 text-gray-600 text-xs py-1.5 rounded-lg hover:bg-[#EAF2EE] hover:text-[#1C3B35] hover:border-[#1C3B35]/30 transition font-semibold">
                    View Profile
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
