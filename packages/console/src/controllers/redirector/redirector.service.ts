import { DIContainer } from '@famir/common'
import {
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  ReplServerError
} from '@famir/domain'
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

  async createRedirector(data: CreateRedirectorData): Promise<RedirectorModel> {
    try {
      return await this.redirectorRepository.create(data.campaignId, data.redirectorId, data.page)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])
    }
  }

  async readRedirector(data: ReadRedirectorData): Promise<RedirectorModel> {
    const model = await this.redirectorRepository.read(data.campaignId, data.redirectorId)

    if (!model) {
      throw new ReplServerError(`Redirector not found`, {
        code: 'NOT_FOUND'
      })
    }

    return model
  }

  async updateRedirector(data: UpdateRedirectorData): Promise<RedirectorModel> {
    try {
      return await this.redirectorRepository.update(data.campaignId, data.redirectorId, data.page)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async deleteRedirector(data: DeleteRedirectorData): Promise<RedirectorModel> {
    try {
      return await this.redirectorRepository.delete(data.campaignId, data.redirectorId)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async listRedirectors(data: ListRedirectorsData): Promise<RedirectorModel[]> {
    const collection = await this.redirectorRepository.list(data.campaignId)

    if (!collection) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return collection
  }
}
