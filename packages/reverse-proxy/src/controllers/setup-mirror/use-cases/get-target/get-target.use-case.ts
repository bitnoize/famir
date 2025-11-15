import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  EnabledFullTargetModel,
  FullTargetModel,
  HttpServerError,
  TARGET_REPOSITORY,
  TargetRepository
} from '@famir/domain'
import { GetTargetData, GetTargetReply } from './get-target.js'

export const GET_TARGET_USE_CASE = Symbol('GetTargetUseCase')

export class GetTargetUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<GetTargetUseCase>(
      GET_TARGET_USE_CASE,
      (c) =>
        new GetTargetUseCase(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {}

  async execute(data: GetTargetData): Promise<GetTargetReply> {
    const [campaignModel, targetModel] = await Promise.all([
      this.campaignRepository.readCampaign({
        campaignId: data.campaignId
      }),

      this.targetRepository.readTarget({
        campaignId: data.campaignId,
        targetId: data.targetId
      })
    ])

    if (!campaignModel) {
      throw new HttpServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    if (!targetModel) {
      throw new HttpServerError(`Target not found`, {
        code: 'NOT_FOUND'
      })
    }

    if (!this.guardEnabledTarget(targetModel)) {
      throw new HttpServerError(`Target disabled`, {
        code: 'FORBIDDEN'
      })
    }

    return {
      campaign: campaignModel,
      target: targetModel
    }
  }

  protected guardEnabledTarget = (value: FullTargetModel): value is EnabledFullTargetModel => {
    return value.isEnabled
  }
}
