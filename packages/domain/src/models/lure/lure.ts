export class LureModel {
  constructor(
    readonly campaignId: string,
    readonly id: string,
    readonly path: string,
    readonly redirectorId: string,
    readonly isEnabled: boolean,
    readonly sessionCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export interface DisabledLureModel extends LureModel {
  isEnabled: false
}

export interface EnabledLureModel extends LureModel {
  isEnabled: true
}
