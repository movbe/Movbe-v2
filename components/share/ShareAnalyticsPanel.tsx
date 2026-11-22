'use client'

import { BarChart3, ExternalLink, Eye, MousePointerClick, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ShareAnalyticsSummary, ShareQuotaStatus } from '@/lib/shares/shareStore'

export function ShareAnalyticsPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const [analytics, setAnalytics] = useState<ShareAnalyticsSummary | null>(null)
  const [quota, setQuota] = useState<ShareQuotaStatus | null>(null)

  useEffect(() => {
    fetch('/api/v1/shares/analytics')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setAnalytics(data.analytics)
          setQuota(data.quota)
        }
      })
      .catch(() => {})
  }, [refreshKey])

  if (!analytics) return null

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between gap-4'>
        <div>
          <CardTitle className='text-lg flex items-center gap-2'>
            <BarChart3 className='h-5 w-5 text-primary' />
            Analíticas de Shares con Voz (C6)
          </CardTitle>
          <CardDescription>
            Rendimiento de tus links compartidos en WhatsApp, Telegram e iMessage
          </CardDescription>
        </div>
        {quota && (
          <Badge variant='outline' className='uppercase text-xs shrink-0'>
            Plan {quota.planTier}
            {quota.monthlyLimit !== null
              ? ` · ${quota.usedThisMonth}/${quota.monthlyLimit} mes`
              : ' · Ilimitado'}
          </Badge>
        )}
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          <div className='rounded-lg border p-3'>
            <p className='text-xs text-muted-foreground flex items-center gap-1'>
              <Share2 className='h-3.5 w-3.5' /> Shares
            </p>
            <p className='text-2xl font-bold mt-1'>{analytics.totalShares}</p>
          </div>
          <div className='rounded-lg border p-3'>
            <p className='text-xs text-muted-foreground flex items-center gap-1'>
              <Eye className='h-3.5 w-3.5' /> Preview Views
            </p>
            <p className='text-2xl font-bold mt-1'>{analytics.previewViews}</p>
          </div>
          <div className='rounded-lg border p-3'>
            <p className='text-xs text-muted-foreground flex items-center gap-1'>
              <MousePointerClick className='h-3.5 w-3.5' /> Taps
            </p>
            <p className='text-2xl font-bold mt-1'>{analytics.taps}</p>
          </div>
          <div className='rounded-lg border p-3'>
            <p className='text-xs text-muted-foreground'>Re-shares / CTAs</p>
            <p className='text-2xl font-bold mt-1'>
              {analytics.reshares + analytics.ctaClicks}
            </p>
          </div>
        </div>

        {analytics.recentShares.length > 0 && (
          <div className='space-y-2'>
            <p className='text-xs font-medium text-muted-foreground uppercase'>
              Shares recientes
            </p>
            <div className='divide-y rounded-lg border'>
              {analytics.recentShares.slice(0, 5).map((item) => (
                <div
                  key={item.shortId}
                  className='flex items-center justify-between gap-3 px-3 py-2 text-sm'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='font-medium truncate'>{item.title}</p>
                    <p className='text-xs text-muted-foreground font-mono'>
                      /p/{item.shortId} · {item.views} views · {item.taps} taps
                    </p>
                  </div>
                  <Link
                    href={`/v/${item.shortId}`}
                    className='text-xs text-primary hover:underline inline-flex items-center gap-1 shrink-0'
                  >
                    Abrir <ExternalLink className='h-3 w-3' />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
