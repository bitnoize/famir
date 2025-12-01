import { DIContainer } from '@famir/common'
import {
  CreateLureData,
  DeleteLureData,
  ListLuresData,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  ReadLureData,
  ReplServerError,
  SwitchLureData
} from '@famir/domain'
import { BaseService } from '../base/index.js'

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
      return await this.lureRepository.createLure(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])
    }
  }

  async readLure(data: ReadLureData): Promise<LureModel> {
    const lureModel = await this.lureRepository.readLure(data)

    if (!lureModel) {
      throw new ReplServerError(`Lure not found`, {
        code: 'NOT_FOUND'
      })
    }

    return lureModel
  }

  async enableLure(data: SwitchLureData): Promise<LureModel> {
    try {
      return await this.lureRepository.enableLure(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async disableLure(data: SwitchLureData): Promise<LureModel> {
    try {
      return await this.lureRepository.disableLure(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async deleteLure(data: DeleteLureData): Promise<LureModel> {
    try {
      return await this.lureRepository.deleteLure(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async listLures(data: ListLuresData): Promise<LureModel[]> {
    const lureCollection = await this.lureRepository.listLures(data)

    if (!lureCollection) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return lureCollection
  }
}
