import { FullTargetModel, TargetAccessLevel, TargetModel } from '../../models/index.js'

/**
 * @category Target
 * @internal
 */
export const TARGET_REPOSITORY = Symbol('TargetRepository')

/**
 * Represents target repository
 *
 * @category Target
 */
export interface TargetRepository {
  /**
   * Create target
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
   * Read target by id
   */
  read(campaignId: string, targetId: string): Promise<TargetModel | null>

  /**
   * Read extended target by id
   */
  readFull(campaignId: string, targetId: string): Promise<FullTargetModel | null>

  /**
   * Find target by mirrorHost
   */
  find(mirrorHost: string): Promise<TargetModel | null>

  /**
   * Find extended target by mirrorHost
   */
  findFull(mirrorHost: string): Promise<FullTargetModel | null>

  /**
   * Update target
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
   * Enable target
   */
  enable(campaignId: string, targetId: string, lockSecret: string): Promise<void>

  /**
   * Disable target
   */
  disable(campaignId: string, targetId: string, lockSecret: string): Promise<void>

  /**
   * Append label to target
   */
  appendLabel(
    campaignId: string,
    targetId: string,
    label: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Remove label from target
   */
  removeLabel(
    campaignId: string,
    targetId: string,
    label: string,
    lockSecret: string
  ): Promise<void>

  /**
   * Delete target
   */
  delete(campaignId: string, targetId: string, lockSecret: string): Promise<void>

  /**
   * List targets
   */
  list(campaignId: string): Promise<TargetModel[] | null>

  /**
   * List extended targets
   */
  listFull(campaignId: string): Promise<FullTargetModel[] | null>
}
