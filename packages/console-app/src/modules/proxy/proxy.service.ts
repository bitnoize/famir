import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DatabaseErrorCode,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
  PROXY_SERVICE,
  ReadProxyData,
  ToggleProxyData,
} from './proxy.js'

/**
 * Represents a proxy service
 *
 * @category Proxy
 */
export class ProxyService {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<ProxyService>(
      PROXY_SERVICE,
      (c) => new ProxyService(c.resolve(PROXY_REPOSITORY))
    )
  }

  constructor(protected readonly proxyRepository: ProxyRepository) {}

  async create(data: CreateProxyData): Promise<true> {
    try {
      await this.proxyRepository.create(data.campaignId, data.proxyId, data.url, data.lockSecret)

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'CONFLICT', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code,
          })
        }
      }

      throw error
    }
  }

  async read(data: ReadProxyData): Promise<ProxyModel> {
    const proxy = await this.proxyRepository.read(data.campaignId, data.proxyId)

    if (!proxy) {
      throw new ReplServerError(`Proxy not found`, {
        code: 'NOT_FOUND',
      })
    }

    return proxy
  }

  async enable(data: ToggleProxyData): Promise<true> {
    try {
      await this.proxyRepository.enable(data.campaignId, data.proxyId, data.lockSecret)

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code,
          })
        }
      }

      throw error
    }
  }

  async disable(data: ToggleProxyData): Promise<true> {
    try {
      await this.proxyRepository.disable(data.campaignId, data.proxyId, data.lockSecret)

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code,
          })
        }
      }

      throw error
    }
  }

  async delete(data: DeleteProxyData): Promise<true> {
    try {
      await this.proxyRepository.delete(data.campaignId, data.proxyId, data.lockSecret)

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code,
          })
        }
      }

      throw error
    }
  }

  async list(data: ListProxiesData): Promise<ProxyModel[]> {
    const proxies = await this.proxyRepository.list(data.campaignId)

    if (!proxies) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND',
      })
    }

    return proxies
  }
}
