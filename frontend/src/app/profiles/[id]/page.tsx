'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { publicProfilesApi } from '@/services/api';

/* ── helpers ─────────────────────────────────────────── */
const fmt = (val: any, suffix = '') =>
  val !== undefined && val !== null && val !== '' ? `${val}${suffix}` : '–';

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span
    className={`inline-block text-[11px] font-semibold font-poppins px-2.5 py-0.5 rounded-full ${color}`}
  >
    {label}
  </span>
);

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
    <h2 className="flex items-center gap-2 text-[15px] font-bold font-poppins text-[#1C3B35] mb-4">
      <span className="text-lg">{icon}</span>
      {title}
    </h2>
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0 gap-3">
    <span className="text-[13px] text-gray-400 font-poppins flex-shrink-0 min-w-[120px]">{label}</span>
    <span className="text-[13px] font-medium text-gray-800 font-poppins text-right">{value}</span>
  </div>
);

/* ── Avatar placeholder ───────────────────────────────── */
const AvatarPlaceholder = ({ gender }: { gender?: string }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="120" height="120" rx="60" fill={gender === 'FEMALE' ? '#FCE7F3' : '#DBEAFE'} />
    <ellipse cx="60" cy="48" rx="22" ry="22" fill={gender === 'FEMALE' ? '#F9A8D4' : '#93C5FD'} />
    <ellipse cx="60" cy="104" rx="36" ry="24" fill={gender === 'FEMALE' ? '#F9A8D4' : '#93C5FD'} />
  </svg>
);

/* ── Skeleton ─────────────────────────────────────────── */
const Skeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/3" />
    <div className="h-4 bg-gray-100 rounded w-1/2" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-40 bg-gray-100 rounded-2xl" />
      ))}
    </div>
  </div>
);

/* ── Decorative Islamic geometric corner ──────────────── */
const GeometricAccent = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="opacity-10">
    <path d="M40 0L52 28H80L57 45L66 73L40 56L14 73L23 45L0 28H28L40 0Z" fill="#DB9D30" />
  </svg>
);

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    publicProfilesApi
      .getById(id)
      .then((r) => setProfile(r.data))
      .catch(() => setError('Profile not found or no longer active.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChat = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('mn_token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    router.push(`/dashboard/chat?start=${id}&name=${encodeURIComponent(profile?.name ?? '')}`);
  };

  /* ── Error state ─────────────────────────────────────── */
  if (error) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-5xl">🔒</div>
        <h1 className="text-xl font-bold text-gray-700 font-poppins text-center">{error}</h1>
        <Link
          href="/profiles"
          className="bg-[#1C3B35] text-white font-poppins font-semibold text-[14px] px-8 py-3 rounded-full hover:bg-[#15302a] transition"
        >
          ← Back to Profiles
        </Link>
      </main>
    );
  }

  /* ── Loading state ───────────────────────────────────── */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton />
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const isVip = profile.isVip;
  const joinedDays = Math.floor(
    (Date.now() - new Date(profile.createdAt).getTime()) / 86400000
  );

  return (
    <>
      {/* ── SEO head title ─────────────────────────────── */}
      <title>{`${profile.name ?? 'Profile'} | Muslim Metromony New`}</title>

      <main className="min-h-screen bg-[#F8F9FA] pt-24 pb-20">

        {/* ── Hero banner ─────────────────────────────── */}
        <div
          className={`relative overflow-hidden ${
            isVip
              ? 'bg-gradient-to-br from-[#1C3B35] via-[#294d42] to-[#1C3B35]'
              : 'bg-gradient-to-br from-[#1C3B35] to-[#2a5247]'
          }`}
        >
          {/* Decorative accents */}
          <div className="absolute top-0 right-0 rotate-45 translate-x-8 -translate-y-8">
            <GeometricAccent />
          </div>
          <div className="absolute bottom-0 left-0 -rotate-12 -translate-x-4 translate-y-4">
            <GeometricAccent />
          </div>
          {isVip && (
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#E8BE1A] via-[#DB9D30] to-[#E8BE1A]" />
          )}

          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-10 relative z-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden ring-4 ${
                  isVip ? 'ring-[#DB9D30]' : 'ring-white/30'
                } shadow-2xl`}
              >
                <AvatarPlaceholder gender={profile.gender} />
              </div>
              {isVip && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#E8BE1A] to-[#DB9D30] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-lg tracking-widest font-poppins">
                  ✦ VIP
                </div>
              )}
            </div>

            {/* Name / meta */}
            <div className="flex-1 text-center sm:text-left pb-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                {profile.memberId && (
                  <span className="text-[10px] font-mono font-bold text-[#DB9D30]/90 bg-white/10 px-2 py-0.5 rounded-full tracking-widest border border-white/20">
                    🪪 {profile.memberId}
                  </span>
                )}
                {isVip && (
                  <span className="text-[10px] font-extrabold text-[#E8BE1A] bg-[#E8BE1A]/15 px-2 py-0.5 rounded-full border border-[#E8BE1A]/30 tracking-wider font-poppins">
                    ✦ VIP BOOSTED
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white font-poppins leading-tight">
                {profile.name}
                {profile._meta?.nameIsNickname && (
                  <span className="ml-2 text-[12px] text-white/50 font-normal">(nickname)</span>
                )}
              </h1>

              <p className="text-white/70 font-poppins text-[14px] mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
                {profile.age && <span>🎂 {profile.age} years</span>}
                {profile.city && <span>📍 {profile.city}{profile.country ? `, ${profile.country}` : ''}</span>}
                {profile.gender && <span>{profile.gender === 'MALE' ? '♂' : '♀'} {profile.gender === 'MALE' ? 'Male' : 'Female'}</span>}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                <span className="text-[12px] text-white/60 font-poppins">
                  👁 {(profile.viewCount ?? 0).toLocaleString()} views
                </span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className="text-[12px] text-white/60 font-poppins">
                  🕐 Joined {joinedDays} days ago
                </span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 pb-2 flex-shrink-0">
              <Link
                href="/profiles"
                className="flex items-center gap-1.5 border border-white/30 text-white/80 hover:text-white hover:border-white/60 text-[13px] font-semibold font-poppins px-4 py-2.5 rounded-xl transition"
              >
                ← Back
              </Link>
              <button
                onClick={handleChat}
                className="flex items-center gap-2 bg-[#DB9D30] hover:bg-[#c98b26] text-white text-[13px] font-bold font-poppins px-5 py-2.5 rounded-xl transition shadow-lg shadow-[#DB9D30]/30"
              >
                💬 Send Interest
              </button>
            </div>
          </div>
        </div>

        {/* ── Body content ─────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left column — quick summary card */}
          <div className="lg:col-span-1 space-y-5">
            <SectionCard title="Quick Summary" icon="📋">
              <InfoRow label="Age" value={fmt(profile.age, ' years')} />
              <InfoRow label="Height" value={profile.height ? `${profile.height} cm` : '–'} />
              <InfoRow label="Weight" value={profile.weight ? `${profile.weight} kg` : '–'} />
              <InfoRow label="Civil Status" value={fmt(profile.civilStatus)} />
              <InfoRow label="Children" value={fmt(profile.children)} />
              <InfoRow label="Complexion" value={fmt(profile.complexion)} />
              <InfoRow label="Appearance" value={fmt(profile.appearance)} />
              <InfoRow label="Dress Code" value={fmt(profile.dressCode)} />
              <InfoRow label="Ethnicity" value={fmt(profile.ethnicity)} />
            </SectionCard>

            {/* Location */}
            <SectionCard title="Location" icon="🌍">
              <InfoRow label="Country" value={fmt(profile.country)} />
              <InfoRow label="City" value={fmt(profile.city)} />
            </SectionCard>
          </div>

          {/* Right column — detail sections */}
          <div className="lg:col-span-2 space-y-5">

            {/* About */}
            {profile.aboutUs && (
              <SectionCard title="About" icon="✨">
                <p className="text-[13.5px] text-gray-600 font-poppins leading-relaxed whitespace-pre-wrap">
                  {profile.aboutUs}
                </p>
              </SectionCard>
            )}

            {/* Partner Expectations */}
            {profile.expectations && (
              <SectionCard title="Looking For" icon="🤝">
                <p className="text-[13.5px] text-gray-600 font-poppins leading-relaxed whitespace-pre-wrap">
                  {profile.expectations}
                </p>
              </SectionCard>
            )}

            {/* Education & Career */}
            <SectionCard title="Education & Career" icon="🎓">
              <InfoRow label="Education" value={fmt(profile.education)} />
              <InfoRow label="Occupation" value={fmt(profile.occupation)} />
              <InfoRow label="Annual Income" value={fmt(profile.annualIncome)} />
            </SectionCard>

            {/* Family */}
            <SectionCard title="Family Background" icon="👨‍👩‍👧‍👦">
              <InfoRow label="Family Status" value={fmt(profile.familyStatus)} />
              <InfoRow label="Father's Occupation" value={fmt(profile.fatherOccupation)} />
              <InfoRow label="Mother's Occupation" value={fmt(profile.motherOccupation)} />
              <InfoRow label="Siblings" value={profile.siblings != null ? String(profile.siblings) : '–'} />
            </SectionCard>

            {/* Partner Preferences */}
            <SectionCard title="Partner Preferences" icon="💑">
              <InfoRow
                label="Age Range"
                value={
                  profile.minAgePreference && profile.maxAgePreference
                    ? `${profile.minAgePreference} – ${profile.maxAgePreference} years`
                    : '–'
                }
              />
              <InfoRow label="Country Preference" value={fmt(profile.countryPreference)} />
            </SectionCard>

            {/* CTA card */}
            <div className="bg-gradient-to-br from-[#1C3B35] to-[#2a5247] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex-1">
                <p className="text-white font-bold font-poppins text-[16px]">
                  Interested in {profile.name}?
                </p>
                <p className="text-white/60 font-poppins text-[13px] mt-1">
                  Send an interest message and start your journey together.
                </p>
              </div>
              <button
                onClick={handleChat}
                className="flex-shrink-0 bg-[#DB9D30] hover:bg-[#c98b26] text-white font-bold font-poppins text-[14px] px-7 py-3 rounded-xl transition shadow-lg"
              >
                💬 Send Interest
              </button>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
