'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { notificationApi } from '@/services/api';

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
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

const typeIcon: Record<string, string> = {
  INTEREST_RECEIVED: '💌',
  INTEREST_ACCEPTED: '✅',
  MESSAGE: '💬',
  PHOTO_REQUEST: '📷',
  PAYMENT_SUCCESS: '💳',
  PROFILE_ACTIVATED: '🎉',
  PROFILE_CREATED: '👤',
  SUBSCRIPTION_EXPIRED: '⚠️',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await notificationApi.getAll();
      setNotifs(res.data ?? []);
      setUnread(res.unread ?? 0);
    } catch { /* silent */ }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(timer);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
    await notificationApi.markRead(id).catch(() => {});
  };

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
    await notificationApi.markAllRead().catch(() => {});
  };

  const deleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifs(prev => prev.filter(n => n.id !== id));
    const wasUnread = notifs.find(n => n.id === id && !n.isRead);
    if (wasUnread) setUnread(prev => Math.max(0, prev - 1));
    await notificationApi.delete(id).catch(() => {});
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(!open); if (!open) load(); }}
        className="relative p-2 rounded-xl hover:bg-gray-50 transition text-gray-500"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 shadow">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-semibold text-gray-800 text-sm">
              Notifications {unread > 0 && <span className="text-rose-500">({unread})</span>}
            </p>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-[#1C3B35] font-semibold hover:underline">
                  Mark all read
                </button>
              )}
              <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="text-[11px] text-gray-400 hover:text-gray-600">
                See all
              </Link>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <div className="py-10 text-center text-gray-300">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifs.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  onClick={() => { if (!n.isRead) markRead(n.id); if (n.link) { setOpen(false); window.location.href = n.link; } }}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition group ${!n.isRead ? 'bg-rose-50/40' : ''}`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{typeIcon[n.type] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                    <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                    <button
                      onClick={(e) => deleteNotif(n.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition text-xs"
                    >✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
