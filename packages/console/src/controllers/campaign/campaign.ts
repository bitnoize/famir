export interface CreateCampaignData {
  campaignId: string
  mirrorDomain: string
  description: string
  landingUpgradePath: string
  landingUpgradeParam: string
  landingRedirectorParam: string
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
  isForce?: boolean
}

export interface UnlockCampaignData {
  campaignId: string
  lockCode: number
}

export interface UpdateCampaignData {
  campaignId: string
  description: string | null | undefined
  sessionExpire: number | null | undefined
  newSessionExpire: number | null | undefined
  messageExpire: number | null | undefined
  lockCode: number
}

export interface DeleteCampaignData {
  campaignId: string
  lockCode: number
}
