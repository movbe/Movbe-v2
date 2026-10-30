import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

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
      const payload = {
        waitlistType: data.waitlistType,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        privacyAccepted: Boolean(data.privacyAccepted),
        promotionalConsent: Boolean(data.promotionalConsent),
        responses: data.responses,
        source: data.source || `waitlist_${data.waitlistType}`,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'waitlist'), payload)
      return docRef.id
    } catch (error) {
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
