'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';

type Photo = {
  id: string;
  url: string;
  visibility: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  childProfile?: { id: string; name: string; memberId: string };
};

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

export default function AdminPhotosModerationPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await adminApi.photos(filter === 'ALL' ? undefined : filter);
      setPhotos(res.data || []);
    } catch (err) {
      console.error(err);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [filter]);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    // Optimistic Update
    setPhotos(prev => prev.filter(p => p.id !== id));
    
    try {
      if (action === 'APPROVE') {
        await adminApi.approvePhoto(id);
      } else {
        await adminApi.rejectPhoto(id);
      }
    } catch (err) {
      console.error('Failed to moderate photo', err);
      // Revert optimism by refetching
      fetchPhotos();
    }
  };

  return (
    <div className="font-poppins space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Photo Moderation</h1>
          <p className="text-gray-400 text-sm mt-0.5">Review and approve member photo uploads</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-[500px]">
        {/* Filters */}
        <div className="px-5 py-4 border-b border-gray-100 flex gap-2 overflow-x-auto">
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
                filter === s 
                  ? 'bg-[#1C3B35] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 border border-gray-200'
              }`}>
              {s} {filter === s && `(${photos.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading photos...</div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <span className="text-4xl mb-3">📸</span>
              <p className="text-sm font-medium">No {filter !== 'ALL' ? filter.toLowerCase() : ''} photos to review</p>
              <p className="text-xs text-gray-300 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group">
                  <div className="relative aspect-[3/4] bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={photo.url} 
                      alt="Uploaded profile photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                      <p className="text-[10px] font-bold text-white tracking-widest">{photo.visibility}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-sm font-bold text-gray-800">{photo.childProfile?.name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500 mb-4">{photo.childProfile?.memberId || 'N/A'} • {new Date(photo.createdAt).toLocaleDateString()}</p>
                    
                    <div className="mt-auto flex items-center justify-between gap-2">
                       {photo.status !== 'REJECTED' && (
                         <button 
                         onClick={() => handleAction(photo.id, 'REJECT')}
                         className="flex-1 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
                       >
                         Reject
                       </button>
                       )}
                       {photo.status !== 'APPROVED' && (
                         <button 
                         onClick={() => handleAction(photo.id, 'APPROVE')}
                         className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-[#1C3B35] hover:bg-[#15302a] shadow-sm transition"
                       >
                         Approve
                       </button>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
