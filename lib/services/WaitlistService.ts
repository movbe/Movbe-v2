export type WaitlistType = 'icebreaker' | 'customer' | 'creator'

export interface WaitlistSubmissionData {
  waitlistType: WaitlistType
  name: string
  email: string
  privacyAccepted: boolean
  promotionalConsent: boolean
  responses: Record<string, unknown>
  source?: string
  createdAt?: unknown
}

export class WaitlistService {
  async submitWaitlist(data: Omit<WaitlistSubmissionData, 'createdAt'>): Promise<string> {
    try {
      const res = await fetch('/api/v1/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waitlistType: data.waitlistType,
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          role: data.waitlistType,
          answers: JSON.stringify(data.responses ?? {}),
          privacyAccepted: Boolean(data.privacyAccepted),
          promotionalConsent: Boolean(data.promotionalConsent),
          source: data.source || `waitlist_${data.waitlistType}`,
        }),
      })

      if (!res.ok) {
        throw new Error(`Waitlist API failed with status ${res.status}`)
      }

      const json = (await res.json()) as { id: string }
      return json.id
    } catch (error) {
      // In case Supabase is temporarily unavailable or unconfigured, backup locally
      if (typeof window !== 'undefined') {
        try {
          const localEntries = JSON.parse(localStorage.getItem('pending_waitlist_entries') || '[]')
          localEntries.push({
            ...data,
            localTimestamp: new Date().toISOString(),
          })
          localStorage.setItem('pending_waitlist_entries', JSON.stringify(localEntries))
        } catch {
          // ignore storage error
        }
      }
      throw error
    }
  }

  // Backwards compatibility alias
  async joinWaitlist(data: Record<string, unknown>): Promise<string> {
    return this.submitWaitlist({
      waitlistType: (data.waitlistType as WaitlistType) || 'icebreaker',
      name: (data.name as string) || (data.companyName as string) || '',
      email: (data.email as string) || '',
      privacyAccepted: Boolean(data.privacyAccepted),
      promotionalConsent: Boolean(data.promotionalConsent),
      responses: data,
    })
  }
}

export const waitlistService = new WaitlistService()
