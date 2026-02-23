import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DatabaseErrorCode,
  LURE_REPOSITORY,
  LureModel,
  LureRepository
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  ReadLureData,
  SwitchLureData
} from './lure.js'

export const LURE_SERVICE = Symbol('LureService')

export class LureService {
  static inject(container: DIContainer) {
    container.registerSingleton<LureService>(
      LURE_SERVICE,
      (c) => new LureService(c.resolve<LureRepository>(LURE_REPOSITORY))
    )
  }

  constructor(protected readonly lureRepository: LureRepository) {}

  async create(data: CreateLureData): Promise<true> {
    try {
      await this.lureRepository.create(
        data.campaignId,
        data.lureId,
        data.path,
        data.redirectorId,
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

  async read(data: ReadLureData): Promise<LureModel> {
    const model = await this.lureRepository.read(data.campaignId, data.lureId)

    if (!model) {
      throw new ReplServerError(`Lure not found`, {
        code: 'NOT_FOUND'
      })
    }

    return model
  }

  async enable(data: SwitchLureData): Promise<true> {
    try {
      await this.lureRepository.enable(data.campaignId, data.lureId, data.lockSecret)

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

  async disable(data: SwitchLureData): Promise<true> {
    try {
      await this.lureRepository.disable(data.campaignId, data.lureId, data.lockSecret)

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

  async delete(data: DeleteLureData): Promise<true> {
    try {
      await this.lureRepository.delete(
        data.campaignId,
        data.lureId,
        data.redirectorId,
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

  async list(data: ListLuresData): Promise<LureModel[]> {
    const collection = await this.lureRepository.list(data.campaignId)

    if (!collection) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return collection
  }
}
