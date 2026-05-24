import { LureModel } from './lure.models.js'

/**
 * DI token for a lure repository implementation.
 *
 * @category Lure
 */
export const LURE_REPOSITORY = Symbol('LureRepository')

/**
 * Defines the public contract for a lure repository.
 *
 * A lure contains a URL path endpoint that maps incoming HTTP requests to a redirector.
 * Lures are created in a disabled state and must be explicitly enabled to start routing traffic.
 *
 * @category Lure
 */
export interface LureRepository {
  /**
   * Creates a new lure.
   *
   * The lure will be created in a disabled state (`isEnabled = false`).
   * Use {@link enable} to activate it for traffic routing.
   *
   * @param campaignId - The ID of the campaign to create the lure in.
   * @param lureId - The new lure ID to create.
   * @param path - The URL path for the lure.
   * @param redirectorId - The ID of the redirector that handles this lure.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the campaign is not locked.
   * @throws {@link DatabaseError} If the campaign lock secret does not match.
   * @throws {@link DatabaseError} If a lure with the same ID already exists.
   * @throws {@link DatabaseError} If the lure URL path is already used by another campaign.
   * @throws {@link DatabaseError} If the redirector does not exist.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  create(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Reads the lure by its ID.
   *
   * @param campaignId - The ID of the campaign containing the lure.
   * @param lureId - The lure ID to read.
   * @returns The lure model, or `null` if the lure is not found.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  read(campaignId: string, lureId: string): Promise<LureModel | null>

  /**
   * Finds a lure by its URL path.
   *
   * This is the primary routing method for HTTP requests. When a request arrives
   * at a mirror domain, the request path is extracted and used to instantly find
   * the corresponding lure via a direct hash lookup.
   *
   * @param campaignId - The ID of the campaign to search in.
   * @param path - The URL path to look up.
   * @returns The lure model, or `null` if no lure matches the URL path.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  find(campaignId: string, path: string): Promise<LureModel | null>

  /**
   * Enables the lure, making it available for request routing.
   *
   * When enabled, the URL path becomes active and can be used to serve
   * the associated redirector content.
   *
   * @param campaignId - The ID of the campaign containing the lure.
   * @param lureId - The lure ID to enable.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the campaign is not locked.
   * @throws {@link DatabaseError} If the campaign lock secret does not match.
   * @throws {@link DatabaseError} If the lure does not exist.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  enable(campaignId: string, lureId: string, lockSecret: string): Promise<void>

  /**
   * Disables the lure, stopping request routing.
   *
   * When disabled, requests to the URL path will not be routed.
   *
   * @param campaignId - The ID of the campaign containing the lure.
   * @param lureId - The lure ID to disable.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the campaign is not locked.
   * @throws {@link DatabaseError} If the campaign lock secret does not match.
   * @throws {@link DatabaseError} If the lure does not exist.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  disable(campaignId: string, lureId: string, lockSecret: string): Promise<void>

  /**
   * Deletes the lure by its ID.
   *
   * A lure must be disabled before it can be deleted.
   *
   * @param campaignId - The ID of the campaign containing the lure.
   * @param lureId - The lure ID to delete.
   * @param redirectorId - The ID of the redirector that handles this lure.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the campaign is not locked.
   * @throws {@link DatabaseError} If the campaign lock secret does not match.
   * @throws {@link DatabaseError} If the lure does not exist.
   * @throws {@link DatabaseError} If the redirector does not exist.
   * @throws {@link DatabaseError} If the lure is still enabled.
   * @throws {@link DatabaseError} If the lure redirector ID does not match the provided one.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  delete(
    campaignId: string,
    lureId: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Lists all lures for the campaign.
   *
   * Lures are ordered by creation time (oldest first).
   *
   * @param campaignId - The ID of the campaign to list lures for.
   * @returns The array of lure models, or `null` if the campaign does not exist.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  list(campaignId: string): Promise<LureModel[] | null>
}
