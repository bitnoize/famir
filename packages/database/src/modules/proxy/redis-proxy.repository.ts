import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DATABASE_CONNECTOR, DatabaseConnector } from '../../database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawProxy } from './proxy.functions.js'
import { PROXY_REPOSITORY, ProxyRepository } from './proxy.js'
import { ProxyModel } from './proxy.models.js'
import { rawProxySchema } from './proxy.schemas.js'

/**
 * Redis-based proxy repository implementation.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 * - {@link DatabaseConnector} via {@link DATABASE_CONNECTOR} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { PROXY_REPOSITORY, ProxyRepository, RedisProxyRepository } from '@famir/database'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * RedisProxyRepository.register(container)
 *
 * // Resolve dependency from container
 * const proxyRepository = container.resolve<ProxyRepository>(PROXY_REPOSITORY)
 *
 * // TODO more examples
 * ```
 *
 * @category Proxy
 */
export class RedisProxyRepository extends RedisBaseRepository implements ProxyRepository {
  /**
   * Registers the proxy repository as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ProxyRepository>(
      PROXY_REPOSITORY,
      (c) =>
        new RedisProxyRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new proxy repository instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   */
  constructor(validator: Validator, config: Config, logger: Logger, connector: DatabaseConnector) {
    super(validator, config, logger, connector, 'proxy')

    this.validator.addSchema('database-raw-proxy', rawProxySchema)
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

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { proxy: { campaignId, proxyId } })
    } catch (error) {
      this.handleRepositoryError(error, 'create', { campaignId, proxyId })
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
      this.handleRepositoryError(error, 'read', { campaignId, proxyId })
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

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { proxy: { campaignId, proxyId } })
    } catch (error) {
      this.handleRepositoryError(error, 'enable', { campaignId, proxyId })
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

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { proxy: { campaignId, proxyId } })
    } catch (error) {
      this.handleRepositoryError(error, 'disable', { campaignId, proxyId })
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

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { proxy: { campaignId, proxyId } })
    } catch (error) {
      this.handleRepositoryError(error, 'delete', { campaignId, proxyId })
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
      this.handleRepositoryError(error, 'list', { campaignId })
    }
  }

  /**
   * Converts raw Redis data to a proxy model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The proxy model, or `null` if the raw data is `null`.
   * @throws {@link DatabaseError} If the raw data fails validation.
   */
  protected buildModel(rawModel: unknown): ProxyModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawProxy>('database-raw-proxy', rawModel)

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
   * Converts a list of raw Redis data to a list of proxy models.
   *
   * @param rawCollection - The array of raw data from Redis.
   * @returns The array of proxy models.
   * @throws {@link DatabaseError} If the array of raw data fails validation.
   */
  protected buildCollection(rawCollection: unknown): ProxyModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(ProxyModel.isNotNull)
  }
}
