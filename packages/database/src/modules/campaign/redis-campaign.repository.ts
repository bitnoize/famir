import { DIContainer, randomIdent } from '@famir/common'
import {
  CAMPAIGN_LOCK_TIMEOUT,
  CAMPAIGN_REPOSITORY,
  CampaignLimiter,
  CampaignModel,
  CampaignRepository,
  CONFIG,
  Config,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  LOGGER,
  Logger,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import { RedisBaseRepository } from '../base/index.js'
import { RawCampaign, RawCampaignLimiter } from './campaign.functions.js'
import { rawCampaignLimiterSchema, rawCampaignSchema } from './campaign.schemas.js'

/**
 * Redis-based campaign repository implementation.
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
        new this(
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
      .addSchema('database-raw-campaign-limiter', rawCampaignLimiterSchema)
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
    messageExpire: number,
    limiterBurst: number,
    limiterRate: number
  ): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'create',
      params: {
        campaignId,
        mirrorDomain,
        description: `content string (${description.length.toString()} bytes)`,
        cryptSecret: '********',
        upgradeSessionPath,
        sessionCookieName,
        sessionExpire,
        newSessionExpire,
        messageExpire,
        limiterBurst,
        limiterRate,
      },
    } as const

    try {
      const statusReply = await this.connection.famir.create_campaign(
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
        limiterBurst,
        limiterRate
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database create campaign`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async read(campaignId: string): Promise<CampaignModel | null> {
    const details = {
      repository: this.repositoryName,
      method: 'read',
      params: {
        campaignId,
      },
    } as const

    try {
      const rawModel = await this.connection.famir.read_campaign(this.options.prefix, campaignId)

      return this.buildModel(rawModel)
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async lock(campaignId: string): Promise<string> {
    const lockSecret = randomIdent()

    const details = {
      repository: this.repositoryName,
      method: 'lock',
      params: {
        campaignId,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.lock_campaign(
        this.options.prefix,
        campaignId,
        lockSecret,
        CAMPAIGN_LOCK_TIMEOUT
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database lock campaign`, { data: details })

      return lockSecret
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async unlock(campaignId: string, lockSecret: string): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'unlock',
      params: {
        campaignId,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.unlock_campaign(
        this.options.prefix,
        campaignId,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database unlock campaign`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async update(
    campaignId: string,
    description: string,
    sessionExpire: number,
    newSessionExpire: number,
    messageExpire: number,
    limiterBurst: number,
    limiterRate: number,
    lockSecret: string
  ): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'update',
      params: {
        campaignId,
        description: `content string (${description.length.toString()} bytes)`,
        sessionExpire,
        newSessionExpire,
        messageExpire,
        limiterBurst,
        limiterRate,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.update_campaign(
        this.options.prefix,
        campaignId,
        description,
        sessionExpire,
        newSessionExpire,
        messageExpire,
        limiterBurst,
        limiterRate,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database update campaign`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async appendFlag(campaignId: string, flag: string): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'appendFlag',
      params: {
        campaignId,
        flag,
      },
    } as const

    try {
      const statusReply = await this.connection.famir.append_campaign_flag(
        this.options.prefix,
        campaignId,
        flag
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database append campaign flag`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async removeFlag(campaignId: string, flag: string): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'removeFlag',
      params: {
        campaignId,
        flag,
      },
    } as const

    try {
      const statusReply = await this.connection.famir.remove_campaign_flag(
        this.options.prefix,
        campaignId,
        flag
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database remove campaign flag`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async delete(campaignId: string, lockSecret: string): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'delete',
      params: {
        campaignId,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.delete_campaign(
        this.options.prefix,
        campaignId,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database delete campaign`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async list(): Promise<CampaignModel[]> {
    const details = {
      repository: this.repositoryName,
      method: 'list',
      params: null,
    } as const

    try {
      const index = await this.connection.famir.read_campaign_index(this.options.prefix)

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((campaignId) =>
          this.connection.famir.read_campaign(this.options.prefix, campaignId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async checkLimiter(
    campaignId: string,
    identity: string,
    cost: number
  ): Promise<CampaignLimiter | null> {
    const details = {
      repository: this.repositoryName,
      method: 'checkLimiter',
      params: {
        campaignId,
        identity,
        cost,
      },
    } as const

    try {
      const rawLimiter = await this.connection.famir.check_campaign_limiter(
        this.options.prefix,
        campaignId,
        identity,
        cost
      )

      return this.buildLimiter(rawLimiter)
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  /**
   * Converts raw Redis data to a campaign model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The campaign model, or `null` if the raw data is `null`.
   * @throws DatabaseError If the raw data fails validation.
   */
  protected buildModel(rawModel: unknown): CampaignModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawCampaign>('database-raw-campaign', rawModel)

    return new CampaignModel(
      rawModel.campaign_id,
      rawModel.mirror_domain,
      rawModel.description,
      rawModel.crypt_secret,
      rawModel.upgrade_session_path,
      rawModel.session_cookie_name,
      rawModel.session_expire,
      rawModel.new_session_expire,
      rawModel.message_expire,
      rawModel.limiter_burst,
      rawModel.limiter_rate,
      rawModel.is_locked,
      rawModel.flags,
      rawModel.proxy_index,
      rawModel.target_index,
      rawModel.redirector_index,
      rawModel.lure_index,
      rawModel.session_count,
      rawModel.session_history,
      rawModel.message_count,
      rawModel.message_history,
      new Date(rawModel.created_at)
    )
  }

  /**
   * Converts a list of raw Redis data to a list of campaign models.
   *
   * @param rawCollection - The array of raw data from Redis.
   * @returns The array of campaign models.
   * @throws DatabaseError If the array of raw data fails validation.
   */
  protected buildCollection(rawCollection: unknown): CampaignModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildModel(rawModel))
      .filter(CampaignModel.isNotNull)
  }

  /**
   * Converts raw Redis data to a campaign limiter.
   *
   * @param rawLimiter - The raw data from Redis.
   * @returns The campaign limiter, or `null` if the raw data is `null`.
   * @throws DatabaseError If the raw data fails validation.
   */
  protected buildLimiter(rawLimiter: unknown): CampaignLimiter | null {
    if (rawLimiter === null) {
      return null
    }

    this.validateReply<RawCampaignLimiter>('database-raw-campaign-limiter', rawLimiter)

    return {
      isAllowed: rawLimiter.is_allowed,
      tokens: rawLimiter.tokens,
      ts: rawLimiter.ts,
      cost: rawLimiter.cost,
      retryAfterMs: rawLimiter.retry_after_ms,
    }
  }
}
