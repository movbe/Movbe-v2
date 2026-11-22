import { VideoService } from '@/lib/services/VideoService'

export interface VideoOEmbedMetadata {
  provider: 'movbe' | 'youtube' | 'vimeo' | 'loom' | 'other'
  title: string
  authorName: string
  thumbnailUrl: string | null
  embedUrl: string | null
  videoId: string | null
  duration?: number
}

function extractMovbeVideoId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl)
    const match = parsed.pathname.match(/^\/watch\/([^/]+)$/)
    if (match && match[1]) {
      return decodeURIComponent(match[1])
    }
  } catch {
    return null
  }
  return null
}

function extractYouTubeId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1).split('/')[0] || null
    }
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v')
      if (v) return v
      const parts = parsed.pathname.split('/').filter(Boolean)
      const idx = parts.findIndex(p => p === 'shorts' || p === 'embed' || p === 'live')
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
    }
  } catch {
    return null
  }
  return null
}

function detectProvider(rawUrl: string): VideoOEmbedMetadata['provider'] {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase()
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube'
    if (host.includes('vimeo.com')) return 'vimeo'
    if (host.includes('loom.com')) return 'loom'
  } catch {
    // ignore
  }
  return 'other'
}

/**
 * Fetches official oEmbed metadata & thumbnail URL without downloading/scraping third-party video bytes.
 */
export async function fetchVideoOEmbed(rawUrl: string): Promise<VideoOEmbedMetadata> {
  const movbeId = extractMovbeVideoId(rawUrl)
  if (movbeId) {
    try {
      const video = await new VideoService().getVideoById(movbeId)
      if (video) {
        return {
          provider: 'movbe',
          title: video.title || 'Video en Movbe',
          authorName: video.uploaderName || '',
          thumbnailUrl: video.thumbnailURL || null,
          embedUrl: null,
          videoId: movbeId,
          duration: video.duration,
        }
      }
    } catch {
      // Fall through to generic fallback if Firestore is unavailable
    }
    return {
      provider: 'movbe',
      title: 'Video en Movbe',
      authorName: '',
      thumbnailUrl: null,
      embedUrl: null,
      videoId: movbeId,
    }
  }

  const provider = detectProvider(rawUrl)
  const ytId = provider === 'youtube' ? extractYouTubeId(rawUrl) : null

  const oembedEndpoints: Record<string, string> = {
    youtube: `https://www.youtube.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`,
    vimeo: `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(rawUrl)}`,
    loom: `https://www.loom.com/v1/oembed?url=${encodeURIComponent(rawUrl)}`,
  }

  const endpoint = oembedEndpoints[provider]
  if (endpoint) {
    try {
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const data = (await res.json()) as {
          title?: string
          author_name?: string
          thumbnail_url?: string
        }
        return {
          provider,
          title: data.title || 'Video compartido con Movbe',
          authorName: data.author_name || '',
          thumbnailUrl:
            data.thumbnail_url || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null),
          embedUrl: ytId ? `https://www.youtube.com/embed/${ytId}` : null,
          videoId: ytId,
        }
      }
    } catch {
      // Fall through to deterministic fallback
    }
  }

  return {
    provider,
    title: 'Video compartido con Movbe',
    authorName: '',
    thumbnailUrl: ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null,
    embedUrl: ytId ? `https://www.youtube.com/embed/${ytId}` : null,
    videoId: ytId,
  }
}
