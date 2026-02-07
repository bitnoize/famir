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

/*
export interface ProxyModel {
  readonly campaignId: string
  readonly proxyId: string
  readonly url: string
  readonly isEnabled: boolean
  readonly messageCount: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export const testProxyModel = <T extends ProxyModel>(value: T | null): value is T => {
  return value != null
}

export interface EnabledProxyModel extends ProxyModel {
  isEnabled: true
}

export const testEnabledProxyModel = <T extends ProxyModel>(
  value: T
): value is T & { isEnabled: true } => {
  return value.isEnabled
}
*/
