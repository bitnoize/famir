export class RedirectorModel {
  static isNotNull = <T extends RedirectorModel>(model: T | null): model is T => {
    return model != null
  }

  constructor(
    readonly campaignId: string,
    readonly redirectorId: string,
    readonly lureCount: number,
    readonly createdAt: Date
  ) {}
}

export class FullRedirectorModel extends RedirectorModel {
  constructor(
    campaignId: string,
    redirectorId: string,
    readonly page: string,
    lureCount: number,
    createdAt: Date
  ) {
    super(campaignId, redirectorId, lureCount, createdAt)
  }
}
