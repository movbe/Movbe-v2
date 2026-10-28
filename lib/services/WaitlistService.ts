import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export interface WaitlistEntry {
  id?: string
  name: string
  email: string
  role?: string
  answers?: string
  privacyAccepted: boolean
  promotionalConsent: boolean
  createdAt?: unknown
}

export class WaitlistService {
  async joinWaitlist(data: Omit<WaitlistEntry, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'waitlist'), {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role || 'user',
        answers: data.answers?.trim() || '',
        privacyAccepted: Boolean(data.privacyAccepted),
        promotionalConsent: Boolean(data.promotionalConsent),
        source: 'rompehielo_waitlist_form',
        createdAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      // In case Firestore is temporarily unavailable or misconfigured, backup locally
      if (typeof window !== 'undefined') {
        try {
          const localEntries = JSON.parse(localStorage.getItem('pending_waitlist_entries') || '[]')
          localEntries.push({
            ...data,
            localTimestamp: new Date().toISOString(),
          })
          localStorage.setItem('pending_waitlist_entries', JSON.stringify(localEntries))
        } catch {
          // Ignore localStorage errors
        }
      }
      throw error
    }
  }
}

export const waitlistService = new WaitlistService()
