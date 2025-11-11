import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateLureData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteLureData,
  DisabledLureModel,
  EnabledLureModel,
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

    this.logger.debug(`LureRepository initialized`)
  }

  async createLure(data: CreateLureData): Promise<DisabledLureModel> {
    try {
      const [status, rawLure] = await Promise.all([
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

      const lureModel = this.buildLureModel(rawLure)

      this.assertDisabledLureModel(lureModel)

      this.logger.info(message, { lureModel })

      return lureModel
    } catch (error) {
      this.handleException(error, 'createLure', data)
    }
  }

  async readLure(data: ReadLureData): Promise<LureModel | null> {
    try {
      const rawLure = await this.connection.lure.read_lure(
        this.options.prefix,
        data.campaignId,
        data.lureId
      )

      return this.buildLureModel(rawLure)
    } catch (error) {
      this.handleException(error, 'readLure', data)
    }
  }

  async readLurePath(data: ReadLurePathData): Promise<EnabledLureModel | null> {
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

      const rawLure = await this.connection.lure.read_lure(
        this.options.prefix,
        data.campaignId,
        lureId
      )

      const lureModel = this.buildLureModel(rawLure)

      return this.guardEnabledLureModel(lureModel) ? lureModel : null
    } catch (error) {
      this.handleException(error, 'readLurePath', data)
    }
  }

  async enableLure(data: SwitchLureData): Promise<EnabledLureModel> {
    try {
      const [status, rawLure] = await Promise.all([
        this.connection.lure.enable_lure(this.options.prefix, data.campaignId, data.lureId),

        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.lureId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const lureModel = this.buildLureModel(rawLure)

      this.assertEnabledLureModel(lureModel)

      this.logger.info(message, { lureModel })

      return lureModel
    } catch (error) {
      this.handleException(error, 'enableLure', data)
    }
  }

  async disableLure(data: SwitchLureData): Promise<DisabledLureModel> {
    try {
      const [status, rawLure] = await Promise.all([
        this.connection.lure.disable_lure(this.options.prefix, data.campaignId, data.lureId),

        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.lureId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const lureModel = this.buildLureModel(rawLure)

      this.assertDisabledLureModel(lureModel)

      this.logger.info(message, { lureModel })

      return lureModel
    } catch (error) {
      this.handleException(error, 'disableLure', data)
    }
  }

  async deleteLure(data: DeleteLureData): Promise<DisabledLureModel> {
    try {
      const [rawLure, status] = await Promise.all([
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

      const lureModel = this.buildLureModel(rawLure)

      this.assertDisabledLureModel(lureModel)

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

      const rawLures = await Promise.all(
        index.map((lureId) =>
          this.connection.lure.read_lure(this.options.prefix, data.campaignId, lureId)
        )
      )

      return this.buildLureCollection(rawLures).filter(this.guardLureModel)
    } catch (error) {
      this.handleException(error, 'listLures', data)
    }
  }

  protected buildLureModel(rawLure: unknown): LureModel | null {
    if (rawLure === null) {
      return null
    }

    this.validateRawLure(rawLure)

    return {
      campaignId: rawLure.campaign_id,
      lureId: rawLure.lure_id,
      path: rawLure.path,
      redirectorId: rawLure.redirector_id,
      isEnabled: !!rawLure.is_enabled,
      sessionCount: rawLure.session_count,
      createdAt: new Date(rawLure.created_at),
      updatedAt: new Date(rawLure.updated_at)
    }
  }

  protected buildLureCollection(rawLures: unknown): Array<LureModel | null> {
    this.validateArrayReply(rawLures)

    return rawLures.map((rawLure) => this.buildLureModel(rawLure))
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

  protected guardLureModel(value: LureModel | null): value is LureModel {
    return value != null
  }

  protected guardEnabledLureModel(value: LureModel | null): value is EnabledLureModel {
    return this.guardLureModel(value) && value.isEnabled
  }

  protected guardDisabledLureModel(value: LureModel | null): value is DisabledLureModel {
    return this.guardLureModel(value) && !value.isEnabled
  }

  protected assertLureModel(value: LureModel | null): asserts value is LureModel {
    if (!this.guardLureModel(value)) {
      throw new DatabaseError(`LureModel unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected assertEnabledLureModel(value: LureModel | null): asserts value is EnabledLureModel {
    if (!this.guardEnabledLureModel(value)) {
      throw new DatabaseError(`EnabledLureModel unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected assertDisabledLureModel(value: LureModel | null): asserts value is DisabledLureModel {
    if (!this.guardDisabledLureModel(value)) {
      throw new DatabaseError(`DisabledLureModel unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
