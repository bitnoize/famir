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
   * Creates a new redirector.
   *
   * @param data - The data object.
   * @returns The created redirector model.
   */
  async create(data: {
    campaignId: string
    redirectorId: string
    page: string
    lockSecret: string
  }): Promise<FullRedirectorModel> {
    try {
      await this.redirectorRepository.create(
        data.campaignId,
        data.redirectorId,
        data.page,
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

    const redirector = await this.redirectorRepository.readFull(data.campaignId, data.redirectorId)

    if (!redirector) {
      throw new ReplServerError(`Redirector not found`, {
        code: 'NOT_FOUND',
      })
    }

    return redirector
  }

  /**
   * Reads the redirector by its ID.
   *
   * @param data - The data object.
   * @returns The redirector model.
   * @throws {@link ReplServerError} If the redirector is not found.
   */
  async read(data: { campaignId: string; redirectorId: string }): Promise<FullRedirectorModel> {
    const redirector = await this.redirectorRepository.readFull(data.campaignId, data.redirectorId)

    if (!redirector) {
      throw new ReplServerError(`Redirector not found`, {
        code: 'NOT_FOUND',
      })
    }

    return redirector
  }

  /**
   * Updates the redirector specific fields.
   *
   * @param data - The data object.
   */
  async update(data: {
    campaignId: string
    redirectorId: string
    page: string | null | undefined
    lockSecret: string
  }): Promise<void> {
    try {
      await this.redirectorRepository.update(
        data.campaignId,
        data.redirectorId,
        data.page,
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
   * Appends a required field to the redirector.
   *
   * @param data - The data object.
   */
  async appendField(data: {
    campaignId: string
    redirectorId: string
    field: string
    lockSecret: string
  }): Promise<void> {
    try {
      await this.redirectorRepository.appendField(
        data.campaignId,
        data.redirectorId,
        data.field,
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
   * Removes a required field from the redirector.
   *
   * @param data - The data object.
   */
  async removeField(data: {
    campaignId: string
    redirectorId: string
    field: string
    lockSecret: string
  }): Promise<void> {
    try {
      await this.redirectorRepository.removeField(
        data.campaignId,
        data.redirectorId,
        data.field,
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
   * Deletes the redirector by its ID.
   *
   * @param data - The data object.
   */
  async delete(data: {
    campaignId: string
    redirectorId: string
    lockSecret: string
  }): Promise<void> {
    try {
      await this.redirectorRepository.delete(data.campaignId, data.redirectorId, data.lockSecret)
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
   * Lists all redirectors for the campaign.
   *
   * @param data - The data object.
   * @returns The array of redirector models.
   */
  async list(data: { campaignId: string }): Promise<RedirectorModel[]> {
    const redirectors = await this.redirectorRepository.list(data.campaignId)

    if (!redirectors) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND',
      })
    }

    return redirectors
  }
}
