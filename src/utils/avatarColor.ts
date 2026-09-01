const PALETTE_SIZE = 6

// FNV-1a: mixes the low bits well enough that short, similar nicknames do not
// collapse onto the same few colours.
function hash(value: string): number {
  let result = 0x811c9dc5

  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i)
    result = Math.imul(result, 0x01000193)
  }

  return result >>> 0
}

export function avatarColor(nickname: string): string {
  return `var(--avatar-${(hash(nickname) % PALETTE_SIZE) + 1})`
}

export function avatarInitial(nickname: string): string {
  const [first] = Array.from(nickname.trim())
  return (first ?? '?').toUpperCase()
}
