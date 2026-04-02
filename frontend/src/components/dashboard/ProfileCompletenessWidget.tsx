'use client';

import { useEffect, useState } from 'react';
import { profileApi } from '@/services/api';

interface Field { label: string; key: string; weight: number }

const FIELDS: Field[] = [
  { label: 'Name', key: 'name', weight: 5 },
  { label: 'Date of Birth', key: 'dateOfBirth', weight: 5 },
  { label: 'Gender', key: 'gender', weight: 5 },
  { label: 'Country', key: 'country', weight: 4 },
  { label: 'City', key: 'city', weight: 4 },
  { label: 'Education', key: 'education', weight: 4 },
  { label: 'Occupation', key: 'occupation', weight: 4 },
  { label: 'Civil Status', key: 'civilStatus', weight: 3 },
  { label: 'Height', key: 'height', weight: 3 },
  { label: 'Ethnicity', key: 'ethnicity', weight: 3 },
  { label: 'About Me', key: 'aboutUs', weight: 5 },
  { label: 'Expectations', key: 'expectations', weight: 4 },
  { label: 'Family Status', key: 'familyStatus', weight: 2 },
  { label: 'Annual Income', key: 'annualIncome', weight: 2 },
  { label: 'Age Preference', key: 'minAgePreference', weight: 2 },
  { label: 'Country Preference', key: 'countryPreference', weight: 2 },
  { label: 'Phone', key: 'phone', weight: 3 },
];

function calcScore(profile: any): { score: number; missing: Field[] } {
  const totalWeight = FIELDS.reduce((s, f) => s + f.weight, 0);
  let earned = 0;
  const missing: Field[] = [];
  for (const f of FIELDS) {
    const val = profile[f.key];
    if (val !== null && val !== undefined && val !== '') {
      earned += f.weight;
    } else {
      missing.push(f);
    }
  }
  return { score: Math.round((earned / totalWeight) * 100), missing };
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10B981' : score >= 50 ? '#D4A843' : '#EF4444';
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
      <circle
        cx="48" cy="48" r={radius} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="48" y="53" textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>{score}%</text>
    </svg>
  );
}

export default function ProfileCompletenessWidget() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi.getMyProfiles()
      .then(res => setProfile((res.data ?? [])[0] ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !profile) return null;

  const { score, missing } = calcScore(profile);
  if (score >= 95) return null; // hide when nearly perfect

  const topMissing = missing.sort((a, b) => b.weight - a.weight).slice(0, 4);
  const color = score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500';
  const bgColor = score >= 80 ? 'bg-emerald-50 border-emerald-100' : score >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100';

  return (
    <div className={`rounded-2xl border p-5 mb-6 ${bgColor}`}>
      <div className="flex items-center gap-5">
        <ScoreRing score={score} />
        <div className="flex-1 min-w-0">
          <h2 className={`font-bold text-base ${color}`}>Profile {score >= 80 ? 'Looking Great!' : score >= 50 ? 'Almost There!' : 'Needs Attention'}</h2>
          <p className="text-xs text-gray-500 mt-0.5">Your profile is {score}% complete. {score < 80 ? 'Complete it to get more visibility and better matches.' : 'Just a few more fields to go!'}</p>

          {topMissing.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Missing fields:</p>
              <div className="flex flex-wrap gap-1.5">
                {topMissing.map(f => (
                  <span key={f.key} className="text-[11px] bg-white/70 border border-white px-2 py-0.5 rounded-full text-gray-600 font-medium">
                    {f.label}
                  </span>
                ))}
                {missing.length > 4 && (
                  <span className="text-[11px] text-gray-400 px-2 py-0.5">+{missing.length - 4} more</span>
                )}
              </div>
            </div>
          )}
        </div>
        <a
          href="/dashboard/profiles"
          className="shrink-0 text-xs font-semibold bg-[#1C3B35] text-white px-4 py-2 rounded-xl hover:bg-[#15302a] transition"
        >
          Complete →
        </a>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: score >= 80 ? '#10B981' : score >= 50 ? '#D4A843' : '#EF4444' }}
        />
      </div>
    </div>
  );
}
