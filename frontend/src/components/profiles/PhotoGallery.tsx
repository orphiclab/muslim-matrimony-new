'use client';

import React, { useState } from 'react';
import { photoApi, profileApi } from '@/services/api';

// Using a placeholder image or a passed-in photo array.
export default function PhotoGallery({ photos = [], targetProfileId, accessStatus }: { photos?: any[], targetProfileId?: string, accessStatus?: string | null }) {
  const [accessRequested, setAccessRequested] = useState(false);
  const isAuthenticated = typeof window !== 'undefined' ? !!localStorage.getItem('mn_token') : false;

  // Fallback to placeholder photos if none provided to demonstrate blurring concept
  const displayPhotos = photos.length > 0 ? photos : [
    { id: 1, url: 'https://images.unsplash.com/photo-1596434452752-19e352b2b1a1?fm=jpg&w=800&fit=crop', visibility: 'BLURRED', hasAccess: false },
    { id: 2, url: 'https://images.unsplash.com/photo-1621847468516-1ed0d0df5a87?fm=jpg&w=800&fit=crop', visibility: 'BLURRED', hasAccess: false }
  ];

  const [activeProfiles, setActiveProfiles] = useState<any[]>([]);

  React.useEffect(() => {
    if (isAuthenticated) {
      profileApi.getMyProfiles().then(r => {
        const active = (r.data ?? []).filter((p: any) => p.status === 'ACTIVE');
        setActiveProfiles(active);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleRequestAccess = async () => {
    if (!isAuthenticated) {
      alert('Please log in to request photo access.');
      return;
    }
    
    if (activeProfiles.length === 0) {
      alert('You need an active profile to request photo access.');
      return;
    }
    
    setAccessRequested(true);
    if (targetProfileId) {
      try {
        await photoApi.requestAccess(activeProfiles[0].id, targetProfileId);
      } catch (err) {
        console.error('Failed to request access:', err);
      }
    }
  };

  const isPending = accessStatus === 'PENDING' || accessRequested;
  const isRejected = accessStatus === 'REJECTED';

  // Determine if we need to show the block overlay
  const allBlurred = displayPhotos.every(p => p.visibility === 'BLURRED' || !p.hasAccess);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-[15px] font-bold font-poppins text-[#1C3B35]">
          <span className="text-lg">📸</span>
          Private Photo Gallery
        </h2>
        <span className="text-[11px] font-semibold bg-[#F8F9FA] text-gray-500 px-2 py-1 rounded hidden sm:inline-block">
          {displayPhotos.length} Photos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 relative">
        {displayPhotos.map((photo, i) => {
          const isHidden = photo.visibility === 'BLURRED' || !photo.hasAccess;
          return (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 ring-1 ring-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={photo.url} 
                alt="Profile photo"
                className={`object-cover w-full h-full transition duration-500 ${isHidden ? 'blur-2xl scale-125 opacity-80' : ''}`}
                style={{ filter: isHidden ? 'blur(16px)' : 'none' }}
              />
            </div>
          );
        })}
        
        {/* Overlay when blurred */}
        {allBlurred && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 rounded-xl pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md p-5 rounded-xl shadow-lg border border-white/40 text-center mx-4 pointer-events-auto">
              <p className="text-[#1C3B35] font-extrabold font-poppins text-[15px] mb-1">Photos are Private</p>
              <p className="text-gray-500 text-[12px] mb-4 leading-tight px-2">Request access from their guardian to view the full gallery</p>
              <button 
                onClick={handleRequestAccess}
                disabled={isPending || isRejected}
                className={`w-full font-bold font-poppins text-[13px] py-2.5 px-4 rounded-xl transition ${
                  isPending || isRejected
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-inner'
                    : 'bg-[#DB9D30] text-white hover:bg-[#c98b26] shadow-md shadow-[#DB9D30]/20'
                }`}
              >
                {isRejected ? 'Request Denied 🚫' : isPending ? 'Pending Approval ⏳' : 'Request Access 🔓'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
