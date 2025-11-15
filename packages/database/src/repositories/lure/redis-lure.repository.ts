import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateLureData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteLureData,
  ListLuresData,
  Logger,
  LOGGER,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  ReadLureData,
  ReadLurePathData,
  SwitchLureData,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawLure } from './lure.functions.js'
import { rawLureSchema } from './lure.schemas.js'

export class RedisLureRepository extends RedisBaseRepository implements LureRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<LureRepository>(
      LURE_REPOSITORY,
      (c) =>
        new RedisLureRepository(
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
    super(validator, config, logger, connection, 'lure')

    this.validator.addSchemas({
      'database-raw-lure': rawLureSchema
    })

    this.logger.debug(`Repository initialized`, {
      repository: this.repositoryName
    })
  }

  async createLure(data: CreateLureData): Promise<LureModel> {
    try {
      const [status, rawValue] = await Promise.all([
        this.connection.lure.create_lure(
          this.options.prefix,
          data.campaignId,
          data.lureId,
          data.path,
          data.redirectorId
        ),

        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.lureId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const lureModel = this.buildLureModel(rawValue)

      this.assertLureModel(lureModel)

      this.logger.info(message, { lureModel })

      return lureModel
    } catch (error) {
      this.handleException(error, 'createLure', data)
    }
  }

  async readLure(data: ReadLureData): Promise<LureModel | null> {
    try {
      const rawValue = await this.connection.lure.read_lure(
        this.options.prefix,
        data.campaignId,
        data.lureId
      )

      return this.buildLureModel(rawValue)
    } catch (error) {
      this.handleException(error, 'readLure', data)
    }
  }

  async readLurePath(data: ReadLurePathData): Promise<LureModel | null> {
    try {
      const lureId = await this.connection.lure.read_lure_path(
        this.options.prefix,
        data.campaignId,
        data.path
      )

      if (lureId === null) {
        return null
      }

      this.validateStringReply(lureId)

      const rawValue = await this.connection.lure.read_lure(
        this.options.prefix,
        data.campaignId,
        lureId
      )

      return this.buildLureModel(rawValue)
    } catch (error) {
      this.handleException(error, 'readLurePath', data)
    }
  }

  async enableLure(data: SwitchLureData): Promise<LureModel> {
    try {
      const [status, rawValue] = await Promise.all([
        this.connection.lure.enable_lure(this.options.prefix, data.campaignId, data.lureId),

        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.lureId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const lureModel = this.buildLureModel(rawValue)

      this.assertLureModel(lureModel)

      this.logger.info(message, { lureModel })

      return lureModel
    } catch (error) {
      this.handleException(error, 'enableLure', data)
    }
  }

  async disableLure(data: SwitchLureData): Promise<LureModel> {
    try {
      const [status, rawValue] = await Promise.all([
        this.connection.lure.disable_lure(this.options.prefix, data.campaignId, data.lureId),

        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.lureId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const lureModel = this.buildLureModel(rawValue)

      this.assertLureModel(lureModel)

      this.logger.info(message, { lureModel })

      return lureModel
    } catch (error) {
      this.handleException(error, 'disableLure', data)
    }
  }

  async deleteLure(data: DeleteLureData): Promise<LureModel> {
    try {
      const [rawValue, status] = await Promise.all([
        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.lureId),

        this.connection.lure.delete_lure(
          this.options.prefix,
          data.campaignId,
          data.lureId,
          data.path,
          data.redirectorId
        )
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const lureModel = this.buildLureModel(rawValue)

      this.assertLureModel(lureModel)

      this.logger.info(message, { lureModel })

      return lureModel
    } catch (error) {
      this.handleException(error, 'deleteLure', data)
    }
  }

  async listLures(data: ListLuresData): Promise<LureModel[] | null> {
    try {
      const index = await this.connection.lure.read_lure_index(this.options.prefix, data.campaignId)

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawValues = await Promise.all(
        index.map((lureId) =>
          this.connection.lure.read_lure(this.options.prefix, data.campaignId, lureId)
        )
      )

      return this.buildLureCollection(rawValues).filter(this.guardLureModel)
    } catch (error) {
      this.handleException(error, 'listLures', data)
    }
  }

  protected buildLureModel(rawValue: unknown): LureModel | null {
    if (rawValue === null) {
      return null
    }

    this.validateRawLure(rawValue)

    return {
      campaignId: rawValue.campaign_id,
      lureId: rawValue.lure_id,
      path: rawValue.path,
      redirectorId: rawValue.redirector_id,
      isEnabled: !!rawValue.is_enabled,
      sessionCount: rawValue.session_count,
      createdAt: new Date(rawValue.created_at),
      updatedAt: new Date(rawValue.updated_at)
    }
  }

  protected buildLureCollection(rawValues: unknown): Array<LureModel | null> {
    this.validateArrayReply(rawValues)

    return rawValues.map((rawValue) => this.buildLureModel(rawValue))
  }

  protected validateRawLure(value: unknown): asserts value is RawLure {
    try {
      this.validator.assertSchema<RawLure>('database-raw-lure', value)
    } catch (error) {
      throw new DatabaseError(`RawLure validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected guardLureModel = (value: LureModel | null): value is LureModel => {
    return value != null
  }

  protected assertLureModel(value: LureModel | null): asserts value is LureModel {
    if (!this.guardLureModel(value)) {
      throw new DatabaseError(`LureModel unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
