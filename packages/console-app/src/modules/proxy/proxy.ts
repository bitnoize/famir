/**
 * @category Proxy
 * @internal
 */
export const PROXY_CONTROLLER = Symbol('ProxyController')

/**
 * @category Proxy
 * @internal
 */
export const PROXY_SERVICE = Symbol('ProxyService')

/**
 * @category Proxy
 */
export interface CreateProxyData {
  campaignId: string
  proxyId: string
  url: string
  lockSecret: string
}

/**
 * @category Proxy
 */
export interface ReadProxyData {
  campaignId: string
  proxyId: string
}

/**
 * @category Proxy
 */
export interface SwitchProxyData {
  campaignId: string
  proxyId: string
  lockSecret: string
}

/**
 * @category Proxy
 */
export interface DeleteProxyData {
  campaignId: string
  proxyId: string
  lockSecret: string
}

/**
 * @category Proxy
 */
export interface ListProxiesData {
  campaignId: string
}
