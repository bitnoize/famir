export interface SessionModel {
  readonly campaignId: string
  readonly sessionId: string
  readonly proxyId: string
  readonly secret: string
  readonly isLanding: boolean
  readonly messageCount: number
  readonly createdAt: Date
  readonly lastAuthAt: Date
}
