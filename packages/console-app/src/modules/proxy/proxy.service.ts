import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DatabaseErrorCode,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'

/**
 * DI token for the proxy service.
 *
 * @category Proxy
 */
export const PROXY_SERVICE = Symbol('ProxyService')

/**
 * Represents the proxy service.
 *
 * @category Proxy
 */
export class ProxyService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ProxyService>(
      PROXY_SERVICE,
      (c) => new ProxyService(c.resolve<ProxyRepository>(PROXY_REPOSITORY))
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param proxyRepository - The proxy repository instance.
   */
  constructor(protected readonly proxyRepository: ProxyRepository) {}

  /**
   * Creates a new proxy.
   *
   * @param data - The data object.
   * @returns The created proxy model.
   */
  async create(data: {
    campaignId: string
    proxyId: string
    url: string
    lockSecret: string
  }): Promise<ProxyModel> {
    try {
      await this.proxyRepository.create(data.campaignId, data.proxyId, data.url, data.lockSecret)
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

    const proxy = await this.proxyRepository.read(data.campaignId, data.proxyId)

    if (!proxy) {
      throw new ReplServerError(`Proxy not found`, {
        code: 'NOT_FOUND',
      })
    }

    return proxy
  }

  /**
   * Reads the proxy by its ID.
   *
   * @param data - The data object.
   * @returns The proxy model.
   * @throws {@link ReplServerError} If the proxy is not found.
   */
  async read(data: { campaignId: string; proxyId: string }): Promise<ProxyModel> {
    const proxy = await this.proxyRepository.read(data.campaignId, data.proxyId)

    if (!proxy) {
      throw new ReplServerError(`Proxy not found`, {
        code: 'NOT_FOUND',
      })
    }

    return proxy
  }

  /**
   * Enables the proxy, making it available for traffic routing.
   *
   * @param data - The data object.
   */
  async enable(data: { campaignId: string; proxyId: string; lockSecret: string }): Promise<void> {
    try {
      await this.proxyRepository.enable(data.campaignId, data.proxyId, data.lockSecret)
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

  /**
   * Disables the proxy, stopping traffic routing.
   *
   * @param data - The data object.
   */
  async disable(data: { campaignId: string; proxyId: string; lockSecret: string }): Promise<void> {
    try {
      await this.proxyRepository.disable(data.campaignId, data.proxyId, data.lockSecret)
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

  /**
   * Deletes the proxy by its ID.
   *
   * @param data - The data object.
   */
  async delete(data: { campaignId: string; proxyId: string; lockSecret: string }): Promise<void> {
    try {
      await this.proxyRepository.delete(data.campaignId, data.proxyId, data.lockSecret)
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

  /**
   * Lists all proxies for the campaign.
   *
   * @param data - The data object.
   * @returns The array of proxy models.
   */
  async list(data: { campaignId: string }): Promise<ProxyModel[]> {
    const proxies = await this.proxyRepository.list(data.campaignId)

    if (!proxies) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND',
      })
    }

    return proxies
  }
}
