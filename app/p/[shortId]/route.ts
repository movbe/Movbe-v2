import { NextRequest, NextResponse } from 'next/server'

import { getShareByShortId, recordShareEvent } from '@/lib/shares/shareStore'
import { isValidShortId } from '@/lib/shares/validation'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toAbsoluteUrl(assetUrl: string | undefined, origin: string): string {
  if (!assetUrl) return ''
  if (assetUrl.startsWith('http://') || assetUrl.startsWith('https://')) return assetUrl
  return `${origin}${assetUrl.startsWith('/') ? '' : '/'}${assetUrl}`
}

/**
 * Component C4 — Cross-Platform Open Graph Delivery (/p/[shortId]).
 * Serves User-Agent-aware OG meta tags without 301/302 redirect chains.
 */
export async function GET(
  request: NextRequest,
  context: { params: { shortId: string } }
) {
  const { shortId } = context.params
  if (!isValidShortId(shortId)) {
    return new NextResponse('Invalid share ID', { status: 400 })
  }

  const share = await getShareByShortId(shortId)

  if (!share) {
    return new NextResponse('Share not found', { status: 404 })
  }

  const ua = request.headers.get('user-agent') || ''
  const isWhatsApp = /WhatsApp/i.test(ua)
  const isTelegramOrApple = /TelegramBot|iMessage|Applebot|Twitterbot/i.test(ua)

  const origin = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/+$/, '')

  // Select optimal <300KB asset per unfurler (P11 fallback chain)
  const chosenImage = isWhatsApp
    ? share.assets.gif || share.assets.jpgWaveform
    : isTelegramOrApple
      ? share.assets.webp || share.assets.jpgWaveform
      : share.assets.jpgWaveform || share.assets.gif || share.assets.webp

  const ogImage = toAbsoluteUrl(chosenImage, origin)
  const ogVideo = toAbsoluteUrl(share.assets.mp4, origin)
  const ogAudio = toAbsoluteUrl(share.audioUrl || undefined, origin)
  const canonicalShareUrl = `${origin}/p/${shortId}`
  const tapUrl = `${origin}/v/${shortId}`

  // Non-blocking preview_view tracking
  recordShareEvent({
    shareId: share.id,
    eventType: 'preview_view',
    userAgent: ua || undefined,
  }).catch(() => {})

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(share.title)} — Movbe</title>
  <meta property="og:title" content="${escapeHtml(share.title)}" />
  <meta property="og:description" content="${escapeHtml(share.description)}" />
  <meta property="og:type" content="video.other" />
  <meta property="og:url" content="${escapeHtml(canonicalShareUrl)}" />
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ''}
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />
  ${ogVideo ? `<meta property="og:video" content="${escapeHtml(ogVideo)}" />` : ''}
  ${ogVideo ? `<meta property="og:video:type" content="video/mp4" />` : ''}
  ${ogAudio ? `<meta property="og:audio" content="${escapeHtml(ogAudio)}" />` : ''}
  <meta name="twitter:card" content="player" />
  <meta name="twitter:title" content="${escapeHtml(share.title)}" />
  <meta name="twitter:description" content="${escapeHtml(share.description)}" />
  ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : ''}
  <meta name="twitter:player" content="${escapeHtml(tapUrl)}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(tapUrl)}" />
</head>
<body style="background:#09090b;color:#fafafa;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
  <p>Abriendo preview con voz... <a href="${escapeHtml(tapUrl)}" style="color:#22d3ee;">Continuar</a></p>
  <script>window.location.replace(${JSON.stringify(tapUrl).replace(/</g, '\\u003c')});</script>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  })
}
