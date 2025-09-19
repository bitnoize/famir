import {
  Config,
  DatabaseError,
  DisabledProxyModel,
  EnabledProxyModel,
  Logger,
  ProxyModel,
  ProxyRepository,
  Validator
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import {
  assertDisabledProxy,
  assertEnabledProxy,
  buildProxyCollection,
  buildProxyModel,
  guardEnabledProxy,
  guardProxy
} from './proxy.utils.js'

export class RedisProxyRepository extends RedisBaseRepository implements ProxyRepository {
  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'proxy')
  }

  async create(campaignId: string, id: string, url: string): Promise<DisabledProxyModel> {
    try {
      const [status, rawProxy] = await Promise.all([
        this.connection.proxy.create_proxy(this.options.prefix, campaignId, id, url),

        this.connection.proxy.read_proxy(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const proxy = buildProxyModel(rawProxy)

        assertDisabledProxy(proxy)

        return proxy
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'create', { campaignId, id, url })
    }
  }

  async read(campaignId: string, id: string): Promise<ProxyModel | null> {
    try {
      const rawProxy = await this.connection.proxy.read_proxy(this.options.prefix, campaignId, id)

      return buildProxyModel(rawProxy)
    } catch (error) {
      this.exceptionFilter(error, 'read', { campaignId, id })
    }
  }

  async readEnabled(campaignId: string, id: string): Promise<EnabledProxyModel | null> {
    try {
      const rawProxy = await this.connection.proxy.read_proxy(this.options.prefix, campaignId, id)

      const proxy = buildProxyModel(rawProxy)

      return guardEnabledProxy(proxy) ? proxy : null
    } catch (error) {
      this.exceptionFilter(error, 'readEnabled', { campaignId, id })
    }
  }

  async enable(campaignId: string, id: string): Promise<EnabledProxyModel> {
    try {
      const [status, rawProxy] = await Promise.all([
        this.connection.proxy.enable_proxy(this.options.prefix, campaignId, id),

        this.connection.proxy.read_proxy(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const proxy = buildProxyModel(rawProxy)

        assertEnabledProxy(proxy)

        return proxy
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'enable', { campaignId, id })
    }
  }

  async disable(campaignId: string, id: string): Promise<DisabledProxyModel> {
    try {
      const [status, rawProxy] = await Promise.all([
        this.connection.proxy.disable_proxy(this.options.prefix, campaignId, id),

        this.connection.proxy.read_proxy(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const proxy = buildProxyModel(rawProxy)

        assertDisabledProxy(proxy)

        return proxy
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'disable', { campaignId, id })
    }
  }

  async delete(campaignId: string, id: string): Promise<DisabledProxyModel> {
    try {
      const [rawProxy, status] = await Promise.all([
        this.connection.proxy.read_proxy(this.options.prefix, campaignId, id),

        this.connection.proxy.delete_proxy(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const proxy = buildProxyModel(rawProxy)

        assertDisabledProxy(proxy)

        return proxy
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'delete', { campaignId, id })
    }
  }

  async list(campaignId: string): Promise<ProxyModel[] | null> {
    try {
      const index = await this.connection.proxy.read_proxy_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      const rawProxies = await Promise.all(
        index.map((id) => this.connection.proxy.read_proxy(this.options.prefix, campaignId, id))
      )

      return buildProxyCollection(rawProxies).filter(guardProxy)
    } catch (error) {
      this.exceptionFilter(error, 'list', { campaignId })
    }
  }
}
