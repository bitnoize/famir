import { EnabledProxy, Proxy, ProxyRepository } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { DatabaseError } from '../../database.errors.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import {
  buildProxyCollection,
  buildProxyModel,
  guardEnabledProxy,
  guardProxy
} from './proxy.utils.js'

export class RedisProxyRepository extends RedisBaseRepository implements ProxyRepository {
  constructor(validator: Validator, logger: Logger, connection: RedisDatabaseConnection) {
    super(validator, logger, connection, 'proxy')
  }

  async create(id: string, url: string): Promise<void> {
    try {
      const status = await this.connection.proxy.create_proxy(id, url)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'create', { id, url })
    }
  }

  async read(id: string): Promise<Proxy | null> {
    try {
      const rawProxy = await this.connection.proxy.read_proxy(id)

      const proxy = buildProxyModel(rawProxy)

      return guardProxy(proxy) ? proxy : null
    } catch (error) {
      this.exceptionFilter(error, 'read', { id })
    }
  }

  async readEnabled(id: string): Promise<EnabledProxy | null> {
    try {
      const rawProxy = await this.connection.proxy.read_proxy(id)

      const proxy = buildProxyModel(rawProxy)

      return guardEnabledProxy(proxy) ? proxy : null
    } catch (error) {
      this.exceptionFilter(error, 'readEnabled', { id })
    }
  }

  async enable(id: string): Promise<void> {
    try {
      const status = await this.connection.proxy.enable_proxy(id)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'enable', { id })
    }
  }

  async disable(id: string): Promise<void> {
    try {
      const status = await this.connection.proxy.disable_proxy(id)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'disable', { id })
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const status = await this.connection.proxy.delete_proxy(id)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'delete', { id })
    }
  }

  async list(): Promise<Proxy[] | null> {
    try {
      const index = await this.connection.proxy.read_proxy_index()

      if (index === null) {
        return null
      }

      const rawProxies = await Promise.all(index.map((id) => this.connection.proxy.read_proxy(id)))

      return buildProxyCollection(rawProxies).filter(guardProxy)
    } catch (error) {
      this.exceptionFilter(error, 'list')
    }
  }
}
