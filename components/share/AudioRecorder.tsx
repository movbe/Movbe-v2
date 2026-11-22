'use client'

import { BookmarkPlus, Mic, RotateCcw, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AudioRecorderProps {
  maxSeconds?: number
  onAudioReady: (blob: Blob | null, durationSec: number) => void
  onSaveToLibrary?: (blob: Blob, durationSec: number, title: string) => Promise<void>
}

export function AudioRecorder({
  maxSeconds = 15,
  onAudioReady,
  onSaveToLibrary,
}: AudioRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templateTitle, setTemplateTitle] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const secondsRef = useRef(0)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setRecording(false)
  }

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, {
        mimeType: preferredMime,
        audioBitsPerSecond: 48000,
      })

      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: preferredMime })
        const url = URL.createObjectURL(blob)
        const finalDuration = Math.max(1, secondsRef.current)
        setAudioBlob(blob)
        setAudioUrl(url)
        onAudioReady(blob, finalDuration)
      }

      secondsRef.current = 0
      setSeconds(0)
      recorder.start(250)
      mediaRecorderRef.current = recorder
      setRecording(true)

      timerRef.current = setInterval(() => {
        secondsRef.current += 1
        setSeconds(secondsRef.current)
        if (secondsRef.current >= maxSeconds) {
          stopRecording()
        }
      }, 1000)
    } catch {
      setError('No se pudo acceder al micrófono. Verifica los permisos del navegador.')
    }
  }

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setAudioBlob(null)
    setSeconds(0)
    secondsRef.current = 0
    onAudioReady(null, 0)
  }

  const handleSaveTemplate = async () => {
    if (!audioBlob || !onSaveToLibrary || !templateTitle.trim()) return
    setSavingTemplate(true)
    try {
      await onSaveToLibrary(audioBlob, Math.max(1, seconds), templateTitle.trim())
      setTemplateTitle('')
    } finally {
      setSavingTemplate(false)
    }
  }

  return (
    <div className='space-y-3 rounded-xl border border-border bg-muted/30 p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium'>Nota de voz del sharer (C1)</p>
          <p className='text-xs text-muted-foreground'>
            Máximo {maxSeconds}s · Opus ~48kbps para mantener el preview &lt;300 KB
          </p>
        </div>
        <span className='font-mono text-sm tabular-nums'>
          0:{String(seconds).padStart(2, '0')} / 0:{String(maxSeconds).padStart(2, '0')}
        </span>
      </div>

      {error && <p className='text-xs text-destructive'>{error}</p>}

      {!audioUrl ? (
        <div className='flex items-center gap-3'>
          {!recording ? (
            <Button type='button' onClick={startRecording} className='gap-2'>
              <Mic className='h-4 w-4' />
              Grabar mi voz
            </Button>
          ) : (
            <Button type='button' variant='destructive' onClick={stopRecording} className='gap-2'>
              <Square className='h-4 w-4' />
              Detener ({maxSeconds - seconds}s)
            </Button>
          )}
        </div>
      ) : (
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <audio src={audioUrl} controls className='h-9 flex-1' />
            <Button type='button' variant='outline' size='icon' onClick={reset} title='Re-grabar'>
              <RotateCcw className='h-4 w-4' />
            </Button>
          </div>

          {onSaveToLibrary && (
            <div className='flex items-center gap-2 pt-1'>
              <Input
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder='Guardar en Voice Library (ej: Intro propiedad)...'
                className='h-8 text-xs'
              />
              <Button
                type='button'
                variant='secondary'
                size='sm'
                disabled={!templateTitle.trim() || savingTemplate}
                onClick={handleSaveTemplate}
                className='shrink-0 gap-1.5'
              >
                <BookmarkPlus className='h-3.5 w-3.5' />
                Guardar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
