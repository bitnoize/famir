export const UPGRADE_SESSION_USE_CASE = Symbol('UpgradeSessionUseCase')

export interface UpgradeSessionData {
  campaignId: string
  lureId: string
  sessionId: string
  secret: string
}
