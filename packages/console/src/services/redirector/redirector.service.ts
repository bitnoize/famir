import { DIContainer } from '@famir/common'
import {
  CreateRedirectorModel,
  DeleteRedirectorModel,
  ListRedirectorModels,
  Logger,
  LOGGER,
  ReadRedirectorModel,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  ReplServerError,
  UpdateRedirectorModel
} from '@famir/domain'
import { BaseService } from '../base/index.js'

export const REDIRECTOR_SERVICE = Symbol('RedirectorService')

export class RedirectorService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<RedirectorService>(
      REDIRECTOR_SERVICE,
      (c) =>
        new RedirectorService(
          c.resolve<Logger>(LOGGER),
          c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY)
        )
    )
  }

  constructor(
    logger: Logger,
    protected readonly redirectorRepository: RedirectorRepository
  ) {
    super(logger)

    this.logger.debug(`RedirectorService initialized`)
  }

  async create(data: CreateRedirectorModel): Promise<RedirectorModel> {
    try {
      return await this.redirectorRepository.create(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])
    }
  }

  async read(data: ReadRedirectorModel): Promise<RedirectorModel> {
    const redirector = await this.redirectorRepository.read(data)

    if (!redirector) {
      throw new ReplServerError(`Redirector not found`, {
        code: 'NOT_FOUND'
      })
    }

    return redirector
  }

  async update(data: UpdateRedirectorModel): Promise<RedirectorModel> {
    try {
      return await this.redirectorRepository.update(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async delete(data: DeleteRedirectorModel): Promise<RedirectorModel> {
    try {
      return await this.redirectorRepository.delete(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async list(data: ListRedirectorModels): Promise<RedirectorModel[]> {
    const redirectors = await this.redirectorRepository.list(data)

    if (!redirectors) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return redirectors
  }
}
