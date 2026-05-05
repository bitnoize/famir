import { FullTargetModel, TargetAccessLevel, TargetHosts, TargetModel } from './target.models.js'

/**
 * DI token for target repository.
 *
 * @category Target
 * @internal
 */
export const TARGET_REPOSITORY = Symbol('TargetRepository')

/**
 * Represents a target repository.
 *
 * @category Target
 */
export interface TargetRepository {
  /**
   * Creates a new target in the specified campaign.
   *
   * The target will be created in a disabled state (`isEnabled = false`).
   * Use `enable()` to activate it for traffic routing.
   *
   * @param campaignId - The ID of the campaign to create the target in
   * @param targetId - The unique identifier for the new target
   * @param accessLevel - The access level
   * @param donorSecure - Whether the donor server uses HTTPS
   * @param donorSub - The donor subdomain
   * @param donorDomain - The donor domain name
   * @param donorPort - The donor server port
   * @param mirrorSecure - Whether the mirror uses HTTPS
   * @param mirrorSub - The mirror subdomain
   * @param mirrorPort - The mirror server port
   * @param connectTimeout - Connection timeout
   * @param simpleTimeout - Simple request timeout
   * @param streamTimeout - Streaming request timeout
   * @param headersSizeLimit - Maximum headers size in bytes
   * @param bodySizeLimit - Maximum body size in bytes
   * @param mainPage - Custom main page content
   * @param notFoundPage - Custom 404 page content
   * @param faviconIco - Custom favicon content
   * @param robotsTxt - Custom robots.txt content
   * @param sitemapXml - Custom sitemap.xml content
   * @param allowWebSockets - Whether to allow WebSocket connections
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If a target with the same ID already exists
   * @throws {@link DatabaseError} If the target donor is already used
   * @throws {@link DatabaseError} If the target mirror is already used
   * @throws {@link DatabaseError} If the mirror hostname is already taken
   */
  create(
    campaignId: string,
    targetId: string,
    accessLevel: TargetAccessLevel,
    donorSecure: boolean,
    donorSub: string,
    donorDomain: string,
    donorPort: number,
    mirrorSecure: boolean,
    mirrorSub: string,
    mirrorPort: number,
    connectTimeout: number,
    simpleTimeout: number,
    streamTimeout: number,
    headersSizeLimit: number,
    bodySizeLimit: number,
    mainPage: string,
    notFoundPage: string,
    faviconIco: string,
    robotsTxt: string,
    sitemapXml: string,
    allowWebSockets: boolean,
    lockSecret: string
  ): Promise<void>

  /**
   * Reads a target model by its ID.
   *
   * @param campaignId - The ID of the campaign containing the target
   * @param targetId - The target ID to read
   * @returns The target model, or `null` if not found
   */
  read(campaignId: string, targetId: string): Promise<TargetModel | null>

  /**
   * Reads a full target model by its ID.
   *
   * @param campaignId - The ID of the campaign containing the target
   * @param targetId - The target ID to read
   * @returns The full target model, or `null` if not found
   */
  readFull(campaignId: string, targetId: string): Promise<FullTargetModel | null>

  /**
   * Read a target hosts entire all campaigns.
   *
   * @returns The target hosts object
   */
  readHosts(): Promise<TargetHosts>

  /**
   * Finds a target by its mirror hostname.
   *
   * This is the primary lookup method for routing incoming HTTP requests.
   * Given a `Host` header from a request, it returns the corresponding target model.
   *
   * @param mirrorHost - The mirror hostname
   * @returns The target model, or `null` if no target matches the hostname
   */
  find(mirrorHost: string): Promise<TargetModel | null>

  /**
   * Finds a full target by its mirror hostname.
   *
   * @param mirrorHost - The mirror hostname
   * @returns The full target model, or `null` if no target matches the hostname
   */
  findFull(mirrorHost: string): Promise<FullTargetModel | null>

  /**
   * Updates specific fields of a target model.
   *
   * @param campaignId - The ID of the campaign containing the target
   * @param targetId - The target ID to update
   * @param connectTimeout - Connection timeout
   * @param simpleTimeout - Simple request timeout
   * @param streamTimeout - Streaming request timeout
   * @param headersSizeLimit - Maximum headers size in bytes
   * @param bodySizeLimit - Maximum body size in bytes
   * @param mainPage - Custom main page content
   * @param notFoundPage - Custom 404 page content
   * @param faviconIco - Custom favicon content
   * @param robotsTxt - Custom robots.txt content
   * @param sitemapXml - Custom sitemap.xml content
   * @param allowWebSockets - Whether to allow WebSocket connections
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the target does not exist
   */
  update(
    campaignId: string,
    targetId: string,
    connectTimeout: number | null | undefined,
    simpleTimeout: number | null | undefined,
    streamTimeout: number | null | undefined,
    headersSizeLimit: number | null | undefined,
    bodySizeLimit: number | null | undefined,
    mainPage: string | null | undefined,
    notFoundPage: string | null | undefined,
    faviconIco: string | null | undefined,
    robotsTxt: string | null | undefined,
    sitemapXml: string | null | undefined,
    allowWebSockets: boolean | null | undefined,
    lockSecret: string
  ): Promise<void>

  /**
   * Enables a target, making it available for traffic routing.
   *
   * When enabled, the mirror hostname becomes active and can be used
   * for proxying requests to the donor server.
   *
   * @param campaignId - The ID of the campaign containing the target
   * @param targetId - The target ID to enable
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the target does not exist
   */
  enable(campaignId: string, targetId: string, lockSecret: string): Promise<void>

  /**
   * Disables a target, stopping traffic routing.
   *
   * When disabled, requests to the mirror hostname will not be proxied.
   *
   * @param campaignId - The ID of the campaign containing the target
   * @param targetId - The target ID to disable
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the target does not exist
   */
  disable(campaignId: string, targetId: string, lockSecret: string): Promise<void>

  /**
   * Appends a label to a target.
   *
   * @param campaignId - The ID of the campaign containing the target
   * @param targetId - The target ID to append label to
   * @param label - The label to add
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the target does not exist
   */
  appendLabel(
    campaignId: string,
    targetId: string,
    label: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Removes a label from a target.
   *
   * @param campaignId - The ID of the campaign containing the target
   * @param targetId - The target ID to remove label from
   * @param label - The label to remove
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the target does not exist
   */
  removeLabel(
    campaignId: string,
    targetId: string,
    label: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Delete a target model by its ID.
   *
   * The target must be **disabled **before it can be deleted.
   *
   * @param campaignId - The ID of the campaign containing the target
   * @param targetId - The target ID to delete
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the target does not exist
   * @throws {@link DatabaseError} If the target is still enabled
   */
  delete(campaignId: string, targetId: string, lockSecret: string): Promise<void>

  /**
   * Lists all targets in a campaign.
   *
   * Targets are ordered by creation time (oldest first).
   *
   * @param campaignId - The ID of the campaign to list targets for
   * @returns An array of target models, or `null` if the campaign does not exist
   */
  list(campaignId: string): Promise<TargetModel[] | null>

  /**
   * Lists all full targets in a campaign.
   *
   * Targets are ordered by creation time (oldest first).
   *
   * @param campaignId - The ID of the campaign to list targets for
   * @returns An array of full target models, or `null` if the campaign does not exist
   */
  listFull(campaignId: string): Promise<FullTargetModel[] | null>
}
