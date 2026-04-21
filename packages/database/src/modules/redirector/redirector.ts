import { FullRedirectorModel, RedirectorModel } from './redirector.models.js'

/**
 * @category Redirector
 * @internal
 */
export const REDIRECTOR_REPOSITORY = Symbol('RedirectorRepository')

/**
 * Represents redirector repository
 *
 * @category Redirector
 */
export interface RedirectorRepository {
  /**
   * Create redirector
   */
  create(campaignId: string, redirectorId: string, page: string, lockSecret: string): Promise<void>

  /**
   * Read redirector by id
   */
  read(campaignId: string, redirectorId: string): Promise<RedirectorModel | null>

  /**
   * Read extended redirector by id
   */
  readFull(campaignId: string, redirectorId: string): Promise<FullRedirectorModel | null>

  /**
   * Update redirector
   */
  update(
    campaignId: string,
    redirectorId: string,
    page: string | null | undefined,
    lockSecret: string
  ): Promise<void>

  /**
   * Append field to redirector
   */
  appendField(
    campaignId: string,
    redirectorId: string,
    field: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Remove field from redirector
   */
  removeField(
    campaignId: string,
    redirectorId: string,
    field: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Delete redirector
   */
  delete(campaignId: string, redirectorId: string, lockSecret: string): Promise<void>

  /**
   * List redirectors
   */
  list(campaignId: string): Promise<RedirectorModel[] | null>

  /**
   * List extended redirectors
   */
  listFull(campaignId: string): Promise<FullRedirectorModel[] | null>
}
