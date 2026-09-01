export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse' | 'shape'

const REQUEST_TIMEOUT_MS = 8000

export class ApiError extends Error {
  readonly status: number
  readonly kind: ApiErrorKind

  constructor(message: string, status: number, kind: ApiErrorKind) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.kind = kind
  }

  get isRetryable(): boolean {
    return this.kind !== 'http' || this.status >= 500
  }
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005'

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException
    ? error.name === 'AbortError'
    : error instanceof Error && error.name === 'AbortError'

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS)

  const callerSignal = init.signal
  const onCallerAbort = () => timeoutController.abort()
  callerSignal?.addEventListener('abort', onCallerAbort)

  const hasBody = init.body !== undefined

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: timeoutController.signal,
      headers: {
        Accept: 'application/json',
        // json-server silently stores an empty record when this is missing.
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })

    if (!response.ok) {
      throw new ApiError(
        `Request to ${path} failed with status ${response.status}`,
        response.status,
        'http'
      )
    }

    try {
      return (await response.json()) as T
    } catch {
      throw new ApiError(`Response from ${path} was not valid JSON`, response.status, 'parse')
    }
  } catch (error) {
    if (error instanceof ApiError) throw error

    if (isAbortError(error)) {
      // A caller-initiated abort is a cancellation, not a failure: rethrow it so
      // React Query discards the result instead of surfacing an error state.
      if (callerSignal?.aborted) throw error
      throw new ApiError(`Request to ${path} timed out`, 0, 'timeout')
    }

    throw new ApiError(`Could not reach the server`, 0, 'network')
  } finally {
    clearTimeout(timeoutId)
    callerSignal?.removeEventListener('abort', onCallerAbort)
  }
}
