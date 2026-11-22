/**
 * Standalone Railway / Fly.io BullMQ + FFmpeg Worker for async C3 + P11 preview generation.
 * Deploy separately from Next.js with `bullmq` and `ioredis` installed and REDIS_URL set.
 */
import { composeCanonicalPreviews } from '../../lib/shares/previewComposer'
import { uploadPreviewAsset } from '../../lib/storage/r2'

export interface GeneratePreviewJob {
  shortId: string
  thumbnailUrl: string | null
  audioBase64: string
  audioExt?: string
  durationSec?: number
}

export async function processGeneratePreviewJob(job: GeneratePreviewJob) {
  const audioBuffer = Buffer.from(job.audioBase64, 'base64')
  const composed = await composeCanonicalPreviews({
    thumbnailUrl: job.thumbnailUrl,
    audioBuffer,
    audioExt: job.audioExt || 'webm',
    durationSec: job.durationSec ?? 8,
  })

  const [webp, mp4, gif, jpgWaveform] = await Promise.all([
    composed.webp
      ? uploadPreviewAsset(`previews/${job.shortId}.webp`, composed.webp, 'image/webp')
      : Promise.resolve(undefined),
    composed.mp4
      ? uploadPreviewAsset(`previews/${job.shortId}.mp4`, composed.mp4, 'video/mp4')
      : Promise.resolve(undefined),
    composed.gif
      ? uploadPreviewAsset(`previews/${job.shortId}.gif`, composed.gif, 'image/gif')
      : Promise.resolve(undefined),
    composed.jpgWaveform
      ? uploadPreviewAsset(`previews/${job.shortId}_wave.jpg`, composed.jpgWaveform, 'image/jpeg')
      : Promise.resolve(undefined),
  ])

  return {
    shortId: job.shortId,
    assets: { webp, mp4, gif, jpgWaveform },
    sizes: composed.sizes,
  }
}
