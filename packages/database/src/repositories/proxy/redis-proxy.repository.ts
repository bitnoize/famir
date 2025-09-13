import { Config } from '@famir/config'
import {
  DisabledProxy,
  EnabledProxy,
  Proxy,
  ProxyRepository,
  RepositoryContainer
} from '@famir/domain'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { DatabaseError } from '../../database.errors.js'
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

  async create(
    campaignId: string,
    id: string,
    url: string
  ): Promise<RepositoryContainer<DisabledProxy>> {
    try {
      const [status, rawProxy] = await Promise.all([
        this.connection.proxy.create_proxy(this.options.prefix, campaignId, id, url),

        this.connection.proxy.read_proxy(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const proxy = buildProxyModel(rawProxy)

        assertDisabledProxy(proxy)

        return [true, proxy, code, message]
      }

      const isKnownError = ['NOT_FOUND', 'CONFLICT'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'create', { campaignId, id, url })
    }
  }

  async read(campaignId: string, id: string): Promise<Proxy | null> {
    try {
      const rawProxy = await this.connection.proxy.read_proxy(this.options.prefix, campaignId, id)

      return buildProxyModel(rawProxy)
    } catch (error) {
      this.exceptionFilter(error, 'read', { campaignId, id })
    }
  }

  async readEnabled(campaignId: string, id: string): Promise<EnabledProxy | null> {
    try {
      const rawProxy = await this.connection.proxy.read_proxy(this.options.prefix, campaignId, id)

      const proxy = buildProxyModel(rawProxy)

      return guardEnabledProxy(proxy) ? proxy : null
    } catch (error) {
      this.exceptionFilter(error, 'readEnabled', { campaignId, id })
    }
  }

  async enable(campaignId: string, id: string): Promise<RepositoryContainer<EnabledProxy>> {
    try {
      const [status, rawProxy] = await Promise.all([
        this.connection.proxy.enable_proxy(this.options.prefix, campaignId, id),

        this.connection.proxy.read_proxy(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const proxy = buildProxyModel(rawProxy)

        assertEnabledProxy(proxy)

        return [true, proxy, code, message]
      }

      const isKnownError = ['NOT_FOUND'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'enable', { campaignId, id })
    }
  }

  async disable(campaignId: string, id: string): Promise<RepositoryContainer<DisabledProxy>> {
    try {
      const [status, rawProxy] = await Promise.all([
        this.connection.proxy.disable_proxy(this.options.prefix, campaignId, id),

        this.connection.proxy.read_proxy(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const proxy = buildProxyModel(rawProxy)

        assertDisabledProxy(proxy)

        return [true, proxy, code, message]
      }

      const isKnownError = ['NOT_FOUND'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'disable', { campaignId, id })
    }
  }

  async delete(campaignId: string, id: string): Promise<RepositoryContainer<DisabledProxy>> {
    try {
      const [rawProxy, status] = await Promise.all([
        this.connection.proxy.read_proxy(this.options.prefix, campaignId, id),

        this.connection.proxy.delete_proxy(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const proxy = buildProxyModel(rawProxy)

        assertDisabledProxy(proxy)

        return [true, proxy, code, message]
      }

      const isKnownError = ['NOT_FOUND', 'FORBIDDEN'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'delete', { campaignId, id })
    }
  }

  async list(campaignId: string): Promise<Proxy[] | null> {
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
