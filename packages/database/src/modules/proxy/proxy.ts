import { ProxyModel } from './proxy.models.js'

/**
 * DI token for proxy repository.
 *
 * @category Proxy
 * @internal
 */
export const PROXY_REPOSITORY = Symbol('ProxyRepository')

/**
 * Represents a proxy repository.
 *
 * @category Proxy
 */
export interface ProxyRepository {
  /**
   * Creates a new proxy in the specified campaign.
   *
   * The proxy will be created in a disabled state (`isEnabled = false`).
   * Use `enable()` to activate it for traffic routing.
   *
   * @param campaignId - The ID of the campaign to create the proxy in
   * @param proxyId - The unique identifier for the new proxy
   * @param url - The proxy URL
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If a proxy with the same ID already exists
   * @throws {@link DatabaseError} If `url` is already used by another proxy in the campaign
   */
  create(campaignId: string, proxyId: string, url: string, lockSecret: string): Promise<void>

  /**
   * Reads a proxy model by its ID.
   *
   * @param campaignId - The ID of the campaign containing the proxy
   * @param proxyId - The proxy ID to read
   * @returns The proxy model, or `null` if not found
   */
  read(campaignId: string, proxyId: string): Promise<ProxyModel | null>

  /**
   * Enables a proxy, making it available for traffic routing.
   *
   * Enabled proxies are automatically selected by the session creation logic
   * using random load balancing.
   *
   * @param campaignId - The ID of the campaign containing the proxy
   * @param proxyId - The proxy ID to enable
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the proxy does not exist
   */
  enable(campaignId: string, proxyId: string, lockSecret: string): Promise<void>

  /**
   * Disables a proxy, stopping traffic routing.
   *
   * Existing sessions using this proxy will be automatically re-assigned
   * to another enabled proxy upon their next authorization.
   *
   * @param campaignId - The ID of the campaign containing the proxy
   * @param proxyId - The proxy ID to disable
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the proxy does not exist
   */
  disable(campaignId: string, proxyId: string, lockSecret: string): Promise<void>

  /**
   * Delete a proxy model by its ID.
   *
   * The proxy must be **disabled** before it can be deleted.
   *
   * @param campaignId - The ID of the campaign containing the proxy
   * @param proxyId - The proxy ID to delete
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the proxy does not exist
   * @throws {@link DatabaseError} If the proxy is still enabled
   */
  delete(campaignId: string, proxyId: string, lockSecret: string): Promise<void>

  /**
   * Lists all proxies in a campaign.
   *
   * Proxies are ordered by creation time (oldest first).
   *
   * @param campaignId - The ID of the campaign to list proxies for
   * @returns An array of proxy models, or `null` if the campaign does not exist
   */
  list(campaignId: string): Promise<ProxyModel[] | null>
}
