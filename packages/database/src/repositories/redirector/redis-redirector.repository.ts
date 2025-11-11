import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateRedirectorData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteRedirectorData,
  ListRedirectorsData,
  Logger,
  LOGGER,
  ReadRedirectorData,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  UpdateRedirectorData,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawRedirector } from './redirector.functions.js'
import { rawRedirectorSchema } from './redirector.schemas.js'

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
      'database-raw-redirector': rawRedirectorSchema
    })

    this.logger.debug(`RedirectorRepository initialized`)
  }

  async createRedirector(data: CreateRedirectorData): Promise<RedirectorModel> {
    try {
      const [status, rawRedirector] = await Promise.all([
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

      const redirectorModel = this.buildRedirectorModel(rawRedirector)

      this.assertRedirectorModel(redirectorModel)

      this.logger.info(message, { redirectorModel })

      return redirectorModel
    } catch (error) {
      this.handleException(error, 'createRedirector', data)
    }
  }

  async readRedirector(data: ReadRedirectorData): Promise<RedirectorModel | null> {
    try {
      const rawRedirector = await this.connection.redirector.read_redirector(
        this.options.prefix,
        data.campaignId,
        data.redirectorId
      )

      return this.buildRedirectorModel(rawRedirector)
    } catch (error) {
      this.handleException(error, 'readRedirector', data)
    }
  }

  async updateRedirector(data: UpdateRedirectorData): Promise<RedirectorModel> {
    try {
      const [status, rawRedirector] = await Promise.all([
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

      const redirectorModel = this.buildRedirectorModel(rawRedirector)

      this.assertRedirectorModel(redirectorModel)

      this.logger.info(message, { redirectorModel })

      return redirectorModel
    } catch (error) {
      this.handleException(error, 'updateRedirector', data)
    }
  }

  async deleteRedirector(data: DeleteRedirectorData): Promise<RedirectorModel> {
    try {
      const [rawRedirector, status] = await Promise.all([
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

      const redirectorModel = this.buildRedirectorModel(rawRedirector)

      this.assertRedirectorModel(redirectorModel)

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

      const rawRedirectors = await Promise.all(
        index.map((redirectorId) =>
          this.connection.redirector.read_redirector(
            this.options.prefix,
            data.campaignId,
            redirectorId
          )
        )
      )

      return this.buildRedirectorCollection(rawRedirectors).filter(this.guardRedirectorModel)
    } catch (error) {
      this.handleException(error, 'listRedirectors', data)
    }
  }

  protected buildRedirectorModel(rawRedirector: unknown): RedirectorModel | null {
    if (rawRedirector === null) {
      return null
    }

    this.validateRawRedirector(rawRedirector)

    return {
      campaignId: rawRedirector.campaign_id,
      redirectorId: rawRedirector.redirector_id,
      page: rawRedirector.page,
      lureCount: rawRedirector.lure_count,
      createdAt: new Date(rawRedirector.created_at),
      updatedAt: new Date(rawRedirector.updated_at)
    }
  }

  protected buildRedirectorCollection(rawRedirectors: unknown): Array<RedirectorModel | null> {
    this.validateArrayReply(rawRedirectors)

    return rawRedirectors.map((rawRedirector) => this.buildRedirectorModel(rawRedirector))
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

  protected guardRedirectorModel(value: RedirectorModel | null): value is RedirectorModel {
    return value != null
  }

  protected assertRedirectorModel(value: RedirectorModel | null): asserts value is RedirectorModel {
    if (!this.guardRedirectorModel(value)) {
      throw new DatabaseError(`RedirectorModel unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
