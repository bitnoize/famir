import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DatabaseErrorCode,
  FullTargetModel,
  TARGET_REPOSITORY,
  TargetAccessLevel,
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
   * Creates a new target.
   *
   * @param data - The data object.
   * @returns The created target model.
   */
  async create(data: {
    campaignId: string
    targetId: string
    accessLevel: TargetAccessLevel
    donorSecure: boolean
    donorSub: string
    donorDomain: string
    donorPort: number
    mirrorSecure: boolean
    mirrorSub: string
    mirrorPort: number
    connectTimeout: number
    simpleTimeout: number
    streamTimeout: number
    headersSizeLimit: number
    bodySizeLimit: number
    mainPage: string
    notFoundPage: string
    faviconIco: string
    robotsTxt: string
    sitemapXml: string
    allowWebSockets: boolean
    lockSecret: string
  }): Promise<FullTargetModel> {
    try {
      await this.targetRepository.create(
        data.campaignId,
        data.targetId,
        data.accessLevel,
        data.donorSecure,
        data.donorSub,
        data.donorDomain,
        data.donorPort,
        data.mirrorSecure,
        data.mirrorSub,
        data.mirrorPort,
        data.connectTimeout,
        data.simpleTimeout,
        data.streamTimeout,
        data.headersSizeLimit,
        data.bodySizeLimit,
        data.mainPage,
        data.notFoundPage,
        data.faviconIco,
        data.robotsTxt,
        data.sitemapXml,
        data.allowWebSockets,
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

    const target = await this.targetRepository.readFull(data.campaignId, data.targetId)

    if (!target) {
      throw new ReplServerError(`Target not found`, {
        code: 'NOT_FOUND',
      })
    }

    return target
  }

  /**
   * Reads the target by its ID.
   *
   * @param data - The data object.
   * @returns The target model.
   * @throws {@link ReplServerError} If the target is not found.
   */
  async read(data: { campaignId: string; targetId: string }): Promise<FullTargetModel> {
    const target = await this.targetRepository.readFull(data.campaignId, data.targetId)

    if (!target) {
      throw new ReplServerError(`Target not found`, {
        code: 'NOT_FOUND',
      })
    }

    return target
  }

  /**
   * Reads all target hosts across all campaigns.
   *
   * @returns The dictionary of target hosts and their links.
   */
  async readHosts(): Promise<TargetHosts> {
    return await this.targetRepository.readHosts()
  }

  /**
   * Updates the target specific fields.
   *
   * @param data - The data object.
   */
  async update(data: {
    campaignId: string
    targetId: string
    connectTimeout: number | null | undefined
    simpleTimeout: number | null | undefined
    streamTimeout: number | null | undefined
    headersSizeLimit: number | null | undefined
    bodySizeLimit: number | null | undefined
    mainPage: string | null | undefined
    notFoundPage: string | null | undefined
    faviconIco: string | null | undefined
    robotsTxt: string | null | undefined
    sitemapXml: string | null | undefined
    allowWebSockets: boolean | null | undefined
    lockSecret: string
  }): Promise<void> {
    try {
      await this.targetRepository.update(
        data.campaignId,
        data.targetId,
        data.connectTimeout,
        data.simpleTimeout,
        data.streamTimeout,
        data.headersSizeLimit,
        data.bodySizeLimit,
        data.mainPage,
        data.notFoundPage,
        data.faviconIco,
        data.robotsTxt,
        data.sitemapXml,
        data.allowWebSockets,
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
   * Enables the target, making it available for traffic routing.
   *
   * @param data - The data object.
   */
  async enable(data: { campaignId: string; targetId: string; lockSecret: string }): Promise<void> {
    try {
      await this.targetRepository.enable(data.campaignId, data.targetId, data.lockSecret)
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
   * Disables the target, stopping traffic routing.
   *
   * @param data - The data object.
   */
  async disable(data: { campaignId: string; targetId: string; lockSecret: string }): Promise<void> {
    try {
      await this.targetRepository.disable(data.campaignId, data.targetId, data.lockSecret)
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
   * Appends a label to the target.
   *
   * @param data - The data object.
   */
  async appendLabel(data: {
    campaignId: string
    targetId: string
    label: string
    lockSecret: string
  }): Promise<void> {
    try {
      await this.targetRepository.appendLabel(
        data.campaignId,
        data.targetId,
        data.label,
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
   * Removes a label from the target.
   *
   * @param data - The data object.
   */
  async removeLabel(data: {
    campaignId: string
    targetId: string
    label: string
    lockSecret: string
  }): Promise<void> {
    try {
      await this.targetRepository.removeLabel(
        data.campaignId,
        data.targetId,
        data.label,
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
   * Deletes the target by its ID.
   *
   * @param data - The data object.
   */
  async delete(data: { campaignId: string; targetId: string; lockSecret: string }): Promise<void> {
    try {
      await this.targetRepository.delete(data.campaignId, data.targetId, data.lockSecret)
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
   * Lists all targets for the campaign.
   *
   * @param data - The data object.
   * @returns The array of target models.
   */
  async list(data: { campaignId: string }): Promise<TargetModel[]> {
    const targets = await this.targetRepository.list(data.campaignId)

    if (!targets) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND',
      })
    }

    return targets
  }
}
