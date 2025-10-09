export interface CampaignModel {
  readonly campaignId: string
  readonly mirrorDomain: string
  readonly description: string
  readonly landingSecret: string
  readonly landingAuthPath: string
  readonly landingAuthParam: string
  readonly landingLureParam: string
  readonly sessionCookieName: string
  readonly sessionExpire: number
  readonly newSessionExpire: number
  readonly messageExpire: number
  readonly proxyCount: number
  readonly targetCount: number
  readonly redirectorCount: number
  readonly lureCount: number
  readonly sessionCount: number
  readonly messageCount: number
  readonly createdAt: Date
  readonly updatedAt: Date
}
