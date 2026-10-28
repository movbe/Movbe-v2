import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export type WaitlistType = 'icebreaker' | 'customer' | 'creator'

export interface WaitlistEntry {
  id?: string
  waitlistType: WaitlistType
  name: string
  email: string
  privacyAccepted: boolean
  promotionalConsent: boolean
  // Icebreaker / Social specific
  keyword?: string
  socialNetwork?: string
  socialHandle?: string
  socialFeedback?: string
  // Customer / Viewer specific
  preferredContent?: string
  currentPlatforms?: string
  missingFeatures?: string
  betaTesterInterest?: string
  // Creator specific
  creatorCategory?: string
  channelUrl?: string
  audienceSize?: string
  desiredTools?: string
  // Generic / fallback
  answers?: string
  source?: string
  createdAt?: unknown
}

export class WaitlistService {
  async joinWaitlist(data: Omit<WaitlistEntry, 'id' | 'createdAt'>): Promise<string> {
    try {
      const payload: Record<string, unknown> = {
        waitlistType: data.waitlistType,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        privacyAccepted: Boolean(data.privacyAccepted),
        promotionalConsent: Boolean(data.promotionalConsent),
        source: data.source || `waitlist_${data.waitlistType}`,
        createdAt: serverTimestamp(),
      }

      // Add optional fields only if provided
      if (data.keyword) payload.keyword = data.keyword.trim()
      if (data.socialNetwork) payload.socialNetwork = data.socialNetwork
      if (data.socialHandle) payload.socialHandle = data.socialHandle.trim()
      if (data.socialFeedback) payload.socialFeedback = data.socialFeedback.trim()

      if (data.preferredContent) payload.preferredContent = data.preferredContent
      if (data.currentPlatforms) payload.currentPlatforms = data.currentPlatforms
      if (data.missingFeatures) payload.missingFeatures = data.missingFeatures.trim()
      if (data.betaTesterInterest) payload.betaTesterInterest = data.betaTesterInterest

      if (data.creatorCategory) payload.creatorCategory = data.creatorCategory
      if (data.channelUrl) payload.channelUrl = data.channelUrl.trim()
      if (data.audienceSize) payload.audienceSize = data.audienceSize
      if (data.desiredTools) payload.desiredTools = data.desiredTools.trim()

      if (data.answers) payload.answers = data.answers.trim()

      const docRef = await addDoc(collection(db, 'waitlist'), payload)
      return docRef.id
    } catch (error) {
      // In case Firestore is temporarily unavailable, backup locally
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
