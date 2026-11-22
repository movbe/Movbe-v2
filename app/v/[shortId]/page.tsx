import { notFound } from 'next/navigation'

import { getShareByShortId } from '@/lib/shares/shareStore'

import { TapToRevealClient } from './TapToRevealClient'

export const dynamic = 'force-dynamic'

export default async function TapToRevealPage({
  params,
}: {
  params: { shortId: string }
}) {
  const share = await getShareByShortId(params.shortId)
  if (!share) {
    notFound()
  }

  return <TapToRevealClient share={share} />
}
