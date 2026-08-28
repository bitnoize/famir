import { FullTargetModel, TargetAccessLevel, TargetHosts, TargetModel } from './target.models.js'

/**
 * DI token for a target repository implementation.
 *
 * @category Target
 */
export const TARGET_REPOSITORY = Symbol('TargetRepository')

/**
 * Defines the public contract for a target repository.
 *
 * A target contains the configuration that maps a mirror server to a donor server.
 *
 * @category Target
 */
export interface TargetRepository {
  /**
   * Creates a new target.
   *
   * The target will be created in a disabled state (`isEnabled = false`).
   * Use {@link enable} to activate it for traffic routing.
   *
   * @param campaignId - The ID of the campaign to create the target in.
   * @param targetId - The new target ID to create.
   * @param accessLevel - The access level.
   * @param donorSecure - The flag indicating if the donor server uses HTTPS.
   * @param donorSub - The donor subdomain.
   * @param donorDomain - The donor domain name.
   * @param donorPort - The donor server port.
   * @param mirrorSecure - The flag indicating if the mirror server uses HTTPS.
   * @param mirrorSub - The mirror subdomain.
   * @param mirrorPort - The mirror server port.
   * @param connectTimeout - The connection timeout in milliseconds.
   * @param simpleTimeout - The simple request timeout in milliseconds.
   * @param streamTimeout - The streaming request timeout in milliseconds.
   * @param headersSizeLimit - The maximum headers size in bytes.
   * @param bodySizeLimit - The maximum body size in bytes.
   * @param mainPage - The custom main page content.
   * @param notFoundPage - The custom not-found page content.
   * @param faviconIco - The custom favicon.ico content.
   * @param robotsTxt - The custom robots.txt content.
   * @param sitemapXml - The custom sitemap.xml content.
   * @param allowWebSockets - The flag indicating if WebSocket connections allowed.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the campaign is not locked.
   * @throws DatabaseError If the campaign lock secret does not match.
   * @throws DatabaseError If a target with the same ID already exists.
   * @throws DatabaseError If the target donor is already used.
   * @throws DatabaseError If the target mirror is already used.
   * @throws DatabaseError If the data validation fails.
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
   * Reads the target by its ID.
   *
   * @param campaignId - The ID of the campaign containing the target.
   * @param targetId - The target ID to read.
   * @returns The target model, or `null` if the target is not found.
   * @throws DatabaseError If the data validation fails.
   */
  read(campaignId: string, targetId: string): Promise<TargetModel | null>

  /**
   * Reads the full target by its ID.
   *
   * @param campaignId - The ID of the campaign containing the target.
   * @param targetId - The target ID to read.
   * @returns The full target model, or `null` if the target is not found.
   * @throws DatabaseError If the data validation fails.
   */
  readFull(campaignId: string, targetId: string): Promise<FullTargetModel | null>

  /**
   * Reads all target hosts across all campaigns.
   *
   * This method returns a dictionary mapping mirror hostnames to target links,
   * used for fast routing lookups.
   *
   * @returns The dictionary of target hosts and their links.
   * @throws DatabaseError If the data validation fails.
   */
  readHosts(): Promise<TargetHosts>

  /**
   * Finds a target by its mirror hostname.
   *
   * This is the primary lookup method for routing incoming HTTP requests.
   * Given a `Host` header from a request, it returns the corresponding target.
   *
   * @param mirrorHost - The mirror hostname to look up.
   * @returns The target model, or `null` if no target matches the hostname.
   * @throws DatabaseError If the data validation fails.
   */
  find(mirrorHost: string): Promise<TargetModel | null>

  /**
   * Finds a full target by its mirror hostname.
   *
   * @param mirrorHost - The mirror hostname to look up.
   * @returns The full target model, or `null` if no target matches the hostname.
   * @throws DatabaseError If the data validation fails.
   */
  findFull(mirrorHost: string): Promise<FullTargetModel | null>

  /**
   * Updates the target specific fields.
   *
   * All update parameters are optional. Only provided fields will be updated.
   *
   * @param campaignId - The ID of the campaign containing the target.
   * @param targetId - The target ID to update.
   * @param connectTimeout - The connection timeout in milliseconds.
   * @param simpleTimeout - The simple request timeout in milliseconds.
   * @param streamTimeout - The streaming request timeout in milliseconds.
   * @param headersSizeLimit - The maximum headers size in bytes.
   * @param bodySizeLimit - The maximum body size in bytes.
   * @param mainPage - The custom main page content.
   * @param notFoundPage - The custom not-found page content.
   * @param faviconIco - The custom favicon.ico content.
   * @param robotsTxt - The custom robots.txt content.
   * @param sitemapXml - The custom sitemap.xml content.
   * @param allowWebSockets - The flag indicating if WebSocket connections allowed.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the campaign is not locked.
   * @throws DatabaseError If the campaign lock secret does not match.
   * @throws DatabaseError If the target does not exist.
   * @throws DatabaseError If the data validation fails.
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
   * Enables the target, making it available for traffic routing.
   *
   * When enabled, the mirror hostname becomes active and can be used
   * for proxying requests to the donor server.
   *
   * @param campaignId - The ID of the campaign containing the target.
   * @param targetId - The target ID to enable.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the campaign is not locked.
   * @throws DatabaseError If the campaign lock secret does not match.
   * @throws DatabaseError If the target does not exist.
   * @throws DatabaseError If the data validation fails.
   */
  enable(campaignId: string, targetId: string, lockSecret: string): Promise<void>

  /**
   * Disables the target, stopping traffic routing.
   *
   * When disabled, requests to the mirror hostname will not be proxied.
   *
   * @param campaignId - The ID of the campaign containing the target.
   * @param targetId - The target ID to disable.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the campaign is not locked.
   * @throws DatabaseError If the campaign lock secret does not match.
   * @throws DatabaseError If the target does not exist.
   * @throws DatabaseError If the data validation fails.
   */
  disable(campaignId: string, targetId: string, lockSecret: string): Promise<void>

  /**
   * Appends multiple labels to the target.
   *
   * Labels are used for categorization and filtering of targets.
   * The label is automatically converted to lowercase.
   *
   * @param campaignId - The ID of the campaign containing the target.
   * @param targetId - The target ID to append label to.
   * @param labels - The labels to append to the target.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the campaign is not locked.
   * @throws DatabaseError If the campaign lock secret does not match.
   * @throws DatabaseError If the target does not exist.
   * @throws DatabaseError If the data validation fails.
   */
  appendLabels(
    campaignId: string,
    targetId: string,
    labels: string[],
    lockSecret: string
  ): Promise<void>

  /**
   * Removes all labels from the target.
   *
   * @param campaignId - The ID of the campaign containing the target.
   * @param targetId - The target ID to remove labels from.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the campaign is not locked.
   * @throws DatabaseError If the campaign lock secret does not match.
   * @throws DatabaseError If the target does not exist.
   * @throws DatabaseError If the data validation fails.
   */
  removeLabels(campaignId: string, targetId: string, lockSecret: string): Promise<void>

  /**
   * Deletes the target by its ID.
   *
   * The target must be disabled before it can be deleted.
   *
   * @param campaignId - The ID of the campaign containing the target.
   * @param targetId - The target ID to delete.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the campaign is not locked.
   * @throws DatabaseError If the campaign lock secret does not match.
   * @throws DatabaseError If the target does not exist.
   * @throws DatabaseError If the target is still enabled.
   * @throws DatabaseError If the data validation fails.
   */
  delete(campaignId: string, targetId: string, lockSecret: string): Promise<void>

  /**
   * Lists all targets for the campaign.
   *
   * Targets are ordered by creation time (oldest first).
   *
   * @param campaignId - The ID of the campaign to list targets for.
   * @returns The array of target models, or `null` if the campaign does not exist.
   * @throws DatabaseError If the data validation fails.
   */
  list(campaignId: string): Promise<TargetModel[] | null>

  /**
   * Lists all full targets for the campaign.
   *
   * Targets are ordered by creation time (oldest first).
   *
   * @param campaignId - The ID of the campaign to list targets for.
   * @returns The array of full target models, or `null` if the campaign does not exist.
   * @throws DatabaseError If the data validation fails.
   */
  listFull(campaignId: string): Promise<FullTargetModel[] | null>
}
