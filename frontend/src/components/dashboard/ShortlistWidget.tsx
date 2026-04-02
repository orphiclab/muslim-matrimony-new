'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { profileApi } from '@/services/api';

export default function ShortlistWidget({ ownerId }: { ownerId: string }) {
  const [shortlists, setShortlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShortlists = async () => {
    try {
      const res = await profileApi.getShortlists(ownerId);
      setShortlists(res.data || []);
    } catch (err) {
      console.error('Failed to fetch shortlists', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ownerId) fetchShortlists();
  }, [ownerId]);

  const removeShortlist = async (targetId: string) => {
    try {
      setShortlists(prev => prev.filter(s => s.targetProfile.id !== targetId));
      await profileApi.toggleShortlist(ownerId, targetId);
    } catch (err) {
      console.error(err);
      fetchShortlists();
    }
  };

  if (!ownerId || (shortlists.length === 0 && !loading)) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-[#D4A843]">⭐</span> Saved Matches
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Profiles you have shortlisted</p>
        </div>
      </div>
      
      <div className="p-5">
        {loading ? (
          <div className="text-xs text-gray-400 flex items-center gap-2">
             <svg className="w-4 h-4 animate-spin text-[#1C3B35]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
             </svg>
             Loading shortlists...
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {shortlists.map((item) => {
              const target = item.targetProfile;
              return (
                <div key={item.id} className="min-w-[200px] border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition bg-gray-50/50 relative group">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mb-3 overflow-hidden shadow-sm relative shrink-0">
                    {target?.photos && target.photos.length > 0 ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={target.photos[0].url} 
                        alt={target.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1C3B35] flex items-center justify-center text-white font-bold text-xl">
                        {target?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-gray-800 truncate w-full">{target?.name}</h3>
                  <p className="text-[10px] text-gray-500 font-mono mb-1">{target?.memberId}</p>
                  <p className="text-xs text-gray-400 truncate w-full mb-3">{target?.occupation || target?.city || 'No Location'}</p>
                  
                  <div className="mt-auto flex w-full gap-2">
                     <Link href={`/dashboard/members/${target.id}`} className="flex-1 bg-white border border-gray-200 text-gray-600 text-xs py-1.5 rounded-lg hover:bg-gray-50 transition">
                       View
                     </Link>
                     <button onClick={() => removeShortlist(target.id)} className="flex-1 bg-red-50 text-red-600 text-xs py-1.5 rounded-lg hover:bg-red-100 transition">
                       Remove
                     </button>
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
