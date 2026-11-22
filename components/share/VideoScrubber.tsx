'use client'

import { Scissors } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface VideoScrubberProps {
  title: string
  provider: string
  thumbnailUrl: string | null
  start: number
  end: number
  maxDuration?: number
  onChange: (range: { start: number; end: number }) => void
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function VideoScrubber({
  title,
  provider,
  thumbnailUrl,
  start,
  end,
  maxDuration = 180,
  onChange,
}: VideoScrubberProps) {
  const handleRangeChange = (values: number[]) => {
    if (values.length !== 2) return
    const [nextStart, nextEnd] = values
    // Enforce 3-15s preview fragment window
    if (nextEnd - nextStart < 3) {
      onChange({ start: nextStart, end: Math.min(maxDuration, nextStart + 3) })
      return
    }
    if (nextEnd - nextStart > 15) {
      onChange({ start: nextStart, end: nextStart + 15 })
      return
    }
    onChange({ start: nextStart, end: nextEnd })
  }

  return (
    <div className='space-y-3 rounded-xl border border-border bg-muted/30 p-4'>
      <div className='flex items-start gap-3'>
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className='h-16 w-24 rounded-lg object-cover border border-border shrink-0'
          />
        ) : (
          <div className='h-16 w-24 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0'>
            Preview
          </div>
        )}
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2 mb-1'>
            <Badge variant='secondary' className='uppercase text-[10px]'>
              {provider}
            </Badge>
            <span className='text-xs text-muted-foreground'>oEmbed oficial (sin scraping)</span>
          </div>
          <p className='text-sm font-medium line-clamp-2'>{title}</p>
        </div>
      </div>

      <div className='space-y-2 pt-1'>
        <div className='flex items-center justify-between text-xs'>
          <Label className='flex items-center gap-1.5'>
            <Scissors className='h-3.5 w-3.5' />
            Fragmento del video (C2)
          </Label>
          <span className='font-mono text-muted-foreground'>
            {formatTime(start)} → {formatTime(end)} ({end - start}s)
          </span>
        </div>
        <Slider
          min={0}
          max={maxDuration}
          step={1}
          value={[start, end]}
          onValueChange={handleRangeChange}
        />
      </div>
    </div>
  )
}
