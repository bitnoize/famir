import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DATABASE_CONNECTOR, DatabaseConnector } from '../../database-connector.js'
import { DatabaseError } from '../../database.error.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullTarget, RawTarget } from './target.functions.js'
import { TARGET_REPOSITORY, TargetRepository } from './target.js'
import {
  FullTargetModel,
  TargetAccessLevel,
  TargetHosts,
  TargetLink,
  TargetModel,
} from './target.models.js'
import {
  rawFullTargetSchema,
  rawTargetSchema,
  targetHostsSchema,
  targetLinkSchema,
} from './target.schemas.js'

/**
 * Redis-based target repository implementation.
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
 * import { TARGET_REPOSITORY, TargetRepository, RedisTargetRepository } from '@famir/database'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * RedisTargetRepository.register(container)
 *
 * // Resolve dependency from container
 * const targetRepository = container.resolve<TargetRepository>(TARGET_REPOSITORY)
 *
 * // TODO more examples
 * ```
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
        new RedisTargetRepository(
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
      .addSchema('database-raw-full-target', rawFullTargetSchema)
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
    try {
      const statusReply = await this.connection.target.create_target(
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
        Date.now(),
        lockSecret
      )

      const result = this.checkStatusReply(statusReply)

      this.logger.info(`Database create target`, {
        repository: this.repositoryName,
        method: 'create',
        params: { campaignId, targetId },
        result,
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'create',
        params: { campaignId, targetId },
      })
    }
  }

  async read(campaignId: string, targetId: string): Promise<TargetModel | null> {
    try {
      const rawModel = await this.connection.target.read_target(
        this.options.prefix,
        campaignId,
        targetId
      )

      return this.buildModel(rawModel)
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'read',
        params: { campaignId, targetId },
      })
    }
  }

  async readFull(campaignId: string, targetId: string): Promise<FullTargetModel | null> {
    try {
      const rawModel = await this.connection.target.read_full_target(
        this.options.prefix,
        campaignId,
        targetId
      )

      return this.buildFullModel(rawModel)
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'readFull',
        params: { campaignId, targetId },
      })
    }
  }

  async readHosts(): Promise<TargetHosts> {
    try {
      const hosts = await this.connection.target.read_target_hosts(this.options.prefix)

      this.validateReply<TargetHosts>('database-target-hosts', hosts)

      return hosts
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'readHosts',
      })
    }
  }

  async find(mirrorHost: string): Promise<TargetModel | null> {
    try {
      const link = await this.connection.target.find_target_link(this.options.prefix, mirrorHost)

      if (link === null) {
        return null
      }

      this.validateReply<TargetLink>('database-target-link', link)

      const [campaignId, targetId] = link

      const rawModel = await this.connection.target.read_target(
        this.options.prefix,
        campaignId,
        targetId
      )

      return this.buildModel(rawModel)
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'find',
        params: { mirrorHost },
      })
    }
  }

  async findFull(mirrorHost: string): Promise<FullTargetModel | null> {
    try {
      const link = await this.connection.target.find_target_link(this.options.prefix, mirrorHost)

      if (link === null) {
        return null
      }

      this.validateReply<TargetLink>('database-target-link', link)

      const [campaignId, targetId] = link

      const rawModel = await this.connection.target.read_full_target(
        this.options.prefix,
        campaignId,
        targetId
      )

      return this.buildFullModel(rawModel)
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'findFull',
        params: { mirrorHost },
      })
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
    try {
      const statusReply = await this.connection.target.update_target(
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

      const result = this.checkStatusReply(statusReply)

      this.logger.info(`Database update target`, {
        repository: this.repositoryName,
        method: 'update',
        params: { campaignId, targetId },
        result,
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'update',
        params: { campaignId, targetId },
      })
    }
  }

  async enable(campaignId: string, targetId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.target.enable_target(
        this.options.prefix,
        campaignId,
        targetId,
        lockSecret
      )

      const result = this.checkStatusReply(statusReply)

      this.logger.info(`Database enable target`, {
        repository: this.repositoryName,
        method: 'enable',
        params: { campaignId, targetId },
        result,
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'enable',
        params: { campaignId, targetId },
      })
    }
  }

  async disable(campaignId: string, targetId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.target.disable_target(
        this.options.prefix,
        campaignId,
        targetId,
        lockSecret
      )

      const result = this.checkStatusReply(statusReply)

      this.logger.info(`Database disable target`, {
        repository: this.repositoryName,
        method: 'disable',
        params: { campaignId, targetId },
        result,
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'disable',
        params: { campaignId, targetId },
      })
    }
  }

  async appendLabels(
    campaignId: string,
    targetId: string,
    labels: string[],
    lockSecret: string
  ): Promise<void> {
    try {
      if (labels.length === 0) {
        return
      }

      const statusReplies = await Promise.all(
        labels.map((label) =>
          this.connection.target.append_target_label(
            this.options.prefix,
            campaignId,
            targetId,
            label.toLowerCase(),
            lockSecret
          )
        )
      )

      const result = this.checkStatusReplies(statusReplies)

      this.logger.info(`Database append target labels`, {
        repository: this.repositoryName,
        method: 'appendLabels',
        params: { campaignId, targetId, labels },
        result,
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'appendLabels',
        params: { campaignId, targetId, labels },
      })
    }
  }

  async removeLabels(campaignId: string, targetId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.target.remove_target_labels(
        this.options.prefix,
        campaignId,
        targetId,
        lockSecret
      )

      const result = this.checkStatusReply(statusReply)

      this.logger.info(`Database remove target labels`, {
        repository: this.repositoryName,
        method: 'removeLabels',
        params: { campaignId, targetId },
        result,
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'removeLabels',
        params: { campaignId, targetId },
      })
    }
  }

  async delete(campaignId: string, targetId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.target.delete_target(
        this.options.prefix,
        campaignId,
        targetId,
        lockSecret
      )

      const result = this.checkStatusReply(statusReply)

      this.logger.info(`Database delete target`, {
        repository: this.repositoryName,
        method: 'delete',
        params: { campaignId, targetId },
        result,
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'delete',
        params: { campaignId, targetId },
      })
    }
  }

  async list(campaignId: string): Promise<TargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((targetId) =>
          this.connection.target.read_target(this.options.prefix, campaignId, targetId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'list',
        params: { campaignId },
      })
    }
  }

  async listFull(campaignId: string): Promise<FullTargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((targetId) =>
          this.connection.target.read_full_target(this.options.prefix, campaignId, targetId)
        )
      )

      return this.buildFullCollection(rawCollection)
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'listFull',
        params: { campaignId },
      })
    }
  }

  /**
   * Converts raw Redis data to a target model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The target model, or `null` if the raw data is `null`.
   * @throws {@link DatabaseError} If the raw data fails validation.
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
      rawModel.is_enabled,
      rawModel.message_count,
      new Date(rawModel.created_at)
    )
  }

  /**
   * Converts raw Redis data to a full target model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The full target model, or `null` if the raw data is `null`.
   * @throws {@link DatabaseError} If the raw data fails validation.
   */
  protected buildFullModel(rawModel: unknown): FullTargetModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawFullTarget>('database-raw-full-target', rawModel)

    return new FullTargetModel(
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
      rawModel.labels,
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
   * @throws {@link DatabaseError} If the array of raw data fails validation.
   */
  protected buildCollection(rawCollection: unknown): TargetModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(TargetModel.isNotNull)
  }

  /**
   * Converts a list of raw Redis data to a list of full target models.
   *
   * @param rawCollection - The array of raw data from Redis.
   * @returns The array of full target models.
   * @throws {@link DatabaseError} If the array of raw data fails validation.
   */
  protected buildFullCollection(rawCollection: unknown): FullTargetModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildFullModel(rawModel))
      .filter(TargetModel.isNotNull)
  }
}
