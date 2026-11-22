export interface VideoOEmbedMetadata {
  provider: 'youtube' | 'vimeo' | 'loom' | 'other'
  title: string
  authorName: string
  thumbnailUrl: string | null
  embedUrl: string | null
  videoId: string | null
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
      const idx = parts.findIndex((p) => p === 'shorts' || p === 'embed' || p === 'live')
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
            data.thumbnail_url ||
            (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null),
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
