import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  Logger,
  LOGGER,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { RedisDatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawLure } from './lure.functions.js'
import { lureSchemas } from './lure.schemas.js'

export class RedisLureRepository extends RedisBaseRepository implements LureRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<LureRepository>(
      LURE_REPOSITORY,
      (c) =>
        new RedisLureRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<RedisDatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR).connection<RedisDatabaseConnection>()
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<RedisDatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'lure')

    this.validator.addSchemas(lureSchemas)

    this.logger.debug(`LureRepository initialized`)
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
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { lure: { campaignId, lureId, path, redirectorId } })
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, lureId, path, redirectorId })
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

  async enable(campaignId: string, lureId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.lure.enable_lure(
        this.options.prefix,
        campaignId,
        lureId,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { lure: { campaignId, lureId } })
    } catch (error) {
      this.raiseError(error, 'enable', { campaignId, lureId })
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

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { lure: { campaignId, lureId } })
    } catch (error) {
      this.raiseError(error, 'disable', { campaignId, lureId })
    }
  }

  async delete(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.lure.delete_lure(
        this.options.prefix,
        campaignId,
        lureId,
        path,
        redirectorId,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { lure: { campaignId, lureId, path, redirectorId } })
    } catch (error) {
      this.raiseError(error, 'delete', { campaignId, lureId, path, redirectorId })
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

    return new LureModel(
      rawModel.campaign_id,
      rawModel.lure_id,
      rawModel.path,
      rawModel.redirector_id,
      !!rawModel.is_enabled,
      rawModel.session_count,
      new Date(rawModel.created_at),
      new Date(rawModel.updated_at)
    )
  }

  protected buildCollection(rawCollection: unknown): LureModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(LureModel.isNotNull)
  }
}
