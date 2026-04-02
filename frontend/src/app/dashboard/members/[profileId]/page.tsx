'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import PhotoGallery from '@/components/profiles/PhotoGallery';
import { profileApi, interestApi, profileViewApi, blockApi } from '@/services/api';
import { calcMatchScore, matchLabel } from '@/lib/matchScore';

function calcAge(dob?: string) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-700 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function ProfileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const profileId = params.profileId as string;
  const viewerProfileId = searchParams.get('viewer') ?? '';

  const [profile, setProfile] = useState<any>(null);
  const [viewerProfile, setViewerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interest state
  const [interestStatus, setInterestStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED' | 'DECLINED'>('NONE');
  const [interestId, setInterestId] = useState<string | null>(null);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [interestMsg, setInterestMsg] = useState('');
  const [showMsgBox, setShowMsgBox] = useState(false);

  // Block / Report state
  const [isBlocked, setIsBlocked] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Shortlist state
  const [shortlisted, setShortlisted] = useState(false);
  const [togglingShortlist, setTogglingShortlist] = useState(false);

  // Load profile
  useEffect(() => {
    if (!profileId) return;
    const token = localStorage.getItem('mn_token');
    const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api';

    if (viewerProfileId) {
      fetch(`${BASE}/profile/list/${viewerProfileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          const found = (data.data ?? []).find((p: any) => p.id === profileId);
          if (found) setProfile(found);
          else setError('Profile not found or not visible to you');
        })
        .catch(() => setError('Failed to load profile'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setError('No viewer profile selected');
    }
  }, [profileId, viewerProfileId]);

  // Load viewer's own profile (for match score computation)
  useEffect(() => {
    if (!viewerProfileId) return;
    profileApi.getMyProfiles()
      .then(res => {
        const all = res.data ?? [];
        const own = all.find((p: any) => p.id === viewerProfileId) ?? all[0] ?? null;
        setViewerProfile(own);
      })
      .catch(() => {});
  }, [viewerProfileId]);

  // Track view + load interest/shortlist state
  useEffect(() => {
    if (!viewerProfileId || !profileId || viewerProfileId === profileId) return;

    // Record view (fire-and-forget)
    profileViewApi.record(viewerProfileId, profileId).catch(() => {});

    // Check existing interest
    interestApi.check(viewerProfileId, profileId)
      .then(res => {
        if (res.data) {
          setInterestStatus(res.data.status);
          setInterestId(res.data.id);
        }
      })
      .catch(() => {});

    // Check if shortlisted
    profileApi.getShortlists(viewerProfileId)
      .then(res => {
        const isShortlisted = (res.data ?? []).some((s: any) => s.targetProfile?.id === profileId);
        setShortlisted(isShortlisted);
      })
      .catch(() => {});

    // Check if blocked
    blockApi.check(viewerProfileId, profileId)
      .then(res => setIsBlocked(res.isBlocked ?? false))
      .catch(() => {});
  }, [viewerProfileId, profileId]);

  const sendInterest = useCallback(async () => {
    if (!viewerProfileId) return;
    setSendingInterest(true);
    try {
      const res = await interestApi.send(viewerProfileId, profileId, interestMsg || undefined);
      setInterestStatus('PENDING');
      setInterestId(res.data?.id ?? null);
      setShowMsgBox(false);
      setInterestMsg('');
    } catch (e: any) {
      alert(e?.message ?? 'Failed to send interest');
    }
    setSendingInterest(false);
  }, [viewerProfileId, profileId, interestMsg]);

  const withdrawInterest = useCallback(async () => {
    if (!viewerProfileId) return;
    setSendingInterest(true);
    try {
      await interestApi.withdraw(viewerProfileId, profileId);
      setInterestStatus('NONE');
      setInterestId(null);
    } catch { /* silent */ }
    setSendingInterest(false);
  }, [viewerProfileId, profileId]);

  const toggleBlock = useCallback(async () => {
    if (!viewerProfileId) return;
    setBlocking(true);
    try {
      if (isBlocked) {
        await blockApi.unblock(viewerProfileId, profileId);
        setIsBlocked(false);
      } else {
        await blockApi.block(viewerProfileId, profileId);
        setIsBlocked(true);
      }
    } catch { /* silent */ }
    setBlocking(false);
  }, [viewerProfileId, profileId, isBlocked]);

  const submitReport = useCallback(async () => {
    if (!viewerProfileId || !reportReason) return;
    setSubmittingReport(true);
    try {
      await blockApi.report(viewerProfileId, profileId, reportReason, reportDetails || undefined);
      setReportSuccess(true);
      setTimeout(() => { setShowReportModal(false); setReportSuccess(false); setReportReason(''); setReportDetails(''); }, 2000);
    } catch (e: any) {
      alert(e?.message ?? 'Failed to submit report');
    }
    setSubmittingReport(false);
  }, [viewerProfileId, profileId, reportReason, reportDetails]);

  const toggleShortlist = useCallback(async () => {
    if (!viewerProfileId) return;
    setTogglingShortlist(true);
    const prev = shortlisted;
    setShortlisted(!prev);
    try {
      await profileApi.toggleShortlist(viewerProfileId, profileId);
    } catch {
      setShortlisted(prev); // rollback
    }
    setTogglingShortlist(false);
  }, [viewerProfileId, profileId, shortlisted]);

  const age = calcAge(profile?.dateOfBirth);
  const initials = profile?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#1C3B35', '#2d6a4f', '#355E3B', '#1B4332', '#0f3460'];
  const color = profile ? colors[profile.id?.charCodeAt(0) % colors.length] : '#1C3B35';

  const interestBtnConfig = {
    NONE:     { label: '💌 Send Interest', cls: 'bg-rose-500 hover:bg-rose-600 text-white', action: () => setShowMsgBox(true) },
    PENDING:  { label: '⏳ Interest Sent', cls: 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100', action: withdrawInterest },
    ACCEPTED: { label: '✅ Interest Accepted', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default', action: () => {} },
    DECLINED: { label: '❌ Interest Declined', cls: 'bg-red-50 text-red-500 border border-red-200 cursor-default', action: () => {} },
  }[interestStatus];

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>Loading...
    </div>
  );

  if (error || !profile) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-600 space-y-3">
      <p className="font-semibold">{error || 'Profile not found'}</p>
      <button onClick={() => router.back()} className="text-sm text-gray-500 underline">Go back</button>
    </div>
  );

  return (
    <div className="font-poppins space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Members
      </button>

      {/* Profile hero */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="h-32 md:h-44" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }} />

        {/* Avatar + basic info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-10 mb-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl border-4 border-white flex-shrink-0" style={{ background: color }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {profile.memberId && <span className="text-xs text-gray-400 font-mono">{profile.memberId}</span>}
                    {age && <span className="text-xs text-gray-400">{age} years old</span>}
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Active</span>
                    {profile._meta?.contactVisible && (
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">Contact Visible</span>
                    )}
                    {/* Match % badge */}
                    {viewerProfile && profile && viewerProfileId !== profileId && (() => {
                      const score = calcMatchScore(viewerProfile, profile);
                      const { color, bg, label } = matchLabel(score);
                      return (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${bg} ${color} flex items-center gap-1`}>
                          ✦ {score}% {label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Shortlist toggle */}
                  {viewerProfileId && (
                    <button
                      disabled={togglingShortlist}
                      onClick={toggleShortlist}
                      title={shortlisted ? 'Remove from saved matches' : 'Save to shortlist'}
                      className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 border ${
                        shortlisted
                          ? 'bg-[#D4A843] text-white border-[#D4A843] hover:bg-[#c49a33]'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-[#D4A843]/10 hover:text-[#D4A843] hover:border-[#D4A843]'
                      } disabled:opacity-50`}
                    >
                      <svg className="w-4 h-4" fill={shortlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {shortlisted ? 'Saved' : 'Save'}
                    </button>
                  )}

                  {/* Interest button */}
                  {viewerProfileId && (
                    <button
                      disabled={sendingInterest || interestStatus === 'ACCEPTED' || interestStatus === 'DECLINED'}
                      onClick={interestBtnConfig.action}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 disabled:opacity-50 ${interestBtnConfig.cls}`}
                    >
                      {sendingInterest ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : interestBtnConfig.label}
                    </button>
                  )}

                  {/* Message button */}
                  <button
                    onClick={() => router.push(`/dashboard/chat?start=${profile.id}&name=${encodeURIComponent(profile.name)}`)}
                    className="bg-[#1C3B35] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#15302a] transition flex items-center gap-1.5 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Message
                  </button>

                  {/* Block button */}
                  {viewerProfileId && (
                    <button
                      disabled={blocking}
                      onClick={toggleBlock}
                      title={isBlocked ? 'Unblock this profile' : 'Block this profile'}
                      className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition border disabled:opacity-50 ${
                        isBlocked
                          ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-700'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {isBlocked ? '🚫 Blocked' : '🚫 Block'}
                    </button>
                  )}

                  {/* Report button */}
                  {viewerProfileId && (
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="px-3 py-2.5 rounded-xl text-sm font-semibold transition border bg-white text-red-400 border-red-200 hover:bg-red-50"
                    >
                      ⚑ Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                {reportSuccess ? (
                  <div className="text-center py-4">
                    <span className="text-4xl">✅</span>
                    <p className="mt-3 font-bold text-gray-800">Report Submitted</p>
                    <p className="text-sm text-gray-400 mt-1">Our team will review it shortly.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-800">⚑ Report Profile</p>
                      <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason</p>
                      {['Fake profile', 'Inappropriate content', 'Harassment', 'Spam', 'Other'].map(r => (
                        <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio" name="reason" value={r}
                            checked={reportReason === r}
                            onChange={() => setReportReason(r)}
                            className="accent-red-500"
                          />
                          <span className="text-sm text-gray-700">{r}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      placeholder="Additional details (optional)..."
                      rows={3}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        disabled={!reportReason || submittingReport}
                        onClick={submitReport}
                        className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition disabled:opacity-40"
                      >
                        {submittingReport ? 'Submitting...' : 'Submit Report'}
                      </button>
                      <button onClick={() => setShowReportModal(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Interest message box */}
          {showMsgBox && (
            <div className="mb-4 bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-rose-700">💌 Send Interest to {profile.name}</p>
              <textarea
                value={interestMsg}
                onChange={e => setInterestMsg(e.target.value)}
                placeholder="Add a short message (optional)..."
                rows={3}
                className="w-full text-sm border border-rose-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none bg-white"
              />
              <div className="flex gap-2">
                <button
                  disabled={sendingInterest}
                  onClick={sendInterest}
                  className="bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 transition disabled:opacity-50"
                >
                  {sendingInterest ? 'Sending...' : 'Send Interest'}
                </button>
                <button
                  onClick={() => { setShowMsgBox(false); setInterestMsg(''); }}
                  className="text-gray-500 px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* About */}
          {profile.aboutUs && (
            <div className="bg-[#F4F6F9] rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About</p>
              <p className="text-sm text-gray-600 leading-relaxed">{profile.aboutUs}</p>
            </div>
          )}

          {/* Expectations */}
          {profile.expectations && (
            <div className="bg-[#F4F6F9] rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Expectations</p>
              <p className="text-sm text-gray-600 leading-relaxed">{profile.expectations}</p>
            </div>
          )}

          {/* Private Photo Gallery */}
          <PhotoGallery targetProfileId={profile.id} photos={profile.photos || []} accessStatus={profile._meta?.photoAccessStatus} />
        </div>
      </div>

      {/* Details grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Personal */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#1C3B35]/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-[#1C3B35]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            Personal Details
          </h2>
          <InfoRow label="Gender" value={profile.gender === 'MALE' ? 'Male' : 'Female'} />
          <InfoRow label="Age" value={age ? `${age} years` : null} />
          <InfoRow label="Height" value={profile.height ? `${profile.height} cm` : null} />
          <InfoRow label="Civil Status" value={profile.civilStatus} />
          <InfoRow label="Ethnicity" value={profile.ethnicity} />
          <InfoRow label="Complexion" value={profile.complexion} />
        </div>

        {/* Location & Education */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#1C3B35]/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-[#1C3B35]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            Location &amp; Education
          </h2>
          <InfoRow label="Country" value={profile.country} />
          <InfoRow label="City" value={profile.city} />
          <InfoRow label="Education" value={profile.education} />
          <InfoRow label="Occupation" value={profile.occupation} />
          <InfoRow label="Annual Income" value={profile.annualIncome} />
        </div>

        {/* Family */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#1C3B35]/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-[#1C3B35]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            Family Background
          </h2>
          <InfoRow label="Family Status" value={profile.familyStatus} />
          <InfoRow label="Father's Occupation" value={profile.fatherOccupation} />
          <InfoRow label="Mother's Occupation" value={profile.motherOccupation} />
          <InfoRow label="Siblings" value={profile.siblings !== null ? profile.siblings : null} />
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#1C3B35]/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-[#1C3B35]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </span>
            Partner Preferences
          </h2>
          <InfoRow label="Age Range" value={profile.minAgePreference && profile.maxAgePreference ? `${profile.minAgePreference} – ${profile.maxAgePreference} yrs` : null} />
          <InfoRow label="Min Height" value={profile.minHeightPreference ? `${profile.minHeightPreference} cm` : null} />
          <InfoRow label="Country Preference" value={profile.countryPreference} />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#1C3B35] to-[#2d6a4f] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-lg">Interested in {profile.name}?</p>
          <p className="text-white/70 text-sm mt-0.5">Send an interest or start a conversation</p>
        </div>
        <div className="flex gap-3">
          {viewerProfileId && interestStatus === 'NONE' && (
            <button
              onClick={() => setShowMsgBox(true)}
              className="bg-rose-500 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-rose-600 transition flex items-center gap-2">
              💌 Send Interest
            </button>
          )}
          <button
            onClick={() => router.push(`/dashboard/chat?start=${profile.id}&name=${encodeURIComponent(profile.name)}`)}
            className="bg-[#D4A843] text-[#1C3B35] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#c49a33] transition flex items-center gap-2 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
}
