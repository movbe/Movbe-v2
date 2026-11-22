import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import { listAudioTemplates, saveAudioTemplate } from '@/lib/shares/shareStore'
import { MAX_AUDIO_UPLOAD_BYTES } from '@/lib/shares/validation'
import { uploadPreviewAsset } from '@/lib/storage/r2'
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const authUser = supabase ? (await supabase.auth.getUser()).data.user : null
  if (isSupabaseServerConfigured() && !authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const templates = await listAudioTemplates(authUser?.id)
  return NextResponse.json({ templates })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const authUser = supabase ? (await supabase.auth.getUser()).data.user : null
    if (isSupabaseServerConfigured() && !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const title = String(formData.get('title') || '')
      .trim()
      .slice(0, 120)
    const durationSec = Number(formData.get('durationSec') || 5)
    const transcript = formData.get('transcript')
      ? String(formData.get('transcript')).slice(0, 1000)
      : null
    const audioFile = formData.get('audio')

    if (!title || !(audioFile instanceof File) || audioFile.size === 0) {
      return NextResponse.json({ error: 'title and audio file are required' }, { status: 400 })
    }

    if (audioFile.size > MAX_AUDIO_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'Audio file exceeds 5 MB limit' }, { status: 413 })
    }

    const id = crypto.randomUUID()
    const buf = Buffer.from(await audioFile.arrayBuffer())
    const audioUrl = await uploadPreviewAsset(
      `voice-library/${id}.webm`,
      buf,
      audioFile.type || 'audio/webm'
    )

    const saved = await saveAudioTemplate({
      id,
      userId: authUser?.id ?? 'local-dev-user',
      title,
      audioUrl,
      durationSec,
      transcript,
    })

    return NextResponse.json({ template: saved })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save template' },
      { status: 500 }
    )
  }
}
