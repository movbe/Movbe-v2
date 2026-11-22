import { NextRequest, NextResponse } from 'next/server'

import { fetchVideoOEmbed } from '@/lib/shares/oembed'
import { parseSafeHttpUrl } from '@/lib/shares/validation'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Missing url query parameter' }, { status: 400 })
  }

  if (!parseSafeHttpUrl(url)) {
    return NextResponse.json({ error: 'Invalid http(s) URL' }, { status: 400 })
  }

  const metadata = await fetchVideoOEmbed(url)
  return NextResponse.json(metadata)
}
