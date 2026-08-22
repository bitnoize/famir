import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  DatabaseError,
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
      (c) =>
        new ProxyService(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<ProxyRepository>(PROXY_REPOSITORY)
        )
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param campaignRepository - The campaign repository instance.
   * @param proxyRepository - The proxy repository instance.
   */
  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly proxyRepository: ProxyRepository
  ) {}

  /**
   * Creates a new proxy.
   */
  async create(data: { campaignId: string; proxyId: string; url: string }): Promise<void> {
    const lockSecret = await this.lockCampaign(data.campaignId)

    try {
      await this.proxyRepository.create(data.campaignId, data.proxyId, data.url, lockSecret)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'CONFLICT') {
          throw ReplServerError.conflict(error.message)
        }

        throw ReplServerError.internal(`Create proxy failed`, null, error)
      }

      throw error
    } finally {
      await this.campaignRepository.unlock(data.campaignId, lockSecret)
    }
  }

  /**
   * Reads the proxy by its ID.
   */
  async read(data: { campaignId: string; proxyId: string }): Promise<ProxyModel> {
    const proxy = await this.proxyRepository.read(data.campaignId, data.proxyId)

    if (!proxy) {
      throw ReplServerError.notFound(`Proxy not found`)
    }

    return proxy
  }

  /**
   * Enables the proxy, making it available for traffic routing.
   */
  async enable(data: { campaignId: string; proxyId: string }): Promise<void> {
    const lockSecret = await this.lockCampaign(data.campaignId)

    try {
      await this.proxyRepository.enable(data.campaignId, data.proxyId, lockSecret)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw ReplServerError.notFound(error.message)
        }

        throw ReplServerError.internal(`Enable proxy failed`, null, error)
      }

      throw error
    } finally {
      await this.campaignRepository.unlock(data.campaignId, lockSecret)
    }
  }

  /**
   * Disables the proxy, stopping traffic routing.
   */
  async disable(data: { campaignId: string; proxyId: string }): Promise<void> {
    const lockSecret = await this.lockCampaign(data.campaignId)

    try {
      await this.proxyRepository.disable(data.campaignId, data.proxyId, lockSecret)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw ReplServerError.notFound(error.message)
        }

        throw ReplServerError.internal(`Disable proxy failed`, null, error)
      }

      throw error
    } finally {
      await this.campaignRepository.unlock(data.campaignId, lockSecret)
    }
  }

  /**
   * Deletes the proxy by its ID.
   */
  async delete(data: { campaignId: string; proxyId: string }): Promise<void> {
    const lockSecret = await this.lockCampaign(data.campaignId)

    try {
      await this.proxyRepository.delete(data.campaignId, data.proxyId, lockSecret)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw ReplServerError.notFound(error.message)
        }

        if (error.code === 'FORBIDDEN') {
          throw ReplServerError.forbidden(error.message)
        }

        throw ReplServerError.internal(`Delete proxy failed`, null, error)
      }

      throw error
    } finally {
      await this.campaignRepository.unlock(data.campaignId, lockSecret)
    }
  }

  /**
   * Lists all proxies for the campaign.
   */
  async list(data: { campaignId: string }): Promise<ProxyModel[]> {
    const proxies = await this.proxyRepository.list(data.campaignId)

    if (!proxies) {
      throw ReplServerError.notFound(`Campaign not found`)
    }

    return proxies
  }

  protected async lockCampaign(campaignId: string): Promise<string> {
    try {
      return await this.campaignRepository.lock(campaignId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw ReplServerError.notFound(error.message)
        }

        if (error.code === 'FORBIDDEN') {
          throw ReplServerError.forbidden(error.message)
        }

        throw ReplServerError.internal(`Lock campaign failed`, null, error)
      }

      throw error
    }
  }
}
