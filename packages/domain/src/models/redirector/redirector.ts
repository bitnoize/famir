export interface RedirectorModel {
  readonly campaignId: string
  readonly redirectorId: string
  readonly lureCount: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface FullRedirectorModel extends RedirectorModel {
  readonly page: string
}
