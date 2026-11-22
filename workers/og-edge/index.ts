/**
 * Cloudflare Worker — Edge Open Graph Delivery (/p/:shortId)
 * Serves User-Agent-aware OG meta tags in <50ms from Cloudflare KV.
 */
interface Env {
  MANIFESTS_KV: {
    get(key: string, type: 'json'): Promise<ShareManifest | null>
  }
  APP_ORIGIN: string
}

interface ShareManifest {
  shortId: string
  title: string
  description: string
  originalUrl: string
  audioUrl?: string
  assets: {
    webp?: string
    mp4?: string
    gif?: string
    jpgWaveform?: string
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const ogEdgeWorker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const shortId = url.pathname.split('/').pop() || ''
    if (!/^[A-Za-z0-9_-]{4,32}$/.test(shortId)) {
      return new Response('Invalid share ID', { status: 400 })
    }

    const manifest = await env.MANIFESTS_KV.get(shortId, 'json')
    if (!manifest) {
      return new Response('Share not found', { status: 404 })
    }

    const ua = request.headers.get('user-agent') || ''
    const isWhatsApp = /WhatsApp/i.test(ua)
    const isTelegramOrApple = /TelegramBot|iMessage|Applebot|Twitterbot/i.test(ua)

    const ogImage = isWhatsApp
      ? manifest.assets.gif || manifest.assets.jpgWaveform || ''
      : isTelegramOrApple
        ? manifest.assets.webp || manifest.assets.jpgWaveform || ''
        : manifest.assets.jpgWaveform || manifest.assets.gif || ''

    const tapUrl = `${env.APP_ORIGIN.replace(/\/+$/, '')}/v/${shortId}`

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(manifest.title)} — Movbe</title>
  <meta property="og:title" content="${escapeHtml(manifest.title)}" />
  <meta property="og:description" content="${escapeHtml(manifest.description)}" />
  <meta property="og:type" content="video.other" />
  <meta property="og:url" content="${escapeHtml(request.url)}" />
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ''}
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />
  ${manifest.assets.mp4 ? `<meta property="og:video" content="${escapeHtml(manifest.assets.mp4)}" />` : ''}
  <meta property="og:video:type" content="video/mp4" />
  <meta name="twitter:card" content="player" />
  <meta name="twitter:player" content="${escapeHtml(tapUrl)}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(tapUrl)}" />
</head>
<body>
  <script>window.location.replace(${JSON.stringify(tapUrl).replace(/</g, '\\u003c')});</script>
</body>
</html>`

    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    })
  },
}

export default ogEdgeWorker
