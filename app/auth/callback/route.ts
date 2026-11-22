import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const next = request.nextUrl.searchParams.get('next') || '/share'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/share'

  if (code) {
    const supabase = await getSupabaseServerClient()
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code)
    }
  }

  return NextResponse.redirect(new URL(safeNext, request.nextUrl.origin))
}
