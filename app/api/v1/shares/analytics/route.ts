import { NextResponse } from 'next/server'

import { getShareAnalytics, getUserShareQuotaStatus } from '@/lib/shares/shareStore'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const authUser = supabase ? (await supabase.auth.getUser()).data.user : null

  const [analytics, quota] = await Promise.all([
    getShareAnalytics(authUser?.id),
    getUserShareQuotaStatus(authUser?.id),
  ])

  return NextResponse.json({ analytics, quota })
}
