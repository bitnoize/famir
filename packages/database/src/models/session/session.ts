/*
 * Client session
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
