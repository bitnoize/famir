import { DIContainer } from '@famir/common'
import {
  FullTargetModel,
  ReplServerError,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository
} from '@famir/domain'
import { BaseService } from '../base/index.js'
import {
  ActionTargetLabelData,
  CreateTargetData,
  DeleteTargetData,
  ListTargetsData,
  ReadTargetData,
  SwitchTargetData,
  UpdateTargetData
} from './target.js'

export const TARGET_SERVICE = Symbol('TargetService')

export class TargetService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<TargetService>(
      TARGET_SERVICE,
      (c) => new TargetService(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(protected readonly targetRepository: TargetRepository) {
    super()
  }

  async createTarget(data: CreateTargetData): Promise<TargetModel> {
    try {
      return await this.targetRepository.create(
        data.campaignId,
        data.targetId,
        data.isLanding,
        data.donorSecure,
        data.donorSub,
        data.donorDomain,
        data.donorPort,
        data.mirrorSecure,
        data.mirrorSub,
        data.mirrorPort,
        data.connectTimeout,
        data.ordinaryTimeout,
        data.streamingTimeout,
        data.requestBodyLimit,
        data.responseBodyLimit,
        data.mainPage,
        data.notFoundPage,
        data.faviconIco,
        data.robotsTxt,
        data.sitemapXml
      )
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])

      throw error
    }
  }

  async readTarget(data: ReadTargetData): Promise<FullTargetModel> {
    const model = await this.targetRepository.read(data.campaignId, data.targetId)

    if (!model) {
      throw new ReplServerError(`Target not found`, {
        code: 'NOT_FOUND'
      })
    }

    return model
  }

  async updateTarget(data: UpdateTargetData): Promise<TargetModel> {
    try {
      return await this.targetRepository.update(
        data.campaignId,
        data.targetId,
        data.connectTimeout,
        data.ordinaryTimeout,
        data.streamingTimeout,
        data.requestBodyLimit,
        data.responseBodyLimit,
        data.mainPage,
        data.notFoundPage,
        data.faviconIco,
        data.robotsTxt,
        data.sitemapXml
      )
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])

      throw error
    }
  }

  async enableTarget(data: SwitchTargetData): Promise<TargetModel> {
    try {
      return await this.targetRepository.enable(data.campaignId, data.targetId)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])

      throw error
    }
  }

  async disableTarget(data: SwitchTargetData): Promise<TargetModel> {
    try {
      return await this.targetRepository.disable(data.campaignId, data.targetId)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])

      throw error
    }
  }

  async appendTargetLabel(data: ActionTargetLabelData): Promise<TargetModel> {
    try {
      return await this.targetRepository.appendLabel(data.campaignId, data.targetId, data.label)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])

      throw error
    }
  }

  async removeTargetLabel(data: ActionTargetLabelData): Promise<TargetModel> {
    try {
      return await this.targetRepository.removeLabel(data.campaignId, data.targetId, data.label)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])

      throw error
    }
  }

  async deleteTarget(data: DeleteTargetData): Promise<TargetModel> {
    try {
      return await this.targetRepository.delete(data.campaignId, data.targetId)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])

      throw error
    }
  }

  async listTargets(data: ListTargetsData): Promise<TargetModel[]> {
    const collection = await this.targetRepository.list(data.campaignId)

    if (!collection) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return collection
  }
}
