import { DIContainer } from '@famir/common'
import {
  CreateRedirectorData,
  DeleteRedirectorData,
  ListRedirectorsData,
  ReadRedirectorData,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  ReplServerError,
  UpdateRedirectorData
} from '@famir/domain'
import { BaseService } from '../base/index.js'

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
      return await this.redirectorRepository.createRedirector(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])
    }
  }

  async readRedirector(data: ReadRedirectorData): Promise<RedirectorModel> {
    const redirectorModel = await this.redirectorRepository.readRedirector(data)

    if (!redirectorModel) {
      throw new ReplServerError(`Redirector not found`, {
        code: 'NOT_FOUND'
      })
    }

    return redirectorModel
  }

  async updateRedirector(data: UpdateRedirectorData): Promise<RedirectorModel> {
    try {
      return await this.redirectorRepository.updateRedirector(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async deleteRedirector(data: DeleteRedirectorData): Promise<RedirectorModel> {
    try {
      return await this.redirectorRepository.deleteRedirector(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async listRedirectors(data: ListRedirectorsData): Promise<RedirectorModel[]> {
    const redirectorCollection = await this.redirectorRepository.listRedirectors(data)

    if (!redirectorCollection) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return redirectorCollection
  }
}
