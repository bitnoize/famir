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
  }

  async create(campaignId: string, proxyId: string, url: string): Promise<ProxyModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.proxy.create_proxy(this.options.prefix, campaignId, proxyId, url),

        this.connection.proxy.read_proxy(this.options.prefix, campaignId, proxyId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildProxyModel(rawValue)

      if (!testProxyModel(model)) {
        throw new DatabaseError(`Proxy lost on create`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'create', {
        campaignId,
        proxyId,
        url
      })
    }
  }

  async read(campaignId: string, proxyId: string): Promise<ProxyModel | null> {
    try {
      const rawValue = await this.connection.proxy.read_proxy(
        this.options.prefix,
        campaignId,
        proxyId
      )

      return this.buildProxyModel(rawValue)
    } catch (error) {
      this.handleException(error, 'read', { campaignId, proxyId })
    }
  }

  async enable(campaignId: string, proxyId: string): Promise<ProxyModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.proxy.enable_proxy(this.options.prefix, campaignId, proxyId),

        this.connection.proxy.read_proxy(this.options.prefix, campaignId, proxyId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildProxyModel(rawValue)

      if (!testProxyModel(model)) {
        throw new DatabaseError(`Proxy lost on enable`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'enable', { campaignId, proxyId })
    }
  }

  async disable(campaignId: string, proxyId: string): Promise<ProxyModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.proxy.disable_proxy(this.options.prefix, campaignId, proxyId),

        this.connection.proxy.read_proxy(this.options.prefix, campaignId, proxyId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildProxyModel(rawValue)

      if (!testProxyModel(model)) {
        throw new DatabaseError(`Proxy lost on disable`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'disable', { campaignId, proxyId })
    }
  }

  async delete(campaignId: string, proxyId: string): Promise<ProxyModel> {
    try {
      const [rawValue, statusReply] = await Promise.all([
        this.connection.proxy.read_proxy(this.options.prefix, campaignId, proxyId),

        this.connection.proxy.delete_proxy(this.options.prefix, campaignId, proxyId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildProxyModel(rawValue)

      if (!testProxyModel(model)) {
        throw new DatabaseError(`Proxy lost on delete`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'delete', { campaignId, proxyId })
    }
  }

  async list(campaignId: string): Promise<ProxyModel[] | null> {
    try {
      const index = await this.connection.proxy.read_proxy_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawValues = await Promise.all(
        index.map((proxyId) =>
          this.connection.proxy.read_proxy(this.options.prefix, campaignId, proxyId)
        )
      )

      return this.buildProxyCollection(rawValues).filter(testProxyModel)
    } catch (error) {
      this.handleException(error, 'list', { campaignId })
    }
  }

  protected buildProxyModel(rawValue: unknown): ProxyModel | null {
    if (rawValue === null) {
      return null
    }

    this.validateRawProxy(rawValue)

    return {
      campaignId: rawValue.campaign_id,
      proxyId: rawValue.proxy_id,
      url: rawValue.url,
      isEnabled: !!rawValue.is_enabled,
      messageCount: rawValue.message_count,
      createdAt: new Date(rawValue.created_at),
      updatedAt: new Date(rawValue.updated_at)
    }
  }

  protected buildProxyCollection(rawValues: unknown): Array<ProxyModel | null> {
    this.validateArrayReply(rawValues)

    return rawValues.map((rawValue) => this.buildProxyModel(rawValue))
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
}
