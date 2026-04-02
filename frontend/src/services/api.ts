const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('mn_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? 'Request failed');
  }
  return data;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body: { email: string; password: string; phone?: string }) =>
    request<{ success: boolean; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

// ─── User ──────────────────────────────────────────────────────────────────
export const userApi = {
  getMe: () => request<any>('/user/me'),
  updateMe: (body: { phone?: string }) =>
    request<any>('/user/me', { method: 'PUT', body: JSON.stringify(body) }),
};

// ─── Profiles ──────────────────────────────────────────────────────────────
export const profileApi = {
  create: (body: any) =>
    request<any>('/profile/create', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: any) =>
    request<any>(`/profile/update/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getMyProfiles: () => request<any>('/profile/my'),
  getOne: (id: string) => request<any>(`/profile/${id}`),
  getVisibleProfiles: (viewerProfileId: string) =>
    request<any>(`/profile/list/${viewerProfileId}`),
  delete: (id: string) => request<any>(`/profile/${id}`, { method: 'DELETE' }),

  // Shortlists & Recommendations
  toggleShortlist: (id: string, targetId: string) => request<any>(`/profile/${id}/shortlist/${targetId}`, { method: 'POST' }),
  getShortlists: (id: string) => request<any>(`/profile/${id}/shortlists`),
  getRecommendations: (id: string) => request<any>(`/profile/${id}/recommendations`),
  
  // Admin / Verification
  verifyProfile: (id: string, isVerified: boolean) => request<any>(`/profile/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ isVerified }) }),

  // Photo Access Requests
  requestPhotoAccess: (requesterId: string, targetId: string) => request<any>('/photo/access/request', { method: 'POST', body: JSON.stringify({ requesterId, targetId }) }),
  getPendingPhotoRequests: () => request<any>('/photo/access/pending'),
  approvePhotoRequest: (requestId: string, targetId: string) => request<any>(`/photo/access/${requestId}/approve`, { method: 'POST', body: JSON.stringify({ targetId }) }),
  rejectPhotoRequest: (requestId: string, targetId: string) => request<any>(`/photo/access/${requestId}/reject`, { method: 'POST', body: JSON.stringify({ targetId }) }),
};

// ─── Subscription ──────────────────────────────────────────────────────────
export const subscriptionApi = {
  status: (childProfileId: string) => request<any>(`/subscription/status/${childProfileId}`),
  mySubscriptions: () => request<any>('/subscription/my'),
};

// ─── Payment ───────────────────────────────────────────────────────────────
export const paymentApi = {
  initiate: (body: {
    childProfileId: string;
    amount: number;
    method: string;
    bankRef?: string;
    bankSlipUrl?: string;
    purpose?: string;
    days?: number;
    packageId?: string;
    packageDurationDays?: number;
  }) =>
    request<any>('/payment/initiate', { method: 'POST', body: JSON.stringify(body) }),
  verify: (body: { paymentId: string; gatewayRef: string }) =>
    request<any>('/payment/verify', { method: 'POST', body: JSON.stringify(body) }),
  myPayments: () => request<any>('/payment/my'),
};


// ─── Visibility ────────────────────────────────────────────────────────────
export const visibilityApi = {
  check: (viewerProfileId: string, targetProfileId: string) =>
    request<any>(`/visibility/contact/${viewerProfileId}/${targetProfileId}`),
  toggle: (profileId: string, visible: boolean) =>
    request<any>('/visibility/toggle', { method: 'POST', body: JSON.stringify({ profileId, visible }) }),
};

// ─── Photo ──────────────────────────────────────────────────────────────────
export const photoApi = {
  requestAccess: (requesterId: string, targetProfileId: string) =>
    request<any>('/photo/access/request', { method: 'POST', body: JSON.stringify({ requesterId, targetId: targetProfileId }) }),
  getPendingRequests: () =>
    request<any>('/photo/access/pending'),
  approveRequest: (requestId: string, targetId: string) =>
    request<any>(`/photo/access/${requestId}/approve`, { method: 'POST', body: JSON.stringify({ targetId }) }),
  rejectRequest: (requestId: string, targetId: string) =>
    request<any>(`/photo/access/${requestId}/reject`, { method: 'POST', body: JSON.stringify({ targetId }) }),
};

// ─── Chat ──────────────────────────────────────────────────────────────────
export const chatApi = {
  send: (body: { senderProfileId: string; receiverProfileId: string; content: string }) =>
    request<any>('/chat/send', { method: 'POST', body: JSON.stringify(body) }),
  history: (myProfileId: string, otherProfileId: string) =>
    request<any>(`/chat/history/${myProfileId}/${otherProfileId}`),
  conversations: (profileId: string) =>
    request<any>(`/chat/conversations/${profileId}`),
};

// ─── Admin ─────────────────────────────────────────────────────────────────
export const adminApi = {
  dashboard: () => request<any>('/admin/dashboard'),

  // Accept either a plain paymentId string or a full object
  approvePayment: (paymentIdOrBody: string | { paymentId: string; adminNote?: string }) => {
    const body = typeof paymentIdOrBody === 'string'
      ? { paymentId: paymentIdOrBody }
      : paymentIdOrBody;
    return request<any>('/admin/payment/approve', { method: 'POST', body: JSON.stringify(body) });
  },

  payments: (status?: string) => request<any>(`/admin/payments${status ? `?status=${status}` : ''}`),
  users: () => request<any>('/admin/users'),
  profiles: (status?: string) => request<any>(`/admin/profiles${status ? `?status=${status}` : ''}`),

  // Analytics (both names for compatibility)
  analytics: () => request<any>('/admin/analytics'),
  getAnalytics: () => request<any>('/admin/analytics'),

  // Chat Monitor
  getMessages: (limit?: number) => request<any>(`/admin/messages${limit ? `?limit=${limit}` : ''}`),
  
  // Photos
  photos: (status?: string) => request<any>(`/admin/photos${status ? `?status=${status}` : ''}`),
  approvePhoto: (id: string) => request<any>(`/admin/photos/${id}/approve`, { method: 'PUT' }),
  rejectPhoto: (id: string) => request<any>(`/admin/photos/${id}/reject`, { method: 'PUT' }),

  // Boosts
  getBoosts: () => request<any>('/admin/boosts'),
  removeBoost: (id: string) => request<any>(`/admin/boosts/${id}`, { method: 'DELETE' }),
  extendBoost: (id: string, days: number) =>
    request<any>(`/admin/boosts/${id}/extend`, { method: 'PUT', body: JSON.stringify({ days }) }),

  // Packages
  getPackages: () => request<any>('/admin/packages'),
  createPackage: (body: {
    name: string; description?: string; price: number; currency?: string;
    durationDays: number; features?: string[]; isActive?: boolean; sortOrder?: number;
    discountPct?: number; originalPrice?: number;
  }) => request<any>('/admin/packages', { method: 'POST', body: JSON.stringify(body) }),
  updatePackage: (id: string, body: {
    name?: string; description?: string; price?: number; currency?: string;
    durationDays?: number; features?: string[]; isActive?: boolean; sortOrder?: number;
    type?: string; discountPct?: number | null; originalPrice?: number | null;
  }) => request<any>(`/admin/packages/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePackage: (id: string) => request<any>(`/admin/packages/${id}`, { method: 'DELETE' }),

  // Site settings
  getSiteSettings: () => request<any>('/admin/settings'),
  updateSiteSettings: (body: { siteDiscountPct?: number; siteDiscountLabel?: string; siteDiscountActive?: boolean }) =>
    request<any>('/admin/settings', { method: 'PUT', body: JSON.stringify(body) }),
};

// ─── Public Packages (no auth) ────────────────────────────────────────────
export const packagesApi = {
  getActive: (type?: string) => request<any>(`/packages${type ? `?type=${type}` : ''}`),
  getSettings: () => request<any>('/settings'),
};

// ─── Interest / Connection Requests ────────────────────────────────────────
export const interestApi = {
  /** Send an interest from senderProfileId → receiverProfileId */
  send: (senderProfileId: string, receiverProfileId: string, message?: string) =>
    request<any>('/interest/send', { method: 'POST', body: JSON.stringify({ senderProfileId, receiverProfileId, message }) }),

  /** Accept or decline a received interest */
  respond: (interestId: string, receiverProfileId: string, action: 'ACCEPTED' | 'DECLINED') =>
    request<any>(`/interest/${interestId}/respond`, { method: 'PATCH', body: JSON.stringify({ receiverProfileId, action }) }),

  /** Get interests received by a profile */
  getReceived: (profileId: string) => request<any>(`/interest/${profileId}/received`),

  /** Get interests sent by a profile */
  getSent: (profileId: string) => request<any>(`/interest/${profileId}/sent`),

  /** Check if interest was already sent */
  check: (profileId: string, targetId: string) => request<any>(`/interest/${profileId}/check/${targetId}`),

  /** Withdraw a sent pending interest */
  withdraw: (senderProfileId: string, receiverProfileId: string) =>
    request<any>(`/interest/${senderProfileId}/withdraw/${receiverProfileId}`, { method: 'DELETE' }),
};

// ─── Profile Views (Who Viewed My Profile) ──────────────────────────────────
export const profileViewApi = {
  record: (viewerProfileId: string, targetProfileId: string) =>
    request<any>('/profile-views/record', { method: 'POST', body: JSON.stringify({ viewerProfileId, targetProfileId }) }),
  getViewers: (profileId: string) => request<any>(`/profile-views/${profileId}/viewers`),
  getVisited: (profileId: string) => request<any>(`/profile-views/${profileId}/visited`),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationApi = {
  getAll: () => request<any>('/notifications'),
  unreadCount: () => request<any>('/notifications/unread-count'),
  markRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request<any>('/notifications/read-all', { method: 'PATCH' }),
  delete: (id: string) => request<any>(`/notifications/${id}`, { method: 'DELETE' }),
};

// ─── Block / Report ───────────────────────────────────────────────────────────
export const blockApi = {
  block: (blockerProfileId: string, blockedProfileId: string) =>
    request<any>('/block', { method: 'POST', body: JSON.stringify({ blockerProfileId, blockedProfileId }) }),
  unblock: (blockerProfileId: string, blockedProfileId: string) =>
    request<any>('/block', { method: 'DELETE', body: JSON.stringify({ blockerProfileId, blockedProfileId }) }),
  check: (blockerProfileId: string, blockedProfileId: string) =>
    request<any>(`/block/check/${blockerProfileId}/${blockedProfileId}`),
  getList: (profileId: string) => request<any>(`/block/${profileId}/list`),
  report: (reporterProfileId: string, reportedProfileId: string, reason: string, details?: string) =>
    request<any>('/block/report', { method: 'POST', body: JSON.stringify({ reporterProfileId, reportedProfileId, reason, details }) }),
  getReports: () => request<any>('/block/reports'),
  updateReport: (id: string, status: string, adminNote?: string) =>
    request<any>(`/block/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status, adminNote }) }),
};


// ─── Public Profiles (no auth) ────────────────────────────────────────────
export const publicProfilesApi = {
  list: (filters?: {
    minAge?: number; maxAge?: number; gender?: string;
    city?: string; ethnicity?: string; civilStatus?: string;
    education?: string; occupation?: string; memberId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.minAge) params.set('minAge', String(filters.minAge));
    if (filters?.maxAge) params.set('maxAge', String(filters.maxAge));
    if (filters?.gender) params.set('gender', filters.gender);
    if (filters?.city) params.set('city', filters.city);
    if (filters?.ethnicity) params.set('ethnicity', filters.ethnicity);
    if (filters?.civilStatus) params.set('civilStatus', filters.civilStatus);
    if (filters?.education) params.set('education', filters.education);
    if (filters?.occupation) params.set('occupation', filters.occupation);
    if (filters?.memberId) params.set('memberId', filters.memberId);
    const qs = params.toString();
    return request<any>(`/profiles/public${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => request<any>(`/profile/public/${id}`),
};

