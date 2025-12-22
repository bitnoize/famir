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

export interface UpdateCampaignData {
  campaignId: string
  description: string | null | undefined
  sessionExpire: number | null | undefined
  newSessionExpire: number | null | undefined
  messageExpire: number | null | undefined
}

export interface DeleteCampaignData {
  campaignId: string
}
