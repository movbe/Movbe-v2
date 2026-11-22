'use client'

import { Check, Copy, ExternalLink, Library, Loader2, Share2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import HeaderDynamic from '@/components/HeaderDynamic'
import Sidebar from '@/components/Sidebar'
import { AudioRecorder } from '@/components/share/AudioRecorder'
import { ShareAnalyticsPanel } from '@/components/share/ShareAnalyticsPanel'
import { VideoScrubber } from '@/components/share/VideoScrubber'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/lib/hooks/use-toast'
import type { VideoOEmbedMetadata } from '@/lib/shares/oembed'
import type { AudioTemplateRecord } from '@/lib/shares/shareStore'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'

interface ShareResult {
  shortId: string
  shareUrl: string
  tapUrl: string
  assets: {
    webp?: string
    mp4?: string
    gif?: string
    jpgWaveform?: string
  }
  sizes: {
    webp: number
    mp4: number
    gif: number
    jpgWaveform: number
  }
}

function SharePageInner() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [videoUrl, setVideoUrl] = useState(searchParams.get('url') || '')
  const [parentShareId] = useState(searchParams.get('parent') || '')
  const [oembed, setOembed] = useState<VideoOEmbedMetadata | null>(null)
  const [loadingOembed, setLoadingOembed] = useState(false)

  const [segment, setSegment] = useState({ start: 0, end: 8 })
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ctaLabel, setCtaLabel] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioDurationSec, setAudioDurationSec] = useState(0)
  const [selectedTemplateUrl, setSelectedTemplateUrl] = useState<string | null>(null)
  const [templates, setTemplates] = useState<AudioTemplateRecord[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ShareResult | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/v1/voice-library')
      .then(r => r.json())
      .then(d => setTemplates(d.templates || []))
      .catch(() => {})
  }, [])

  const lookupUrl = async (raw: string) => {
    if (!raw.trim()) return
    try {
      new URL(raw)
    } catch {
      return
    }
    setLoadingOembed(true)
    try {
      const res = await fetch(`/api/v1/oembed?url=${encodeURIComponent(raw)}`)
      if (res.ok) {
        const data = (await res.json()) as VideoOEmbedMetadata
        setOembed(data)
        if (!title) setTitle(data.title)
      }
    } finally {
      setLoadingOembed(false)
    }
  }

  useEffect(() => {
    if (videoUrl) {
      lookupUrl(videoUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveToLibrary = async (blob: Blob, durationSec: number, tplTitle: string) => {
    const fd = new FormData()
    fd.append('title', tplTitle)
    fd.append('durationSec', String(durationSec))
    fd.append('audio', blob, 'intro.webm')
    const res = await fetch('/api/v1/voice-library', { method: 'POST', body: fd })
    if (res.ok) {
      const { template } = (await res.json()) as { template: AudioTemplateRecord }
      setTemplates(prev => [template, ...prev])
      toast({ title: 'Guardado en Voice Library', description: template.title })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoUrl.trim() || (!audioBlob && !selectedTemplateUrl)) {
      toast({
        title: 'Falta video o nota de voz',
        description: 'Pega un URL de video y graba (o selecciona) tu nota de voz.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('originalUrl', videoUrl.trim())
      fd.append('segmentStart', String(segment.start))
      fd.append('segmentEnd', String(segment.end))
      fd.append('title', title.trim())
      fd.append('description', description.trim())
      fd.append('audioDurationSec', String(audioDurationSec || 8))
      if (ctaLabel.trim()) fd.append('ctaLabel', ctaLabel.trim())
      if (ctaUrl.trim()) fd.append('ctaUrl', ctaUrl.trim())
      if (parentShareId) fd.append('parentShareId', parentShareId)

      if (audioBlob) {
        fd.append('audio', audioBlob, 'commentary.webm')
      } else if (selectedTemplateUrl) {
        fd.append('existingAudioUrl', selectedTemplateUrl)
      }

      const res = await fetch('/api/v1/shares', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error generando preview')
      }

      setResult(data as ShareResult)
      toast({
        title: '¡Preview con voz listo!',
        description: 'Ya puedes compartir el link por WhatsApp, Telegram o iMessage.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo generar el preview',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const copyLink = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatKb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`

  return (
    <div className='flex flex-col min-h-screen'>
      <HeaderDynamic onMenuClick={() => dispatch(toggleSidebar())} />
      <div className='flex flex-1 pt-16 sm:pt-20'>
        <Sidebar />
        <main className='flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6'>
          <div>
            <Badge variant='secondary' className='mb-2'>
              Movbe Protocol · MVP (C1–C5 + P5 + P11 + P12)
            </Badge>
            <h1 className='text-2xl md:text-3xl font-bold'>Comparte un video con tu voz</h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Pega el link, elige el fragmento y graba tu nota de voz. Generamos previews
              multi-formato (&lt;300 KB) listos para WhatsApp, Telegram e iMessage.
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>1. Video de origen</CardTitle>
                <CardDescription>YouTube, Vimeo, Loom o cualquier URL de video</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex gap-2'>
                  <Input
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder='https://www.youtube.com/watch?v=...'
                    required
                  />
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => lookupUrl(videoUrl)}
                    disabled={loadingOembed}
                  >
                    {loadingOembed ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Cargar'}
                  </Button>
                </div>

                {oembed && (
                  <VideoScrubber
                    title={oembed.title}
                    provider={oembed.provider}
                    thumbnailUrl={oembed.thumbnailUrl}
                    start={segment.start}
                    end={segment.end}
                    onChange={setSegment}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>2. Tu voz (Audio Commentary)</CardTitle>
                <CardDescription>
                  Graba una nota nueva o reutiliza una de tu Voice Library
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <AudioRecorder
                  onAudioReady={(blob, dur) => {
                    setAudioBlob(blob)
                    setAudioDurationSec(dur)
                    if (blob) setSelectedTemplateUrl(null)
                  }}
                  onSaveToLibrary={handleSaveToLibrary}
                />

                {templates.length > 0 && (
                  <div className='space-y-2'>
                    <Label className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                      <Library className='h-3.5 w-3.5' />O elige de tu Voice Library (P12)
                    </Label>
                    <div className='flex flex-wrap gap-2'>
                      {templates.map(tpl => {
                        const active = selectedTemplateUrl === tpl.audioUrl && !audioBlob
                        return (
                          <Button
                            key={tpl.id}
                            type='button'
                            size='sm'
                            variant={active ? 'default' : 'outline'}
                            onClick={() => {
                              setSelectedTemplateUrl(tpl.audioUrl)
                              setAudioDurationSec(tpl.durationSec)
                              setAudioBlob(null)
                            }}
                          >
                            {tpl.title} ({Math.round(tpl.durationSec)}s)
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>3. Contexto y CTA vertical (Opcional)</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-1.5'>
                  <Label>Título del preview</Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder='Ej: Casa en El Poblado — mira el minuto 1:20'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label>Nota corta</Label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder='Por qué deberían ver este fragmento...'
                    rows={2}
                  />
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
                  <div className='space-y-1.5'>
                    <Label>Texto botón CTA (P8)</Label>
                    <Input
                      value={ctaLabel}
                      onChange={e => setCtaLabel(e.target.value)}
                      placeholder='Ej: Agendar llamada'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>URL del CTA</Label>
                    <Input
                      value={ctaUrl}
                      onChange={e => setCtaUrl(e.target.value)}
                      placeholder='https://calendly.com/...'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type='submit' size='lg' className='w-full gap-2' disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Componiendo previews (FFmpeg C3 + P11)...
                </>
              ) : (
                <>
                  <Sparkles className='h-4 w-4' />
                  Generar Link Movbe con Voz
                </>
              )}
            </Button>
          </form>

          {result && (
            <Card className='border-primary/40 bg-primary/5'>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Share2 className='h-5 w-5 text-primary' />
                  Preview generado ({result.shortId})
                </CardTitle>
                <CardDescription>
                  Pega el link en WhatsApp, Telegram o iMessage para activar el preview Open Graph.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex gap-2'>
                  <Input readOnly value={result.shareUrl} className='font-mono text-xs' />
                  <Button type='button' onClick={copyLink} variant='secondary' className='gap-1.5'>
                    {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </Button>
                  <Button asChild variant='outline'>
                    <Link href={`/v/${result.shortId}`}>
                      <ExternalLink className='h-4 w-4 mr-1.5' />
                      Abrir P5
                    </Link>
                  </Button>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs'>
                  <div className='rounded-lg border p-2.5 bg-background'>
                    <p className='font-medium'>WebP + Opus</p>
                    <p className='text-muted-foreground'>{formatKb(result.sizes.webp)}</p>
                  </div>
                  <div className='rounded-lg border p-2.5 bg-background'>
                    <p className='font-medium'>MP4 H.264</p>
                    <p className='text-muted-foreground'>{formatKb(result.sizes.mp4)}</p>
                  </div>
                  <div className='rounded-lg border p-2.5 bg-background'>
                    <p className='font-medium'>GIF WhatsApp</p>
                    <p className='text-muted-foreground'>{formatKb(result.sizes.gif)}</p>
                  </div>
                  <div className='rounded-lg border p-2.5 bg-background'>
                    <p className='font-medium'>JPG Waveform</p>
                    <p className='text-muted-foreground'>{formatKb(result.sizes.jpgWaveform)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <ShareAnalyticsPanel refreshKey={result ? 1 : 0} />
        </main>
      </div>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className='p-8 text-center text-sm'>Cargando...</div>}>
      <SharePageInner />
    </Suspense>
  )
}
