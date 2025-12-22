export interface CreateSessionData {
  campaignId: string
}

export interface ReadSessionData {
  campaignId: string
  sessionId: string
}

export interface AuthSessionData {
  campaignId: string
  sessionId: string
}

export interface UpgradeSessionData {
  campaignId: string
  lureId: string
  sessionId: string
  secret: string
}
