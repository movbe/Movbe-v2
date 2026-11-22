import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import { getPlanQuota, type PlanTier } from '@/lib/shares/quotas'
import { getSupabaseAdminClient, getSupabaseServerClient } from '@/lib/supabase/server'

export interface ShareAssets {
  webp?: string
  mp4?: string
  gif?: string
  jpgWaveform?: string
}

export interface ShareRecord {
  id: string
  shortId: string
  sharerId: string | null
  parentShareId: string | null
  originalUrl: string
  title: string
  description: string
  sourceThumbnailUrl: string | null
  segmentStart: number
  segmentEnd: number
  audioUrl: string | null
  audioDurationSec: number | null
  transcript: string | null
  assets: ShareAssets
  options: {
    ctaLabel?: string
    ctaUrl?: string
  }
  status: 'processing' | 'ready' | 'failed'
  createdAt: string
}

export interface AudioTemplateRecord {
  id: string
  userId: string
  title: string
  audioUrl: string
  durationSec: number
  transcript: string | null
  createdAt: string
}

interface LocalStoreData {
  shares: ShareRecord[]
  events: Array<{
    shareId: string
    eventType: string
    userAgent?: string
    createdAt: string
  }>
  audioTemplates: AudioTemplateRecord[]
}

const LOCAL_STORE_PATH = path.join(os.tmpdir(), 'movbe-v2-dev-store.json')

async function readLocalStore(): Promise<LocalStoreData> {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, 'utf-8')
    return JSON.parse(raw) as LocalStoreData
  } catch {
    return { shares: [], events: [], audioTemplates: [] }
  }
}

async function writeLocalStore(data: LocalStoreData): Promise<void> {
  await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export async function createShareRecord(
  input: Omit<ShareRecord, 'createdAt'>
): Promise<ShareRecord> {
  const now = new Date().toISOString()
  const record: ShareRecord = { ...input, createdAt: now }

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient())
  if (supabase) {
    const { error } = await supabase.from('shares').insert({
      id: record.id,
      short_id: record.shortId,
      sharer_id: record.sharerId,
      parent_share_id: record.parentShareId,
      original_url: record.originalUrl,
      title: record.title,
      description: record.description,
      source_thumbnail_url: record.sourceThumbnailUrl,
      segment_start: record.segmentStart,
      segment_end: record.segmentEnd,
      audio_url: record.audioUrl,
      audio_duration_sec: record.audioDurationSec,
      transcript: record.transcript,
      assets: record.assets,
      options: record.options,
      status: record.status,
    })
    if (error) {
      throw new Error(`Supabase shares insert failed: ${error.message}`)
    }
    return record
  }

  const store = await readLocalStore()
  store.shares.unshift(record)
  await writeLocalStore(store)
  return record
}

export async function getShareByShortId(shortId: string): Promise<ShareRecord | null> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient())
  if (supabase) {
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .eq('short_id', shortId)
      .maybeSingle()

    if (error || !data) return null
    return {
      id: data.id,
      shortId: data.short_id,
      sharerId: data.sharer_id,
      parentShareId: data.parent_share_id,
      originalUrl: data.original_url,
      title: data.title,
      description: data.description,
      sourceThumbnailUrl: data.source_thumbnail_url,
      segmentStart: Number(data.segment_start),
      segmentEnd: Number(data.segment_end),
      audioUrl: data.audio_url,
      audioDurationSec: data.audio_duration_sec ? Number(data.audio_duration_sec) : null,
      transcript: data.transcript,
      assets: (data.assets as ShareAssets) || {},
      options: (data.options as ShareRecord['options']) || {},
      status: data.status,
      createdAt: data.created_at,
    }
  }

  const store = await readLocalStore()
  return store.shares.find(s => s.shortId === shortId) ?? null
}

export async function recordShareEvent(params: {
  shareId: string
  eventType: 'preview_view' | 'tap' | 'reshare' | 'cta_click'
  userAgent?: string
}): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient())
  if (supabase) {
    await supabase.from('share_events').insert({
      share_id: params.shareId,
      event_type: params.eventType,
      user_agent: params.userAgent ?? null,
    })
    return
  }

  const store = await readLocalStore()
  store.events.push({
    shareId: params.shareId,
    eventType: params.eventType,
    userAgent: params.userAgent,
    createdAt: new Date().toISOString(),
  })
  await writeLocalStore(store)
}

export async function listAudioTemplates(userId?: string): Promise<AudioTemplateRecord[]> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient())
  if (supabase && userId) {
    const { data } = await supabase
      .from('audio_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      audioUrl: row.audio_url,
      durationSec: Number(row.duration_sec),
      transcript: row.transcript,
      createdAt: row.created_at,
    }))
  }

  const store = await readLocalStore()
  return store.audioTemplates
}

export async function saveAudioTemplate(
  tpl: Omit<AudioTemplateRecord, 'createdAt'>
): Promise<AudioTemplateRecord> {
  const record: AudioTemplateRecord = { ...tpl, createdAt: new Date().toISOString() }
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient())
  if (supabase) {
    const { error } = await supabase.from('audio_templates').insert({
      id: record.id,
      user_id: record.userId,
      title: record.title,
      audio_url: record.audioUrl,
      duration_sec: record.durationSec,
      transcript: record.transcript,
    })
    if (error) {
      throw new Error(`Supabase audio_templates insert failed: ${error.message}`)
    }
    return record
  }

  const store = await readLocalStore()
  store.audioTemplates.unshift(record)
  await writeLocalStore(store)
  return record
}

export interface ShareQuotaStatus {
  planTier: PlanTier
  usedThisMonth: number
  monthlyLimit: number | null
  maxAudioSeconds: number
  canCreateShare: boolean
}

export async function getUserShareQuotaStatus(userId?: string | null): Promise<ShareQuotaStatus> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient())
  if (!supabase || !userId) {
    // Local dev / unconfigured Supabase: allow full MVP testing
    return {
      planTier: 'pro',
      usedThisMonth: 0,
      monthlyLimit: null,
      maxAudioSeconds: 15,
      canCreateShare: true,
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_tier')
    .eq('id', userId)
    .maybeSingle()

  const planTier = (profile?.plan_tier as PlanTier) || 'free'
  const quota = getPlanQuota(planTier)

  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('shares')
    .select('id', { count: 'exact', head: true })
    .eq('sharer_id', userId)
    .gte('created_at', monthStart.toISOString())

  const usedThisMonth = count ?? 0
  const canCreateShare = quota.monthlyShares === null || usedThisMonth < quota.monthlyShares

  return {
    planTier,
    usedThisMonth,
    monthlyLimit: quota.monthlyShares,
    maxAudioSeconds: quota.maxAudioSeconds,
    canCreateShare,
  }
}

export interface ShareAnalyticsSummary {
  totalShares: number
  previewViews: number
  taps: number
  reshares: number
  ctaClicks: number
  recentShares: Array<{
    shortId: string
    title: string
    createdAt: string
    views: number
    taps: number
    reshares: number
    ctaClicks: number
  }>
}

export async function getShareAnalytics(sharerId?: string | null): Promise<ShareAnalyticsSummary> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient())
  if (supabase) {
    let sharesQuery = supabase
      .from('shares')
      .select('id, short_id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    if (sharerId) {
      sharesQuery = sharesQuery.eq('sharer_id', sharerId)
    }

    const { data: sharesRows } = await sharesQuery
    const shares = sharesRows || []
    if (shares.length === 0) {
      return {
        totalShares: 0,
        previewViews: 0,
        taps: 0,
        reshares: 0,
        ctaClicks: 0,
        recentShares: [],
      }
    }

    const shareIds = shares.map(s => s.id)
    const { data: eventsRows } = await supabase
      .from('share_events')
      .select('share_id, event_type')
      .in('share_id', shareIds)

    const events = eventsRows || []
    const byShare = new Map<
      string,
      { views: number; taps: number; reshares: number; ctaClicks: number }
    >()

    let previewViews = 0
    let taps = 0
    let reshares = 0
    let ctaClicks = 0

    for (const ev of events) {
      const stats = byShare.get(ev.share_id) ?? {
        views: 0,
        taps: 0,
        reshares: 0,
        ctaClicks: 0,
      }
      if (ev.event_type === 'preview_view') {
        stats.views++
        previewViews++
      } else if (ev.event_type === 'tap') {
        stats.taps++
        taps++
      } else if (ev.event_type === 'reshare') {
        stats.reshares++
        reshares++
      } else if (ev.event_type === 'cta_click') {
        stats.ctaClicks++
        ctaClicks++
      }
      byShare.set(ev.share_id, stats)
    }

    return {
      totalShares: shares.length,
      previewViews,
      taps,
      reshares,
      ctaClicks,
      recentShares: shares.map(s => {
        const stats = byShare.get(s.id) ?? { views: 0, taps: 0, reshares: 0, ctaClicks: 0 }
        return {
          shortId: s.short_id,
          title: s.title || 'Video compartido con Movbe',
          createdAt: s.created_at,
          ...stats,
        }
      }),
    }
  }

  const store = await readLocalStore()
  const shares = store.shares.slice(0, 20)
  const byShare = new Map<
    string,
    { views: number; taps: number; reshares: number; ctaClicks: number }
  >()
  let previewViews = 0
  let taps = 0
  let reshares = 0
  let ctaClicks = 0

  for (const ev of store.events) {
    const stats = byShare.get(ev.shareId) ?? { views: 0, taps: 0, reshares: 0, ctaClicks: 0 }
    if (ev.eventType === 'preview_view') {
      stats.views++
      previewViews++
    } else if (ev.eventType === 'tap') {
      stats.taps++
      taps++
    } else if (ev.eventType === 'reshare') {
      stats.reshares++
      reshares++
    } else if (ev.eventType === 'cta_click') {
      stats.ctaClicks++
      ctaClicks++
    }
    byShare.set(ev.shareId, stats)
  }

  return {
    totalShares: store.shares.length,
    previewViews,
    taps,
    reshares,
    ctaClicks,
    recentShares: shares.map(s => {
      const stats = byShare.get(s.id) ?? { views: 0, taps: 0, reshares: 0, ctaClicks: 0 }
      return {
        shortId: s.shortId,
        title: s.title,
        createdAt: s.createdAt,
        ...stats,
      }
    }),
  }
}
