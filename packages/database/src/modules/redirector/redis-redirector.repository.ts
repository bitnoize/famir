import { DIContainer } from '@famir/common'
import {
  CONFIG,
  Config,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  LOGGER,
  Logger,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import { RedisBaseRepository } from '../base/index.js'
import { RawRedirector } from './redirector.functions.js'
import { rawRedirectorSchema } from './redirector.schemas.js'

/**
 * Redis-based redirector repository implementation.
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
        new this(
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

    this.validator.addSchema('database-raw-redirector', rawRedirectorSchema)
  }

  async create(
    campaignId: string,
    redirectorId: string,
    page: string,
    lockSecret: string
  ): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'create',
      params: {
        campaignId,
        redirectorId,
        page: page,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.create_redirector(
        this.options.prefix,
        campaignId,
        redirectorId,
        page,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database create redirector`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async read(campaignId: string, redirectorId: string): Promise<RedirectorModel | null> {
    const details = {
      repository: this.repositoryName,
      method: 'read',
      params: {
        campaignId,
        redirectorId,
      },
    } as const

    try {
      const rawModel = await this.connection.famir.read_redirector(
        this.options.prefix,
        campaignId,
        redirectorId
      )

      return this.buildModel(rawModel)
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async update(
    campaignId: string,
    redirectorId: string,
    page: string,
    lockSecret: string
  ): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'update',
      params: {
        campaignId,
        redirectorId,
        page,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.update_redirector(
        this.options.prefix,
        campaignId,
        redirectorId,
        page,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database update redirector`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async appendFields(
    campaignId: string,
    redirectorId: string,
    fields: string[],
    lockSecret: string
  ): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'appendFields',
      params: {
        campaignId,
        redirectorId,
        fields,
        lockSecret: '********',
      },
    } as const

    try {
      if (fields.length === 0) {
        return
      }

      const statusReplies = await Promise.all(
        fields.map((field) =>
          this.connection.famir.append_redirector_field(
            this.options.prefix,
            campaignId,
            redirectorId,
            field,
            lockSecret
          )
        )
      )

      this.checkStatusReplies(statusReplies)

      this.logger.info(`Database append redirector fields`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async clearFields(campaignId: string, redirectorId: string, lockSecret: string): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'clearFields',
      params: {
        campaignId,
        redirectorId,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.clear_redirector_fields(
        this.options.prefix,
        campaignId,
        redirectorId,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database clear redirector fields`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async delete(campaignId: string, redirectorId: string, lockSecret: string): Promise<void> {
    const details = {
      repository: this.repositoryName,
      method: 'delete',
      params: {
        campaignId,
        redirectorId,
        lockSecret: '********',
      },
    } as const

    try {
      const statusReply = await this.connection.famir.delete_redirector(
        this.options.prefix,
        campaignId,
        redirectorId,
        lockSecret
      )

      this.checkStatusReply(statusReply)

      this.logger.info(`Database delete redirector`, { data: details })
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  async list(campaignId: string): Promise<RedirectorModel[] | null> {
    const details = {
      repository: this.repositoryName,
      method: 'list',
      params: {
        campaignId,
      },
    } as const

    try {
      const index = await this.connection.famir.read_redirector_index(
        this.options.prefix,
        campaignId
      )

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((redirectorId) =>
          this.connection.famir.read_redirector(this.options.prefix, campaignId, redirectorId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      throw DatabaseError.wrap(error, details)
    }
  }

  /**
   * Converts raw Redis data to a redirector model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The redirector model, or `null` if the raw data is `null`.
   * @throws DatabaseError If the raw data fails validation.
   */
  protected buildModel(rawModel: unknown): RedirectorModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawRedirector>('database-raw-redirector', rawModel)

    return new RedirectorModel(
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
   * @throws DatabaseError If the array of raw data fails validation.
   */
  protected buildCollection(rawCollection: unknown): RedirectorModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildModel(rawModel))
      .filter(RedirectorModel.isNotNull)
  }
}
