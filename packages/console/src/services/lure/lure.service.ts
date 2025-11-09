import { DIContainer } from '@famir/common'
import {
  CreateLureModel,
  DeleteLureModel,
  DisabledLureModel,
  EnabledLureModel,
  ListLureModels,
  Logger,
  LOGGER,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  ReadLureModel,
  ReplServerError,
  SwitchLureModel
} from '@famir/domain'
import { BaseService } from '../base/index.js'

export const LURE_SERVICE = Symbol('LureService')

export class LureService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<LureService>(
      LURE_SERVICE,
      (c) => new LureService(c.resolve<Logger>(LOGGER), c.resolve<LureRepository>(LURE_REPOSITORY))
    )
  }

  constructor(
    logger: Logger,
    protected readonly lureRepository: LureRepository
  ) {
    super(logger)

    this.logger.debug(`LureService initialized`)
  }

  async create(data: CreateLureModel): Promise<DisabledLureModel> {
    try {
      return await this.lureRepository.create(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])
    }
  }

  async read(data: ReadLureModel): Promise<LureModel> {
    const lure = await this.lureRepository.read(data)

    if (!lure) {
      throw new ReplServerError(`Lure not found`, {
        code: 'NOT_FOUND'
      })
    }

    return lure
  }

  async enable(data: SwitchLureModel): Promise<EnabledLureModel> {
    try {
      return await this.lureRepository.enable(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async disable(data: SwitchLureModel): Promise<DisabledLureModel> {
    try {
      return await this.lureRepository.disable(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async delete(data: DeleteLureModel): Promise<DisabledLureModel> {
    try {
      return await this.lureRepository.delete(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async list(data: ListLureModels): Promise<LureModel[]> {
    const lures = await this.lureRepository.list(data)

    if (!lures) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return lures
  }
}
