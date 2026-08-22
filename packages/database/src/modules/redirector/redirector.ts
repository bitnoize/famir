import { FullRedirectorModel, RedirectorModel } from './redirector.models.js'

/**
 * DI token for a redirector repository implementation.
 *
 * @category Redirector
 */
export const REDIRECTOR_REPOSITORY = Symbol('RedirectorRepository')

/**
 * Defines the public contract for a redirector repository.
 *
 * A redirector contains a landing page template and a list of required field names.
 *
 * @category Redirector
 */
export interface RedirectorRepository {
  /**
   * Creates a new redirector.
   *
   * The redirector is created with an empty `fields` array,
   * meaning it is initially 'loose' (accepts any parameters).
   * Use {@link appendFields} or {@link removeFields} to manage required fields.
   *
   * @param campaignId - The ID of the campaign to create the redirector in.
   * @param redirectorId - The new redirector ID to create.
   * @param page - The page template.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the campaign is not locked.
   * @throws {@link DatabaseError} If the campaign lock secret does not match.
   * @throws {@link DatabaseError} If a redirector with the same ID already exists.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  create(campaignId: string, redirectorId: string, page: string, lockSecret: string): Promise<void>

  /**
   * Reads the redirector by its ID.
   *
   * @param campaignId - The ID of the campaign containing the redirector.
   * @param redirectorId - The redirector ID to read.
   * @returns The redirector model, or `null` if the redirector is not found.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  read(campaignId: string, redirectorId: string): Promise<RedirectorModel | null>

  /**
   * Reads the full redirector by its ID.
   *
   * @param campaignId - The ID of the campaign containing the redirector.
   * @param redirectorId - The redirector ID to read.
   * @returns The full redirector model, or `null` if the redirector is not found.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  readFull(campaignId: string, redirectorId: string): Promise<FullRedirectorModel | null>

  /**
   * Updates the redirector specific fields.
   *
   * All update parameters are optional. Only provided fields will be updated.
   *
   * @param campaignId - The ID of the campaign containing the redirector.
   * @param redirectorId - The redirector ID to update.
   * @param page - The page template.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the campaign is not locked.
   * @throws {@link DatabaseError} If the campaign lock secret does not match.
   * @throws {@link DatabaseError} If the redirector does not exist.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  update(
    campaignId: string,
    redirectorId: string,
    page: string | null | undefined,
    lockSecret: string
  ): Promise<void>

  /**
   * Appends multiple required fields to the redirector.
   *
   * When rendering a redirector with required fields, all specified fields
   * must be provided in the parameters. If the fields array is empty,
   * the redirector is 'loose' and accepts any parameters.
   *
   * @param campaignId - The ID of the campaign containing the redirector.
   * @param redirectorId - The redirector ID to append field to.
   * @param fields - The field names to append to the fields list.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the campaign is not locked.
   * @throws {@link DatabaseError} If the campaign lock secret does not match.
   * @throws {@link DatabaseError} If the redirector does not exist.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  appendFields(
    campaignId: string,
    redirectorId: string,
    fields: string[],
    lockSecret: string
  ): Promise<void>

  /**
   * Removes all fields from the redirector.
   *
   * @param campaignId - The ID of the campaign containing the redirector.
   * @param redirectorId - The redirector ID to remove fields from.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the campaign is not locked.
   * @throws {@link DatabaseError} If the campaign lock secret does not match.
   * @throws {@link DatabaseError} If the redirector does not exist.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  removeFields(campaignId: string, redirectorId: string, lockSecret: string): Promise<void>

  /**
   * Deletes the redirector by its ID.
   *
   * A redirector cannot be deleted if it has any lures pointing to it.
   *
   * @param campaignId - The ID of the campaign containing the redirector.
   * @param redirectorId - The redirector ID to delete.
   * @param lockSecret - The campaign lock secret obtained from {@link CampaignRepository.lock}.
   * @throws {@link DatabaseError} If the campaign does not exist.
   * @throws {@link DatabaseError} If the campaign is not locked.
   * @throws {@link DatabaseError} If the campaign lock secret does not match.
   * @throws {@link DatabaseError} If the redirector does not exist.
   * @throws {@link DatabaseError} If the redirector still has lures.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  delete(campaignId: string, redirectorId: string, lockSecret: string): Promise<void>

  /**
   * Lists all redirectors for the campaign.
   *
   * Redirectors are ordered by creation time (oldest first).
   *
   * @param campaignId - The ID of the campaign to list redirectors for.
   * @returns The array of redirector models, or `null` if the campaign does not exist.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  list(campaignId: string): Promise<RedirectorModel[] | null>

  /**
   * Lists all full redirectors for the campaign.
   *
   * Redirectors are ordered by creation time (oldest first).
   *
   * @param campaignId - The ID of the campaign to list redirectors for.
   * @returns The array of full redirector models, or `null` if the campaign does not exist.
   * @throws {@link DatabaseError} If the data validation fails.
   */
  listFull(campaignId: string): Promise<FullRedirectorModel[] | null>
}
