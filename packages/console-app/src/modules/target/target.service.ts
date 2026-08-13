import { DIContainer } from '@famir/common'
import {
  FullTargetModel,
  TARGET_REPOSITORY,
  TargetHosts,
  TargetModel,
  TargetRepository,
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'

/**
 * DI token for the target service.
 *
 * @category Target
 */
export const TARGET_SERVICE = Symbol('TargetService')

/**
 * Represents the target service.
 *
 * @category Target
 */
export class TargetService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<TargetService>(
      TARGET_SERVICE,
      (c) => new TargetService(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param targetRepository - The target repository instance.
   */
  constructor(protected readonly targetRepository: TargetRepository) {}

  /**
   * Reads the target by its ID.
   */
  async read(data: { campaignId: string; targetId: string }): Promise<FullTargetModel> {
    const target = await this.targetRepository.readFull(data.campaignId, data.targetId)

    if (!target) {
      throw ReplServerError.notFound(`Target not found`)
    }

    return target
  }

  /**
   * Reads all target hosts across all campaigns.
   */
  async readHosts(): Promise<TargetHosts> {
    return await this.targetRepository.readHosts()
  }

  /**
   * Lists all targets for the campaign.
   */
  async list(data: { campaignId: string }): Promise<TargetModel[]> {
    const targets = await this.targetRepository.list(data.campaignId)

    if (!targets) {
      throw ReplServerError.notFound(`Campaign not found`)
    }

    return targets
  }
}
