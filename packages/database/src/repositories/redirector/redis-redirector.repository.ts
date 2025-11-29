import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateRedirectorData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteRedirectorData,
  FullRedirectorModel,
  ListRedirectorsData,
  Logger,
  LOGGER,
  ReadRedirectorData,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  testRedirectorModel,
  UpdateRedirectorData,
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

  async createRedirector(data: CreateRedirectorData): Promise<RedirectorModel> {
    try {
      const [status, rawValue] = await Promise.all([
        this.connection.redirector.create_redirector(
          this.options.prefix,
          data.campaignId,
          data.redirectorId,
          data.page
        ),

        this.connection.redirector.read_redirector(
          this.options.prefix,
          data.campaignId,
          data.redirectorId
        )
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const redirectorModel = this.buildRedirectorModel(rawValue)

      this.existsRedirectorModel(redirectorModel)

      this.logger.info(message, { redirectorModel })

      return redirectorModel
    } catch (error) {
      this.handleException(error, 'createRedirector', data)
    }
  }

  async readRedirector(data: ReadRedirectorData): Promise<FullRedirectorModel | null> {
    try {
      const rawValue = await this.connection.redirector.read_full_redirector(
        this.options.prefix,
        data.campaignId,
        data.redirectorId
      )

      return this.buildFullRedirectorModel(rawValue)
    } catch (error) {
      this.handleException(error, 'readRedirector', data)
    }
  }

  async updateRedirector(data: UpdateRedirectorData): Promise<RedirectorModel> {
    try {
      const [status, rawValue] = await Promise.all([
        this.connection.redirector.update_redirector(
          this.options.prefix,
          data.campaignId,
          data.redirectorId,
          data.page
        ),

        this.connection.redirector.read_redirector(
          this.options.prefix,
          data.campaignId,
          data.redirectorId
        )
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const redirectorModel = this.buildRedirectorModel(rawValue)

      this.existsRedirectorModel(redirectorModel)

      this.logger.info(message, { redirectorModel })

      return redirectorModel
    } catch (error) {
      this.handleException(error, 'updateRedirector', data)
    }
  }

  async deleteRedirector(data: DeleteRedirectorData): Promise<RedirectorModel> {
    try {
      const [rawValue, status] = await Promise.all([
        this.connection.redirector.read_redirector(
          this.options.prefix,
          data.campaignId,
          data.redirectorId
        ),

        this.connection.redirector.delete_redirector(
          this.options.prefix,
          data.campaignId,
          data.redirectorId
        )
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const redirectorModel = this.buildRedirectorModel(rawValue)

      this.existsRedirectorModel(redirectorModel)

      this.logger.info(message, { redirectorModel })

      return redirectorModel
    } catch (error) {
      this.handleException(error, 'deleteRedirector', data)
    }
  }

  async listRedirectors(data: ListRedirectorsData): Promise<RedirectorModel[] | null> {
    try {
      const index = await this.connection.redirector.read_redirector_index(
        this.options.prefix,
        data.campaignId
      )

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawValues = await Promise.all(
        index.map((redirectorId) =>
          this.connection.redirector.read_redirector(
            this.options.prefix,
            data.campaignId,
            redirectorId
          )
        )
      )

      return this.buildRedirectorCollection(rawValues).filter(testRedirectorModel)
    } catch (error) {
      this.handleException(error, 'listRedirectors', data)
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

  protected existsRedirectorModel<T extends RedirectorModel>(value: T | null): asserts value is T {
    if (!testRedirectorModel(value)) {
      throw new DatabaseError(`RedirectorModel not exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
