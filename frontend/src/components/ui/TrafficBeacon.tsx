'use client';

import { useTrafficBeacon } from '@/hooks/useTrafficBeacon';

/**
 * Client component wrapper that lives in the root layout.
 * Activates the traffic beacon on every page without making
 * the root layout itself a client component.
 */
export default function TrafficBeacon() {
  useTrafficBeacon();
  return null; // renders nothing
}
