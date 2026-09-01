import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api/client'

const MAX_RETRIES = 3

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (error instanceof ApiError && !error.isRetryable) return false
          return failureCount < MAX_RETRIES
        },
        retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000),
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        // Sends are never retried automatically: json-server has no idempotency
        // key, so replaying a request that already succeeded would duplicate the
        // message. Failures surface a manual retry instead.
        retry: false,
      },
    },
  })
}
