/**
 * matchScore.ts
 * Pure function — no API calls.
 * Scores how well `candidate` matches `viewer`'s preferences (0–100).
 *
 * Criteria          Max pts  Logic
 * ──────────────    ───────  ─────────────────────────────────
 * Age fit           30       candidate age ∈ viewer's [minAge, maxAge]
 *                            viewer age ∈ candidate's [minAge, maxAge]  (15 pts each)
 * Gender opposite   20       candidate.gender ≠ viewer.gender
 * Country match     20       viewer.countryPreference matches candidate.country
 * City match        15       same city (bonus)
 * Height fit        10       candidate.height ≥ viewer.minHeightPreference
 * Education match    5       same education level (soft)
 */

export interface MatchProfile {
  gender?: string;
  dateOfBirth?: string;
  height?: number;
  city?: string;
  country?: string;
  education?: string;
  minAgePreference?: number | null;
  maxAgePreference?: number | null;
  minHeightPreference?: number | null;
  countryPreference?: string | null;
}

function calcAge(dob?: string): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
}

export function calcMatchScore(viewer: MatchProfile, candidate: MatchProfile): number {
  let score = 0;

  const viewerAge = calcAge(viewer.dateOfBirth);
  const candidateAge = calcAge(candidate.dateOfBirth);

  // ── Age fit (30 pts total) ──────────────────────────────
  // Part A: candidate age within viewer's preference (15 pts)
  if (candidateAge !== null) {
    const min = viewer.minAgePreference;
    const max = viewer.maxAgePreference;
    if (min && max) {
      if (candidateAge >= min && candidateAge <= max) score += 15;
      else if (candidateAge >= min - 2 && candidateAge <= max + 2) score += 8; // close match
    } else {
      score += 10; // no preference = neutral bonus
    }
  }

  // Part B: viewer age within candidate's preference (15 pts)
  if (viewerAge !== null) {
    const min = candidate.minAgePreference;
    const max = candidate.maxAgePreference;
    if (min && max) {
      if (viewerAge >= min && viewerAge <= max) score += 15;
      else if (viewerAge >= min - 2 && viewerAge <= max + 2) score += 8;
    } else {
      score += 10;
    }
  }

  // ── Gender opposite (20 pts) ────────────────────────────
  if (viewer.gender && candidate.gender && viewer.gender !== candidate.gender) {
    score += 20;
  }

  // ── Country preference (20 pts) ────────────────────────
  if (viewer.countryPreference && candidate.country) {
    if (viewer.countryPreference.toLowerCase() === candidate.country.toLowerCase()) {
      score += 20;
    }
  } else if (!viewer.countryPreference) {
    score += 12; // no preference = partial bonus
  }

  // ── City match (15 pts) ────────────────────────────────
  if (viewer.city && candidate.city &&
      viewer.city.toLowerCase() === candidate.city.toLowerCase()) {
    score += 15;
  }

  // ── Height fit (10 pts) ────────────────────────────────
  if (viewer.minHeightPreference && candidate.height) {
    if (candidate.height >= viewer.minHeightPreference) score += 10;
    else if (candidate.height >= viewer.minHeightPreference - 5) score += 5;
  } else if (!viewer.minHeightPreference) {
    score += 7; // no preference = partial bonus
  }

  // ── Education match (5 pts) ───────────────────────────
  if (viewer.education && candidate.education &&
      viewer.education.toLowerCase() === candidate.education.toLowerCase()) {
    score += 5;
  }

  // Cap at 100
  return Math.min(100, Math.round(score));
}

/** Returns a color and label for the score */
export function matchLabel(score: number): { color: string; bg: string; label: string } {
  if (score >= 80) return { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Excellent Match' };
  if (score >= 60) return { color: 'text-[#1C3B35]', bg: 'bg-[#EAF2EE] border-[#1C3B35]/20', label: 'Good Match' };
  if (score >= 40) return { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Possible Match' };
  return { color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', label: 'Low Match' };
}
