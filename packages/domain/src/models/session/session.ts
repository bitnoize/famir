export class SessionModel {
  constructor(
    readonly campaignId: string,
    readonly id: string,
    readonly proxyId: string,
    readonly secret: string,
    readonly isLanding: boolean,
    readonly messageCount: number,
    readonly createdAt: Date,
    readonly lastAuthAt: Date
  ) {}
}
