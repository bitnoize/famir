export class RedirectorModel {
  constructor(
    readonly campaignId: string,
    readonly id: string,
    readonly page: string,
    readonly lureCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}
