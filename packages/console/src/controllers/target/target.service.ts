import { DIContainer } from '@famir/common'
import {
  CreateTargetData,
  DeleteTargetData,
  DisabledTargetModel,
  EnabledTargetModel,
  ListTargetsData,
  Logger,
  LOGGER,
  ReadTargetData,
  ReplServerError,
  SwitchTargetData,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository,
  UpdateTargetData
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

  async createTarget(data: CreateTargetData): Promise<DisabledTargetModel> {
    try {
      return await this.targetRepository.createTarget(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])
    }
  }

  async readTarget(data: ReadTargetData): Promise<TargetModel> {
    const targetModel = await this.targetRepository.readTarget(data)

    if (!targetModel) {
      throw new ReplServerError(`Target not found`, {
        code: 'NOT_FOUND'
      })
    }

    return targetModel
  }

  async updateTarget(data: UpdateTargetData): Promise<TargetModel> {
    try {
      return await this.targetRepository.updateTarget(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async enableTarget(data: SwitchTargetData): Promise<EnabledTargetModel> {
    try {
      return await this.targetRepository.enableTarget(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async disableTarget(data: SwitchTargetData): Promise<DisabledTargetModel> {
    try {
      return await this.targetRepository.disableTarget(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async deleteTarget(data: DeleteTargetData): Promise<DisabledTargetModel> {
    try {
      return await this.targetRepository.deleteTarget(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async listTargets(data: ListTargetsData): Promise<TargetModel[]> {
    const targetCollection = await this.targetRepository.listTargets(data)

    if (!targetCollection) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return targetCollection
  }
}
