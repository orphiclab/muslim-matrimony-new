'use client';

import React, { useEffect, useState } from 'react';
import { photoApi } from '@/services/api';

// Temporary mock function until the backend API gets connected.
const fetchPhotoRequests = async () => {
  return [
    {
      id: "req_123",
      requesterName: "Ahmed A.",
      targetName: "Fatima S.",
      originalRequesterId: "MN-9012",
      status: "PENDING",
      createdAt: new Date().toISOString()
    },
    {
      id: "req_124",
      requesterName: "Zainab B.",
      targetName: "Omar H.",
      originalRequesterId: "MN-7761",
      status: "PENDING",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
};

export default function PhotoRequestsWidget() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    photoApi.getPendingRequests().then(data => {
      // Map backend structure to the widget's expected structure
      const mapped = (data || []).map((req: any) => ({
        id: req.id,
        requesterName: req.requester?.name || 'Unknown',
        targetName: req.target?.name || 'Unknown',
        originalRequesterId: req.requester?.memberId || 'N/A',
        targetId: req.targetProfileId,
        status: req.status,
        createdAt: req.createdAt
      }));
      setRequests(mapped);
      setLoading(false);
    });
  }, []);

  const handleAction = async (id: string, targetId: string, action: 'APPROVE' | 'REJECT') => {
    // Optimistic UI update for immediate user feedback
    setRequests(prev => prev.filter(req => req.id !== id));
    try {
      if (action === 'APPROVE') {
        await photoApi.approveRequest(id, targetId);
      } else {
        await photoApi.rejectRequest(id, targetId);
      }
    } catch (e) {
      console.error(e);
      // Optional: re-fetch or show error toast
    }
  };

  if (loading) return null;
  if (requests.length === 0) return null; // Only show widget if there are pending requests

  return (
    <div className="bg-white rounded-2xl border border-[#DB9D30]/30 shadow-sm overflow-hidden mb-6 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Decorative gradient line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#DB9D30] to-[#E8BE1A]" />
      
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-[#DB9D30]/5 to-transparent">
        <div>
          <h2 className="font-bold text-[#1C3B35] font-poppins flex items-center gap-2">
            <span className="text-lg">📸</span> 
            Pending Photo Requests
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 animate-pulse shadow-sm">
              {requests.length} New
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-poppins">Other suitors are requesting to view your private galleries</p>
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {requests.map((req) => (
          <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFAFA] transition">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#EAF2EE] rounded-full flex items-center justify-center flex-shrink-0 text-[#1C3B35] font-bold font-poppins text-[15px]">
                {req.requesterName.charAt(0)}
              </div>
              <div>
                <p className="text-[13px] text-gray-800 font-poppins leading-relaxed">
                  <span className="font-bold">{req.requesterName}</span> wants to view <span className="font-bold text-[#DB9D30]">{req.targetName}'s</span> photos
                </p>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1 font-poppins">
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-100 shadow-sm">{req.originalRequesterId}</span>
                  <span>•</span>
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-12 sm:ml-0">
              <button 
                onClick={() => handleAction(req.id, req.targetId, 'REJECT')}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold text-gray-500 hover:text-red-700 hover:bg-red-50 hover:border-red-100 border border-transparent transition"
              >
                Reject
              </button>
              <button 
                onClick={() => handleAction(req.id, req.targetId, 'APPROVE')}
                className="px-5 py-2 rounded-xl text-[12px] font-bold text-white bg-[#1C3B35] hover:bg-[#15302a] shadow-md shadow-[#1C3B35]/20 font-poppins transition scale-100 hover:scale-105 active:scale-95"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
