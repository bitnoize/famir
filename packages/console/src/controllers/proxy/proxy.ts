export interface CreateProxyData {
  campaignId: string
  proxyId: string
  url: string
  lockSecret: string
}

export interface ReadProxyData {
  campaignId: string
  proxyId: string
}

export interface SwitchProxyData {
  campaignId: string
  proxyId: string
  lockSecret: string
}

export interface DeleteProxyData {
  campaignId: string
  proxyId: string
  lockSecret: string
}

export interface ListProxiesData {
  campaignId: string
}
