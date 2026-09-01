import { ApiError } from './client'
import type { Conversation } from '../../types/conversation'
import type { Message } from '../../types/message'
import type { User } from '../../types/user'

type Guard<T> = (value: unknown) => value is T

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

export const isConversation = (value: unknown): value is Conversation =>
  isRecord(value) &&
  isNumber(value.id) &&
  isNumber(value.senderId) &&
  isNumber(value.recipientId) &&
  typeof value.senderNickname === 'string' &&
  typeof value.recipientNickname === 'string' &&
  isNumber(value.lastMessageTimestamp)

export const isMessage = (value: unknown): value is Message =>
  isRecord(value) &&
  isNumber(value.id) &&
  isNumber(value.conversationId) &&
  isNumber(value.authorId) &&
  isNumber(value.timestamp) &&
  typeof value.body === 'string'

export const isUser = (value: unknown): value is User =>
  isRecord(value) && isNumber(value.id) && typeof value.nickname === 'string'

const warn = (message: string) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[api] ${message}`)
  }
}

// A single malformed row should degrade that row, not blank the whole screen.
export function parseList<T>(raw: unknown, guard: Guard<T>, label: string): T[] {
  if (!Array.isArray(raw)) {
    throw new ApiError(`Expected a list of ${label}`, 0, 'shape')
  }

  const valid = raw.filter(guard)

  if (valid.length !== raw.length) {
    warn(`Dropped ${raw.length - valid.length} malformed ${label} entries`)
  }

  return valid
}

// Single-resource routes are rewritten to filtered list queries, so they answer
// with an array and a miss is an empty array with a 200 rather than a 404.
export function parseOne<T>(raw: unknown, guard: Guard<T>, label: string): T {
  if (!Array.isArray(raw)) {
    if (guard(raw)) return raw
    throw new ApiError(`Expected ${label}`, 0, 'shape')
  }

  if (raw.length === 0) {
    throw new ApiError(`${label} not found`, 404, 'http')
  }

  if (raw.length > 1) {
    warn(`Expected a single ${label} but received ${raw.length}; using the first`)
  }

  const [first] = raw
  if (!guard(first)) {
    throw new ApiError(`Malformed ${label} received`, 0, 'shape')
  }

  return first
}

export function parseCreated<T>(raw: unknown, guard: Guard<T>, label: string): T {
  if (!guard(raw)) {
    throw new ApiError(`Malformed ${label} returned after creation`, 0, 'shape')
  }
  return raw
}
