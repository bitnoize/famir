export interface CreateProxyData {
  campaignId: string
  proxyId: string
  url: string
  lockCode: number
}

export interface ReadProxyData {
  campaignId: string
  proxyId: string
}

export interface SwitchProxyData {
  campaignId: string
  proxyId: string
  lockCode: number
}

export interface DeleteProxyData {
  campaignId: string
  proxyId: string
  lockCode: number
}

export interface ListProxiesData {
  campaignId: string
}
