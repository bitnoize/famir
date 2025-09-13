export class Lure {
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

export interface DisabledLure extends Lure {
  isEnabled: false
}

export interface EnabledLure extends Lure {
  isEnabled: true
}
