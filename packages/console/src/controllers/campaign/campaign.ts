export interface CreateCampaignData {
  campaignId: string
  mirrorDomain: string
  description: string
  lockTimeout: number
  landingUpgradePath: string
  sessionCookieName: string
  sessionExpire: number
  newSessionExpire: number
  messageExpire: number
}

export interface ReadCampaignData {
  campaignId: string
}

export interface LockCampaignData {
  campaignId: string
}

export interface UnlockCampaignData {
  campaignId: string
  lockSecret: string
}

export interface UpdateCampaignData {
  campaignId: string
  description: string | null | undefined
  sessionExpire: number | null | undefined
  newSessionExpire: number | null | undefined
  messageExpire: number | null | undefined
  lockSecret: string
}

export interface DeleteCampaignData {
  campaignId: string
  lockSecret: string
}
