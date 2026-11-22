'use client'

import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageCircle,
  Mic,
  Pause,
  Play,
  Share2,
  Sparkles,
  Volume2,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ShareRecord } from '@/lib/shares/shareStore'
import { parseSafeHttpUrl } from '@/lib/shares/validation'

interface TapToRevealClientProps {
  share: ShareRecord
}

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function TapToRevealClient({ share }: TapToRevealClientProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showLayer2, setShowLayer2] = useState(true)
  const [showLayer3, setShowLayer3] = useState(true)

  useEffect(() => {
    fetch(`/api/v1/shares/${share.shortId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'tap' }),
    }).catch(() => {})
  }, [share.shortId])

  const toggleAudio = () => {
    const el = audioRef.current
    if (!el) return
    if (isPlaying) {
      el.pause()
      setIsPlaying(false)
    } else {
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    }
  }

  const trackEvent = (eventType: 'reshare' | 'cta_click') => {
    fetch(`/api/v1/shares/${share.shortId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType }),
    }).catch(() => {})
  }

  const safeOriginalUrl = parseSafeHttpUrl(share.originalUrl)?.toString() || '#'
  const safeCtaUrl = share.options?.ctaUrl
    ? parseSafeHttpUrl(share.options.ctaUrl)?.toString() || null
    : null

  const whatsappReplyUrl = `https://wa.me/?text=${encodeURIComponent(
    `Acabo de escuchar tu nota sobre "${share.title}". ¡Gracias por compartirlo!`
  )}`

  return (
    <div className='min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100 px-4 py-8'>
      <div className='max-w-xl mx-auto space-y-5'>
        {/* Brand Header */}
        <div className='flex items-center justify-between'>
          <Link href='/' className='flex items-center gap-2 font-bold text-lg tracking-tight'>
            <span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400'>
              <Volume2 className='h-4 w-4' />
            </span>
            Movbe
          </Link>
          <Badge variant='secondary' className='bg-cyan-500/15 text-cyan-300 border-cyan-500/30'>
            El video lleva tu voz
          </Badge>
        </div>

        {/* Layer 1: Preview + Sharer Voice Note */}
        <Card className='border-zinc-800 bg-zinc-900/80 backdrop-blur'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between gap-2'>
              <Badge variant='outline' className='border-zinc-700 text-zinc-300'>
                Fragmento {formatSec(share.segmentStart)} – {formatSec(share.segmentEnd)}
              </Badge>
              {share.audioDurationSec ? (
                <span className='text-xs text-zinc-400'>
                  Nota de voz · {Math.round(share.audioDurationSec)}s
                </span>
              ) : null}
            </div>
            <CardTitle className='text-xl text-white pt-1'>{share.title}</CardTitle>
          </CardHeader>

          <CardContent className='space-y-4'>
            {share.assets.mp4 ? (
              <div className='relative overflow-hidden rounded-xl border border-zinc-800 bg-black aspect-square max-h-80 mx-auto'>
                <video
                  src={share.assets.mp4}
                  poster={share.assets.jpgWaveform || share.sourceThumbnailUrl || undefined}
                  controls
                  playsInline
                  className='w-full h-full object-cover'
                />
              </div>
            ) : share.assets.jpgWaveform || share.sourceThumbnailUrl ? (
              <div className='relative overflow-hidden rounded-xl border border-zinc-800 bg-black aspect-square max-h-80 mx-auto'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={share.assets.jpgWaveform || share.sourceThumbnailUrl || ''}
                  alt={share.title}
                  className='w-full h-full object-cover'
                />
              </div>
            ) : null}

            {share.audioUrl && (
              <div className='flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3'>
                <Button
                  type='button'
                  size='icon'
                  onClick={toggleAudio}
                  className='h-11 w-11 rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shrink-0'
                >
                  {isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5 ml-0.5' />}
                </Button>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-cyan-200'>
                    Escuchar voz de quien comparte
                  </p>
                  <p className='text-xs text-zinc-400 truncate'>{share.description}</p>
                </div>
                <audio
                  ref={audioRef}
                  src={share.audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className='hidden'
                />
              </div>
            )}

            {/* Primary Destination CTA */}
            <Button asChild className='w-full bg-white text-zinc-950 hover:bg-zinc-200' size='lg'>
              <a href={safeOriginalUrl} target='_blank' rel='noopener noreferrer'>
                <ExternalLink className='h-4 w-4 mr-2' />
                Abrir video completo
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Layer 2: Context & Transcript (Tap-to-Reveal P5) */}
        <Card className='border-zinc-800 bg-zinc-900/60'>
          <button
            type='button'
            onClick={() => setShowLayer2(v => !v)}
            className='w-full flex items-center justify-between px-5 py-3.5 text-left'
          >
            <span className='text-sm font-medium text-zinc-200'>Contexto del fragmento</span>
            {showLayer2 ? (
              <ChevronUp className='h-4 w-4 text-zinc-400' />
            ) : (
              <ChevronDown className='h-4 w-4 text-zinc-400' />
            )}
          </button>
          {showLayer2 && (
            <CardContent className='pt-0 pb-4 text-sm text-zinc-300 space-y-2'>
              <p>{share.description}</p>
              {share.transcript && (
                <p className='text-xs text-zinc-400 italic'>“{share.transcript}”</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* Layer 3: Quick Replies & Vertical CTAs (P5 + P8 + P6 Reshare) */}
        <Card className='border-zinc-800 bg-zinc-900/60'>
          <button
            type='button'
            onClick={() => setShowLayer3(v => !v)}
            className='w-full flex items-center justify-between px-5 py-3.5 text-left'
          >
            <span className='text-sm font-medium text-zinc-200'>Acciones rápidas</span>
            {showLayer3 ? (
              <ChevronUp className='h-4 w-4 text-zinc-400' />
            ) : (
              <ChevronDown className='h-4 w-4 text-zinc-400' />
            )}
          </button>
          {showLayer3 && (
            <CardContent className='pt-0 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
              {safeCtaUrl && share.options?.ctaLabel && (
                <Button
                  asChild
                  className='sm:col-span-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold'
                  onClick={() => trackEvent('cta_click')}
                >
                  <a href={safeCtaUrl} target='_blank' rel='noopener noreferrer'>
                    <Sparkles className='h-4 w-4 mr-2' />
                    {share.options.ctaLabel}
                  </a>
                </Button>
              )}

              <Button asChild variant='outline' className='border-zinc-700 text-zinc-200'>
                <a href={whatsappReplyUrl} target='_blank' rel='noopener noreferrer'>
                  <MessageCircle className='h-4 w-4 mr-2 text-emerald-400' />
                  Responder por WhatsApp
                </a>
              </Button>

              <Button
                asChild
                variant='outline'
                className='border-zinc-700 text-zinc-200'
                onClick={() => trackEvent('reshare')}
              >
                <Link
                  href={`/share?url=${encodeURIComponent(share.originalUrl)}&parent=${share.id}`}
                >
                  <Share2 className='h-4 w-4 mr-2 text-cyan-400' />
                  Re-compartir con mi voz
                </Link>
              </Button>
            </CardContent>
          )}
        </Card>

        {/* PLG Viral Footer */}
        <div className='text-center pt-2'>
          <Link
            href='/share'
            className='inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-cyan-300 transition-colors'
          >
            <Mic className='h-3.5 w-3.5' />
            Compartido con Movbe — Crea tu propio preview con voz gratis
          </Link>
        </div>
      </div>
    </div>
  )
}
