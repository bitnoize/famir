import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DatabaseErrorCode,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import {
  CreateRedirectorData,
  DeleteRedirectorData,
  ListRedirectorsData,
  ReadRedirectorData,
  UpdateRedirectorData
} from './redirector.js'

export const REDIRECTOR_SERVICE = Symbol('RedirectorService')

export class RedirectorService {
  static inject(container: DIContainer) {
    container.registerSingleton<RedirectorService>(
      REDIRECTOR_SERVICE,
      (c) => new RedirectorService(c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY))
    )
  }

  constructor(protected readonly redirectorRepository: RedirectorRepository) {}

  async create(data: CreateRedirectorData): Promise<true> {
    try {
      await this.redirectorRepository.create(
        data.campaignId,
        data.redirectorId,
        data.page,
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

  async read(data: ReadRedirectorData): Promise<RedirectorModel> {
    const model = await this.redirectorRepository.read(data.campaignId, data.redirectorId)

    if (!model) {
      throw new ReplServerError(`Redirector not found`, {
        code: 'NOT_FOUND'
      })
    }

    return model
  }

  async update(data: UpdateRedirectorData): Promise<true> {
    try {
      await this.redirectorRepository.update(
        data.campaignId,
        data.redirectorId,
        data.page,
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

  async delete(data: DeleteRedirectorData): Promise<true> {
    try {
      await this.redirectorRepository.delete(data.campaignId, data.redirectorId, data.lockSecret)

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

  async list(data: ListRedirectorsData): Promise<RedirectorModel[]> {
    const collection = await this.redirectorRepository.list(data.campaignId)

    if (!collection) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return collection
  }
}
