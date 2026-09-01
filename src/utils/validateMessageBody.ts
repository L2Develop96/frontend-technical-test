export const MAX_MESSAGE_LENGTH = 2000

type ValidationResult =
  | { valid: true; value: string }
  | { valid: false; reason: 'empty' | 'too-long' }

export function validateMessageBody(input: string): ValidationResult {
  const value = input.trim()

  if (value.length === 0) return { valid: false, reason: 'empty' }
  if (value.length > MAX_MESSAGE_LENGTH) return { valid: false, reason: 'too-long' }

  return { valid: true, value }
}
