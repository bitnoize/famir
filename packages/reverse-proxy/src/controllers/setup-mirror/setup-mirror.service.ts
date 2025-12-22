import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  EnabledFullTargetModel,
  EnabledTargetModel,
  FullCampaignModel,
  HttpServerError,
  TARGET_REPOSITORY,
  TargetRepository,
  testEnabledTargetModel
} from '@famir/domain'
import { BaseService } from '../base/index.js'
import { SetupMirrorData } from './setup-mirror.js'

export const SETUP_MIRROR_SERVICE = Symbol('SetupMirrorService')

export class SetupMirrorService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<SetupMirrorService>(
      SETUP_MIRROR_SERVICE,
      (c) =>
        new SetupMirrorService(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {
    super()
  }

  async readCampaignTarget(
    data: SetupMirrorData
  ): Promise<[FullCampaignModel, EnabledFullTargetModel]> {
    const [campaignModel, targetModel] = await Promise.all([
      this.campaignRepository.read(data.campaignId),

      this.targetRepository.read(data.campaignId, data.targetId)
    ])

    if (!campaignModel) {
      throw new HttpServerError(`Read campaign failed`, {
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    if (!(targetModel && testEnabledTargetModel(targetModel))) {
      throw new HttpServerError(`Read target failed`, {
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    return [campaignModel, targetModel]
  }

  async listTargets(data: SetupMirrorData): Promise<EnabledTargetModel[]> {
    const collection = await this.targetRepository.list(data.campaignId)

    if (!collection) {
      throw new HttpServerError(`List targets failed`, {
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    return collection.filter(testEnabledTargetModel)
  }
}
