const LOCALE = 'fr-FR'

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
})

const dayFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
})

const dayWithYearFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const fullFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'full',
  timeStyle: 'short',
})

// The API stores seconds since epoch, Date expects milliseconds.
const toDate = (seconds: number): Date | null => {
  if (!Number.isFinite(seconds) || seconds < 0) return null
  const date = new Date(seconds * 1000)
  return Number.isNaN(date.getTime()) ? null : date
}

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export function formatRelativeDate(seconds: number, now: number = Date.now()): string {
  const date = toDate(seconds)
  if (!date) return ''

  const today = new Date(now)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameDay(date, today)) return `aujourd'hui à ${timeFormatter.format(date)}`
  if (isSameDay(date, yesterday)) return `hier à ${timeFormatter.format(date)}`

  return date.getFullYear() === today.getFullYear()
    ? dayFormatter.format(date)
    : dayWithYearFormatter.format(date)
}

export function formatTime(seconds: number): string {
  const date = toDate(seconds)
  return date ? timeFormatter.format(date) : ''
}

export function formatFullDate(seconds: number): string {
  const date = toDate(seconds)
  return date ? fullFormatter.format(date) : ''
}

export function toIsoString(seconds: number): string | undefined {
  const date = toDate(seconds)
  return date ? date.toISOString() : undefined
}
