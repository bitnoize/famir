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

    this.logger.debug(`LureRepository initialized`)
  }

  async create(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string
  ): Promise<LureModel> {
    try {
      const [statusReply, rawModel] = await Promise.all([
        this.connection.lure.create_lure(
          this.options.prefix,
          campaignId,
          lureId,
          path,
          redirectorId
        ),

        this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)
      ])

      const message = this.handleStatusReply(statusReply)

      const model = this.buildModelStrict(rawModel)

      this.logger.info(message, { lure: model })

      return model
    } catch (error) {
      this.raiseError(error, 'create', {
        campaignId,
        lureId,
        path,
        redirectorId
      })
    }
  }

  async read(campaignId: string, lureId: string): Promise<LureModel | null> {
    try {
      const rawModel = await this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)

      return this.buildModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId, lureId })
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

      const rawModel = await this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)

      return this.buildModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'readPath', { campaignId, path })
    }
  }

  async enable(campaignId: string, lureId: string): Promise<LureModel> {
    try {
      const [statusReply, rawModel] = await Promise.all([
        this.connection.lure.enable_lure(this.options.prefix, campaignId, lureId),

        this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)
      ])

      const message = this.handleStatusReply(statusReply)

      const model = this.buildModelStrict(rawModel)

      this.logger.info(message, { lure: model })

      return model
    } catch (error) {
      this.raiseError(error, 'enable', { campaignId, lureId })
    }
  }

  async disable(campaignId: string, lureId: string): Promise<LureModel> {
    try {
      const [statusReply, rawModel] = await Promise.all([
        this.connection.lure.disable_lure(this.options.prefix, campaignId, lureId),

        this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)
      ])

      const message = this.handleStatusReply(statusReply)

      const model = this.buildModelStrict(rawModel)

      this.logger.info(message, { lure: model })

      return model
    } catch (error) {
      this.raiseError(error, 'disable', { campaignId, lureId })
    }
  }

  async delete(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string
  ): Promise<LureModel> {
    try {
      const [rawModel, statusReply] = await Promise.all([
        this.connection.lure.read_lure(this.options.prefix, campaignId, lureId),

        this.connection.lure.delete_lure(
          this.options.prefix,
          campaignId,
          lureId,
          path,
          redirectorId
        )
      ])

      const message = this.handleStatusReply(statusReply)

      const model = this.buildModelStrict(rawModel)

      this.logger.info(message, { lure: model })

      return model
    } catch (error) {
      this.raiseError(error, 'delete', {
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

      const rawCollection = await Promise.all(
        index.map((lureId) =>
          this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      this.raiseError(error, 'list', { campaignId })
    }
  }

  protected buildModel(rawModel: unknown): LureModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawLure>('database-raw-lure', rawModel)

    return {
      campaignId: rawModel.campaign_id,
      lureId: rawModel.lure_id,
      path: rawModel.path,
      redirectorId: rawModel.redirector_id,
      isEnabled: !!rawModel.is_enabled,
      sessionCount: rawModel.session_count,
      createdAt: new Date(rawModel.created_at),
      updatedAt: new Date(rawModel.updated_at)
    }
  }

  protected buildModelStrict(rawModel: unknown): LureModel {
    const model = this.buildModel(rawModel)

    if (!testLureModel(model)) {
      throw new DatabaseError(`Lure unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return model
  }

  protected buildCollection(rawCollection: unknown): LureModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(testLureModel)
  }
}
