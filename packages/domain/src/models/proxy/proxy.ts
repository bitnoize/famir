export class Proxy {
  constructor(
    readonly campaignId: string,
    readonly id: string,
    readonly url: string,
    readonly isEnabled: boolean,
    readonly messageCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export interface DisabledProxy extends Proxy {
  isEnabled: false
}

export interface EnabledProxy extends Proxy {
  isEnabled: true
}
