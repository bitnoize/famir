import { DIContainer } from '@famir/common'
import {
  FullRedirectorModel,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'

/**
 * DI token for the redirector service.
 *
 * @category Redirector
 */
export const REDIRECTOR_SERVICE = Symbol('RedirectorService')

/**
 * Represents the redirector service.
 *
 * @category Redirector
 */
export class RedirectorService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<RedirectorService>(
      REDIRECTOR_SERVICE,
      (c) => new RedirectorService(c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY))
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param redirectorRepository - The redirector repository instance.
   */
  constructor(protected readonly redirectorRepository: RedirectorRepository) {}

  /**
   * Reads the redirector by its ID.
   */
  async read(data: { campaignId: string; redirectorId: string }): Promise<FullRedirectorModel> {
    const redirector = await this.redirectorRepository.readFull(data.campaignId, data.redirectorId)

    if (!redirector) {
      throw ReplServerError.notFound(`Redirector not found`)
    }

    return redirector
  }

  /**
   * Lists all redirectors for the campaign.
   */
  async list(data: { campaignId: string }): Promise<RedirectorModel[]> {
    const redirectors = await this.redirectorRepository.list(data.campaignId)

    if (!redirectors) {
      throw ReplServerError.notFound(`Campaign not found`)
    }

    return redirectors
  }
}
