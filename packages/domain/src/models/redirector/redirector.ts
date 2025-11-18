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
