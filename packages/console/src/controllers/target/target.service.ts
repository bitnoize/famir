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
  UpdateTargetData
} from './target.js'

export const TARGET_SERVICE = Symbol('TargetService')

export class TargetService {
  static inject(container: DIContainer) {
    container.registerSingleton<TargetService>(
      TARGET_SERVICE,
      (c) => new TargetService(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(protected readonly targetRepository: TargetRepository) {}

  async create(data: CreateTargetData): Promise<true> {
    try {
      await this.targetRepository.create(
        data.campaignId,
        data.targetId,
        data.isLanding,
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
        data.requestSizeLimit,
        data.responseSizeLimit,
        data.mainPage,
        data.notFoundPage,
        data.faviconIco,
        data.robotsTxt,
        data.sitemapXml,
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

  async read(data: ReadTargetData): Promise<FullTargetModel> {
    const model = await this.targetRepository.read(data.campaignId, data.targetId)

    if (!model) {
      throw new ReplServerError(`Target not found`, {
        code: 'NOT_FOUND'
      })
    }

    return model
  }

  async update(data: UpdateTargetData): Promise<true> {
    try {
      await this.targetRepository.update(
        data.campaignId,
        data.targetId,
        data.connectTimeout,
        data.simpleTimeout,
        data.streamTimeout,
        data.requestSizeLimit,
        data.responseSizeLimit,
        data.mainPage,
        data.notFoundPage,
        data.faviconIco,
        data.robotsTxt,
        data.sitemapXml,
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

  async list(data: ListTargetsData): Promise<TargetModel[]> {
    const collection = await this.targetRepository.list(data.campaignId)

    if (!collection) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return collection
  }
}
