import { DIContainer } from '@famir/common'
import { LURE_REPOSITORY, LureModel, LureRepository, ReplServerError } from '@famir/domain'
import { BaseService } from '../base/index.js'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  ReadLureData,
  SwitchLureData
} from './lure.js'

export const LURE_SERVICE = Symbol('LureService')

export class LureService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<LureService>(
      LURE_SERVICE,
      (c) => new LureService(c.resolve<LureRepository>(LURE_REPOSITORY))
    )
  }

  constructor(protected readonly lureRepository: LureRepository) {
    super()
  }

  async createLure(data: CreateLureData): Promise<LureModel> {
    try {
      return await this.lureRepository.create(
        data.campaignId,
        data.lureId,
        data.path,
        data.redirectorId
      )
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])
    }
  }

  async readLure(data: ReadLureData): Promise<LureModel> {
    const model = await this.lureRepository.read(data.campaignId, data.lureId)

    if (!model) {
      throw new ReplServerError(`Lure not found`, {
        code: 'NOT_FOUND'
      })
    }

    return model
  }

  async enableLure(data: SwitchLureData): Promise<LureModel> {
    try {
      return await this.lureRepository.enable(data.campaignId, data.lureId)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async disableLure(data: SwitchLureData): Promise<LureModel> {
    try {
      return await this.lureRepository.disable(data.campaignId, data.lureId)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async deleteLure(data: DeleteLureData): Promise<LureModel> {
    try {
      return await this.lureRepository.delete(
        data.campaignId,
        data.lureId,
        data.path,
        data.redirectorId
      )
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async listLures(data: ListLuresData): Promise<LureModel[]> {
    const collection = await this.lureRepository.list(data.campaignId)

    if (!collection) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return collection
  }
}
