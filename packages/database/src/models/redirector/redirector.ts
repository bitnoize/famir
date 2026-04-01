/*
 * Redirector is a simple page shows to client when using landing targets
 */
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

/*
 * Extended redirector
 */
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
