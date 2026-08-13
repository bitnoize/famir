import { ProxyModel } from './proxy.models.js'

/**
 * DI token for a proxy repository implementation.
 *
 * @category Proxy
 */
export const PROXY_REPOSITORY = Symbol('ProxyRepository')

/**
 * Defines the public contract for a proxy repository.
 *
 * A proxy contains an upstream server that handles outgoing traffic.
 * Proxies are automatically load-balanced when creating and authorizing sessions.
 *
 * @category Proxy
 */
export interface ProxyRepository {
  /**
   * Creates a new proxy.
   *
   * The proxy will be created in a disabled state (`isEnabled = false`).
   * Use {@link enable} to activate it for traffic routing.
   *
   * @param campaignId - The ID of the campaign to create the proxy in.
   * @param proxyId - The new proxy ID to create.
   * @param url - The upstream URL for the proxy.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the campaign is not locked.
   * @throws DatabaseError If the campaign lock secret does not match.
   * @throws DatabaseError If a proxy with the same ID already exists.
   * @throws DatabaseError If the proxy URL is already used.
   * @throws DatabaseError If the data validation fails.
   */
  create(campaignId: string, proxyId: string, url: string, lockSecret: string): Promise<void>

  /**
   * Reads the proxy by its ID.
   *
   * @param campaignId - The ID of the campaign containing the proxy.
   * @param proxyId - The proxy ID to read.
   * @returns The proxy model, or `null` if the proxy is not found.
   * @throws DatabaseError If the data validation fails.
   */
  read(campaignId: string, proxyId: string): Promise<ProxyModel | null>

  /**
   * Enables the proxy, making it available for traffic routing.
   *
   * Enabled proxies are automatically selected by the session creation logic
   * using random load balancing.
   *
   * @param campaignId - The ID of the campaign containing the proxy.
   * @param proxyId - The proxy ID to enable.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the campaign is not locked.
   * @throws DatabaseError If the campaign lock secret does not match.
   * @throws DatabaseError If the proxy does not exist.
   * @throws DatabaseError If the data validation fails.
   */
  enable(campaignId: string, proxyId: string, lockSecret: string): Promise<void>

  /**
   * Disables the proxy, stopping traffic routing.
   *
   * Existing sessions using this proxy will be automatically re-assigned
   * to another enabled proxy upon their next authorization.
   *
   * @param campaignId - The ID of the campaign containing the proxy.
   * @param proxyId - The proxy ID to disable.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the campaign is not locked.
   * @throws DatabaseError If the campaign lock secret does not match.
   * @throws DatabaseError If the proxy does not exist.
   * @throws DatabaseError If the data validation fails.
   */
  disable(campaignId: string, proxyId: string, lockSecret: string): Promise<void>

  /**
   * Deletes the proxy by its ID.
   *
   * A proxy must be disabled before it can be deleted.
   *
   * @param campaignId - The ID of the campaign containing the proxy.
   * @param proxyId - The proxy ID to delete.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the campaign is not locked.
   * @throws DatabaseError If the campaign lock secret does not match.
   * @throws DatabaseError If the proxy does not exist.
   * @throws DatabaseError If the proxy is still enabled.
   * @throws DatabaseError If the data validation fails.
   */
  delete(campaignId: string, proxyId: string, lockSecret: string): Promise<void>

  /**
   * Lists all proxies for the campaign.
   *
   * Proxies are ordered by creation time (oldest first).
   *
   * @param campaignId - The ID of the campaign to list proxies for.
   * @returns The array of proxy models, or `null` if the campaign does not exist.
   * @throws DatabaseError If the data validation fails.
   */
  list(campaignId: string): Promise<ProxyModel[] | null>
}
