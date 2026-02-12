export class ProxyModel {
  static isNotNull = <T extends ProxyModel>(model: T | null): model is T => {
    return model != null
  }

  static isEnabled = <T extends ProxyModel>(model: T): model is T & { isEnabled: true } => {
    return model.isEnabled
  }

  constructor(
    readonly campaignId: string,
    readonly proxyId: string,
    readonly url: string,
    readonly isEnabled: boolean,
    readonly messageCount: number,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export interface EnabledProxyModel extends ProxyModel {
  isEnabled: true
}
