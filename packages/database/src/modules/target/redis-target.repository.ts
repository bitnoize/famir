import { DIContainer } from '@famir/common'
import {
  CONFIG,
  Config,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  LOGGER,
  Logger,
  TARGET_REPOSITORY,
  TargetAccessLevel,
  TargetHosts,
  TargetLink,
  TargetModel,
  TargetRepository,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import { RedisBaseRepository } from '../base/index.js'
import { RawTarget } from './target.functions.js'
import { rawTargetSchema, targetHostsSchema, targetLinkSchema } from './target.schemas.js'

/**
 * Redis-based target repository implementation.
 *
 * @category Target
 */
export class RedisTargetRepository extends RedisBaseRepository implements TargetRepository {
  /**
   * Registers the target repository as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<TargetRepository>(
      TARGET_REPOSITORY,
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
   * Creates a new target repository instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   */
  constructor(validator: Validator, config: Config, logger: Logger, connector: DatabaseConnector) {
    super(validator, config, logger, connector, 'target')

    this.validator
      .addSchema('database-raw-target', rawTargetSchema)
      .addSchema('database-target-link', targetLinkSchema)
      .addSchema('database-target-hosts', targetHostsSchema)
  }

  async create(
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
    label: string,
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
  ): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'create',
      params: {
        campaignId,
        targetId,
        accessLevel,
        donorSecure,
        donorSub,
        donorDomain,
        donorPort,
        mirrorSecure,
        mirrorSub,
        mirrorPort,
        label,
        connectTimeout,
        simpleTimeout,
        streamTimeout,
        headersSizeLimit,
        bodySizeLimit,
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        allowWebSockets,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.create_target(
        this.options.prefix,
        campaignId,
        targetId,
        accessLevel,
        donorSecure,
        donorSub,
        donorDomain,
        donorPort,
        mirrorSecure,
        mirrorSub,
        mirrorPort,
        label,
        connectTimeout,
        simpleTimeout,
        streamTimeout,
        headersSizeLimit,
        bodySizeLimit,
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        allowWebSockets,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database create target`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async read(campaignId: string, targetId: string): Promise<TargetModel | null> {
    const details = {
      repository: this.repositoryName,
      method: 'read',
      params: {
        campaignId,
        targetId,
      },
    } as const

    try {
      const rawModel = await this.connection.famir.read_target(
        this.options.prefix,
        campaignId,
        targetId
      )

      return this.buildModel(rawModel)
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async readHosts(): Promise<TargetHosts> {
    const details = {
      repository: this.repositoryName,
      method: 'readHosts',
      params: null,
    } as const

    try {
      const hosts = await this.connection.famir.read_target_hosts(this.options.prefix)

      this.validateReply<TargetHosts>('database-target-hosts', hosts)

      return hosts
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async find(mirrorHost: string): Promise<TargetLink | null> {
    const details = {
      repository: this.repositoryName,
      method: 'find',
      params: {
        mirrorHost,
      },
    } as const

    try {
      const targetLink = await this.connection.famir.find_target_link(
        this.options.prefix,
        mirrorHost
      )

      if (targetLink === null) {
        return null
      }

      this.validateReply<TargetLink>('database-target-link', targetLink)

      return targetLink
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async update(
    campaignId: string,
    targetId: string,
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
  ): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'update',
      params: {
        campaignId,
        targetId,
        connectTimeout,
        simpleTimeout,
        streamTimeout,
        headersSizeLimit,
        bodySizeLimit,
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        allowWebSockets,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.update_target(
        this.options.prefix,
        campaignId,
        targetId,
        connectTimeout,
        simpleTimeout,
        streamTimeout,
        headersSizeLimit,
        bodySizeLimit,
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        allowWebSockets,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database update target`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async enable(campaignId: string, targetId: string, lockSecret: string): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'enable',
      params: {
        campaignId,
        targetId,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.enable_target(
        this.options.prefix,
        campaignId,
        targetId,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database enable target`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async disable(campaignId: string, targetId: string, lockSecret: string): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'disable',
      params: {
        campaignId,
        targetId,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.disable_target(
        this.options.prefix,
        campaignId,
        targetId,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database disable target`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async delete(campaignId: string, targetId: string, lockSecret: string): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'delete',
      params: {
        campaignId,
        targetId,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.delete_target(
        this.options.prefix,
        campaignId,
        targetId,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database delete target`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async list(campaignId: string): Promise<TargetModel[] | null> {
    const details = {
      repository: this.repositoryName,
      method: 'list',
      params: {
        campaignId,
      },
    } as const

    try {
      const index = await this.connection.famir.read_target_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((targetId) =>
          this.connection.famir.read_target(this.options.prefix, campaignId, targetId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  /**
   * Converts raw Redis data to a target model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The target model, or `null` if the raw data is `null`.
   * @throws DatabaseError If the raw data fails validation.
   */
  protected buildModel(rawModel: unknown): TargetModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawTarget>('database-raw-target', rawModel)

    return new TargetModel(
      rawModel.campaign_id,
      rawModel.target_id,
      rawModel.access_level,
      rawModel.donor_secure,
      rawModel.donor_sub,
      rawModel.donor_domain,
      rawModel.donor_port,
      rawModel.mirror_secure,
      rawModel.mirror_sub,
      rawModel.mirror_domain,
      rawModel.mirror_port,
      rawModel.label,
      rawModel.connect_timeout,
      rawModel.simple_timeout,
      rawModel.stream_timeout,
      rawModel.headers_size_limit,
      rawModel.body_size_limit,
      rawModel.main_page,
      rawModel.not_found_page,
      rawModel.favicon_ico,
      rawModel.robots_txt,
      rawModel.sitemap_xml,
      rawModel.allow_websockets,
      rawModel.is_enabled,
      rawModel.message_count,
      new Date(rawModel.created_at)
    )
  }

  /**
   * Converts a list of raw Redis data to a list of target models.
   *
   * @param rawCollection - The array of raw data from Redis.
   * @returns The array of target models.
   * @throws DatabaseError If the array of raw data fails validation.
   */
  protected buildCollection(rawCollection: unknown): TargetModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(TargetModel.isNotNull)
  }
}
