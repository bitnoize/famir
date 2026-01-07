import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  Logger,
  LOGGER,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  testProxyModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawProxy } from './proxy.functions.js'
import { proxySchemas } from './proxy.schemas.js'

export class RedisProxyRepository extends RedisBaseRepository implements ProxyRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<ProxyRepository>(
      PROXY_REPOSITORY,
      (c) =>
        new RedisProxyRepository(
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
    super(validator, config, logger, connection, 'proxy')

    this.validator.addSchemas(proxySchemas)

    this.logger.debug(`ProxyRepository initialized`)
  }

  async create(campaignId: string, proxyId: string, url: string): Promise<ProxyModel> {
    try {
      const [statusReply, rawModel] = await Promise.all([
        this.connection.proxy.create_proxy(this.options.prefix, campaignId, proxyId, url),

        this.connection.proxy.read_proxy(this.options.prefix, campaignId, proxyId)
      ])

      const message = this.handleStatusReply(statusReply)

      const model = this.buildModelStrict(rawModel)

      this.logger.info(message, { proxy: model })

      return model
    } catch (error) {
      this.raiseError(error, 'create', {
        campaignId,
        proxyId,
        url
      })
    }
  }

  async read(campaignId: string, proxyId: string): Promise<ProxyModel | null> {
    try {
      const rawModel = await this.connection.proxy.read_proxy(
        this.options.prefix,
        campaignId,
        proxyId
      )

      return this.buildModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId, proxyId })
    }
  }

  async enable(campaignId: string, proxyId: string): Promise<ProxyModel> {
    try {
      const [statusReply, rawModel] = await Promise.all([
        this.connection.proxy.enable_proxy(this.options.prefix, campaignId, proxyId),

        this.connection.proxy.read_proxy(this.options.prefix, campaignId, proxyId)
      ])

      const message = this.handleStatusReply(statusReply)

      const model = this.buildModelStrict(rawModel)

      this.logger.info(message, { proxy: model })

      return model
    } catch (error) {
      this.raiseError(error, 'enable', { campaignId, proxyId })
    }
  }

  async disable(campaignId: string, proxyId: string): Promise<ProxyModel> {
    try {
      const [statusReply, rawModel] = await Promise.all([
        this.connection.proxy.disable_proxy(this.options.prefix, campaignId, proxyId),

        this.connection.proxy.read_proxy(this.options.prefix, campaignId, proxyId)
      ])

      const message = this.handleStatusReply(statusReply)

      const model = this.buildModelStrict(rawModel)

      this.logger.info(message, { proxy: model })

      return model
    } catch (error) {
      this.raiseError(error, 'disable', { campaignId, proxyId })
    }
  }

  async delete(campaignId: string, proxyId: string): Promise<ProxyModel> {
    try {
      const [rawModel, statusReply] = await Promise.all([
        this.connection.proxy.read_proxy(this.options.prefix, campaignId, proxyId),

        this.connection.proxy.delete_proxy(this.options.prefix, campaignId, proxyId)
      ])

      const message = this.handleStatusReply(statusReply)

      const model = this.buildModelStrict(rawModel)

      this.logger.info(message, { proxy: model })

      return model
    } catch (error) {
      this.raiseError(error, 'delete', { campaignId, proxyId })
    }
  }

  async list(campaignId: string): Promise<ProxyModel[] | null> {
    try {
      const index = await this.connection.proxy.read_proxy_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((proxyId) =>
          this.connection.proxy.read_proxy(this.options.prefix, campaignId, proxyId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      this.raiseError(error, 'list', { campaignId })
    }
  }

  protected buildModel(rawModel: unknown): ProxyModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawProxy>('database-raw-proxy', rawModel)

    return {
      campaignId: rawModel.campaign_id,
      proxyId: rawModel.proxy_id,
      url: rawModel.url,
      isEnabled: !!rawModel.is_enabled,
      messageCount: rawModel.message_count,
      createdAt: new Date(rawModel.created_at),
      updatedAt: new Date(rawModel.updated_at)
    }
  }

  protected buildModelStrict(rawModel: unknown): ProxyModel {
    const model = this.buildModel(rawModel)

    if (!testProxyModel(model)) {
      throw new DatabaseError(`Proxy unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return model
  }

  protected buildCollection(rawCollection: unknown): ProxyModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(testProxyModel)
  }
}
