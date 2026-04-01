import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DatabaseErrorCode,
  FullTargetModel,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import {
  ActionTargetLabelData,
  CreateTargetData,
  DeleteTargetData,
  ListTargetsData,
  ReadTargetData,
  SwitchTargetData,
  TARGET_SERVICE,
  UpdateTargetData
} from './target.js'

/*
 * Target service
 */
export class TargetService {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<TargetService>(
      TARGET_SERVICE,
      (c) => new TargetService(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(protected readonly targetRepository: TargetRepository) {}

  /*
   * Create target
   */
  async create(data: CreateTargetData): Promise<true> {
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

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'CONFLICT', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  /*
   * Read target
   */
  async read(data: ReadTargetData): Promise<FullTargetModel> {
    const target = await this.targetRepository.readFull(data.campaignId, data.targetId)

    if (!target) {
      throw new ReplServerError(`Target not found`, {
        code: 'NOT_FOUND'
      })
    }

    return target
  }

  /*
   * Update target
   */
  async update(data: UpdateTargetData): Promise<true> {
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

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  /*
   * Enable target
   */
  async enable(data: SwitchTargetData): Promise<true> {
    try {
      await this.targetRepository.enable(data.campaignId, data.targetId, data.lockSecret)

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  /*
   * Disable target
   */
  async disable(data: SwitchTargetData): Promise<true> {
    try {
      await this.targetRepository.disable(data.campaignId, data.targetId, data.lockSecret)

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  /*
   * Append target label
   */
  async appendLabel(data: ActionTargetLabelData): Promise<true> {
    try {
      await this.targetRepository.appendLabel(
        data.campaignId,
        data.targetId,
        data.label,
        data.lockSecret
      )

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  /*
   * Remove target label
   */
  async removeLabel(data: ActionTargetLabelData): Promise<true> {
    try {
      await this.targetRepository.removeLabel(
        data.campaignId,
        data.targetId,
        data.label,
        data.lockSecret
      )

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  /*
   * Delete target
   */
  async delete(data: DeleteTargetData): Promise<true> {
    try {
      await this.targetRepository.delete(data.campaignId, data.targetId, data.lockSecret)

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  /*
   * List targets
   */
  async list(data: ListTargetsData): Promise<TargetModel[]> {
    const targets = await this.targetRepository.list(data.campaignId)

    if (!targets) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return targets
  }
}
