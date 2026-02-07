export class RedirectorModel {
  static isNotNull = <T extends RedirectorModel>(model: T | null): model is T => {
    return model != null
  }

  constructor(
    readonly campaignId: string,
    readonly redirectorId: string,
    readonly lureCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export class FullRedirectorModel extends RedirectorModel {
  constructor(
    campaignId: string,
    redirectorId: string,
    readonly page: string,
    lureCount: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(campaignId, redirectorId, lureCount, createdAt, updatedAt)
  }
}

/*
export interface RedirectorModel {
  readonly campaignId: string
  readonly redirectorId: string
  readonly lureCount: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export const testRedirectorModel = <T extends RedirectorModel>(value: T | null): value is T => {
  return value != null
}

export interface FullRedirectorModel extends RedirectorModel {
  readonly page: string
}
*/
