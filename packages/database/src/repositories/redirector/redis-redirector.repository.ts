import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  FullRedirectorModel,
  Logger,
  LOGGER,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { RedisDatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullRedirector, RawRedirector } from './redirector.functions.js'
import { redirectorSchemas } from './redirector.schemas.js'

export class RedisRedirectorRepository extends RedisBaseRepository implements RedirectorRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<RedirectorRepository>(
      REDIRECTOR_REPOSITORY,
      (c) =>
        new RedisRedirectorRepository(
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
    super(validator, config, logger, connection, 'redirector')

    this.validator.addSchemas(redirectorSchemas)

    this.logger.debug(`RedirectorRepository initialized`)
  }

  async create(
    campaignId: string,
    redirectorId: string,
    page: string,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.redirector.create_redirector(
        this.options.prefix,
        campaignId,
        redirectorId,
        page,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { redirector: { campaignId, redirectorId } })
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, redirectorId })
    }
  }

  async read(campaignId: string, redirectorId: string): Promise<FullRedirectorModel | null> {
    try {
      const rawFullModel = await this.connection.redirector.read_full_redirector(
        this.options.prefix,
        campaignId,
        redirectorId
      )

      return this.buildFullModel(rawFullModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId, redirectorId })
    }
  }

  async update(
    campaignId: string,
    redirectorId: string,
    page: string | null | undefined,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.redirector.update_redirector(
        this.options.prefix,
        campaignId,
        redirectorId,
        page,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { redirector: { campaignId, redirectorId } })
    } catch (error) {
      this.raiseError(error, 'update', { campaignId, redirectorId })
    }
  }

  async delete(campaignId: string, redirectorId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.redirector.delete_redirector(
        this.options.prefix,
        campaignId,
        redirectorId,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { redirector: { campaignId, redirectorId } })
    } catch (error) {
      this.raiseError(error, 'delete', { campaignId, redirectorId })
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

      const rawCollection = await Promise.all(
        index.map((redirectorId) =>
          this.connection.redirector.read_redirector(this.options.prefix, campaignId, redirectorId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      this.raiseError(error, 'list', { campaignId })
    }
  }

  protected buildModel(rawModel: unknown): RedirectorModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawRedirector>('database-raw-redirector', rawModel)

    return new RedirectorModel(
      rawModel.campaign_id,
      rawModel.redirector_id,
      rawModel.lure_count,
      new Date(rawModel.created_at),
      new Date(rawModel.updated_at)
    )
  }

  protected buildFullModel(rawFullModel: unknown): FullRedirectorModel | null {
    if (rawFullModel === null) {
      return null
    }

    this.validateRawData<RawFullRedirector>('database-raw-full-redirector', rawFullModel)

    return new FullRedirectorModel(
      rawFullModel.campaign_id,
      rawFullModel.redirector_id,
      rawFullModel.page,
      rawFullModel.lure_count,
      new Date(rawFullModel.created_at),
      new Date(rawFullModel.updated_at)
    )
  }

  protected buildCollection(rawCollection: unknown): RedirectorModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildModel(rawModel))
      .filter(RedirectorModel.isNotNull)
  }
}
