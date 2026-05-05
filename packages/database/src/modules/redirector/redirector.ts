import { FullRedirectorModel, RedirectorModel } from './redirector.models.js'

/**
 * DI token for redirector repository.
 *
 * @category Redirector
 * @internal
 */
export const REDIRECTOR_REPOSITORY = Symbol('RedirectorRepository')

/**
 * Represents a redirector repository.
 *
 * @category Redirector
 */
export interface RedirectorRepository {
  /**
   * Creates a new redirector in the specified campaign.
   *
   * The redirector is created with an empty `fields` array,
   * meaning it is initially "loose" (accepts any parameters).
   * Use `appendField()` or `removeField()` to manage required fields.
   *
   * @param campaignId - The ID of the campaign to create the redirector in
   * @param redirectorId - The unique identifier for the new redirector
   * @param page - The page template
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If a redirector with the same ID already exists
   */
  create(campaignId: string, redirectorId: string, page: string, lockSecret: string): Promise<void>

  /**
   * Reads a redirector by its ID.
   *
   * @param campaignId - The ID of the campaign containing the redirector
   * @param redirectorId - The redirector ID to read
   * @returns The redirector model, or `null` if not found
   */
  read(campaignId: string, redirectorId: string): Promise<RedirectorModel | null>

  /**
   * Reads a full redirector by its ID.
   *
   * @param campaignId - The ID of the campaign containing the redirector
   * @param redirectorId - The redirector ID to read
   * @returns The full redirector model, or `null` if not found
   */
  readFull(campaignId: string, redirectorId: string): Promise<FullRedirectorModel | null>

  /**
   * Updates specific fields of a redirector model.
   *
   * @param campaignId - The ID of the campaign containing the redirector
   * @param redirectorId - The redirector ID to update
   * @param page - The page template
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the redirector does not exist
   */
  update(
    campaignId: string,
    redirectorId: string,
    page: string | null | undefined,
    lockSecret: string
  ): Promise<void>

  /**
   * Appends a required field to a redirector.
   *
   * When rendering a redirector with required fields, all specified fields
   * must be provided in the parameters. If the fields array is empty,
   * the redirector is "loose" and accepts any parameters.
   *
   * @param campaignId - The ID of the campaign containing the redirector
   * @param redirectorId - The redirector ID to append fields
   * @param field - The field name to require
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the redirector does not exist
   */
  appendField(
    campaignId: string,
    redirectorId: string,
    field: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Removes a required field from a redirector.
   *
   * @param campaignId - The ID of the campaign containing the redirector
   * @param redirectorId - The redirector ID to remove fields
   * @param field - The field name to remove
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the redirector does not exist
   */
  removeField(
    campaignId: string,
    redirectorId: string,
    field: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Delete a redirector model by its ID.
   *
   * A redirector cannot be deleted if it has any lures pointing to it.
   *
   * @param campaignId - The ID of the campaign containing the redirector
   * @param redirectorId - The redirector ID to delete
   * @param lockSecret - The campaign lock secret obtained from `CampaignRepository.lock()`
   *
   * @throws {@link DatabaseError} If the campaign does not exist
   * @throws {@link DatabaseError} If the campaign is not locked
   * @throws {@link DatabaseError} If the lock secret does not match
   * @throws {@link DatabaseError} If the redirector does not exist
   * @throws {@link DatabaseError} If the redirector still has lures
   */
  delete(campaignId: string, redirectorId: string, lockSecret: string): Promise<void>

  /**
   * Lists all redirectors in a campaign.
   *
   * Redirectors are ordered by creation time (oldest first).
   *
   * @param campaignId - The ID of the campaign to list redirectors for
   * @returns An array of redirector models, or `null` if the campaign does not exist
   */
  list(campaignId: string): Promise<RedirectorModel[] | null>

  /**
   * Lists all full redirectors in a campaign.
   *
   * Redirectors are ordered by creation time (oldest first).
   *
   * @param campaignId - The ID of the campaign to list redirectors for
   * @returns An array of full redirector models, or `null` if the campaign does not exist
   */
  listFull(campaignId: string): Promise<FullRedirectorModel[] | null>
}
