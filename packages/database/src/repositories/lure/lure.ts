import { LureModel } from '../../models/index.js'

/**
 * @category Lure
 * @internal
 */
export const LURE_REPOSITORY = Symbol('LureRepository')

/**
 * Represents a lure repository
 *
 * @category Lure
 */
export interface LureRepository {
  /**
   * Create lure
   */
  create(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Read lure by id
   */
  read(campaignId: string, lureId: string): Promise<LureModel | null>

  /**
   * Find lure by path
   */
  find(campaignId: string, path: string): Promise<LureModel | null>

  /**
   * Enable lure
   */
  enable(campaignId: string, lureId: string, lockSecret: string): Promise<void>

  /**
   * Disable lure
   */
  disable(campaignId: string, lureId: string, lockSecret: string): Promise<void>

  /**
   * Delete lure
   */
  delete(
    campaignId: string,
    lureId: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void>

  /**
   * List lures
   */
  list(campaignId: string): Promise<LureModel[] | null>
}
