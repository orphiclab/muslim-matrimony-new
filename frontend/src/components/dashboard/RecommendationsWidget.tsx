'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { profileApi } from '@/services/api';

export default function RecommendationsWidget({ ownerId }: { ownerId: string }) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      const res = await profileApi.getRecommendations(ownerId);
      setRecommendations(res.data || []);
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ownerId) fetchRecommendations();
  }, [ownerId]);

  const handleShortlist = async (targetId: string) => {
    try {
      await profileApi.toggleShortlist(ownerId, targetId);
      alert("Added to shortlist!");
    } catch (err) {
      console.error(err);
      alert("Failed to shortlist.");
    }
  };

  if (!ownerId || (recommendations.length === 0 && !loading)) return null;

  return (
    <div className="bg-gradient-to-r from-[#DB9D30]/10 to-[#1C3B35]/5 rounded-2xl border border-[#DB9D30]/20 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-[#DB9D30]/10 flex items-center justify-between bg-white/40">
        <div>
          <h2 className="font-semibold text-[#1C3B35] flex items-center gap-2">
            <span className="text-[#DB9D30]">✨</span> Perfect Matches for You
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Based on your child's preferences</p>
        </div>
      </div>
      
      <div className="p-5">
        {loading ? (
          <div className="text-xs text-gray-400 flex items-center gap-2">
             <svg className="w-4 h-4 animate-spin text-[#1C3B35]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
             </svg>
             Finding perfect matches...
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recommendations.map((target) => {
              return (
                <div key={target.id} className="min-w-[200px] border border-white/50 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition bg-white/60 relative group backdrop-blur-sm shadow-sm hover:-translate-y-1">
                  
                  {target.isVip && (
                    <div className="absolute top-0 right-0 bg-[#DB9D30] text-white text-[8px] font-bold px-2 py-0.5 rounded-tr-xl rounded-bl-xl z-10 uppercase tracking-wider">
                      Premium
                    </div>
                  )}

                  <div className="w-16 h-16 rounded-full bg-gray-200 mb-3 overflow-hidden shadow-sm relative shrink-0 ring-2 ring-[#DB9D30]/30 ring-offset-2">
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
                  <p className="text-[11px] text-gray-500 font-medium mb-1">{target?.age} yrs • {target.height ? `${target.height}cm` : '–'}</p>
                  <p className="text-xs text-gray-400 truncate w-full mb-3">{target?.occupation || target?.city || 'No Location'}</p>
                  
                  <div className="mt-auto flex w-full gap-2">
                     <Link href={`/profiles/${target.id}`} className="flex-1 bg-white border border-gray-200 text-gray-600 text-[11px] font-semibold py-2 rounded-lg hover:bg-gray-50 transition shadow-sm">
                       View
                     </Link>
                     <button onClick={() => handleShortlist(target.id)} className="flex-1 bg-[#1C3B35] text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-[#152c28] transition shadow-sm">
                       Shortlist
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
