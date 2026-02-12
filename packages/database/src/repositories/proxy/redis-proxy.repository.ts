import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  DATABASE_CONNECTOR,
  DatabaseConnector,
  RedisDatabaseConnection
} from '../../database-connector.js'
import { RedisDatabaseConfig } from '../../database.js'
import { ProxyModel } from '../../models/index.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawProxy } from './proxy.functions.js'
import { PROXY_REPOSITORY, ProxyRepository } from './proxy.js'
import { proxySchemas } from './proxy.schemas.js'

export class RedisProxyRepository extends RedisBaseRepository implements ProxyRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<ProxyRepository>(
      PROXY_REPOSITORY,
      (c) =>
        new RedisProxyRepository(
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
    super(validator, config, logger, connection, 'proxy')

    this.validator.addSchemas(proxySchemas)

    this.logger.debug(`ProxyRepository initialized`)
  }

  async create(
    campaignId: string,
    proxyId: string,
    url: string,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.proxy.create_proxy(
        this.options.prefix,
        campaignId,
        proxyId,
        url,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { proxy: { campaignId, proxyId } })
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, proxyId })
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

  async enable(campaignId: string, proxyId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.proxy.enable_proxy(
        this.options.prefix,
        campaignId,
        proxyId,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { proxy: { campaignId, proxyId } })
    } catch (error) {
      this.raiseError(error, 'enable', { campaignId, proxyId })
    }
  }

  async disable(campaignId: string, proxyId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.proxy.disable_proxy(
        this.options.prefix,
        campaignId,
        proxyId,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { proxy: { campaignId, proxyId } })
    } catch (error) {
      this.raiseError(error, 'disable', { campaignId, proxyId })
    }
  }

  async delete(campaignId: string, proxyId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.proxy.delete_proxy(
        this.options.prefix,
        campaignId,
        proxyId,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { proxy: { campaignId, proxyId } })
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

    return new ProxyModel(
      rawModel.campaign_id,
      rawModel.proxy_id,
      rawModel.url,
      !!rawModel.is_enabled,
      rawModel.message_count,
      new Date(rawModel.created_at),
      new Date(rawModel.updated_at)
    )
  }

  protected buildCollection(rawCollection: unknown): ProxyModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(ProxyModel.isNotNull)
  }
}
