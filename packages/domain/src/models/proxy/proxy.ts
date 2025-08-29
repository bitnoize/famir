export class Proxy {
  constructor(
    readonly id: string,
    readonly url: string,
    readonly isEnabled: boolean,
    readonly totalCount: number,
    readonly successCount: number,
    readonly failureCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export interface EnabledProxy extends Proxy {
  isEnabled: true
}
