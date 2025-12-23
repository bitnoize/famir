import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  Logger,
  LOGGER,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  testLureModel,
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
  }

  async create(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string
  ): Promise<LureModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.lure.create_lure(
          this.options.prefix,
          campaignId,
          lureId,
          path,
          redirectorId
        ),

        this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildLureModel(rawValue)

      if (!testLureModel(model)) {
        throw new DatabaseError(`Lure lost on create`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { lure: model })

      return model
    } catch (error) {
      this.handleException(error, 'create', {
        campaignId,
        lureId,
        path,
        redirectorId
      })
    }
  }

  async read(campaignId: string, lureId: string): Promise<LureModel | null> {
    try {
      const rawValue = await this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)

      return this.buildLureModel(rawValue)
    } catch (error) {
      this.handleException(error, 'read', { campaignId, lureId })
    }
  }

  async readPath(campaignId: string, path: string): Promise<LureModel | null> {
    try {
      const lureId = await this.connection.lure.read_lure_path(
        this.options.prefix,
        campaignId,
        path
      )

      if (lureId === null) {
        return null
      }

      this.validateStringReply(lureId)

      const rawValue = await this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)

      return this.buildLureModel(rawValue)
    } catch (error) {
      this.handleException(error, 'readPath', { campaignId, path })
    }
  }

  async enable(campaignId: string, lureId: string): Promise<LureModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.lure.enable_lure(this.options.prefix, campaignId, lureId),

        this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildLureModel(rawValue)

      if (!testLureModel(model)) {
        throw new DatabaseError(`Lure lost on enable`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { lure: model })

      return model
    } catch (error) {
      this.handleException(error, 'enable', { campaignId, lureId })
    }
  }

  async disable(campaignId: string, lureId: string): Promise<LureModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.lure.disable_lure(this.options.prefix, campaignId, lureId),

        this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildLureModel(rawValue)

      if (!testLureModel(model)) {
        throw new DatabaseError(`Lure lost on disable`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { lure: model })

      return model
    } catch (error) {
      this.handleException(error, 'disable', { campaignId, lureId })
    }
  }

  async delete(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string
  ): Promise<LureModel> {
    try {
      const [rawValue, statusReply] = await Promise.all([
        this.connection.lure.read_lure(this.options.prefix, campaignId, lureId),

        this.connection.lure.delete_lure(
          this.options.prefix,
          campaignId,
          lureId,
          path,
          redirectorId
        )
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildLureModel(rawValue)

      if (!testLureModel(model)) {
        throw new DatabaseError(`Lure lost on delete`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { lure: model })

      return model
    } catch (error) {
      this.handleException(error, 'delete', {
        campaignId,
        lureId,
        path,
        redirectorId
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

      const rawValues = await Promise.all(
        index.map((lureId) =>
          this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)
        )
      )

      return this.buildLureCollection(rawValues).filter(testLureModel)
    } catch (error) {
      this.handleException(error, 'list', { campaignId })
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
}
