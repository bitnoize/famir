/**
 * @category Redirector
 */
export type RedirectorParams = Record<string, string>

/**
 * Represents redirector model
 *
 * @category Redirector
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

/**
 * Represents full redirector model
 *
 * @category Redirector
 */
export class FullRedirectorModel extends RedirectorModel {
  constructor(
    campaignId: string,
    redirectorId: string,
    readonly page: string,
    readonly fields: string[],
    lureCount: number,
    createdAt: Date
  ) {
    super(campaignId, redirectorId, lureCount, createdAt)
  }

  get isLoose(): boolean {
    return this.fields.length === 0
  }

  checkParams(params: RedirectorParams): boolean {
    return this.isLoose || this.fields.every((field) => params[field] != null)
  }
}
