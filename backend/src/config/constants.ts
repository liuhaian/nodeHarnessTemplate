export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const CACHE_TTL_MS = {
  SHORT: 30_000,
  MEDIUM: 5 * 60_000,
  LONG: 60 * 60_000,
} as const;

export const API_PREFIX = '/api/v1';
