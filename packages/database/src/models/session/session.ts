/**
 * Upgrade session params
 * @category Models
 */
export interface UpgradeSessionParams {
  lure_id: string
  session_id: string
  secret: string
  back_url: string
}

/**
 * Session model
 * @category Models
 */
export class SessionModel {
  static isNotNull = <T extends SessionModel>(model: T | null): model is T => {
    return model != null
  }

  constructor(
    readonly campaignId: string,
    readonly sessionId: string,
    readonly proxyId: string,
    readonly secret: string,
    readonly isUpgraded: boolean,
    readonly messageCount: number,
    readonly createdAt: Date,
    readonly authorizedAt: Date
  ) {}

  get isNew(): boolean {
    return this.messageCount <= 1
  }
}
