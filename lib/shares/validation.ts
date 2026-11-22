export const MAX_AUDIO_UPLOAD_BYTES = 5 * 1024 * 1024 // 5 MB

const SHORT_ID_REGEX = /^[A-Za-z0-9_-]{4,32}$/
const ALLOWED_EVENT_TYPES = new Set(['preview_view', 'tap', 'reshare', 'cta_click'])

/**
 * Validates that a URL uses http: or https: (blocks javascript:, data:, file:, etc.).
 */
export function parseSafeHttpUrl(raw: string): URL | null {
  try {
    const parsed = new URL(raw.trim())
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function isValidShortId(shortId: string): boolean {
  return SHORT_ID_REGEX.test(shortId)
}

export function isAllowedEventType(
  value: unknown
): value is 'preview_view' | 'tap' | 'reshare' | 'cta_click' {
  return typeof value === 'string' && ALLOWED_EVENT_TYPES.has(value)
}

/**
 * Prevents SSRF by only allowing existing audio URLs from our own /previews/ path
 * or the configured R2_PUBLIC_URL origin.
 */
export function isAllowedExistingAudioUrl(raw: string): boolean {
  const trimmed = raw.trim()
  if (trimmed.startsWith('/previews/') || trimmed.startsWith('/voice-library/')) {
    return !trimmed.includes('..') && !trimmed.includes('\\')
  }

  const r2Public = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '')
  if (r2Public && trimmed.startsWith(`${r2Public}/`)) {
    const parsed = parseSafeHttpUrl(trimmed)
    return Boolean(parsed)
  }

  return false
}
