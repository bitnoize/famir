import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DatabaseError } from '../../database.error.js'
import { DATABASE_CONNECTOR, DatabaseConnector, RedisDatabaseConfig } from '../../database.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawProxy } from './proxy.functions.js'
import { PROXY_REPOSITORY, ProxyRepository } from './proxy.js'
import { ProxyModel } from './proxy.models.js'
import { proxySchemas } from './proxy.schemas.js'

/**
 * Redis proxy repository implementation.
 *
 * @category Proxy
 */
export class RedisProxyRepository extends RedisBaseRepository implements ProxyRepository {
  /**
   * Register proxy repository instance as singleton in DI container.
   *
   * @param container - DI container to register in
   */
  static register(container: DIContainer) {
    container.registerSingleton<ProxyRepository>(
      PROXY_REPOSITORY,
      (c) =>
        new RedisProxyRepository(
          c.resolve(VALIDATOR),
          c.resolve(CONFIG),
          c.resolve(LOGGER),
          c.resolve(DATABASE_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new proxy repository instance.
   *
   * @param validator - The validator instance
   * @param config - The database config instance
   * @param logger - The logger instance
   * @param connector - The database connector instance
   */
  constructor(
    validator: Validator,
    config: Config<RedisDatabaseConfig>,
    logger: Logger,
    connector: DatabaseConnector
  ) {
    super(validator, config, logger, connector, 'proxy')

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
        Date.now(),
        lockSecret
      )

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

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

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

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

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

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

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

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

  /**
   * Converts raw Redis data to a proxy model.
   *
   * @param rawModel - The raw data from Redis
   * @returns The proxy model, or `null` if the raw data is `null`
   * @throws {@link DatabaseError} If the raw data fails validation
   * @internal
   */
  protected buildModel(rawModel: unknown): ProxyModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawProxy>('database-raw-proxy', rawModel)

    return new ProxyModel(
      rawModel.campaign_id,
      rawModel.proxy_id,
      rawModel.url,
      rawModel.is_enabled,
      rawModel.message_count,
      new Date(rawModel.created_at)
    )
  }

  /**
   * Converts an array of raw Redis data to an array of proxy models.
   *
   * @param rawCollection - The array of raw data from Redis
   * @returns An array of proxy models
   * @throws {@link DatabaseError} If the array of raw data fails validation
   * @internal
   */
  protected buildCollection(rawCollection: unknown): ProxyModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(ProxyModel.isNotNull)
  }
}
