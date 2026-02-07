export class LureModel {
  static isNotNull = <T extends LureModel>(model: T | null): model is T => {
    return model != null
  }

  static isEnabled = <T extends LureModel>(model: T): model is T & { isEnabled: true } => {
    return model.isEnabled
  }

  constructor(
    readonly campaignId: string,
    readonly lureId: string,
    readonly path: string,
    readonly redirectorId: string,
    readonly isEnabled: boolean,
    readonly sessionCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export interface EnabledLureModel extends LureModel {
  isEnabled: true
}

/*
export interface LureModel {
  readonly campaignId: string
  readonly lureId: string
  readonly path: string
  readonly redirectorId: string
  readonly isEnabled: boolean
  readonly sessionCount: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export const testLureModel = <T extends LureModel>(value: T | null): value is T => {
  return value != null
}

export interface EnabledLureModel extends LureModel {
  isEnabled: true
}

export const testEnabledLureModel = <T extends LureModel>(
  value: T
): value is T & { isEnabled: true } => {
  return value.isEnabled
}
*/
