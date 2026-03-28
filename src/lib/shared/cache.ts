/** Named staleTime constants for React Query cache configuration */
export const STALE_TIME = {
  /** 30s — near-real-time data (notification count, request count) */
  FAST: 30 * 1000,
  /** 5min — standard for most queries */
  STANDARD: 5 * 60 * 1000,
  /** 10min — rarely changing data (platform stats, browse catalog) */
  SLOW: 10 * 60 * 1000,
} as const
