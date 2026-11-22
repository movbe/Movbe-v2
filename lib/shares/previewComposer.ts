import { execFile } from 'child_process'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const MAX_WHATSAPP_BYTES = 300 * 1024 // 300 KB hard compatibility target

export interface ComposedAssetsBuffers {
  webp: Buffer | null
  mp4: Buffer | null
  gif: Buffer | null
  jpgWaveform: Buffer | null
  sizes: {
    webp: number
    mp4: number
    gif: number
    jpgWaveform: number
  }
  usedFfmpeg: boolean
}

async function runFfmpeg(args: string[]): Promise<void> {
  await execFileAsync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], {
    timeout: 30_000,
    maxBuffer: 10 * 1024 * 1024,
  })
}

/**
 * Creates a clean 600x600 fallback base image via FFmpeg if no remote thumbnail is available.
 */
async function createFallbackPoster(outPath: string): Promise<void> {
  await runFfmpeg(['-f', 'lavfi', '-i', 'color=c=#0f172a:s=600x600:d=1', '-frames:v', '1', outPath])
}

/**
 * Downloads remote thumbnail or generates a solid 600x600 poster.
 * Normalizes to 600x600 JPEG so downstream filters have predictable dimensions.
 */
async function prepareBasePoster(thumbnailUrl: string | null, workDir: string): Promise<string> {
  const normalizedPath = path.join(workDir, 'base_600.jpg')

  if (thumbnailUrl) {
    try {
      const res = await fetch(thumbnailUrl, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const rawBuf = Buffer.from(await res.arrayBuffer())
        const rawPath = path.join(workDir, 'raw_thumb')
        await fs.writeFile(rawPath, rawBuf)
        await runFfmpeg([
          '-i',
          rawPath,
          '-vf',
          'scale=600:600:force_original_aspect_ratio=increase,crop=600:600',
          '-frames:v',
          '1',
          '-q:v',
          '4',
          normalizedPath,
        ])
        return normalizedPath
      }
    } catch {
      // Fallback below
    }
  }

  await createFallbackPoster(normalizedPath)
  return normalizedPath
}

async function generateWebp(
  posterPath: string,
  audioPath: string,
  durationSec: number,
  outPath: string
): Promise<Buffer> {
  const dur = String(Math.min(Math.max(durationSec, 2), 15))
  // Animated WebP loop (low fps pulse/zoom to stay well under 300KB)
  await runFfmpeg([
    '-loop',
    '1',
    '-framerate',
    '4',
    '-t',
    dur,
    '-i',
    posterPath,
    '-i',
    audioPath,
    '-vf',
    'scale=480:480',
    '-c:v',
    'libwebp',
    '-lossless',
    '0',
    '-q:v',
    '60',
    '-loop',
    '0',
    '-c:a',
    'libopus',
    '-b:a',
    '24k',
    '-shortest',
    outPath,
  ])
  return fs.readFile(outPath)
}

async function generateMp4(
  posterPath: string,
  audioPath: string,
  durationSec: number,
  outPath: string
): Promise<Buffer> {
  const dur = String(Math.min(Math.max(durationSec, 2), 15))
  const buildArgs = (crf: string) => [
    '-loop',
    '1',
    '-framerate',
    '2',
    '-t',
    dur,
    '-i',
    posterPath,
    '-i',
    audioPath,
    '-vf',
    'scale=480:480,format=yuv420p',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    crf,
    '-c:a',
    'aac',
    '-b:a',
    '32k',
    '-movflags',
    '+faststart',
    '-shortest',
    outPath,
  ]

  await runFfmpeg(buildArgs('30'))
  let buf = await fs.readFile(outPath)
  if (buf.length > MAX_WHATSAPP_BYTES) {
    await runFfmpeg(buildArgs('38'))
    buf = await fs.readFile(outPath)
  }
  return buf
}

async function generateGif(
  posterPath: string,
  durationSec: number,
  outPath: string
): Promise<Buffer> {
  const dur = String(Math.min(Math.max(durationSec, 2), 6))
  // Subtle zoom/pulse GIF with palette optimization under 300KB
  await runFfmpeg([
    '-loop',
    '1',
    '-framerate',
    '4',
    '-t',
    dur,
    '-i',
    posterPath,
    '-vf',
    'scale=360:360:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer',
    '-loop',
    '0',
    outPath,
  ])
  return fs.readFile(outPath)
}

/**
 * Proposal P11: JPG + visible audio waveform overlay (< 90 KB universal fallback).
 */
async function generateJpgWithWaveform(
  posterPath: string,
  audioPath: string,
  outPath: string
): Promise<Buffer> {
  const wavePath = path.join(path.dirname(outPath), 'wave.png')
  try {
    await runFfmpeg([
      '-i',
      audioPath,
      '-filter_complex',
      'aformat=channel_layouts=mono,showwavespic=s=560x100:colors=#22d3ee|#3b82f6',
      '-frames:v',
      '1',
      wavePath,
    ])

    await runFfmpeg([
      '-i',
      posterPath,
      '-i',
      wavePath,
      '-filter_complex',
      '[0:v]drawbox=x=0:y=460:w=600:h=140:color=black@0.65:t=fill[bg];[bg][1:v]overlay=20:480',
      '-frames:v',
      '1',
      '-q:v',
      '5',
      outPath,
    ])
  } catch {
    // Fallback if audio has no decodable waveform
    await fs.copyFile(posterPath, outPath)
  }
  return fs.readFile(outPath)
}

/**
 * Component C3 + P11: Generates 4 canonical preview formats in parallel.
 */
export async function composeCanonicalPreviews(params: {
  thumbnailUrl: string | null
  audioBuffer: Buffer
  audioExt?: string
  durationSec?: number
}): Promise<ComposedAssetsBuffers> {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'movbe-c3-'))
  const audioExt = params.audioExt || 'webm'
  const durationSec = params.durationSec ?? 8

  try {
    const audioPath = path.join(workDir, `sharer_audio.${audioExt}`)
    await fs.writeFile(audioPath, params.audioBuffer)

    const posterPath = await prepareBasePoster(params.thumbnailUrl, workDir)

    const webpPath = path.join(workDir, 'preview.webp')
    const mp4Path = path.join(workDir, 'preview.mp4')
    const gifPath = path.join(workDir, 'preview.gif')
    const jpgPath = path.join(workDir, 'preview_waveform.jpg')

    const [webp, mp4, gif, jpgWaveform] = await Promise.all([
      generateWebp(posterPath, audioPath, durationSec, webpPath),
      generateMp4(posterPath, audioPath, durationSec, mp4Path),
      generateGif(posterPath, durationSec, gifPath),
      generateJpgWithWaveform(posterPath, audioPath, jpgPath),
    ])

    return {
      webp,
      mp4,
      gif,
      jpgWaveform,
      sizes: {
        webp: webp.length,
        mp4: mp4.length,
        gif: gif.length,
        jpgWaveform: jpgWaveform.length,
      },
      usedFfmpeg: true,
    }
  } catch {
    // Graceful fallback on serverless hosts without ffmpeg (e.g. Vercel):
    // Fetch the official thumbnail so /p/[shortId] still has a valid og:image.
    let thumbBuf: Buffer | null = null
    if (params.thumbnailUrl) {
      try {
        const res = await fetch(params.thumbnailUrl, { signal: AbortSignal.timeout(5000) })
        if (res.ok) {
          thumbBuf = Buffer.from(await res.arrayBuffer())
        }
      } catch {
        // ignore
      }
    }

    return {
      webp: null,
      mp4: null,
      gif: null,
      jpgWaveform: thumbBuf,
      sizes: {
        webp: 0,
        mp4: 0,
        gif: 0,
        jpgWaveform: thumbBuf?.length ?? 0,
      },
      usedFfmpeg: false,
    }
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {})
  }
}
