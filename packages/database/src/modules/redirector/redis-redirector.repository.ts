import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DATABASE_CONNECTOR, DatabaseConnector } from '../../database-connector.js'
import { DatabaseError } from '../../database.error.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullRedirector, RawRedirector } from './redirector.functions.js'
import { REDIRECTOR_REPOSITORY, RedirectorRepository } from './redirector.js'
import { FullRedirectorModel, RedirectorModel } from './redirector.models.js'
import { rawFullRedirectorSchema, rawRedirectorSchema } from './redirector.schemas.js'

/**
 * Redis-based redirector repository implementation.
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
 * import { REDIRECTOR_REPOSITORY, RedirectorRepository, RedisRedirectorRepository } from '@famir/database'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * RedisRedirectorRepository.register(container)
 *
 * // Resolve dependency from container
 * const redirectorRepository = container.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY)
 *
 * // TODO more examples
 * ```
 *
 * @category Redirector
 */
export class RedisRedirectorRepository extends RedisBaseRepository implements RedirectorRepository {
  /**
   * Registers the redirector repository as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<RedirectorRepository>(
      REDIRECTOR_REPOSITORY,
      (c) =>
        new RedisRedirectorRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new redirector repository instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   */
  constructor(validator: Validator, config: Config, logger: Logger, connector: DatabaseConnector) {
    super(validator, config, logger, connector, 'redirector')

    this.validator
      .addSchema('database-raw-redirector', rawRedirectorSchema)
      .addSchema('database-raw-full-redirector', rawFullRedirectorSchema)
  }

  async create(
    campaignId: string,
    redirectorId: string,
    page: string,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.redirector.create_redirector(
        this.options.prefix,
        campaignId,
        redirectorId,
        page,
        Date.now(),
        lockSecret
      )

      const result = this.checkStatusReply(statusReply)

      this.logger.info(`Database create redirector`, {
        repository: this.repositoryName,
        method: 'create',
        params: { campaignId, redirectorId },
        result,
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'create',
        params: { campaignId, redirectorId },
      })
    }
  }

  async read(campaignId: string, redirectorId: string): Promise<RedirectorModel | null> {
    try {
      const rawModel = await this.connection.redirector.read_redirector(
        this.options.prefix,
        campaignId,
        redirectorId
      )

      return this.buildModel(rawModel)
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'read',
        params: { campaignId, redirectorId },
      })
    }
  }

  async readFull(campaignId: string, redirectorId: string): Promise<FullRedirectorModel | null> {
    try {
      const rawModel = await this.connection.redirector.read_full_redirector(
        this.options.prefix,
        campaignId,
        redirectorId
      )

      return this.buildFullModel(rawModel)
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'readFull',
        params: { campaignId, redirectorId },
      })
    }
  }

  async update(
    campaignId: string,
    redirectorId: string,
    page: string,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.redirector.update_redirector(
        this.options.prefix,
        campaignId,
        redirectorId,
        page,
        lockSecret
      )

      const result = this.checkStatusReply(statusReply)

      this.logger.info(`Database update redirector`, {
        repository: this.repositoryName,
        method: 'update',
        params: { campaignId, redirectorId },
        result,
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'update',
        params: { campaignId, redirectorId },
      })
    }
  }

  async appendFields(
    campaignId: string,
    redirectorId: string,
    fields: string[],
    lockSecret: string
  ): Promise<void> {
    try {
      if (fields.length === 0) {
        return
      }

      const statusReplies = await Promise.all(
        fields.map((field) =>
          this.connection.redirector.append_redirector_field(
            this.options.prefix,
            campaignId,
            redirectorId,
            field,
            lockSecret
          )
        )
      )

      const result = this.checkStatusReplies(statusReplies)

      this.logger.info(`Database append redirector fields`, {
        repository: this.repositoryName,
        method: 'appendFields',
        params: { campaignId, redirectorId, fields },
        result,
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'appendFields',
        params: { campaignId, redirectorId, fields },
      })
    }
  }

  async removeFields(campaignId: string, redirectorId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.redirector.remove_redirector_fields(
        this.options.prefix,
        campaignId,
        redirectorId,
        lockSecret
      )

      const result = this.checkStatusReply(statusReply)

      this.logger.info(`Database remove redirector fields`, {
        repository: this.repositoryName,
        method: 'removeFields',
        params: { campaignId, redirectorId },
        result,
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'removeFields',
        params: { campaignId, redirectorId },
      })
    }
  }

  async delete(campaignId: string, redirectorId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.redirector.delete_redirector(
        this.options.prefix,
        campaignId,
        redirectorId,
        lockSecret
      )

      const result = this.checkStatusReply(statusReply)

      this.logger.info(`Database delete redirector`, {
        repository: this.repositoryName,
        method: 'delete',
        params: { campaignId, redirectorId },
        result,
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'delete',
        params: { campaignId, redirectorId },
      })
    }
  }

  async list(campaignId: string): Promise<RedirectorModel[] | null> {
    try {
      const index = await this.connection.redirector.read_redirector_index(
        this.options.prefix,
        campaignId
      )

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((redirectorId) =>
          this.connection.redirector.read_redirector(this.options.prefix, campaignId, redirectorId)
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

  async listFull(campaignId: string): Promise<FullRedirectorModel[] | null> {
    try {
      const index = await this.connection.redirector.read_redirector_index(
        this.options.prefix,
        campaignId
      )

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((redirectorId) =>
          this.connection.redirector.read_full_redirector(
            this.options.prefix,
            campaignId,
            redirectorId
          )
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
   * Converts raw Redis data to a redirector model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The redirector model, or `null` if the raw data is `null`.
   * @throws {@link DatabaseError} If the raw data fails validation.
   */
  protected buildModel(rawModel: unknown): RedirectorModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawRedirector>('database-raw-redirector', rawModel)

    return new RedirectorModel(
      rawModel.campaign_id,
      rawModel.redirector_id,
      rawModel.lure_count,
      new Date(rawModel.created_at)
    )
  }

  /**
   * Converts raw Redis data to a full redirector model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The full redirector model, or `null` if the raw data is `null`.
   * @throws {@link DatabaseError} If the raw data fails validation.
   */
  protected buildFullModel(rawModel: unknown): FullRedirectorModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawFullRedirector>('database-raw-full-redirector', rawModel)

    return new FullRedirectorModel(
      rawModel.campaign_id,
      rawModel.redirector_id,
      rawModel.page,
      rawModel.fields,
      rawModel.lure_count,
      new Date(rawModel.created_at)
    )
  }

  /**
   * Converts a list of raw Redis data to a list of redirector models.
   *
   * @param rawCollection - The array of raw data from Redis.
   * @returns The array of redirector models.
   * @throws {@link DatabaseError} If the array of raw data fails validation.
   */
  protected buildCollection(rawCollection: unknown): RedirectorModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildModel(rawModel))
      .filter(RedirectorModel.isNotNull)
  }

  /**
   * Converts a list of raw Redis data to a list of full redirector models.
   *
   * @param rawCollection - The array of raw data from Redis.
   * @returns The array of full redirector models.
   * @throws {@link DatabaseError} If the array of raw data fails validation.
   */
  protected buildFullCollection(rawCollection: unknown): FullRedirectorModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildFullModel(rawModel))
      .filter(RedirectorModel.isNotNull)
  }
}
