'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notificationApi } from '@/services/api';

type Notif = {
  id: string; type: string; title: string; body: string;
  isRead: boolean; link?: string | null; createdAt: string;
};

const typeIcon: Record<string, string> = {
  INTEREST_RECEIVED: '💌', INTEREST_ACCEPTED: '✅', MESSAGE: '💬',
  PHOTO_REQUEST: '📷', PAYMENT_SUCCESS: '💳', PROFILE_ACTIVATED: '🎉',
  PROFILE_CREATED: '👤', SUBSCRIPTION_EXPIRED: '⚠️',
};

function timeAgo(str: string) {
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getAll();
      setNotifs(res.data ?? []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await notificationApi.markRead(id).catch(() => {});
  };

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    await notificationApi.markAllRead().catch(() => {});
  };

  const deleteNotif = async (id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
    await notificationApi.delete(id).catch(() => {});
  };

  const displayed = filter === 'unread' ? notifs.filter(n => !n.isRead) : notifs;
  const unreadCount = notifs.filter(n => !n.isRead).length;

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 text-sm bg-[#1C3B35] text-white px-3 py-1 rounded-full font-semibold align-middle">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">All your activity updates in one place</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="text-xs bg-[#1C3B35] text-white px-4 py-2 rounded-lg hover:bg-[#15302a] transition font-semibold">
            Mark all as read
          </button>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Activity Feed</h2>
            <p className="text-xs text-gray-400 mt-0.5">{notifs.length} total notifications</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-3.5 text-sm font-semibold capitalize transition-all ${
                filter === f ? 'text-[#1C3B35] border-b-2 border-[#1C3B35] bg-[#EAF2EE]/40' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}>
              {f === 'all' ? `All (${notifs.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="divide-y divide-gray-50">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p className="text-sm font-medium">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
            </div>
          ) : (
            displayed.map(n => (
              <div key={n.id}
                onClick={() => { if (!n.isRead) markRead(n.id); if (n.link) window.location.href = n.link; }}
                className={`flex items-start gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition group ${!n.isRead ? 'bg-[#EAF2EE]/20' : ''}`}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${!n.isRead ? 'bg-[#EAF2EE]' : 'bg-gray-50'}`}>
                  {typeIcon[n.type] ?? '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#1C3B35] shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }}
                  className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition flex-shrink-0">
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
