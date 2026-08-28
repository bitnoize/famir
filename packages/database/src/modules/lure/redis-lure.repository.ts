import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DATABASE_CONNECTOR, DatabaseConnector } from '../../database-connector.js'
import { DatabaseError } from '../../database.error.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawLure } from './lure.functions.js'
import { LURE_REPOSITORY, LureRepository } from './lure.js'
import { LureModel } from './lure.models.js'
import { rawLureSchema } from './lure.schemas.js'

/**
 * Redis-based lure repository implementation.
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
 * import { LURE_REPOSITORY, LureRepository, RedisLureRepository } from '@famir/database'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * RedisLureRepository.register(container)
 *
 * // Resolve dependency from container
 * const lureRepository = container.resolve<LureRepository>(LURE_REPOSITORY)
 *
 * // TODO more examples
 * ```
 *
 * @category Lure
 */
export class RedisLureRepository extends RedisBaseRepository implements LureRepository {
  /**
   * Registers the lure repository as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<LureRepository>(
      LURE_REPOSITORY,
      (c) =>
        new RedisLureRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new lure repository instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   */
  constructor(validator: Validator, config: Config, logger: Logger, connector: DatabaseConnector) {
    super(validator, config, logger, connector, 'lure')

    this.validator.addSchema('database-raw-lure', rawLureSchema)
  }

  async create(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.lure.create_lure(
        this.options.prefix,
        campaignId,
        lureId,
        path,
        redirectorId,
        Date.now(),
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database create lure`, {
        database: {
          lure: {
            campaignId,
            lureId,
            path,
            redirectorId,
          },
        },
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'create',
        params: {
          campaignId,
          lureId,
          path,
          redirectorId,
        },
      })
    }
  }

  async read(campaignId: string, lureId: string): Promise<LureModel | null> {
    try {
      const rawModel = await this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)

      return this.buildModel(rawModel)
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'read',
        params: {
          campaignId,
          lureId,
        },
      })
    }
  }

  async find(campaignId: string, path: string): Promise<LureModel | null> {
    try {
      const lureId = await this.connection.lure.find_lure_id(this.options.prefix, campaignId, path)

      if (lureId === null) {
        return null
      }

      this.validateStringReply(lureId)

      const rawModel = await this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)

      return this.buildModel(rawModel)
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'find',
        params: {
          campaignId,
          path,
        },
      })
    }
  }

  async enable(campaignId: string, lureId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.lure.enable_lure(
        this.options.prefix,
        campaignId,
        lureId,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database enable lure`, {
        database: {
          lure: {
            campaignId,
            lureId,
          },
        },
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'enable',
        params: {
          campaignId,
          lureId,
        },
      })
    }
  }

  async disable(campaignId: string, lureId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.lure.disable_lure(
        this.options.prefix,
        campaignId,
        lureId,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database disable lure`, {
        database: {
          lure: {
            campaignId,
            lureId,
          },
        },
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'disable',
        params: {
          campaignId,
          lureId,
        },
      })
    }
  }

  async delete(
    campaignId: string,
    lureId: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.lure.delete_lure(
        this.options.prefix,
        campaignId,
        lureId,
        redirectorId,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database delete lure`, {
        database: {
          lure: {
            campaignId,
            lureId,
            redirectorId,
          },
        },
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'delete',
        params: {
          campaignId,
          lureId,
          redirectorId,
        },
      })
    }
  }

  async list(campaignId: string): Promise<LureModel[] | null> {
    try {
      const index = await this.connection.lure.read_lure_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((lureId) =>
          this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      throw DatabaseError.wrap(error, {
        repository: this.repositoryName,
        method: 'list',
        params: {
          campaignId,
        },
      })
    }
  }

  /**
   * Converts raw Redis data to a lure model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The lure model, or `null` if the raw data is `null`.
   * @throws {@link DatabaseError} If the raw data fails validation.
   */
  protected buildModel(rawModel: unknown): LureModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawLure>('database-raw-lure', rawModel)

    return new LureModel(
      rawModel.campaign_id,
      rawModel.lure_id,
      rawModel.path,
      rawModel.redirector_id,
      rawModel.is_enabled,
      rawModel.session_count,
      new Date(rawModel.created_at)
    )
  }

  /**
   * Converts a list of raw Redis data to a list of lure models.
   *
   * @param rawCollection - The array of raw data from Redis.
   * @returns The array of lure models.
   * @throws {@link DatabaseError} If the array of raw data fails validation.
   */
  protected buildCollection(rawCollection: unknown): LureModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(LureModel.isNotNull)
  }
}
