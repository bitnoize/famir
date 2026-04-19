/**
 * @category DI
 */
export const PROXY_SERVICE = Symbol('ProxyService')

/**
 * @category Data
 */
export interface CreateProxyData {
  campaignId: string
  proxyId: string
  url: string
  lockSecret: string
}

/**
 * @category Data
 */
export interface ReadProxyData {
  campaignId: string
  proxyId: string
}

/**
 * @category Data
 */
export interface SwitchProxyData {
  campaignId: string
  proxyId: string
  lockSecret: string
}

/**
 * @category Data
 */
export interface DeleteProxyData {
  campaignId: string
  proxyId: string
  lockSecret: string
}

/**
 * @category Data
 */
export interface ListProxiesData {
  campaignId: string
}
