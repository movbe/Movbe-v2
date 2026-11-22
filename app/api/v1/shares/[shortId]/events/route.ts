import { NextRequest, NextResponse } from 'next/server'

import { getShareByShortId, recordShareEvent } from '@/lib/shares/shareStore'
import { isAllowedEventType, isValidShortId } from '@/lib/shares/validation'

export async function POST(request: NextRequest, context: { params: { shortId: string } }) {
  const { shortId } = context.params
  if (!isValidShortId(shortId)) {
    return NextResponse.json({ error: 'Invalid shortId' }, { status: 400 })
  }

  const share = await getShareByShortId(shortId)
  if (!share) {
    return NextResponse.json({ error: 'Share not found' }, { status: 404 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    eventType?: unknown
  }
  const eventType = body.eventType ?? 'tap'
  if (!isAllowedEventType(eventType)) {
    return NextResponse.json({ error: 'Invalid eventType' }, { status: 400 })
  }

  await recordShareEvent({
    shareId: share.id,
    eventType,
    userAgent: request.headers.get('user-agent') || undefined,
  })

  return NextResponse.json({ ok: true })
}
