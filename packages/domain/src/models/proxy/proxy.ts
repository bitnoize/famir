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
