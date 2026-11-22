import crypto from 'crypto'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'

import { fetchVideoOEmbed } from '@/lib/shares/oembed'
import { composeCanonicalPreviews } from '@/lib/shares/previewComposer'
import { createShareRecord, getUserShareQuotaStatus } from '@/lib/shares/shareStore'
import { transcribeAudioNote } from '@/lib/shares/transcriber'
import {
  isAllowedExistingAudioUrl,
  MAX_AUDIO_UPLOAD_BYTES,
  parseSafeHttpUrl,
} from '@/lib/shares/validation'
import { uploadPreviewAsset } from '@/lib/storage/r2'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const originalUrl = String(formData.get('originalUrl') || '').trim()
    const segmentStart = Number(formData.get('segmentStart') || 0)
    const segmentEnd = Number(formData.get('segmentEnd') || 8)
    const customTitle = String(formData.get('title') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const audioDurationSec = Number(formData.get('audioDurationSec') || 8)
    const ctaLabel = String(formData.get('ctaLabel') || '').trim()
    const ctaUrl = String(formData.get('ctaUrl') || '').trim()
    const parentShareId = formData.get('parentShareId')
      ? String(formData.get('parentShareId'))
      : null

    const audioFile = formData.get('audio')
    const existingAudioUrl = formData.get('existingAudioUrl')
      ? String(formData.get('existingAudioUrl'))
      : null

    if (!originalUrl || !parseSafeHttpUrl(originalUrl)) {
      return NextResponse.json({ error: 'Valid http(s) originalUrl is required' }, { status: 400 })
    }

    if (ctaUrl && !parseSafeHttpUrl(ctaUrl)) {
      return NextResponse.json({ error: 'Invalid http(s) ctaUrl' }, { status: 400 })
    }

    const safeSegmentStart = Number.isFinite(segmentStart) ? Math.max(0, segmentStart) : 0
    const safeSegmentEnd = Number.isFinite(segmentEnd)
      ? Math.max(safeSegmentStart + 1, segmentEnd)
      : safeSegmentStart + 8
    const safeDurationSec = Number.isFinite(audioDurationSec)
      ? Math.min(Math.max(audioDurationSec, 1), 30)
      : 8

    let audioBuffer: Buffer | null = null
    let audioExt = 'webm'

    if (audioFile instanceof File && audioFile.size > 0) {
      if (audioFile.size > MAX_AUDIO_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: 'Audio file exceeds 5 MB limit' },
          { status: 413 }
        )
      }
      audioBuffer = Buffer.from(await audioFile.arrayBuffer())
      if (audioFile.type.includes('mp4') || audioFile.type.includes('m4a')) {
        audioExt = 'm4a'
      } else if (audioFile.type.includes('ogg')) {
        audioExt = 'ogg'
      } else if (audioFile.type.includes('wav')) {
        audioExt = 'wav'
      }
    } else if (existingAudioUrl) {
      if (!isAllowedExistingAudioUrl(existingAudioUrl)) {
        return NextResponse.json({ error: 'Invalid existingAudioUrl' }, { status: 400 })
      }
      const origin = request.nextUrl.origin
      const fetchUrl = existingAudioUrl.startsWith('/')
        ? `${origin}${existingAudioUrl}`
        : existingAudioUrl
      const res = await fetch(fetchUrl, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        if (buf.length > MAX_AUDIO_UPLOAD_BYTES) {
          return NextResponse.json(
            { error: 'Audio file exceeds 5 MB limit' },
            { status: 413 }
          )
        }
        audioBuffer = buf
      }
    }

    if (!audioBuffer) {
      return NextResponse.json(
        { error: 'Audio commentary file or existingAudioUrl is required' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServerClient()
    const authUser = supabase ? (await supabase.auth.getUser()).data.user : null

    const quota = await getUserShareQuotaStatus(authUser?.id)
    if (!quota.canCreateShare) {
      return NextResponse.json(
        {
          error: `Límite mensual alcanzado (${quota.usedThisMonth}/${quota.monthlyLimit}) para el plan ${quota.planTier}.`,
        },
        { status: 429 }
      )
    }

    const clampedDurationSec = Math.min(safeDurationSec, quota.maxAudioSeconds)

    const shortId = nanoid(8)
    const id = crypto.randomUUID()

    const oembed = await fetchVideoOEmbed(originalUrl)
    const title = customTitle || oembed.title || 'Video compartido con Movbe'

    // Upload raw sharer audio, compose 4 canonical assets (<300KB), and transcribe in parallel
    const [audioUrl, composed, transcript] = await Promise.all([
      uploadPreviewAsset(
        `audio/${shortId}.${audioExt}`,
        audioBuffer,
        audioExt === 'webm' ? 'audio/webm' : 'audio/mpeg'
      ),
      composeCanonicalPreviews({
        thumbnailUrl: oembed.thumbnailUrl,
        audioBuffer,
        audioExt,
        durationSec: clampedDurationSec,
      }),
      transcribeAudioNote(audioBuffer, audioExt),
    ])

    const [webpUrl, mp4Url, gifUrl, jpgWaveformUrl] = await Promise.all([
      uploadPreviewAsset(`previews/${shortId}.webp`, composed.webp, 'image/webp'),
      uploadPreviewAsset(`previews/${shortId}.mp4`, composed.mp4, 'video/mp4'),
      uploadPreviewAsset(`previews/${shortId}.gif`, composed.gif, 'image/gif'),
      uploadPreviewAsset(`previews/${shortId}_wave.jpg`, composed.jpgWaveform, 'image/jpeg'),
    ])

    const record = await createShareRecord({
      id,
      shortId,
      sharerId: authUser?.id ?? null,
      parentShareId,
      originalUrl,
      title,
      description: description || 'Escucha mi nota de voz antes de abrir el video.',
      sourceThumbnailUrl: oembed.thumbnailUrl,
      segmentStart: safeSegmentStart,
      segmentEnd: safeSegmentEnd,
      audioUrl,
      audioDurationSec: clampedDurationSec,
      transcript,
      assets: {
        webp: webpUrl,
        mp4: mp4Url,
        gif: gifUrl,
        jpgWaveform: jpgWaveformUrl,
      },
      options: {
        ...(ctaLabel ? { ctaLabel } : {}),
        ...(ctaUrl ? { ctaUrl } : {}),
      },
      status: 'ready',
    })

    const appBase = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/+$/, '')

    return NextResponse.json({
      id: record.id,
      shortId: record.shortId,
      shareUrl: `${appBase}/p/${record.shortId}`,
      tapUrl: `${appBase}/v/${record.shortId}`,
      assets: record.assets,
      sizes: composed.sizes,
    })
  } catch (err) {
    console.error('Error creating Movbe share:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create share' },
      { status: 500 }
    )
  }
}
