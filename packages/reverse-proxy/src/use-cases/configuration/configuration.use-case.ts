import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  HttpServerError,
  TARGET_REPOSITORY,
  TargetRepository
} from '@famir/domain'
import { ConfigurationData, ConfigurationResult } from './configuration.js'

export const CONFIGURATION_USE_CASE = Symbol('ConfigurationUseCase')

export class ConfigurationUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ConfigurationUseCase>(
      CONFIGURATION_USE_CASE,
      (c) =>
        new ConfigurationUseCase(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {}

  async execute(data: ConfigurationData): Promise<ConfigurationResult> {
    const campaign = await this.campaignRepository.read({
      id: data.campaignId
    })

    if (campaign === null) {
      throw new HttpServerError(`Campaign not found`, {
        context: {
          useCase: 'configuration'
        },
        code: 'SERVICE_UNAVAILABLE',
        status: 503
      })
    }

    const target = await this.targetRepository.read({
      campaignId: data.campaignId,
      id: data.targetId
    })

    if (target === null) {
      throw new HttpServerError(`Target not found`, {
        context: {
          useCase: 'configuration'
        },
        code: 'SERVICE_UNAVAILABLE',
        status: 503
      })
    }

    return { campaign, target }
  }
}
