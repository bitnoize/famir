import { DIContainer, arrayIncludes, encrypt, randomName } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  DatabaseError,
  DatabaseErrorCode,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  TARGET_REPOSITORY,
  TargetRepository
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import {
  CreateLureData,
  DeleteLureData,
  LURE_SERVICE,
  ListLuresData,
  MakeLureUrlData,
  ReadLureData,
  SwitchLureData
} from './lure.js'

export class LureService {
  static inject(container: DIContainer) {
    container.registerSingleton<LureService>(
      LURE_SERVICE,
      (c) =>
        new LureService(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY),
          c.resolve<LureRepository>(LURE_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository,
    protected readonly lureRepository: LureRepository
  ) {}

  async create(data: CreateLureData): Promise<true> {
    try {
      await this.lureRepository.create(
        data.campaignId,
        data.lureId,
        data.path,
        data.redirectorId,
        data.lockSecret
      )

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'CONFLICT', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  async read(data: ReadLureData): Promise<LureModel> {
    const lure = await this.lureRepository.read(data.campaignId, data.lureId)

    if (!lure) {
      throw new ReplServerError(`Lure not found`, {
        code: 'NOT_FOUND'
      })
    }

    return lure
  }

  async enable(data: SwitchLureData): Promise<true> {
    try {
      await this.lureRepository.enable(data.campaignId, data.lureId, data.lockSecret)

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  async disable(data: SwitchLureData): Promise<true> {
    try {
      await this.lureRepository.disable(data.campaignId, data.lureId, data.lockSecret)

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  async delete(data: DeleteLureData): Promise<true> {
    try {
      await this.lureRepository.delete(
        data.campaignId,
        data.lureId,
        data.redirectorId,
        data.lockSecret
      )

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  async list(data: ListLuresData): Promise<LureModel[]> {
    const lures = await this.lureRepository.list(data.campaignId)

    if (!lures) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return lures
  }

  async makeUrl(data: MakeLureUrlData): Promise<string> {
    const lure = await this.lureRepository.read(data.campaignId, data.lureId)

    if (!lure) {
      throw new ReplServerError(`Lure not found`, {
        code: 'NOT_FOUND'
      })
    }

    const campaign = await this.campaignRepository.readFull(data.campaignId)

    if (!campaign) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    const target = await this.targetRepository.readFull(data.campaignId, data.targetId)

    if (!target) {
      throw new ReplServerError(`Target not found`, {
        code: 'NOT_FOUND'
      })
    }

    return data.payload
      ? [
          target.mirrorUrl,
          lure.path,
          '?',
          data.paramName ?? randomName(),
          '=',
          encrypt(JSON.stringify(data.payload), campaign.cryptSecret)
        ].join('')
      : [target.mirrorUrl, lure.path].join('')
  }
}
