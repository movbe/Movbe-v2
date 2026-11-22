export type PlanTier = 'free' | 'personal' | 'pro' | 'business' | 'enterprise'

export interface PlanQuotaConfig {
  monthlyShares: number | null // null = unlimited
  maxAudioSeconds: number
  voiceLibraryEnabled: boolean
  hideBranding: boolean
}

export const PLAN_QUOTAS: Record<PlanTier, PlanQuotaConfig> = {
  free: {
    monthlyShares: 3,
    maxAudioSeconds: 5,
    voiceLibraryEnabled: false,
    hideBranding: false,
  },
  personal: {
    monthlyShares: 30,
    maxAudioSeconds: 15,
    voiceLibraryEnabled: true,
    hideBranding: true,
  },
  pro: {
    monthlyShares: null,
    maxAudioSeconds: 15,
    voiceLibraryEnabled: true,
    hideBranding: true,
  },
  business: {
    monthlyShares: null,
    maxAudioSeconds: 15,
    voiceLibraryEnabled: true,
    hideBranding: true,
  },
  enterprise: {
    monthlyShares: null,
    maxAudioSeconds: 30,
    voiceLibraryEnabled: true,
    hideBranding: true,
  },
}

export function getPlanQuota(tier?: string | null): PlanQuotaConfig {
  if (tier && tier in PLAN_QUOTAS) {
    return PLAN_QUOTAS[tier as PlanTier]
  }
  return PLAN_QUOTAS.free
}
