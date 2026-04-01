'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { subscriptionApi, profileApi } from '@/services/api';

const navItems = [
  {
    href: '/dashboard/parent', label: 'Overview', exact: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/dashboard/profiles', label: 'My Profiles', exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/members', label: 'Browse Members', exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/subscription', label: 'Subscription', exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    href: '/dashboard/chat', label: 'Messages', exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('mn_token');
    if (!token) { router.replace('/login'); return; }

    const u = JSON.parse(localStorage.getItem('mn_user') ?? '{}');
    setUser(u);

    if (u.role === 'ADMIN') { setChecking(false); return; }

    // Allow users with any profile (even pending payment) to access the dashboard.
    // Only redirect to /select-plan if they have zero profiles at all.
    Promise.all([
      subscriptionApi.mySubscriptions().catch(() => ({ data: [] })),
      profileApi.getMyProfiles().catch(() => ({ data: [] })),
    ]).then(([subRes, profRes]) => {
      const profiles = profRes.data ?? [];
      const hasActive = (subRes.data ?? []).some((s: any) => s.subscription?.status === 'ACTIVE');
      const hasPending = profiles.some((p: any) => p.status === 'PAYMENT_PENDING' || p.status === 'DRAFT');

      // Allow in if has active subscription OR has profiles (even pending)
      if (!hasActive && !hasPending && profiles.length === 0) {
        router.replace('/select-plan');
      } else {
        setChecking(false);
      }
    }).catch(() => router.replace('/select-plan'));
  }, [router]);

  const logout = () => {
    localStorage.removeItem('mn_token');
    localStorage.removeItem('mn_user');
    window.dispatchEvent(new Event('mn_auth_change'));
    router.push('/login');
  };

  // Listen for unread count changes from the chat page
  useEffect(() => {
    // Load initial count from localStorage
    const stored = parseInt(localStorage.getItem('mn_unread') ?? '0', 10);
    if (!isNaN(stored)) setTotalUnread(stored);

    const handler = (e: Event) => {
      const count = (e as CustomEvent<number>).detail ?? 0;
      setTotalUnread(count);
    };
    window.addEventListener('mn_unread_change', handler);
    return () => window.removeEventListener('mn_unread_change', handler);
  }, []);

  const isActive = (item: { href: string; exact: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#1B6B4A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-poppins">Checking your membership...</p>
      </div>
    </div>
  );

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <a href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#D4A843] flex items-center justify-center flex-shrink-0">
            <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold leading-tight tracking-wide">Muslim Metromony New</p>
            <p className="text-[10px] text-white/50 leading-tight">Member Dashboard</p>
          </div>
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          const isMessages = item.href === '/dashboard/chat';
          const showBadge = isMessages && totalUnread > 0 && !active;
          return (
            <a key={item.href} href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 ${
                active
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90'
              }`}>
              <span className={active ? 'text-white' : 'text-white/50'}>{item.icon}</span>
              {item.label}
              <span className="ml-auto flex items-center gap-1.5">
                {showBadge && (
                  <span className="min-w-[18px] h-[18px] bg-[#22C55E] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
                {active && !showBadge && <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]" />}
              </span>
            </a>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-5 border-t border-white/10 pt-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-[#D4A843]/20 border border-[#D4A843]/40 flex items-center justify-center text-[#D4A843] text-sm font-bold flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white/90 leading-none truncate">{user?.email?.split('@')[0] ?? 'Member'}</p>
            <p className="text-[10px] text-white/40 mt-0.5 truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[13.5px] font-medium text-white/60 hover:text-white hover:bg-white/8 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex font-poppins bg-[#F4F6F9]">
      {/* ── Desktop Sidebar ── */}
      <aside className="w-60 bg-[#1C3B35] text-white flex flex-col shadow-2xl min-h-screen hidden lg:flex flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay Sidebar ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#1C3B35] text-white flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between gap-4 flex-shrink-0">
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-50 transition text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Page breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400">
            <span>Member</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
            <span className="text-gray-700 font-medium capitalize">
              {navItems.find(n => isActive(n))?.label ?? 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Notification bell */}
            <button className="relative p-2 rounded-xl hover:bg-gray-50 transition text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            <div className="w-px h-6 bg-gray-200" />

            {/* User avatar + Logout */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-[#1C3B35] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 leading-none">{user?.email?.split('@')[0] ?? 'Member'}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{user?.email ?? ''}</p>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="ml-1 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-7 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
