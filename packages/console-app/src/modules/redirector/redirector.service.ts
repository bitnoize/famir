import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DatabaseErrorCode,
  FullRedirectorModel,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import {
  AlterRedirectorFieldData,
  CreateRedirectorData,
  DeleteRedirectorData,
  ListRedirectorsData,
  REDIRECTOR_SERVICE,
  ReadRedirectorData,
  UpdateRedirectorData,
} from './redirector.js'

/**
 * Represents a redirector service
 *
 * @category Redirector
 */
export class RedirectorService {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<RedirectorService>(
      REDIRECTOR_SERVICE,
      (c) => new RedirectorService(c.resolve(REDIRECTOR_REPOSITORY))
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
            code: error.code,
          })
        }
      }

      throw error
    }
  }

  async read(data: ReadRedirectorData): Promise<FullRedirectorModel> {
    const redirector = await this.redirectorRepository.readFull(data.campaignId, data.redirectorId)

    if (!redirector) {
      throw new ReplServerError(`Redirector not found`, {
        code: 'NOT_FOUND',
      })
    }

    return redirector
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
            code: error.code,
          })
        }
      }

      throw error
    }
  }

  async appendField(data: AlterRedirectorFieldData): Promise<true> {
    try {
      await this.redirectorRepository.appendField(
        data.campaignId,
        data.redirectorId,
        data.field,
        data.lockSecret
      )

      return true
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

  async removeField(data: AlterRedirectorFieldData): Promise<true> {
    try {
      await this.redirectorRepository.removeField(
        data.campaignId,
        data.redirectorId,
        data.field,
        data.lockSecret
      )

      return true
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

  async delete(data: DeleteRedirectorData): Promise<true> {
    try {
      await this.redirectorRepository.delete(data.campaignId, data.redirectorId, data.lockSecret)

      return true
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

  async list(data: ListRedirectorsData): Promise<RedirectorModel[]> {
    const redirectors = await this.redirectorRepository.list(data.campaignId)

    if (!redirectors) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND',
      })
    }

    return redirectors
  }
}
