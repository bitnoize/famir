/*
 * Lure is a secret link to enter mirror through landing page
 */
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
    readonly createdAt: Date
  ) {}
}

export interface EnabledLureModel extends LureModel {
  isEnabled: true
}
