import { DIContainer } from '@famir/common'
import {
  CreateTargetModel,
  DeleteTargetModel,
  DisabledTargetModel,
  EnabledTargetModel,
  ListTargetModels,
  Logger,
  LOGGER,
  ReadTargetModel,
  ReplServerError,
  SwitchTargetModel,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository,
  UpdateTargetModel
} from '@famir/domain'
import { BaseService } from '../base/index.js'

export const TARGET_SERVICE = Symbol('TargetService')

export class TargetService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<TargetService>(
      TARGET_SERVICE,
      (c) =>
        new TargetService(c.resolve<Logger>(LOGGER), c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(
    logger: Logger,
    protected readonly targetRepository: TargetRepository
  ) {
    super(logger)

    this.logger.debug(`TargetService initialized`)
  }

  async create(data: CreateTargetModel): Promise<DisabledTargetModel> {
    try {
      return await this.targetRepository.create(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])
    }
  }

  async read(data: ReadTargetModel): Promise<TargetModel> {
    const target = await this.targetRepository.read(data)

    if (!target) {
      throw new ReplServerError(`Target not found`, {
        code: 'NOT_FOUND'
      })
    }

    return target
  }

  async update(data: UpdateTargetModel): Promise<TargetModel> {
    try {
      return await this.targetRepository.update(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async enable(data: SwitchTargetModel): Promise<EnabledTargetModel> {
    try {
      return await this.targetRepository.enable(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async disable(data: SwitchTargetModel): Promise<DisabledTargetModel> {
    try {
      return await this.targetRepository.disable(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async delete(data: DeleteTargetModel): Promise<DisabledTargetModel> {
    try {
      return await this.targetRepository.delete(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async list(data: ListTargetModels): Promise<TargetModel[]> {
    const targets = await this.targetRepository.list(data)

    if (!targets) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return targets
  }
}
