export interface ProxyModel {
  readonly campaignId: string
  readonly proxyId: string
  readonly url: string
  readonly isEnabled: boolean
  readonly messageCount: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface DisabledProxyModel extends ProxyModel {
  isEnabled: false
}

export interface EnabledProxyModel extends ProxyModel {
  isEnabled: true
}
