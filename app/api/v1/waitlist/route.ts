import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseAdminClient, getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string
      email?: string
      role?: string
      answers?: string
      source?: string
      privacyAccepted?: boolean
      promotionalConsent?: boolean
    }

    const name = body.name?.trim().slice(0, 120)
    const email = body.email?.trim().toLowerCase().slice(0, 254)

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid name and email are required' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient())
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      )
    }

    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        name,
        email,
        role: body.role || 'user',
        answers: body.answers?.trim() || '',
        privacy_accepted: Boolean(body.privacyAccepted),
        promotional_consent: Boolean(body.promotionalConsent),
        source: body.source?.slice(0, 80) || 'rompehielo_waitlist_form',
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: data.id })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}
