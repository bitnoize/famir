import { LureModel } from './lure.models.js'

/**
 * DI token for lure repository.
 *
 * @category Lure
 * @internal
 */
export const LURE_REPOSITORY = Symbol('LureRepository')

/**
 * Represents a lure repository.
 *
 * @category Lure
 */
export interface LureRepository {
  /**
   * Creates a new lure in the specified campaign.
   *
   * The lure will be created in a disabled state (`isEnabled = false`).
   * Use `enable()` to activate it for traffic routing.
   *
   * @param campaignId - The ID of the campaign to create the lure in
   * @param lureId - The unique identifier for the new lure
   * @param path - The URL path
   * @param redirectorId - The ID of the redirector that handles this lure
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If a lure with the same ID already exists
   * @throws {@link DatabaseError} If the path is already used by another lure in the campaign
   * @throws {@link DatabaseError} If the redirector does not exist
   */
  create(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Reads a lure model by its ID.
   *
   * @param campaignId - The ID of the campaign containing the lure
   * @param lureId - The lure ID to read
   * @returns The lure model, or `null` if not found
   */
  read(campaignId: string, lureId: string): Promise<LureModel | null>

  /**
   * Finds a lure model by its URL path.
   *
   * This is the primary routing method for HTTP requests.
   * When a request arrives at a mirror domain, the request path is extracted
   * and used to instantly find the corresponding lure via a direct hash lookup.
   *
   * @param campaignId - The ID of the campaign to search in
   * @param path - The URL path
   * @returns The lure model, or `null` if no lure matches the path
   */
  find(campaignId: string, path: string): Promise<LureModel | null>

  /**
   * Enables a lure, making it available for request routing.
   *
   * When enabled, the URL path becomes active and can be used
   * to serve the associated redirector content.
   *
   * @param campaignId - The ID of the campaign containing the lure
   * @param lureId - The lure ID to enable
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the lure does not exist
   */
  enable(campaignId: string, lureId: string, lockSecret: string): Promise<void>

  /**
   * Disables a lure, stopping request routing.
   *
   * When disabled, requests to the URL path will not be routed.
   *
   * @param campaignId - The ID of the campaign containing the lure
   * @param lureId - The lure ID to disable
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the lure does not exist
   */
  disable(campaignId: string, lureId: string, lockSecret: string): Promise<void>

  /**
   * Delete a lure model by its ID.
   *
   * A lure must be **disabled** before it can be deleted.
   *
   * @param campaignId - The ID of the campaign containing the lure
   * @param lureId - The lure ID to delete
   * @param redirectorId - The ID of the redirector associated with the lure
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the lure does not exist
   * @throws {@link DatabaseError} If the redirector does not exist
   * @throws {@link DatabaseError} If the lure is still enabled
   * @throws {@link DatabaseError} If the lure's redirector ID does not match the provided one
   */
  delete(
    campaignId: string,
    lureId: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Lists all lures in a campaign.
   *
   * Lures are ordered by creation time (oldest first).
   *
   * @param campaignId - The ID of the campaign to list lures for
   * @returns An array of lure models, or `null` if the campaign does not exist
   */
  list(campaignId: string): Promise<LureModel[] | null>
}
