import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  FullRedirectorModel,
  Logger,
  LOGGER,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  testRedirectorModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullRedirector, RawRedirector } from './redirector.functions.js'
import { rawFullRedirectorSchema, rawRedirectorSchema } from './redirector.schemas.js'

export class RedisRedirectorRepository extends RedisBaseRepository implements RedirectorRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<RedirectorRepository>(
      REDIRECTOR_REPOSITORY,
      (c) =>
        new RedisRedirectorRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<DatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR).connection<RedisDatabaseConnection>()
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'redirector')

    this.validator.addSchemas({
      'database-raw-redirector': rawRedirectorSchema,
      'database-raw-full-redirector': rawFullRedirectorSchema
    })
  }

  async create(campaignId: string, redirectorId: string, page: string): Promise<RedirectorModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.redirector.create_redirector(
          this.options.prefix,
          campaignId,
          redirectorId,
          page
        ),

        this.connection.redirector.read_redirector(this.options.prefix, campaignId, redirectorId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildRedirectorModel(rawValue)

      if (!testRedirectorModel(model)) {
        throw new DatabaseError(`Redirector lost on create`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'create', { campaignId, redirectorId })
    }
  }

  async read(campaignId: string, redirectorId: string): Promise<FullRedirectorModel | null> {
    try {
      const rawValue = await this.connection.redirector.read_full_redirector(
        this.options.prefix,
        campaignId,
        redirectorId
      )

      return this.buildFullRedirectorModel(rawValue)
    } catch (error) {
      this.handleException(error, 'read', { campaignId, redirectorId })
    }
  }

  async update(
    campaignId: string,
    redirectorId: string,
    page: string | null | undefined
  ): Promise<RedirectorModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.redirector.update_redirector(
          this.options.prefix,
          campaignId,
          redirectorId,
          page
        ),

        this.connection.redirector.read_redirector(this.options.prefix, campaignId, redirectorId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildRedirectorModel(rawValue)

      if (!testRedirectorModel(model)) {
        throw new DatabaseError(`Redirector lost on update`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'update', { campaignId, redirectorId })
    }
  }

  async delete(campaignId: string, redirectorId: string): Promise<RedirectorModel> {
    try {
      const [rawValue, statusReply] = await Promise.all([
        this.connection.redirector.read_redirector(this.options.prefix, campaignId, redirectorId),

        this.connection.redirector.delete_redirector(this.options.prefix, campaignId, redirectorId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildRedirectorModel(rawValue)

      if (!testRedirectorModel(model)) {
        throw new DatabaseError(`Redirector lost on delete`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'delete', { campaignId, redirectorId })
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

      const rawValues = await Promise.all(
        index.map((redirectorId) =>
          this.connection.redirector.read_redirector(this.options.prefix, campaignId, redirectorId)
        )
      )

      return this.buildRedirectorCollection(rawValues).filter(testRedirectorModel)
    } catch (error) {
      this.handleException(error, 'list', { campaignId })
    }
  }

  protected buildRedirectorModel(rawValue: unknown): RedirectorModel | null {
    if (rawValue === null) {
      return null
    }

    this.validateRawRedirector(rawValue)

    return {
      campaignId: rawValue.campaign_id,
      redirectorId: rawValue.redirector_id,
      lureCount: rawValue.lure_count,
      createdAt: new Date(rawValue.created_at),
      updatedAt: new Date(rawValue.updated_at)
    }
  }

  protected buildFullRedirectorModel(rawValue: unknown): FullRedirectorModel | null {
    if (rawValue === null) {
      return null
    }

    this.validateRawFullRedirector(rawValue)

    return {
      campaignId: rawValue.campaign_id,
      redirectorId: rawValue.redirector_id,
      page: rawValue.page,
      lureCount: rawValue.lure_count,
      createdAt: new Date(rawValue.created_at),
      updatedAt: new Date(rawValue.updated_at)
    }
  }

  protected buildRedirectorCollection(rawValues: unknown): Array<RedirectorModel | null> {
    this.validateArrayReply(rawValues)

    return rawValues.map((rawValue) => this.buildRedirectorModel(rawValue))
  }

  protected validateRawRedirector(value: unknown): asserts value is RawRedirector {
    try {
      this.validator.assertSchema<RawRedirector>('database-raw-redirector', value)
    } catch (error) {
      throw new DatabaseError(`RawRedirector validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected validateRawFullRedirector(value: unknown): asserts value is RawFullRedirector {
    try {
      this.validator.assertSchema<RawFullRedirector>('database-raw-full-redirector', value)
    } catch (error) {
      throw new DatabaseError(`RawFullRedirector validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
