import { DIContainer, randomIdent } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DATABASE_CONNECTOR, DatabaseConnector } from '../../database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawCampaign, RawFullCampaign } from './campaign.functions.js'
import { CAMPAIGN_LOCK_TIMEOUT, CAMPAIGN_REPOSITORY, CampaignRepository } from './campaign.js'
import { CampaignModel, FullCampaignModel } from './campaign.models.js'
import { rawCampaignSchema, rawFullCampaignSchema } from './campaign.schemas.js'

/**
 * Redis-based campaign repository implementation.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 * - {@link DatabaseConnector} via {@link DATABASE_CONNECTOR} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { CAMPAIGN_REPOSITORY, CampaignRepository, RedisCampaignRepository } from '@famir/database'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * RedisCampaignRepository.register(container)
 *
 * // Resolve dependency from container
 * const campaignRepository = container.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY)
 *
 * // TODO more examples
 * ```
 *
 * @category Campaign
 */
export class RedisCampaignRepository extends RedisBaseRepository implements CampaignRepository {
  /**
   * Registers the campaign repository as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<CampaignRepository>(
      CAMPAIGN_REPOSITORY,
      (c) =>
        new RedisCampaignRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new campaign repository instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   */
  constructor(validator: Validator, config: Config, logger: Logger, connector: DatabaseConnector) {
    super(validator, config, logger, connector, 'campaign')

    this.validator
      .addSchema('database-raw-campaign', rawCampaignSchema)
      .addSchema('database-raw-full-campaign', rawFullCampaignSchema)
  }

  async create(
    campaignId: string,
    mirrorDomain: string,
    description: string,
    cryptSecret: string,
    upgradeSessionPath: string,
    sessionCookieName: string,
    sessionExpire: number,
    newSessionExpire: number,
    messageExpire: number
  ): Promise<void> {
    try {
      const statusReply = await this.connection.campaign.create_campaign(
        this.options.prefix,
        campaignId,
        mirrorDomain,
        description,
        cryptSecret,
        upgradeSessionPath,
        sessionCookieName,
        sessionExpire,
        newSessionExpire,
        messageExpire,
        Date.now()
      )

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId, mirrorDomain } })
    } catch (error) {
      this.handleRepositoryError(error, 'create', { campaignId, mirrorDomain })
    }
  }

  async read(campaignId: string): Promise<CampaignModel | null> {
    try {
      const rawModel = await this.connection.campaign.read_campaign(this.options.prefix, campaignId)

      return this.buildModel(rawModel)
    } catch (error) {
      this.handleRepositoryError(error, 'read', { campaignId })
    }
  }

  async readFull(campaignId: string): Promise<FullCampaignModel | null> {
    try {
      const rawModel = await this.connection.campaign.read_full_campaign(
        this.options.prefix,
        campaignId
      )

      return this.buildFullModel(rawModel)
    } catch (error) {
      this.handleRepositoryError(error, 'readFull', { campaignId })
    }
  }

  async lock(campaignId: string): Promise<string> {
    const lockSecret = randomIdent()

    try {
      const statusReply = await this.connection.campaign.lock_campaign(
        this.options.prefix,
        campaignId,
        lockSecret,
        CAMPAIGN_LOCK_TIMEOUT
      )

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId } })

      return lockSecret
    } catch (error) {
      this.handleRepositoryError(error, 'lock', { campaignId })
    }
  }

  async unlock(campaignId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.campaign.unlock_campaign(
        this.options.prefix,
        campaignId,
        lockSecret
      )

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId } })
    } catch (error) {
      this.handleRepositoryError(error, 'unlock', { campaignId })
    }
  }

  async update(
    campaignId: string,
    description: string | null | undefined,
    sessionExpire: number | null | undefined,
    newSessionExpire: number | null | undefined,
    messageExpire: number | null | undefined,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.campaign.update_campaign(
        this.options.prefix,
        campaignId,
        description,
        sessionExpire,
        newSessionExpire,
        messageExpire,
        lockSecret
      )

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId } })
    } catch (error) {
      this.handleRepositoryError(error, 'update', { campaignId })
    }
  }

  async delete(campaignId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.campaign.delete_campaign(
        this.options.prefix,
        campaignId,
        lockSecret
      )

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { campaign: { campaignId } })
    } catch (error) {
      this.handleRepositoryError(error, 'delete', { campaignId })
    }
  }

  async list(): Promise<CampaignModel[]> {
    try {
      const index = await this.connection.campaign.read_campaign_index(this.options.prefix)

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((campaignId) =>
          this.connection.campaign.read_campaign(this.options.prefix, campaignId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      this.handleRepositoryError(error, 'list', null)
    }
  }

  async listFull(): Promise<FullCampaignModel[]> {
    try {
      const index = await this.connection.campaign.read_campaign_index(this.options.prefix)

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((campaignId) =>
          this.connection.campaign.read_full_campaign(this.options.prefix, campaignId)
        )
      )

      return this.buildFullCollection(rawCollection)
    } catch (error) {
      this.handleRepositoryError(error, 'listFull', null)
    }
  }

  /**
   * Converts raw Redis data to a campaign model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The campaign model, or `null` if the raw data is `null`.
   * @throws {@link DatabaseError} If the raw data fails validation.
   */
  protected buildModel(rawModel: unknown): CampaignModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawCampaign>('database-raw-campaign', rawModel)

    return new CampaignModel(
      rawModel.campaign_id,
      rawModel.mirror_domain,
      rawModel.is_locked,
      rawModel.session_count,
      rawModel.message_count,
      new Date(rawModel.created_at)
    )
  }

  /**
   * Converts raw Redis data to a full campaign model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The full campaign model, or `null` if the raw data is `null`.
   * @throws {@link DatabaseError} If the raw data fails validation.
   */
  protected buildFullModel(rawModel: unknown): FullCampaignModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawFullCampaign>('database-raw-full-campaign', rawModel)

    return new FullCampaignModel(
      rawModel.campaign_id,
      rawModel.mirror_domain,
      rawModel.description,
      rawModel.crypt_secret,
      rawModel.upgrade_session_path,
      rawModel.session_cookie_name,
      rawModel.session_cookie_names,
      rawModel.session_expire,
      rawModel.new_session_expire,
      rawModel.message_expire,
      rawModel.is_locked,
      rawModel.proxy_count,
      rawModel.target_count,
      rawModel.redirector_count,
      rawModel.lure_count,
      rawModel.session_count,
      rawModel.message_count,
      new Date(rawModel.created_at)
    )
  }

  /**
   * Converts a list of raw Redis data to a list of campaign models.
   *
   * @param rawCollection - The array of raw data from Redis.
   * @returns The array of campaign models.
   * @throws {@link DatabaseError} If the array of raw data fails validation.
   */
  protected buildCollection(rawCollection: unknown): CampaignModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildModel(rawModel))
      .filter(CampaignModel.isNotNull)
  }

  /**
   * Converts a list of raw Redis data to a list of full campaign models.
   *
   * @param rawCollection - The array of raw data from Redis.
   * @returns The array of full campaign models.
   * @throws {@link DatabaseError} If the array of raw data fails validation.
   */
  protected buildFullCollection(rawCollection: unknown): FullCampaignModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildFullModel(rawModel))
      .filter(CampaignModel.isNotNull)
  }
}
