export class SessionModel {
  static isNotNull = <T extends SessionModel>(model: T | null): model is T => {
    return model != null
  }

  constructor(
    readonly campaignId: string,
    readonly sessionId: string,
    readonly proxyId: string,
    readonly secret: string,
    readonly isLanding: boolean,
    readonly messageCount: number,
    readonly createdAt: Date,
    readonly lastAuthAt: Date
  ) {}
}
