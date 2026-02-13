import { DIContainer } from '@famir/common'
import { REDIRECTOR_REPOSITORY, RedirectorModel, RedirectorRepository } from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import { BaseService } from '../base/index.js'
import {
  CreateRedirectorData,
  DeleteRedirectorData,
  ListRedirectorsData,
  ReadRedirectorData,
  UpdateRedirectorData
} from './redirector.js'

export const REDIRECTOR_SERVICE = Symbol('RedirectorService')

export class RedirectorService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<RedirectorService>(
      REDIRECTOR_SERVICE,
      (c) => new RedirectorService(c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY))
    )
  }

  constructor(protected readonly redirectorRepository: RedirectorRepository) {
    super()
  }

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
      this.simpleDatabaseException(error, ['NOT_FOUND', 'CONFLICT', 'FORBIDDEN'])

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
      this.simpleDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])

      throw error
    }
  }

  async delete(data: DeleteRedirectorData): Promise<true> {
    try {
      await this.redirectorRepository.delete(data.campaignId, data.redirectorId, data.lockSecret)

      return true
    } catch (error) {
      this.simpleDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])

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
