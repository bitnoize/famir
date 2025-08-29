export class Lure {
  constructor(
    readonly id: string,
    readonly path: string,
    readonly redirectorId: string,
    readonly isEnabled: boolean,
    readonly authCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export interface EnabledLure extends Lure {
  isEnabled: true
}
