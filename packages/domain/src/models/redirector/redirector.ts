export class Redirector {
  constructor(
    readonly id: string,
    readonly page: string,
    readonly lureCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}
