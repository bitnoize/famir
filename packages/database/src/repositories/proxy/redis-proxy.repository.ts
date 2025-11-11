import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateProxyData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteProxyData,
  DisabledProxyModel,
  EnabledProxyModel,
  ListProxiesData,
  Logger,
  LOGGER,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  ReadProxyData,
  SwitchProxyData,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawProxy } from './proxy.functions.js'
import { rawProxySchema } from './proxy.schemas.js'

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

    this.validator.addSchemas({
      'database-raw-proxy': rawProxySchema
    })

    this.logger.debug(`ProxyRepository initialized`)
  }

  async createProxy(data: CreateProxyData): Promise<DisabledProxyModel> {
    try {
      const [status, rawProxy] = await Promise.all([
        this.connection.proxy.create_proxy(
          this.options.prefix,
          data.campaignId,
          data.proxyId,
          data.url
        ),

        this.connection.proxy.read_proxy(this.options.prefix, data.campaignId, data.proxyId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const proxyModel = this.buildProxyModel(rawProxy)

      this.assertDisabledProxyModel(proxyModel)

      this.logger.info(message, { proxyModel })

      return proxyModel
    } catch (error) {
      this.handleException(error, 'createProxy', data)
    }
  }

  async readProxy(data: ReadProxyData): Promise<ProxyModel | null> {
    try {
      const rawProxy = await this.connection.proxy.read_proxy(
        this.options.prefix,
        data.campaignId,
        data.proxyId
      )

      return this.buildProxyModel(rawProxy)
    } catch (error) {
      this.handleException(error, 'readProxy', data)
    }
  }

  async readEnabledProxy(data: ReadProxyData): Promise<EnabledProxyModel | null> {
    try {
      const rawProxy = await this.connection.proxy.read_proxy(
        this.options.prefix,
        data.campaignId,
        data.proxyId
      )

      const proxyModel = this.buildProxyModel(rawProxy)

      return this.guardEnabledProxyModel(proxyModel) ? proxyModel : null
    } catch (error) {
      this.handleException(error, 'readEnabledProxy', data)
    }
  }

  async enableProxy(data: SwitchProxyData): Promise<EnabledProxyModel> {
    try {
      const [status, rawProxy] = await Promise.all([
        this.connection.proxy.enable_proxy(this.options.prefix, data.campaignId, data.proxyId),

        this.connection.proxy.read_proxy(this.options.prefix, data.campaignId, data.proxyId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const proxyModel = this.buildProxyModel(rawProxy)

      this.assertEnabledProxyModel(proxyModel)

      this.logger.info(message, { proxyModel })

      return proxyModel
    } catch (error) {
      this.handleException(error, 'enableProxy', data)
    }
  }

  async disableProxy(data: SwitchProxyData): Promise<DisabledProxyModel> {
    try {
      const [status, rawProxy] = await Promise.all([
        this.connection.proxy.disable_proxy(this.options.prefix, data.campaignId, data.proxyId),

        this.connection.proxy.read_proxy(this.options.prefix, data.campaignId, data.proxyId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const proxyModel = this.buildProxyModel(rawProxy)

      this.assertDisabledProxyModel(proxyModel)

      this.logger.info(message, { proxyModel })

      return proxyModel
    } catch (error) {
      this.handleException(error, 'disableProxy', data)
    }
  }

  async deleteProxy(data: DeleteProxyData): Promise<DisabledProxyModel> {
    try {
      const [rawProxy, status] = await Promise.all([
        this.connection.proxy.read_proxy(this.options.prefix, data.campaignId, data.proxyId),

        this.connection.proxy.delete_proxy(this.options.prefix, data.campaignId, data.proxyId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const proxyModel = this.buildProxyModel(rawProxy)

      this.assertDisabledProxyModel(proxyModel)

      this.logger.info(message, { proxyModel })

      return proxyModel
    } catch (error) {
      this.handleException(error, 'deleteProxy', data)
    }
  }

  async listProxies(data: ListProxiesData): Promise<ProxyModel[] | null> {
    try {
      const index = await this.connection.proxy.read_proxy_index(
        this.options.prefix,
        data.campaignId
      )

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawProxies = await Promise.all(
        index.map((proxyId) =>
          this.connection.proxy.read_proxy(this.options.prefix, data.campaignId, proxyId)
        )
      )

      return this.buildProxyCollection(rawProxies).filter(this.guardProxyModel)
    } catch (error) {
      this.handleException(error, 'listProxies', data)
    }
  }

  protected buildProxyModel(rawProxy: unknown): ProxyModel | null {
    if (rawProxy === null) {
      return null
    }

    this.validateRawProxy(rawProxy)

    return {
      campaignId: rawProxy.campaign_id,
      proxyId: rawProxy.proxy_id,
      url: rawProxy.url,
      isEnabled: !!rawProxy.is_enabled,
      messageCount: rawProxy.message_count,
      createdAt: new Date(rawProxy.created_at),
      updatedAt: new Date(rawProxy.updated_at)
    }
  }

  protected buildProxyCollection(rawProxies: unknown): Array<ProxyModel | null> {
    this.validateArrayReply(rawProxies)

    return rawProxies.map((rawProxy) => this.buildProxyModel(rawProxy))
  }

  protected validateRawProxy(value: unknown): asserts value is RawProxy {
    try {
      this.validator.assertSchema<RawProxy>('database-raw-proxy', value)
    } catch (error) {
      throw new DatabaseError(`RawProxy validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected guardProxyModel(value: ProxyModel | null): value is ProxyModel {
    return value != null
  }

  protected guardEnabledProxyModel(value: ProxyModel | null): value is EnabledProxyModel {
    return this.guardProxyModel(value) && value.isEnabled
  }

  protected guardDisabledProxyModel(value: ProxyModel | null): value is DisabledProxyModel {
    return this.guardProxyModel(value) && !value.isEnabled
  }

  protected assertProxyModel(value: ProxyModel | null): asserts value is ProxyModel {
    if (!this.guardProxyModel(value)) {
      throw new DatabaseError(`ProxyModel unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected assertEnabledProxyModel(value: ProxyModel | null): asserts value is EnabledProxyModel {
    if (!this.guardEnabledProxyModel(value)) {
      throw new DatabaseError(`EnabledProxyModel unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected assertDisabledProxyModel(
    value: ProxyModel | null
  ): asserts value is DisabledProxyModel {
    if (!this.guardDisabledProxyModel(value)) {
      throw new DatabaseError(`DisabledProxyModel unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
