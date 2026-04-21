import { ProxyModel } from './proxy.models.js'

/**
 * @category Proxy
 * @internal
 */
export const PROXY_REPOSITORY = Symbol('ProxyRepository')

/**
 * Represents a proxy repository
 *
 * @category Proxy
 */
export interface ProxyRepository {
  /**
   * Create proxy
   */
  create(campaignId: string, proxyId: string, url: string, lockSecret: string): Promise<void>

  /**
   * Read proxy by id
   */
  read(campaignId: string, proxyId: string): Promise<ProxyModel | null>

  /**
   * Enable proxy
   */
  enable(campaignId: string, proxyId: string, lockSecret: string): Promise<void>

  /**
   * Disable proxy
   */
  disable(campaignId: string, proxyId: string, lockSecret: string): Promise<void>

  /**
   * Delete proxy
   */
  delete(campaignId: string, proxyId: string, lockSecret: string): Promise<void>

  /**
   * List proxies
   */
  list(campaignId: string): Promise<ProxyModel[] | null>
}
